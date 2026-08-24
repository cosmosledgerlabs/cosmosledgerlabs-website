/**
 * lib/orchestrator.js
 *
 * Orchestration engine: runs a sequence of steps in order and, if any step
 * fails, executes compensating transactions for the completed steps in
 * reverse order.
 *
 * Core concepts (use this wording consistently):
 *   - A single Solana transaction is atomic — that is native to the chain.
 *   - A sequence of transactions is NOT atomic — that is the gap this closes.
 *   - This is "compensation", not "rollback": a confirmed transaction cannot
 *     be undone, only offset by a new transaction.
 */

export const STATUS = {
  PENDING: 'pending',           // not started yet
  RUNNING: 'running',           // in progress
  SUCCESS: 'success',           // completed
  FAILED: 'failed',             // failed
  COMPENSATING: 'compensating', // compensation in progress
  COMPENSATED: 'compensated',   // compensation confirmed
  SKIPPED: 'skipped',           // not run because an earlier step failed
};

export const FLOW_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED_COMPENSATED: 'failed_compensated',
  FAILED_INCOMPLETE: 'failed_incomplete', // a compensation itself failed; needs manual handling
};

/**
 * Build the initial step-state array.
 */
export function initSteps(stepDefs) {
  return stepDefs.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    status: STATUS.PENDING,
    signature: null,
    compensationSignature: null,
    error: null,
  }));
}

/**
 * Sign, send and confirm one transaction.
 */
async function sendAndConfirm(web3, connection, provider, tx, pubkey) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed');

  tx.recentBlockhash = blockhash;
  tx.feePayer = pubkey;

  const signed = await provider.signAndSendTransaction(tx);
  const signature = signed.signature || signed;

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  return signature;
}

/**
 * Run the whole flow.
 *
 * @param {object}   opts.web3        the @solana/web3.js module
 * @param {object}   opts.connection  a Connection instance
 * @param {object}   opts.provider    wallet provider (Phantom)
 * @param {object}   opts.pubkey      PublicKey of the signer
 * @param {Array}    opts.stepDefs    STEPS from steps.js
 * @param {object}   opts.ctx         context { flowId, amount, ... }
 * @param {number}   opts.failAt      inject a failure at this step (1-based); 0 = no injection
 * @param {Function} opts.onUpdate    called on every state change: (steps, flowState) => void
 *
 * @returns {Promise<{flowState: string, steps: Array}>}
 */
export async function runFlow(opts) {
  const {
    web3, connection, provider, pubkey,
    stepDefs, ctx, failAt = 0, onUpdate,
  } = opts;

  const steps = initSteps(stepDefs);
  const completed = []; // indices of completed steps, compensated in reverse order

  const push = (flowState) => {
    if (onUpdate) onUpdate(steps.map((s) => ({ ...s })), flowState);
  };

  push(FLOW_STATE.RUNNING);

  // ---------- forward execution ----------
  for (let i = 0; i < stepDefs.length; i++) {
    const def = stepDefs[i];

    steps[i].status = STATUS.RUNNING;
    push(FLOW_STATE.RUNNING);

    try {
      // Injected failure: used to demonstrate the compensation mechanism
      if (failAt === i + 1) {
        throw new Error(
          'Simulated failure injected at this step (demonstration mode).'
        );
      }

      const tx = def.execute(web3, pubkey, ctx);
      const signature = await sendAndConfirm(
        web3, connection, provider, tx, pubkey
      );

      steps[i].status = STATUS.SUCCESS;
      steps[i].signature = signature;
      completed.push(i);
      push(FLOW_STATE.RUNNING);

    } catch (err) {
      steps[i].status = STATUS.FAILED;
      steps[i].error = readableError(err);

      // Mark the remaining steps as not run
      for (let j = i + 1; j < steps.length; j++) {
        steps[j].status = STATUS.SKIPPED;
      }

      push(FLOW_STATE.RUNNING);

      // ---------- compensation in reverse order ----------
      const flowState = await compensate({
        web3, connection, provider, pubkey,
        stepDefs, steps, completed, ctx, push,
      });

      return { flowState, steps };
    }
  }

  push(FLOW_STATE.COMPLETED);
  return { flowState: FLOW_STATE.COMPLETED, steps };
}

/**
 * Compensate the completed steps, last one first.
 */
async function compensate(args) {
  const {
    web3, connection, provider, pubkey,
    stepDefs, steps, completed, ctx, push,
  } = args;

  let allCompensated = true;

  for (let k = completed.length - 1; k >= 0; k--) {
    const idx = completed[k];
    const def = stepDefs[idx];

    // This step needs no compensation
    if (!def.compensate) {
      steps[idx].status = STATUS.COMPENSATED;
      push(FLOW_STATE.RUNNING);
      continue;
    }

    steps[idx].status = STATUS.COMPENSATING;
    push(FLOW_STATE.RUNNING);

    try {
      const tx = def.compensate(web3, pubkey, ctx);
      const signature = await sendAndConfirm(
        web3, connection, provider, tx, pubkey
      );

      steps[idx].status = STATUS.COMPENSATED;
      steps[idx].compensationSignature = signature;

    } catch (err) {
      // Compensation failed: keep SUCCESS status, record the error, flag for manual handling
      steps[idx].status = STATUS.SUCCESS;
      steps[idx].error =
        'Compensation failed — manual intervention required: ' +
        readableError(err);
      allCompensated = false;
    }

    push(FLOW_STATE.RUNNING);
  }

  const finalState = allCompensated
    ? FLOW_STATE.FAILED_COMPENSATED
    : FLOW_STATE.FAILED_INCOMPLETE;

  push(finalState);
  return finalState;
}

/**
 * Turn an error into one readable sentence.
 */
export function readableError(err) {
  const text = err && err.message ? err.message : String(err);

  if (text.indexOf('User rejected') !== -1) {
    return 'Signature was cancelled in the wallet.';
  }
  if (text.indexOf('insufficient') !== -1 ||
      text.indexOf('Insufficient') !== -1) {
    return 'Insufficient devnet SOL. Request test tokens at faucet.solana.com.';
  }
  if (text.indexOf('blockhash') !== -1) {
    return 'Transaction expired before confirmation. Please retry.';
  }
  return text;
}
