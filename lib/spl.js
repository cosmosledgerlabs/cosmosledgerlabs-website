/**
 * lib/spl.js  — v2
 *
 * Helpers for real SPL token operations.
 *
 * One-time SETUP creates:
 *   1. a test token (mint)
 *   2. a token account for the connected wallet, minted with the initial supply
 *   3. an escrow account, owned by a keypair generated in the browser
 *   4. a recipient account
 *
 * The three flow steps then move real tokens:
 *   Step 1  Approve        → memo record
 *   Step 2  Vesting setup  → owner account → escrow account
 *   Step 3  Distribution   → escrow account → recipient account
 *
 * Compensation:
 *   Step 2 compensation → escrow account → owner account (a real transfer back)
 *   Step 1 compensation → memo record
 *
 * About the escrow account — state this honestly:
 * The escrow in this demonstration is owned by a keypair generated in the
 * browser and held in page state. That is enough to show funds genuinely
 * leaving and returning, but it is NOT a trustless escrow. A production
 * version would use a program-derived address held by an on-chain program.
 * Never describe this as "trustless escrow".
 *
 * All transactions go through sendAndConfirm in orchestrator.js, so SETUP
 * gets the same fresh-block-reference / re-broadcast / 429 back-off handling
 * as the flow steps.
 */

import { sendAndConfirm, rpc } from './orchestrator';

export const DECIMALS = 6;
export const INITIAL_SUPPLY = 1_000_000;   // minted to the connected wallet at SETUP
export const FLOW_AMOUNT = 1_000;          // amount moved by each flow run

/**
 * Convert a human-readable amount to on-chain base units.
 */
export function toBaseUnits(amount, decimals = DECIMALS) {
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

/**
 * One-time SETUP: create the token and accounts, and mint the initial supply.
 *
 * Two transactions (the wallet prompts twice):
 *   TX A: create mint + initialise it + create the owner token account + mint
 *   TX B: create the escrow token account + the recipient token account
 *
 * @returns {Promise<{mint, ownerAta, escrow, escrowAta, recipient, recipientAta, escrowKeypair, signatures}>}
 */
export async function runSetup({ web3, spl, connection, provider, owner }) {
  const signatures = [];

  // Three fresh keypairs: the mint, the escrow owner, the recipient
  const mintKeypair = web3.Keypair.generate();
  const escrowKeypair = web3.Keypair.generate();
  const recipientKeypair = web3.Keypair.generate();

  const mint = mintKeypair.publicKey;
  const ownerAta = spl.getAssociatedTokenAddressSync(mint, owner);
  const escrowAta = spl.getAssociatedTokenAddressSync(mint, escrowKeypair.publicKey);
  const recipientAta = spl.getAssociatedTokenAddressSync(mint, recipientKeypair.publicKey);

  const rent = await rpc(() => spl.getMinimumBalanceForRentExemptMint(connection));

  // ---------- TX A ----------
  // Built inside a function so a retry always starts from an unsigned transaction.
  const buildTxA = () => {
    const tx = new web3.Transaction();

    tx.add(
      web3.SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: mint,
        space: spl.MINT_SIZE,
        lamports: rent,
        programId: spl.TOKEN_PROGRAM_ID,
      })
    );

    tx.add(
      spl.createInitializeMintInstruction(
        mint,
        DECIMALS,
        owner,   // mint authority
        owner    // freeze authority (kept — compliance-friendly)
      )
    );

    tx.add(
      spl.createAssociatedTokenAccountInstruction(owner, ownerAta, owner, mint)
    );

    tx.add(
      spl.createMintToInstruction(
        mint,
        ownerAta,
        owner,
        toBaseUnits(INITIAL_SUPPLY)
      )
    );

    return { tx, extraSigners: [mintKeypair] };
  };

  const sigA = await sendAndConfirm(web3, connection, provider, buildTxA, owner);
  signatures.push({ label: 'Token created and minted', signature: sigA });

  // ---------- TX B ----------
  const buildTxB = () => {
    const tx = new web3.Transaction();

    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        owner, escrowAta, escrowKeypair.publicKey, mint
      )
    );

    tx.add(
      spl.createAssociatedTokenAccountInstruction(
        owner, recipientAta, recipientKeypair.publicKey, mint
      )
    );

    return { tx, extraSigners: [] };
  };

  const sigB = await sendAndConfirm(web3, connection, provider, buildTxB, owner);
  signatures.push({ label: 'Escrow and recipient accounts created', signature: sigB });

  return {
    mint: mint.toString(),
    ownerAta: ownerAta.toString(),
    escrow: escrowKeypair.publicKey.toString(),
    escrowAta: escrowAta.toString(),
    recipient: recipientKeypair.publicKey.toString(),
    recipientAta: recipientAta.toString(),
    escrowKeypair,      // kept in page state; signs transfers out of escrow
    signatures,
  };
}

/**
 * Read a token account balance (human-readable string).
 */
export async function readBalance(web3, connection, ataString) {
  try {
    const res = await rpc(() => connection.getTokenAccountBalance(
      new web3.PublicKey(ataString)
    ));
    return res.value.uiAmountString;
  } catch (e) {
    return '0';
  }
}
