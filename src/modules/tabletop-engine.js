/**
 * 3D Tabletop Wargame Engine (`i.tabletop`) + Mode Selector UI + Menu/Loop Bindings
 * Transforms both Missions (East Sea Mega Bridge & Red Sand Spaceport) into an 11-node
 * graph wargame supporting Solo 1P vs AI (`tt1p`) and Face-to-Face 2P Pass-and-Play (`tt2p`)
 * with automatic 180-degree table flip and dynamic marker safe-zone clamping.
 */
export const TABLETOP_ENGINE_CODE = `
let ttRoot=new wt;ttRoot.name="tabletop-board",i.scene&&i.scene.add(ttRoot);
const TT_MAPS={
  1:[
    {id:"n_gate",name:"苍穹登陆滩",x:-30,z:6,type:"atk_hq",adj:["n_n1","n_c1","n_s1"]},
    {id:"n_n1",name:"北堤闸口",x:-17,z:-17,type:"node",adj:["n_gate","n_n2","n_c1"]},
    {id:"n_n2",name:"乙·海底冷库",x:-2,z:-21,type:"relay",relay:"乙",adj:["n_n1","n_n3","n_c2"]},
    {id:"n_n3",name:"深蓝栈桥",x:16,z:-17,type:"node",adj:["n_n2","n_c3","n_ext"]},
    {id:"n_c1",name:"PT2C巨幕广场",x:-15,z:3,type:"supply",adj:["n_gate","n_n1","n_c2","n_s1"]},
    {id:"n_c2",name:"甲·堆场中枢",x:2,z:7,type:"relay",relay:"甲",adj:["n_n2","n_c1","n_c3","n_s2"]},
    {id:"n_c3",name:"中央指挥台",x:12,z:2,type:"def_hq",adj:["n_n3","n_c2","n_s3","n_ext"]},
    {id:"n_s1",name:"南港吊机弯",x:-15,z:19,type:"node",adj:["n_gate","n_c1","n_s2"]},
    {id:"n_s2",name:"BC22+补给锚点",x:4,z:20,type:"supply",adj:["n_s1","n_c2","n_s3"]},
    {id:"n_s3",name:"丙·深水泊位",x:22,z:17,type:"relay",relay:"丙",adj:["n_s2","n_c3","n_ext"]},
    {id:"n_ext",name:"神州撤离艇",x:25,z:2,type:"ext",adj:["n_n3","n_c3","n_s3"]}
  ],
  2:[
    {id:"m_gate",name:"西漠登陆营",x:-27,z:-15,type:"atk_hq",adj:["m_w1","m_c1"]},
    {id:"m_w1",name:"PT2C航天巨幕",x:-17,z:-2,type:"supply",adj:["m_gate","m_w2","m_c1"]},
    {id:"m_w2",name:"甲·敦煌熔盐塔",x:-13,z:11,type:"relay",relay:"甲",adj:["m_w1","m_w3","m_c3"]},
    {id:"m_w3",name:"熔盐蓄热南站",x:2,z:13,type:"node",adj:["m_w2","m_c3","m_e2"]},
    {id:"m_c1",name:"昆仑峡谷口",x:-10,z:-12,type:"node",adj:["m_gate","m_w1","m_c2"]},
    {id:"m_c2",name:"乙·昆仑射电眼",x:0,z:-13,type:"relay",relay:"乙",adj:["m_c1","m_c3","m_e1"]},
    {id:"m_c3",name:"沙盘中央前哨",x:7,z:1,type:"def_hq",adj:["m_w2","m_w3","m_c2","m_e1","m_e2","m_e3"]},
    {id:"m_e1",name:"BC22+沙丘哨",x:14,z:-11,type:"supply",adj:["m_c2","m_c3","m_ext"]},
    {id:"m_e2",name:"丙·火箭发射塔",x:16,z:12,type:"relay",relay:"丙",adj:["m_w3","m_c3","m_e3"]},
    {id:"m_e3",name:"旋翼机引道",x:22,z:2,type:"node",adj:["m_c3","m_e2","m_ext"]},
    {id:"m_ext",name:"断崖旋翼坪",x:22,z:-15,type:"ext",adj:["m_e1","m_e3"]}
  ]
};
let ttUI=document.createElement("div");ttUI.id="tt-ui";
ttUI.innerHTML=\`
  <div class="tt-markers" id="tt-markers"></div>
  <div class="tt-top-wrap">
    <div class="tt-top">
      <div class="tt-pillbar">
        <span class="tt-badge atk" id="tt-turn-badge">攻方回合 · P1</span>
        <span class="tt-stat" id="tt-round-st">第 1 / 6 轮</span>
        <span class="tt-stat" id="tt-ap-st">AP: 4</span>
        <span class="tt-stat" id="tt-relay-st">中继完好: 3/3</span>
      </div>
      <div class="tt-tools">
        <button type="button" class="tt-toolbtn" id="tt-flip-btn">同桌180°:开</button>
        <button type="button" class="tt-toolbtn" id="tt-zoom-in">+</button>
        <button type="button" class="tt-toolbtn" id="tt-zoom-out">-</button>
        <button type="button" class="tt-toolbtn" id="tt-cam-reset">回正视角</button>
        <button type="button" class="tt-toolbtn" id="tt-pause-btn">暂停</button>
      </div>
    </div>
    <div class="tt-log" id="tt-log">欢迎进入「苍穹沙盘」3D 战术桌游 · 点击下方己方棋子或地图节点开始行动！</div>
  </div>
  <div class="tt-dock">
    <div class="tt-row" id="tt-pawns-row"></div>
    <div class="tt-row">
      <div class="tt-cards" id="tt-cards-row"></div>
      <button type="button" class="tt-endbtn" id="tt-endturn-btn">结束回合</button>
    </div>
  </div>
  <div class="tt-handoff" id="tt-handoff">
    <div class="tt-ho-card">
      <h3 id="tt-ho-title">指挥权交接</h3>
      <p id="tt-ho-desc">请将设备转交下一位指挥官</p>
      <button type="button" class="btn primary" id="tt-ho-go">我已接手 · 开始行动</button>
    </div>
  </div>\`;
document.getElementById("ui").appendChild(ttUI);

let tt={
  active:!1,mode:"tt1p",round:1,maxRounds:6,side:"atk",ap:4,selectedId:null,
  nodes:[],nodeMap:new Map(),pawns:[],turrets:[],cardsUsed:{emp:0,aid:0,spec:0},
  camYaw:0.25,camTargetYaw:0.25,camDist:42,camPitch:.88,focusX:0,focusZ:0,
  dragId:-1,lx:0,ly:0,moved:0,aiQueue:[],aiTimer:0,cardTargetMode:null,
  projVec:new W(),v1:new W(),v2:new W()
};
function ttGroundY(x,z){let y=i.physics&&i.physics.groundHeight?i.physics.groundHeight(x,z,6):0;return Math.max(0,Math.min(4.2,y))}
function ttLog(msg){let el=ttUI.querySelector("#tt-log");el&&(el.innerHTML=msg)}
function ttDistHops(idA,idB){if(idA===idB)return 0;let q=[[idA,0]],seen=new Set([idA]);while(q.length){let [cur,d]=q.shift(),n=tt.nodeMap.get(cur);if(!n)continue;for(let nb of n.adj){if(nb===idB)return d+1;if(!seen.has(nb)){seen.add(nb);q.push([nb,d+1])}}}return 99}
function ttBuild3DPawn(p){let g=new wt;let isAtk=p.side==="atk",col=isAtk?16758861:3729663;let mat=new Nn({color:col}),dark=i.mats.get("painted_iron",{color:1849912});let ring=new Qe(new O0(.82,1.05,24,1).rotateX(-Math.PI/2),new Nn({color:col,side:Sn}));ring.position.y=.08;g.add(ring);if(p.kind==="leader"||p.kind==="boss"){let b=new Qe(ot(.36,.44,1.35,8),dark);b.position.y=.8;let h=new Qe(new ls(.28,10,8),mat);h.position.y=1.72;g.add(b,h)}else if(p.kind==="hound"){let b=new Qe(Wi(.72,.38,1.15,.03),dark);b.position.y=.55;let visor=new Qe(Wi(.5,.18,.18,.01),mat);visor.position.set(0,.62,.58);g.add(b,visor)}else if(p.kind==="drone"){let c=new Qe(Wi(.5,.2,.75,.02),dark);c.position.y=2.2;let w=new Qe(Wi(1.4,.06,.28,.01),mat);w.position.y=2.22;g.add(c,w)}else{let b=new Qe(ot(.4,.5,1.0,8),dark);b.position.y=.5;let head=new Qe(new ls(.28,10,8),mat);head.position.y=1.18;g.add(b,head)}ttRoot.add(g),p.mesh=g;let nd=tt.nodeMap.get(p.nodeId);nd&&g.position.set(nd.x,nd.y,nd.z)}
function ttClearBoard(){while(ttRoot.children.length)ttRoot.remove(ttRoot.children[0]);tt.nodeMap.clear(),tt.pawns.length=0,tt.turrets.length=0}
function ttInitBoard(mode){
  ttClearBoard(),tt.mode=mode||"tt1p",tt.round=1,tt.maxRounds=6,tt.side="atk",tt.ap=4,tt.selectedId=null,tt.cardTargetMode=null,tt.cardsUsed={emp:0,aid:0,spec:0},tt.aiQueue.length=0,tt.aiTimer=0;
  let defs=(TT_MAPS[i.missionId===2?2:1]||TT_MAPS[2]);
  tt.nodes=defs.map(d=>{let nd={...d,y:ttGroundY(d.x,d.z),owner:d.type==="def_hq"||d.type==="relay"?"def":d.type==="atk_hq"?"atk":"neu",relayCut:!1};tt.nodeMap.set(nd.id,nd);return nd});
  for(let nd of tt.nodes){
    let col=nd.type==="relay"?16747560:nd.type==="ext"?16768256:nd.type==="supply"?6481558:3729663;
    let pad=new Qe(new O0(1.05,1.38,24,1).rotateX(-Math.PI/2),new Nn({color:col,side:Sn,fog:!1}));
    pad.position.set(nd.x,nd.y+.12,nd.z),ttRoot.add(pad),nd.padMesh=pad;
    for(let nbId of nd.adj)if(nd.id<nbId){
      let nb=tt.nodeMap.get(nbId);if(!nb)continue;
      let dx=nb.x-nd.x,dy=nb.y-nd.y,dz=nb.z-nd.z,len=Math.hypot(dx,dy,dz)||1;
      let beam=new Qe(Wi(.18,.08,len,0),new Nn({color:3729663,fog:!1}));
      beam.position.set((nd.x+nb.x)/2,(nd.y+nb.y)/2+.1, (nd.z+nb.z)/2);
      beam.lookAt(nb.x,nb.y+.1,nb.z),ttRoot.add(beam);
    }
  }
  let mid=i.missionId===2?2:1, startAtk=mid===2?"m_gate":"n_gate", startDef1=mid===2?"m_c3":"n_c3", startDef2=mid===2?"m_w2":"n_c2", startDef3=mid===2?"m_e2":"n_n2";
  let initPawns=[
    {id:"a1",name:"BC6V突击队长",side:"atk",kind:"leader",nodeId:startAtk,hp:120,maxHp:120,dmg:42,range:2,moveLeft:2,acted:!1,stunned:!1,buffDmg:0},
    {id:"a2",name:"BC4机械犬游骑",side:"atk",kind:"hound",nodeId:startAtk,hp:95,maxHp:95,dmg:34,range:1,moveLeft:3,acted:!1,stunned:!1,buffDmg:0},
    {id:"a3",name:"PT2C巡飞无人机",side:"atk",kind:"drone",nodeId:startAtk,hp:80,maxHp:80,dmg:30,range:3,moveLeft:3,acted:!1,stunned:!1,buffDmg:0},
    {id:"d1",name:"重甲防卫队长",side:"def",kind:"leader",nodeId:startDef1,hp:135,maxHp:135,dmg:40,range:2,moveLeft:2,acted:!1,stunned:!1,buffDmg:0},
    {id:"d2",name:"巡逻机械猎犬",side:"def",kind:"hound",nodeId:startDef2,hp:95,maxHp:95,dmg:34,range:2,moveLeft:2,acted:!1,stunned:!1,buffDmg:0},
    {id:"d3",name:"高空防卫无人机",side:"def",kind:"drone",nodeId:startDef3,hp:85,maxHp:85,dmg:30,range:3,moveLeft:3,acted:!1,stunned:!1,buffDmg:0}
  ];
  for(let pw of initPawns){tt.pawns.push(pw),ttBuild3DPawn(pw)}
  ttResetCam(!1),ttSelectFirstPawn(),ttRenderUI();
}
function ttResetCam(keepSide){let isPort=innerWidth<innerHeight,isLand=innerWidth>innerHeight&&innerHeight<=560;tt.focusX=0,tt.focusZ=0,tt.camDist=isPort?76:(isLand?50:44),tt.camPitch=isPort?.94:.86;let baseYaw=isPort?-Math.PI/2:.24;if(keepSide&&tt.mode==="tt2p"&&tt.side==="def"&&!(i.settings&&i.settings.tableFlip===!1))baseYaw+=Math.PI;tt.camYaw=tt.camTargetYaw=baseYaw}
function ttSelectFirstPawn(){let cand=tt.pawns.find(p=>p.side===tt.side&&p.hp>0&&!p.stunned);tt.selectedId=cand?cand.id:null}
function ttNodePawns(nodeId,side){return tt.pawns.filter(p=>p.hp>0&&p.nodeId===nodeId&&(!side||p.side===side))}
function ttUpdatePawnOffset(pw){if(!pw.mesh)return;let nd=tt.nodeMap.get(pw.nodeId);if(!nd)return;let same=tt.pawns.filter(x=>x.hp>0&&x.nodeId===pw.nodeId),idx=same.indexOf(pw),ang=(idx/Math.max(1,same.length))*Math.PI*2,rad=same.length>1?.95:0;let tx=nd.x+Math.cos(ang)*rad,tz=nd.z+Math.sin(ang)*rad,ty=nd.y;pw.mesh.position.x+=(tx-pw.mesh.position.x)*.25,pw.mesh.position.z+=(tz-pw.mesh.position.z)*.25,pw.mesh.position.y=ty}
function ttFireVisual(fromNodeId,toNodeId,size=1){let f=tt.nodeMap.get(fromNodeId),t=tt.nodeMap.get(toNodeId);if(!f||!t)return;tt.v1.set(f.x,f.y+1.4,f.z),tt.v2.set(t.x,t.y+1.2,t.z);i.fx&&i.fx.tracer&&i.fx.tracer(tt.v1,tt.v2);i.fx&&i.fx.sparks&&i.fx.sparks(tt.v2,new W(0,1,0),8);size>1.1&&i.fx&&i.fx.explosion&&i.fx.explosion(tt.v2,size);a(i.audio,"play","rifle_shot",{gain:.7})}
function ttCheckWin(){
  let atkAlive=tt.pawns.some(p=>p.side==="atk"&&p.hp>0),defAlive=tt.pawns.some(p=>p.side==="def"&&p.hp>0);
  let cutCnt=tt.nodes.filter(n=>n.type==="relay"&&n.relayCut).length;
  let extNode=tt.nodes.find(n=>n.type==="ext"),leader=tt.pawns.find(p=>p.id==="a1"&&p.hp>0);
  let winner=null,reason="";
  if(!defAlive){winner="atk",reason="守方部队全灭，破袭方完胜！"}
  else if(cutCnt>=2&&leader&&extNode&&leader.nodeId===extNode.id){winner="atk",reason=\`已突破 \${cutCnt} 处中继并顺利抵达撤离点！\`}
  else if(!atkAlive){winner="def",reason="攻方小队已被彻底瓦解，防线完美守住！"}
  else if(tt.round>tt.maxRounds){winner="def",reason="成功坚守满 6 轮高压推演，守方胜利！"}
  if(!winner)return!1;
  ttUI.classList.remove("on"),tt.active=!1,ttClearBoard();
  let playerWon=tt.mode==="tt2p"||(winner===(i.role==="defend"?"def":"atk"));
  unlockMedal("table_master"),(tt.mode==="tt2p"||(winner==="def"&&cutCnt===0))&&unlockMedal("table_grand"),(i.tier||1)>=2&&unlockMedal("tier_ascend");
  addScore(playerWon?650:220,winner==="atk"?"沙盘攻方胜":"沙盘守方胜",!1);
  let rk=getRank(career.totalScore).name;
  l.setDebrief({time:c.time,accuracy:null,kills:tt.pawns.filter(p=>p.hp<=0).length,retries:0,rating:tt.mode==="tt2p"?(winner==="atk"?"攻方破袭获胜":"守方稳固获胜"):playerWon?"运筹帷幄":"惜败一局",score:c.score,career:career.totalScore,rank:rk,medals:[...career.medals],allMedals:MEDALS,tier:i.tier||1});
  M("complete"),l.show("complete");
  let dk=document.querySelector("#m-debrief-k"),dh=document.querySelector("#m-debrief-h");
  dk&&(dk.textContent=(i.missionId===2?"赤沙航天港":"东海深蓝港区")+(tt.mode==="tt2p"?" · 2P 双人面对面战棋简报":" · 苍穹沙盘战棋简报"));
  dh&&(dh.textContent=reason);
  return!0;
}
function ttRenderUI(){
  if(!tt.active)return;
  let tb=ttUI.querySelector("#tt-turn-badge");tb.className="tt-badge "+tt.side;
  tb.textContent=(tt.side==="atk"?"攻方行动":"守方行动")+(tt.mode==="tt2p"?(tt.side==="atk"?" · P1":" · P2"):tt.side===(i.role==="defend"?"def":"atk")?" · 己方":" · AI思考中");
  ttUI.querySelector("#tt-round-st").textContent=\`第 \${Math.min(tt.round,tt.maxRounds)} / \${tt.maxRounds} 轮\`;
  ttUI.querySelector("#tt-ap-st").textContent=\`AP: \${tt.ap}\`;
  let intact=tt.nodes.filter(n=>n.type==="relay"&&!n.relayCut).length;
  ttUI.querySelector("#tt-relay-st").textContent=\`中继完好: \${intact}/3\`;
  let fb=ttUI.querySelector("#tt-flip-btn");fb.classList.toggle("on",!(i.settings&&i.settings.tableFlip===!1));
  fb.textContent="同桌180°:"+(i.settings&&i.settings.tableFlip===!1?"关":"开");

  let sel=tt.pawns.find(p=>p.id===tt.selectedId&&p.hp>0);
  let pr=ttUI.querySelector("#tt-pawns-row");
  let sidePawns=tt.pawns.filter(p=>p.side===tt.side);
  pr.innerHTML=sidePawns.map(p=>{
    let nd=tt.nodeMap.get(p.nodeId),stTxt=p.hp<=0?"阵亡":p.stunned?"被EMP眩晕":p.acted?"已攻击":"可行动";
    return \`<button type="button" class="tt-pawn\${p.id===tt.selectedId?" sel":""}\${p.hp<=0?" dead":""}" data-pid="\${p.id}"><div class="tp-n">\${p.name}</div><div class="tp-m">HP \${p.hp}/\${p.maxHp} · \${nd?nd.name.slice(0,5):""} · \${stTxt}</div></button>\`;
  }).join("");

  let cr=ttUI.querySelector("#tt-cards-row"),empCd=tt.cardsUsed.emp>0,aidCd=tt.cardsUsed.aid>0;
  cr.innerHTML=\`
    <button type="button" class="tt-card\${tt.ap<2?" disabled":""}" data-cid="spec"><div class="tc-k">\${tt.side==="def"?"🛰️ PT2C哨兵台(2AP)":"🦅 BC4双目重击(2AP)"}</div><div class="tc-d">\${tt.side==="def"?"当前节点建自动炮塔":"选中单位伤害+25"}</div></button>
    <button type="button" class="tt-card\${tt.ap<2||empCd?" disabled":""}" data-cid="emp"><div class="tc-k">⚡ 研极芯EMP(2AP)</div><div class="tc-d">\${empCd?"冷却中":"15m敌军伤25+眩晕"}</div></button>
    <button type="button" class="tt-card\${tt.ap<1||aidCd?" disabled":""}" data-cid="aid"><div class="tc-k">📦 BC22+补给(1AP)</div><div class="tc-d">\${aidCd?"冷却中":"选中回血+50HP"}</div></button>
  \`;
}
function ttHandleActionNode(ndId){
  if(!tt.active||tt.ap<=0)return;
  if(tt.mode==="tt1p"&&tt.side!==(i.role==="defend"?"def":"atk"))return;
  let sel=tt.pawns.find(p=>p.id===tt.selectedId&&p.hp>0);
  if(!sel){
    let f=tt.pawns.find(p=>p.side===tt.side&&p.hp>0&&p.nodeId===ndId);
    if(f){tt.selectedId=f.id,ttRenderUI(),ttLog(\`已选中 \${f.name}\`);return}
    ttLog("请先点选下方一个己方单位！");return;
  }
  if(sel.stunned){ttLog(\`\${sel.name} 本回合被研极芯 EMP 眩晕！\`);return}
  let nd=tt.nodeMap.get(ndId);if(!nd)return;
  let enemies=ttNodePawns(ndId,tt.side==="atk"?"def":"atk");
  let hops=ttDistHops(sel.nodeId,ndId);
  if(enemies.length&&hops<=sel.range&&!sel.acted){
    let tgt=enemies[0],dmg=sel.dmg+(sel.buffDmg||0);sel.buffDmg=0,sel.acted=!0,tt.ap--,tgt.hp=Math.max(0,tgt.hp-dmg);
    ttFireVisual(sel.nodeId,ndId,tgt.hp<=0?1.35:1);
    if(tgt.hp<=0&&tgt.mesh){ttRoot.remove(tgt.mesh),tgt.mesh=null}
    ttLog(\`\${sel.name} 攻击 \${tgt.name}，造成 <b>\${dmg}</b> 伤害\${tgt.hp<=0?"（击毁！）":""}\`),addScore(85,"沙盘火力命中",!1),ttRenderUI(),ttCheckWin();return;
  }
  if(sel.nodeId===ndId&&nd.type==="relay"){
    if(tt.side==="atk"&&!nd.relayCut){nd.relayCut=!0,nd.owner="atk",tt.ap--,a(i.audio,"play","relay_cut",{gain:.9}),i.fx&&i.fx.explosion&&i.fx.explosion(new W(nd.x,nd.y+1,nd.z),1.4),ttLog(\`<b>\${nd.name}</b> 中继已成功切断！\`),addScore(180,"沙盘切断中继",!1),ttRenderUI(),ttCheckWin();return}
    if(tt.side==="def"&&nd.relayCut){nd.relayCut=!1,nd.owner="def",tt.ap--,ttLog(\`<b>\${nd.name}</b> 中继已纳米修复！\`),addScore(150,"沙盘修复中继",!1),ttRenderUI();return}
  }
  if(hops===1&&sel.moveLeft>0){
    sel.nodeId=ndId,sel.moveLeft--,tt.ap--,nd.owner=tt.side;
    ttLog(\`\${sel.name} 进驻 \${nd.name}\${nd.type==="ext"&&tt.side==="atk"?"（到达撤离点）":""}\`),ttRenderUI(),ttCheckWin();return;
  }
  let friend=tt.pawns.find(p=>p.side===tt.side&&p.hp>0&&p.nodeId===ndId);
  if(friend){tt.selectedId=friend.id,ttRenderUI(),ttLog(\`切换选择：\${friend.name}\`)}
}
function ttEndTurn(){
  if(!tt.active)return;
  tt.cardsUsed.emp=Math.max(0,tt.cardsUsed.emp-1),tt.cardsUsed.aid=Math.max(0,tt.cardsUsed.aid-1);
  if(tt.side==="atk"){tt.side="def"}else{tt.side="atk",tt.round++}
  if(ttCheckWin())return;
  for(let p of tt.pawns){if(p.side===tt.side){p.stunned=!1,p.acted=!1,p.moveLeft=p.kind==="leader"?2:3}}
  let supBonus=tt.nodes.filter(n=>n.type==="supply"&&n.owner===tt.side).length;
  tt.ap=4+supBonus;
  if(tt.side==="def"){
    for(let tr of tt.turrets){let trg=tt.pawns.find(p=>p.side==="atk"&&p.hp>0&&ttDistHops(tr.nodeId,p.nodeId)<=2);if(trg){trg.hp=Math.max(0,trg.hp-24);ttFireVisual(tr.nodeId,trg.nodeId,1);if(trg.hp<=0&&trg.mesh){ttRoot.remove(trg.mesh),trg.mesh=null}ttLog(\`神眸 PT2C 云台炮塔自动齐射 \${trg.name} (-24 HP)\`)}}
    if(ttCheckWin())return;
  }
  ttSelectFirstPawn();
  if(tt.mode==="tt2p"){
    tt.cardTargetMode=null;
    let ho=ttUI.querySelector("#tt-handoff");
    ttUI.querySelector("#tt-ho-title").textContent=(tt.side==="atk"?"红方 · 攻方指挥官回合":"青方 · 神眸守卫回合")+\` (第 \${tt.round}/\${tt.maxRounds} 轮)\`;
    ttUI.querySelector("#tt-ho-desc").textContent=(i.settings&&i.settings.tableFlip!==!1)?"请确认桌对面指挥官就绪，点击后沙盘将自动旋转 180° 对准您！":"请将设备交由对应指挥官后继续操作！";
    ho.classList.add("on");
  }else if(tt.side!==(i.role==="defend"?"def":"atk")){
    tt.aiTimer=.65,ttLog("AI 指挥官正在推演决策...");
  }
  ttRenderUI();
}
function ttRunAIStep(){
  let aiPawns=tt.pawns.filter(p=>p.side===tt.side&&p.hp>0&&!p.stunned);
  if(!aiPawns.length||tt.ap<=0){ttEndTurn();return}
  for(let p of aiPawns){
    if(!p.acted){
      let opp=tt.pawns.find(e=>e.side!==tt.side&&e.hp>0&&ttDistHops(p.nodeId,e.nodeId)<=p.range);
      if(opp){tt.selectedId=p.id,opp.hp=Math.max(0,opp.hp-p.dmg),p.acted=!0,tt.ap--,ttFireVisual(p.nodeId,opp.nodeId,opp.hp<=0?1.3:1);if(opp.hp<=0&&opp.mesh){ttRoot.remove(opp.mesh),opp.mesh=null}ttLog(\`AI \${p.name} 攻击 \${opp.name} (-\${p.dmg} HP)\`),ttRenderUI(),ttCheckWin();return}
    }
    let nd=tt.nodeMap.get(p.nodeId);
    if(nd&&nd.type==="relay"&&((tt.side==="atk"&&!nd.relayCut)||(tt.side==="def"&&nd.relayCut))){
      if(tt.side==="atk"){nd.relayCut=!0,nd.owner="atk",tt.ap--,ttLog(\`AI 切断中继 \${nd.name}\`)}else{nd.relayCut=!1,nd.owner="def",tt.ap--,ttLog(\`AI 修复中继 \${nd.name}\`)}
      ttRenderUI(),ttCheckWin();return;
    }
    if(p.moveLeft>0&&nd){
      let goal=tt.nodes.find(n=>tt.side==="atk"?(n.type==="relay"&&!n.relayCut)||n.type==="ext":n.type==="relay"&&n.relayCut)||tt.nodes[5];
      let bestNb=nd.adj[0],bestD=99;
      for(let nbId of nd.adj){let hd=ttDistHops(nbId,goal.id);if(hd<bestD){bestD=hd,bestNb=nbId}}
      if(bestNb){p.nodeId=bestNb,p.moveLeft--,tt.ap--,ttLog(\`AI \${p.name} 调动至 \${tt.nodeMap.get(bestNb).name}\`),ttRenderUI(),ttCheckWin();return}
    }
  }
  ttEndTurn();
}
ttUI.addEventListener("click",ev=>{
  let btn=ev.target.closest("button");if(!btn||!tt.active)return;
  ev.stopPropagation(),i.events.emit("ui:click",{});
  if(btn.id==="tt-pause-btn"){G();return}
  if(btn.id==="tt-endturn-btn"){ttEndTurn();return}
  if(btn.id==="tt-ho-go"){ttUI.querySelector("#tt-handoff").classList.remove("on");if(i.settings&&i.settings.tableFlip!==!1)tt.camTargetYaw+=Math.PI;return}
  if(btn.id==="tt-flip-btn"){i.settings&&(i.settings.tableFlip=!i.settings.tableFlip,Wf(i.settings));ttRenderUI();return}
  if(btn.id==="tt-zoom-in"){tt.camDist=Math.max(24,tt.camDist-6);return}
  if(btn.id==="tt-zoom-out"){tt.camDist=Math.min(92,tt.camDist+6);return}
  if(btn.id==="tt-cam-reset"){ttResetCam(!0);return}
  if(btn.dataset.pid){tt.selectedId=btn.dataset.pid,ttRenderUI(),ttLog("已选中单位，请点亮色节点移动或攻击！");return}
  if(btn.dataset.nd){ttHandleActionNode(btn.dataset.nd);return}
  if(btn.dataset.cid){
    let cid=btn.dataset.cid,sel=tt.pawns.find(p=>p.id===tt.selectedId&&p.hp>0);
    if(cid==="spec"&&tt.ap>=2&&sel){
      tt.ap-=2;
      if(tt.side==="def"){let nd=tt.nodeMap.get(sel.nodeId),tm=new Qe(ot(.32,.4,.9,8),new Nn({color:3729663}));tm.position.set(nd.x+.8,nd.y+.45,nd.z+.8),ttRoot.add(tm),tt.turrets.push({nodeId:sel.nodeId,mesh:tm}),ttLog("🛰️ 已架设【神眸 PT2C】云台自动炮塔！")}
      else{sel.buffDmg+=25,ttLog(\`🦅 \${sel.name} 激活【BC4 Pro+ 双目锁定】下次攻击 +25 伤害！\`)}
    }else if(cid==="emp"&&tt.ap>=2&&tt.cardsUsed.emp===0){
      tt.ap-=2,tt.cardsUsed.emp=2;let cnt=0;
      for(let e of tt.pawns)if(e.side!==tt.side&&e.hp>0){e.hp=Math.max(0,e.hp-25),e.stunned=!0,cnt++;if(e.hp<=0&&e.mesh){ttRoot.remove(e.mesh),e.mesh=null}}
      i.fx&&i.fx.explosion&&i.fx.explosion(new W(0,1.5,0),2),ttLog(\`⚡ 【神眸研极芯 EMP】释放！震慑敌方 \${cnt} 个单位并致其下轮眩晕！\`);
    }else if(cid==="aid"&&tt.ap>=1&&tt.cardsUsed.aid===0&&sel){
      tt.ap--,tt.cardsUsed.aid=2,sel.hp=Math.min(sel.maxHp,sel.hp+50),ttLog(\`📦 【神眸 BC22+ 补给箱】已投送，\${sel.name} 恢复 +50 HP！\`);
    }
    ttRenderUI(),ttCheckWin();return;
  }
});
let ttDragEl=document.getElementById("view");
ttDragEl.addEventListener("pointerdown",ev=>{if(!tt.active||ev.target!==ttDragEl)return;tt.dragId=ev.pointerId,tt.lx=ev.clientX,tt.ly=ev.clientY,tt.moved=0});
addEventListener("pointermove",ev=>{if(!tt.active||tt.dragId!==ev.pointerId)return;let dx=ev.clientX-tt.lx,dy=ev.clientY-tt.ly;tt.lx=ev.clientX,tt.ly=ev.clientY,tt.moved+=Math.hypot(dx,dy),tt.camTargetYaw-=dx*.005,tt.camPitch=Zn(tt.camPitch+dy*.003,.42,1.25)});
addEventListener("pointerup",ev=>{tt.dragId===ev.pointerId&&(tt.dragId=-1)});
i.tabletop={
  start(mode){tt.active=!0,ttInitBoard(mode),ttUI.classList.add("on")},
  stop(){tt.active=!1,ttUI.classList.remove("on"),ttClearBoard()},
  endTurn:ttEndTurn,
  getState(){return{active:tt.active,mode:tt.mode,round:tt.round,side:tt.side,ap:tt.ap,nodes:tt.nodes.length,camYaw:tt.camYaw,camTargetYaw:tt.camTargetYaw,pawns:tt.pawns.map(p=>({id:p.id,side:p.side,hp:p.hp,nodeId:p.nodeId}))}},
  actNode:ttHandleActionNode,
  update(P){
    if(!tt.active)return;
    c.time+=P;
    for(let pw of tt.pawns)pw.hp>0&&ttUpdatePawnOffset(pw);
    tt.camYaw+=(tt.camTargetYaw-tt.camYaw)*Math.min(1,P*10);
    let cy=tt.focusX+Math.sin(tt.camYaw)*Math.cos(tt.camPitch)*tt.camDist,ch=Math.sin(tt.camPitch)*tt.camDist,cz=tt.focusZ+Math.cos(tt.camYaw)*Math.cos(tt.camPitch)*tt.camDist;
    i.camera.position.set(cy,ch,cz),i.camera.lookAt(tt.focusX,1.2,tt.focusZ);
    if(tt.mode==="tt1p"&&tt.side!==(i.role==="defend"?"def":"atk")){tt.aiTimer-=P;if(tt.aiTimer<=0){tt.aiTimer=.55,ttRunAIStep()}}
    let sel=tt.pawns.find(p=>p.id===tt.selectedId&&p.hp>0),mk=ttUI.querySelector("#tt-markers");
    if(mk){
      let htmlStr="",W0=innerWidth,H0=innerHeight,tw=ttUI.querySelector(".tt-top-wrap"),dk=ttUI.querySelector(".tt-dock"),topSafe=Math.round((tw?tw.getBoundingClientRect().bottom:80)+20),botSafe=Math.round((dk?dk.getBoundingClientRect().top:H0-120)-22);
      topSafe=Math.min(topSafe,H0*.4),botSafe=Math.max(botSafe,topSafe+40);
      for(let nd of tt.nodes){
        tt.projVec.set(nd.x,nd.y+1.8,nd.z).project(i.camera);
        if(tt.projVec.z>1)continue;
        let sx=Math.max(46,Math.min(W0-46,Math.round((tt.projVec.x*.5+.5)*W0))),sy=Math.max(topSafe,Math.min(botSafe,Math.round((-tt.projVec.y*.5+.5)*H0)));
        let ps=ttNodePawns(nd.id),hops=sel?ttDistHops(sel.nodeId,nd.id):99,en=ps.some(p=>p.side!==tt.side),reach=!!(sel&&!sel.stunned&&tt.ap>0&&(hops===1&&sel.moveLeft>0)),tgt=!!(sel&&!sel.stunned&&tt.ap>0&&en&&!sel.acted&&hops<=sel.range);
        let cls="tt-nbtn "+(nd.owner==="atk"?"atk-ctl":nd.owner==="def"?"def-ctl":"")+(reach?" reach":"")+(tgt?" target":"");
        let pNames=ps.map(p=>p.side==="atk"?"🟠"+p.name.slice(0,4):"🔵"+p.name.slice(0,4)).join(" ");
        let tag=nd.type==="relay"?(nd.relayCut?"[已破]":\`[\${nd.relay}核]\`):nd.type==="supply"?"[补给]":nd.type==="ext"?"[撤离]":"";
        let hpPct=ps.length?Math.round(ps[0].hp/ps[0].maxHp*100):0;
        htmlStr+=\`<button type="button" class="\${cls}" data-nd="\${nd.id}" style="left:\${sx.toFixed(1)}px;top:\${sy.toFixed(1)}px"><span>\${nd.name}\${tag}</span>\${pNames?\`<b>\${pNames}</b>\`:""}\${ps.length?\`<div class="tt-hp"><i style="width:\${hpPct}%"></i></div>\`:""}</button>\`;
      }
      mk.innerHTML=htmlStr;
    }
  }
};
`;

