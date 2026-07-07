/* ===== SPACING SYSTEM (8px) ===== */
/* sp1=8 sp2=16 sp3=24 sp4=32 sp6=48 sp8=64 */

/* ===== COMMON ===== */
.section { padding: 48px 5%; max-width: 920px; margin: 0 auto; width: 100%; }

.secTag {
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: .22em; color: #44bbcc;
  margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.secTagLine { flex:1; height:1px; background:linear-gradient(90deg,rgba(0,200,255,.4),transparent); max-width:180px; }

.secTitle {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(22px, 4vw, 40px); font-weight: 700;
  letter-spacing: .06em; margin-bottom: 16px;
  color: #ffffff; text-align: left;
}
.secBody {
  font-family: 'Share Tech Mono', monospace;
  font-size: clamp(15px, 1.5vw, 16px);
  color: #ffffff; line-height: 1.6; max-width: 640px;
}

/* ===== STEEL CARD ===== */
.steelCard {
  background: rgba(0,10,28,.88);
  border: 1px solid rgba(0,190,230,.3);
  border-radius: 6px; padding: 32px;
  position: relative; margin-top: 16px;
  width: 100%;
}
.steelCard::before { content:''; position:absolute; top:0; left:0; width:14px; height:14px; border-top:2px solid rgba(0,220,255,.65); border-left:2px solid rgba(0,220,255,.65); }
.steelCard::after { content:''; position:absolute; bottom:0; right:0; width:14px; height:14px; border-bottom:2px solid rgba(0,220,255,.65); border-right:2px solid rgba(0,220,255,.65); }

/* 融资标签居中 */
.fundingInline { display:flex; justify-content:center; margin-top:16px; }
.fundingTag {
  padding:10px 20px; background:rgba(0,150,255,.1);
  border:1.5px solid rgba(0,220,255,.5); border-radius:4px;
  font-family:'Rajdhani',sans-serif; font-size:clamp(11px,1.5vw,13px); font-weight:700;
  color:#00e8ff; letter-spacing:.14em; text-align:center;
  max-width:100%;
}

/* ===== PROBLEM CARDS — 修正 "Approval Fragmentation" 不换行 ===== */
.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px; margin-top: 16px;
  border: 1px solid rgba(0,160,210,.2); border-radius: 6px; overflow: hidden;
}
.card {
  background: rgba(0,10,28,.88);
  padding: 24px; position: relative;
  display: flex; flex-direction: column; gap: 8px;
}
.card::before { content:''; position:absolute; top:0; left:0; width:10px; height:10px; border-top:1.5px solid rgba(0,210,255,.5); border-left:1.5px solid rgba(0,210,255,.5); }
.cardName {
  font-family:'Rajdhani',sans-serif;
  font-size:clamp(11px,1.5vw,13px); font-weight:700;
  color:#00e8ff; letter-spacing:.08em;
  white-space: nowrap; /* 保持一行 */
  overflow: hidden; text-overflow: ellipsis;
}
.cardText { font-family:'Share Tech Mono',monospace; font-size:clamp(13px,1.4vw,14px); color:#ffffff; line-height:1.6; }

/* ===== ARCHITECTURE ===== */
.archList { display:flex; flex-direction:column; gap:4px; margin-top:16px; }
.archLayer {
  display:flex; align-items:center; gap:16px;
  padding:12px 16px; background:rgba(0,10,28,.88);
  border:1px solid rgba(0,165,205,.2); border-radius:4px;
  position:relative; overflow:hidden;
}
.archLayer::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg,#00e8ff,rgba(0,100,200,.3)); }
.archNum { font-family:'Rajdhani',sans-serif; font-size:10px; font-weight:700; color:#00e8ff; min-width:28px; letter-spacing:.1em; flex-shrink:0; }
.archTitle { font-family:'Rajdhani',sans-serif; font-size:clamp(12px,1.5vw,14px); font-weight:700; color:#ffffff; letter-spacing:.06em; flex:1; }
.archSub { font-family:'Share Tech Mono',monospace; font-size:clamp(10px,1.2vw,11px); color:#88ccdd; white-space:nowrap; flex-shrink:0; }

/* ===== WORKFLOW ===== */
.wfList { display:flex; flex-direction:column; gap:4px; margin-top:16px; }
.wfStep { display:flex; align-items:center; gap:16px; padding:8px 0; }
.wfDot { width:8px; height:8px; border-radius:50%; flex-shrink:0; background:#00e8ff; }
.wfNum { font-family:'Rajdhani',sans-serif; font-size:10px; font-weight:700; color:#44bbcc; min-width:40px; letter-spacing:.1em; flex-shrink:0; }
.wfLabel { font-family:'Rajdhani',sans-serif; font-size:clamp(14px,1.6vw,15px); font-weight:700; color:#ffffff; letter-spacing:.05em; }
.wfLine { width:2px; height:12px; background:rgba(0,200,255,.25); margin-left:4px; }

/* ===== SECURITY — 3+3 grid ===== */
.secGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列 */
  gap: 16px; margin-top: 16px;
}
.secCard {
  background: rgba(0,10,28,.88);
  border: 1px solid rgba(0,185,225,.22);
  border-radius: 6px; padding: 24px;
  position: relative;
  display: flex; flex-direction: column; gap: 8px;
  height: 100%; /* 等高 */
}
.secCard::before { content:''; position:absolute; top:0; left:0; width:9px; height:9px; border-top:1.5px solid rgba(0,210,255,.5); border-left:1.5px solid rgba(0,210,255,.5); }
.secCardTitle { font-family:'Rajdhani',sans-serif; font-size:clamp(11px,1.4vw,13px); font-weight:700; color:#00e8ff; letter-spacing:.07em; }
.secCardText { font-family:'Share Tech Mono',monospace; font-size:clamp(13px,1.3vw,14px); color:#ffffff; line-height:1.6; }

/* ===== ECOSYSTEM ===== */
.ecoText { font-family:'Share Tech Mono',monospace; font-size:clamp(15px,1.5vw,16px); color:#ffffff; line-height:1.6; }

/* ===== ROADMAP — 4个按钮等宽等高对齐 ===== */
.roadmapList { display:flex; flex-direction:column; gap:1px; margin-top:16px; border:1px solid rgba(0,155,205,.2); border-radius:6px; overflow:hidden; }
.rmItem { padding:24px; position:relative; background:rgba(0,10,28,.88); }
.rmItem::after { content:''; position:absolute; bottom:0; left:0; height:1px; background:linear-gradient(90deg,#001833,#00e8ff); opacity:.5; }
.rm1::after{width:100%;} .rm2::after{width:55%;} .rm3::after{width:25%;} .rm4::after{width:8%;}

.rmRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: nowrap;
}
.rmLeft { display:flex; align-items:center; gap:16px; flex:1; min-width:0; }
.rmNum { font-family:'Rajdhani',sans-serif; font-size:28px; font-weight:700; color:rgba(0,185,255,.2); flex-shrink:0; line-height:1; }
.rmInfo { display:flex; flex-direction:column; min-width:0; }
.rmPhase { font-family:'Rajdhani',sans-serif; font-size:9px; font-weight:700; color:#44bbcc; letter-spacing:.16em; margin-bottom:4px; }
.rmTitle1 { font-family:'Rajdhani',sans-serif; font-size:clamp(18px,2.5vw,22px); font-weight:700; color:#00e8ff; letter-spacing:.08em; }
.rmTitle2 { font-family:'Rajdhani',sans-serif; font-size:clamp(18px,2.5vw,22px); font-weight:700; color:#ffffff; letter-spacing:.08em; }
.rmTitle3 { font-family:'Rajdhani',sans-serif; font-size:clamp(18px,2.5vw,22px); font-weight:700; color:#4499bb; letter-spacing:.08em; }
.rmTitle4 { font-family:'Rajdhani',sans-serif; font-size:clamp(18px,2.5vw,22px); font-weight:700; color:#6b8ea3; letter-spacing:.08em; }

/* 按钮等宽等高 */
.rmBadge {
  font-family: 'Rajdhani', sans-serif;
  font-size: 10px; font-weight: 700;
  padding: 8px 0;
  width: 88px; /* 固定等宽 */
  text-align: center;
  border-radius: 3px;
  letter-spacing: .12em;
  white-space: nowrap;
  flex-shrink: 0;
}
.badgeCurrent { color:#00e8ff; background:rgba(0,160,240,.28); border:1.5px solid rgba(0,210,255,.6); }
.badgeNext    { color:#ffffff; background:rgba(0,100,180,.32); border:1.5px solid rgba(0,170,230,.5); }
.badgePlanned { color:#6fb0c8; background:rgba(0,70,120,.28); border:1.5px solid rgba(0,130,180,.45); }
.badgeFuture  { color:#7fa3b5; background:rgba(0,45,80,.24); border:1.5px solid rgba(0,80,120,.38); }

.rmTags { display:flex; flex-wrap:wrap; gap:4px 16px; }
.rmTag { font-family:'Share Tech Mono',monospace; font-size:clamp(12px,1.3vw,13px); color:#88aacc; }

/* ===== DOWNLOADS ===== */
.dlButtons { display:flex; gap:16px; flex-wrap:wrap; margin-top:24px; align-items:center; }
.dlBtn1 {
  font-family:'Rajdhani',sans-serif; font-size:clamp(12px,1.5vw,14px); font-weight:700;
  padding:14px 28px; border-radius:4px;
  background:rgba(0,80,180,.55);
  border:1.5px solid rgba(0,210,255,.75);
  color:#00e8ff; text-decoration:none; letter-spacing:.12em;
  white-space:nowrap;
  display:inline-flex; align-items:center; justify-content:center;
  min-width:220px; text-align:center;
}
.dlBtn2 {
  font-family:'Rajdhani',sans-serif; font-size:clamp(12px,1.5vw,14px); font-weight:700;
  padding:14px 28px; border-radius:4px;
  background:rgba(0,60,120,.22);
  border:1.5px solid rgba(0,175,220,.45);
  color:#88ddee; text-decoration:none; letter-spacing:.12em;
  white-space:nowrap;
}

/* ===== VIDEO PLACEHOLDER — 加亮8% ===== */
/* ===== CONTACT ===== */
.contactEmail {
  font-family:'Rajdhani',sans-serif; font-size:clamp(14px,2vw,18px); font-weight:700;
  color:#00e8ff; letter-spacing:.06em;
  overflow-wrap: anywhere; /* wrap cleanly if needed, no mid-word cuts on normal widths */
}
.contactLocation { font-family:'Rajdhani',sans-serif; font-size:clamp(13px,1.6vw,15px); font-weight:600; color:#88ddee; margin-top:16px; letter-spacing:.08em; }

/* ===== RESPONSIVE ===== */
@media(max-width:767px) {
  .section { padding: 32px 4%; }
  .cardGrid { grid-template-columns: 1fr 1fr; }
  .secGrid { grid-template-columns: 1fr 1fr; } /* 手机2+2+2 */
  .archSub { display: none; } /* 手机隐藏副标签 */
  /* Stack the phase title and status badge vertically so they can never overlap */
  .rmRow { flex-direction: column; align-items: flex-start; gap: 12px; }
  .rmBadge { width: 108px; padding: 7px 0; align-self: flex-start; } /* uniform badge size */
  .dlButtons { flex-direction: column; align-items: stretch; }
  .dlBtn1, .dlBtn2 { text-align: center; }
  .cardName { white-space: normal; } /* 手机允许换行 */
}
@media(max-width:480px) {
  .cardGrid { grid-template-columns: 1fr; }
  .secGrid { grid-template-columns: 1fr; }
}

/* --- added: inline email link + investor legal note + team block spacing --- */
.inlineLink { color:#00e8ff; text-decoration:none; border-bottom:1px solid rgba(0,232,255,.4); transition:opacity .2s; }
.inlineLink:hover { opacity:.8; }
.legalNote { font-family:'Share Tech Mono',monospace; font-size:clamp(11px,1.3vw,12.5px); color:#7fb0c4; line-height:1.6; margin-top:20px; }
.teamBlock { margin-top:20px; }
.teamHead { font-family:'Rajdhani',sans-serif; font-weight:700; letter-spacing:.06em; color:#00e8ff; font-size:clamp(16px,2vw,20px); margin-bottom:10px; }