export const TABLETOP_PATCHES = [
  {
    label: 'title-mode-selector',
    target: '<div class="m-missions" role="group" aria-label="任务关卡选择">',
    replacement: `<div class="m-modes" role="group" aria-label="游玩模式选择（兼顾手游与桌游）">
          <button type="button" class="m-mode active" data-pmode="fps"><div class="mm-k">手游 · 端游即时动作</div><div class="mm-t">🎯 3D 第一人称枪战</div><div class="mm-d">手机触屏/自动瞄准 · 电脑键鼠 · 立体攻防切换</div></button>
          <button type="button" class="m-mode" data-pmode="tt1p"><div class="mm-k">桌游 · 沙盘单人推演</div><div class="mm-t">♟️ 苍穹沙盘（1P 人机）</div><div class="mm-d">3D 俯瞰棋盘 · 神眸指令卡 · 单手零压力</div></button>
          <button type="button" class="m-mode" data-pmode="tt2p"><div class="mm-k">桌游 · 同桌面对面联机</div><div class="mm-t">🤝 双人战棋（2P 对弈）</div><div class="mm-d">传机对战 · 180°对坐自动翻转 · 面对面下棋</div></button>
        </div>
        <div class="m-missions" role="group" aria-label="任务关卡选择">`
  },
  {
    label: 'settings-v3-toggles',
    target: '<div class="row" data-row="fs"><label id="l-fs">显示模式</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">进入全屏</span></button></div>',
    replacement: `<div class="row"><label id="l-aa">手机智能磁吸自瞄</label><button class="toggle" data-act="aimAssist" aria-labelledby="l-aa" aria-pressed="true"><i></i><span>开启</span></button></div>
        <div class="row"><label id="l-af">触屏智能自动开火</label><button class="toggle" data-act="autoFire" aria-labelledby="l-af" aria-pressed="true"><i></i><span>开启</span></button></div>
        <div class="row"><label id="l-gy">陀螺仪体感瞄准</label><button class="toggle" data-act="gyroAim" aria-labelledby="l-gy" aria-pressed="false"><i></i><span>关闭</span></button></div>
        <div class="row"><label id="l-tf">双人桌游面对面翻转(180°)</label><button class="toggle" data-act="tableFlip" aria-labelledby="l-tf" aria-pressed="true"><i></i><span>开启</span></button></div>
        <div class="row" data-row="fs"><label id="l-fs">显示模式</label><button class="btn small" data-act="fullscreen" aria-labelledby="l-fs fs-t"><span id="fs-t">进入全屏</span></button></div>`
  },
  {
    label: 'pm-sync-modes',
    target: 'function syncMissionUI(){let isM2=i.missionId===2,isDef=i.role==="defend",tr=i.tier||1;',
    replacement: `i.settings=n,i.toggleAutoFire=()=>{n.autoFire=!n.autoFire,Wf(n),g()};
function syncMissionUI(){let isM2=i.missionId===2,isDef=i.role==="defend",tr=i.tier||1,pm=i.playMode||"fps";for(let mb of r(".m-mode"))mb.classList.toggle("active",mb.dataset.pmode===pm);`
  },
  {
    label: 'pm-tag-code-mode',
    target: 'o("#m-tag-code").textContent=(isM2?"D7":"B4")+(isDef?"·守":"·攻")+"·T"+tr,',
    replacement: 'o("#m-tag-code").textContent=(isM2?"D7":"B4")+(pm==="tt2p"?"·双人棋":pm==="tt1p"?"·沙盘":isDef?"·守":"·攻")+"·T"+tr,'
  },
  {
    label: 'pm-preserve-tabletop-debrief',
    target: 'o("#m-debrief-k").textContent=(isM2?"赤沙航天港":"东海深蓝港区")+(isDef?` · 防卫简报 · TIER ${tr}`:` · 突击简报 · TIER ${tr}`),o("#m-debrief-h").textContent=isDef?"核心中继防线已成功守住":isM2?"赤沙航天港危机已解除":"东海深蓝港区已解除封锁"',
    replacement: '(pm==="fps")&&(o("#m-debrief-k").textContent=(isM2?"赤沙航天港":"东海深蓝港区")+(isDef?` · 防卫简报 · TIER ${tr}`:` · 突击简报 · TIER ${tr}`),o("#m-debrief-h").textContent=isDef?"核心中继防线已成功守住":isM2?"赤沙航天港危机已解除":"东海深蓝港区已解除封锁")'
  },
  {
    label: 'pm-apply-settings-to-i',
    target: 'function v(U){',
    replacement: 'function v(U){i.settings=n;i.syncTouchUI&&i.syncTouchUI();'
  },
  {
    label: 'pm-sync-toggle-ui',
    target: 'let T=o(\'[data-act="invert"]\');T.setAttribute("aria-pressed",String(n.invertY)),T.querySelector("span").textContent=n.invertY?"开启":"关闭",',
    replacement: 'for(let [act,val] of [["invert",n.invertY],["aimAssist",n.aimAssist],["autoFire",n.autoFire],["gyroAim",n.gyroAim],["tableFlip",n.tableFlip]]){let b=o(`[data-act="${act}"]`);b&&(b.setAttribute("aria-pressed",String(!!val)),b.querySelector("span").textContent=val?"开启":"关闭")}'
  },
  {
    label: 'pm-click-pmode',
    target: 'let rc=U.target.closest(".m-rcard");if(rc&&s.contains(rc)){',
    replacement: `let mb=U.target.closest(".m-mode");if(mb&&s.contains(mb)){i.events.emit("ui:click",{}),i.playMode=mb.dataset.pmode||"fps",syncMissionUI();return}
let rc=U.target.closest(".m-rcard");if(rc&&s.contains(rc)){`
  },
  {
    label: 'pm-click-settings-toggles',
    target: 'D==="invert"?(n.invertY=!n.invertY,v("invertY"),g(),Wf(n)):D==="fullscreen"?M():D&&e[D]&&e[D](U)',
    replacement: 'D==="invert"?(n.invertY=!n.invertY,v("invertY"),g(),Wf(n)):D==="aimAssist"?(n.aimAssist=!n.aimAssist,v("aimAssist"),g(),Wf(n)):D==="autoFire"?(n.autoFire=!n.autoFire,v("autoFire"),g(),Wf(n)):D==="tableFlip"?(n.tableFlip=!n.tableFlip,v("tableFlip"),g(),Wf(n)):D==="gyroAim"?((()=>{if(!n.gyroAim&&typeof DeviceOrientationEvent<"u"&&typeof DeviceOrientationEvent.requestPermission=="function"){DeviceOrientationEvent.requestPermission().then(st=>{st==="granted"&&(n.gyroAim=!0,v("gyroAim"),g(),Wf(n))}).catch(()=>{})}else{n.gyroAim=!n.gyroAim,v("gyroAim"),g(),Wf(n)}})()):D==="fullscreen"?M():D&&e[D]&&e[D](U)'
  },
  {
    label: 'add-tabletop-medals',
    target: '{id:"tier_ascend",icon:"⭐",name:"无尽远征",bonus:500,desc:"突破并完成 Tier 2+ 高阶战局"}]',
    replacement: '{id:"tier_ascend",icon:"⭐",name:"无尽远征",bonus:500,desc:"突破并完成 Tier 2+ 高阶战局"},{id:"table_master",icon:"♟️",name:"沙盘运筹",bonus:350,desc:"完成一局苍穹沙盘 3D 战棋胜局"},{id:"table_grand",icon:"🤝",name:"桌面棋圣",bonus:450,desc:"在 2P 面对面战棋或无失守沙盘中获胜"}]'
  },
  {
    label: 'guard-lock-calls',
    target: 'l=pM(i,{deploy(){a(i.audio,"resume"),r.requestLock(),U({})},resume(){j(!0)},restart(){a(i.audio,"resume"),r.requestLock(),c.retries++,U({quick:!0,keepRetries:!0})},retry(){a(i.audio,"resume"),r.requestLock(),c.retries++,U({quick:!0,keepRetries:!0})},redeploy(){a(i.audio,"resume"),r.requestLock(),U({quick:!0})},nexttier(){a(i.audio,"resume"),r.requestLock(),i.tier=(i.tier||1)+1,l.syncMissionUI&&l.syncMissionUI(),o.feed&&o.feed(`⚔️ 已晋升至 <b>Tier ${i.tier}</b> 高压战局`),U({quick:!0})},switchrole(){switchRole()},',
    replacement: 'tryLockFPS=()=>{!r.touch&&!IS_TOUCH_DEV&&(i.playMode||"fps")==="fps"&&r.requestLock()},\nl=pM(i,{deploy(){a(i.audio,"resume"),tryLockFPS(),U({})},resume(){j(!0)},restart(){a(i.audio,"resume"),tryLockFPS(),c.retries++,U({quick:!0,keepRetries:!0})},retry(){a(i.audio,"resume"),tryLockFPS(),c.retries++,U({quick:!0,keepRetries:!0})},redeploy(){a(i.audio,"resume"),tryLockFPS(),U({quick:!0})},nexttier(){a(i.audio,"resume"),tryLockFPS(),i.tier=(i.tier||1)+1,l.syncMissionUI&&l.syncMissionUI(),o.feed&&o.feed(`⚔️ 已晋升至 <b>Tier ${i.tier}</b> 高压战局`),U({quick:!0})},switchrole(){switchRole()},backtitle(){i.tabletop&&i.tabletop.stop(),w(),H(),o.show(!1),r.setGameplay&&r.setGameplay(!1),l.syncMissionUI&&l.syncMissionUI(),l.show("title"),M("title")},'
  },
  {
    label: 'switchmission-stop-tabletop',
    target: 'switchmission(){let nextId=i.missionId===2?1:2;i.switchMission&&i.switchMission(nextId).then(()=>{l.syncMissionUI&&l.syncMissionUI(),w(),H(),o.show(!1),l.show("title"),M("title")})}',
    replacement: 'switchmission(){i.tabletop&&i.tabletop.stop();let nextId=i.missionId===2?1:2;i.switchMission&&i.switchMission(nextId).then(()=>{l.syncMissionUI&&l.syncMissionUI(),w(),H(),o.show(!1),l.show("title"),M("title")})}'
  },
  {
    label: 'paused-backtitle-btn',
    target: '<button class="btn" data-act="restart">重新开始任务</button>',
    replacement: '<button class="btn" data-act="restart">重新开始任务</button>\n        <button class="btn" data-act="backtitle">返回模式主界面</button>'
  },
  {
    label: 'complete-backtitle-btn',
    target: '<button class="btn" data-act="switchmission">切换下一战区</button></div>',
    replacement: '<button class="btn" data-act="switchmission">切换下一战区</button><button class="btn" data-act="backtitle">返回模式主界面</button></div>'
  },
  {
    label: 'controls-zc-v3',
    target: '<div><dt>冲刺</dt><dd>将摇杆推到最前方</dd></div>\n  </dl>`;',
    replacement: '<div><dt>冲刺</dt><dd>将摇杆推到最前方</dd></div>\n    <div><dt>智能自瞄</dt><dd>右上胶囊一键切换自动开火；设置可开启陀螺仪</dd></div>\n    <div><dt>沙盘桌游</dt><dd>主界面选「1P 沙盘」或「2P 对弈」，单指拖拽旋转视角、点击棋盘节点调兵与释放神眸卡牌</dd></div>\n  </dl>`;'
  },
  {
    label: 'about-copy-v3',
    target: '<p><strong>攻防平衡与永续成长：</strong>守方神盾炮塔与友军具备有限持久与耐久度，迎战 4 波分路强攻与双首领；攻方强化 11s EMP 超载与 <b>[G]</b> 自动突击僚机。完局不终止，可通过<b>阶梯晋升 (Tier +1)</b>、实时连击倍率与 8 枚荣誉勋章持续冲击更高军衔！</p>',
    replacement: '<p><strong>V3 手游×桌游双栖形态：</strong>打开网页即刻开战！支持手机竖屏/横屏触控 3D 第一人称枪战（内建磁吸自瞄、自动开火胶囊与陀螺仪体感），并新增「苍穹沙盘 1P 人机」与「2P 面对面战棋（同桌 180° 自动反转视角 + 神眸战术卡牌）」。</p>\n        <p><strong>攻防平衡与永续成长：</strong>守方神盾炮塔与友军具备有限持久与耐久度，迎战 4 波分路强攻与双首领；攻方强化 11s EMP 超载与 <b>[G]</b> 自动突击僚机。完局不终止，可通过<b>阶梯晋升 (Tier +1)</b>、实时连击倍率与 10 枚荣誉勋章持续冲击更高军衔！</p>'
  },
  {
    label: 'inject-tabletop-engine',
    target: 'let tacRoot=new wt;tacRoot.name="tactical-entities",i.scene&&i.scene.add(tacRoot);',
    replacement: TABLETOP_ENGINE_CODE + '\nlet tacRoot=new wt;tacRoot.name="tactical-entities",i.scene&&i.scene.add(tacRoot);'
  },
  {
    label: 'mM-U-tabletop-entry',
    target: 'function U({skipIntro:P=!1,quick:V=!1,keepRetries:Y=!1}={}){if(Y||(c.retries=0),l.show("none"),l.locationCard(!1),a(i.audio,"setPaused",!1),H(),a(i.weapon,"setVisible",!0),g=!1,P){e.fade=0,T();return}',
    replacement: `function U({skipIntro:P=!1,quick:V=!1,keepRetries:Y=!1}={}){Y||(c.retries=0);l.show("none"),l.locationCard(!1),a(i.audio,"setPaused",!1),H(),g=!1;if(i.playMode==="tt1p"||i.playMode==="tt2p"){n.enabled=!1,a(i.weapon,"setVisible",!1),r.setGameplay&&r.setGameplay(!1),o.show(!1),e.fade=0,i.tabletop.start(i.playMode),M("tabletop");return}i.tabletop&&i.tabletop.stop(),a(i.weapon,"setVisible",!0);if(P){e.fade=0,T();return}`
  },
  {
    label: 'mM-G-tabletop-pause',
    target: 'function G(){_.state==="playing"&&(r.setGameplay&&r.setGameplay(!1),',
    replacement: 'function G(){(_.state==="playing"||_.state==="tabletop")&&(ttUI.classList.remove("on"),r.setGameplay&&r.setGameplay(!1),'
  },
  {
    label: 'mM-j-tabletop-resume',
    target: 'function j(P){_.state==="paused"&&(l.show("none"),a(i.audio,"setPaused",!1),o.show(!0),r.setGameplay&&r.setGameplay(!0),g=!1,r.requestLock(),M("playing"),setTimeout(()=>C(!0),700))}',
    replacement: 'function j(P){_.state==="paused"&&(l.show("none"),a(i.audio,"setPaused",!1),i.tabletop&&i.playMode&&i.playMode!=="fps"?(ttUI.classList.add("on"),M("tabletop")):(o.show(!0),r.setGameplay&&r.setGameplay(!0),g=!1,tryLockFPS(),M("playing"),setTimeout(()=>C(!0),700)))}'
  },
  {
    label: 'mM-B-tabletop-loop',
    target: 'function B(P){switch(u+=P,_.state){case"title":return z(P),!1;',
    replacement: 'function B(P){(_svW!==innerWidth||_svH!==innerHeight)&&syncViewportEnv();switch(u+=P,_.state){case"title":return ttUI.classList.remove("on"),z(P),!1;case"tabletop":return i.tabletop&&i.tabletop.update(P),!1;'
  }
];
