/**
 * Bionic Quadruped Hound Overhaul, Global Character Rig Upgrades & Catharsis Feedback System
 *
 * 1. Defender Bionic Guardian Hound (`spawnAllyGuard` + `buildBionicHoundRig`):
 *    - Sculpted pearl-ivory & champagne-titanium bionic quadruped inspired by modern embodied-AI
 *      quadruped kinematics (672x355x432mm proportion ratio, zero third-party logos).
 *    - Elevated hooded binocular camera pod + central pill ToF depth sensor + top cyan neural strip +
 *      vertical sternum keel bracket.
 *    - 4 coaxial dual-drum hip/shoulder servo actuators with machined cooling rings & curved
 *      Catmull-Rom braided power conduits (`Fn`).
 *    - 4 articulated S-curve reverse-knee legs (`hipPivot` + `kneePivot` + elastomer paw pads)
 *      with real-time diagonal trot gait, body pitch/roll banking, and idle breathing.
 *    - Ventral heat-sink fins + 4 rubber belly crouch pads + rear 432Wh battery LED array +
 *      dorsal 20kg payload rail deck mounting a dual-barrel electromagnetic pulse turret.
 *    - 720-degree aerial backflip shockwave (`al.flipT`) + automatic deployment of 1 Bionic Guardian
 *      Hound at Defender mission start.
 * 2. Upgraded First-Person ViewModels (`houndVm` & `droneVm`) & Global Characters (`spawnTurret`,
 *    `spawnWingman`, `opHolo`, and dynamic `Elite`/`Boss`/`Saboteur` 3D armor attachments).
 * 3. Continuous Catharsis & Dopamine Feedback Loop ("持续激发用户的爽感"):
 *    - 3D-to-2D floating damage & weakpoint crit popups (`#h-popups`, `pointer-events: none !important`).
 *    - 5-stage Kill-Streak Announcer (`#h-streak`, `pointer-events: none !important`) with instant
 *      gameplay rewards (Ammo Refill + Heal -> Skill CD Reset -> 5.5s Hyper-Frenzy -> Orbital EMP Bolt).
 *    - Active `[F]` Tactical Pulse Shockwave (`r.pressed("melee")`) + Bionic Pack Flip command +
 *      Hound landing shockwave + Relay harmonic wave.
 */

export const BIONIC_CATHARSIS_PATCHES = [
  // 1. Emit exact damage amount on enemy:hit in both Hound (iM) and Gull (Q_) and player:hitEnemy
  {
    label: 'bionic-enemy-hit-hound-dmg',
    target: `s.events.emit("enemy:hit",{enemy:m,point:D,part:G||"body"})`,
    replacement: `s.events.emit("enemy:hit",{enemy:m,point:D,part:G||"body",damage:T})`
  },
  {
    label: 'bionic-enemy-hit-gull-dmg',
    target: `s.events.emit("enemy:hit",{enemy:d,point:b,part:A||"body"})`,
    replacement: `s.events.emit("enemy:hit",{enemy:d,point:b,part:A||"body",damage:y})`
  },
  {
    label: 'bionic-player-hit-enemy-dmg',
    target: `i.events.emit("player:hitEnemy",{enemy:c.enemy,part:c.part,killed:h,weak:c.part==="weak"})`,
    replacement: `i.events.emit("player:hitEnemy",{enemy:c.enemy,part:c.part,killed:h,weak:c.part==="weak",damage:Math.round(o*u),point:c.point})`
  },

  // 2. Upgrade First-Person ViewModels (droneVm & houndVm) with articulated bionic shoulder actuators,
  //    braided cables, hooded visor rim, spinning drone rotors, and alternating barrel recoil
  {
    label: 'bionic-fp-viewmodels',
    target: `let droneVm=new wt,houndVm=new wt;{let cMat=new Nn({color:3729663}),aMat=new Nn({color:16750632});droneVm.add(o(Ce(Wi(.16,.065,.24,.01),0,-.21,-.32),r),o(Ce( new ls(.026,12,8),0,-.21,-.44),cMat));for(let sx of[-1,1])droneVm.add(o(Ce(Si(.016,.016,.34,10),sx*.15,-.19,-.38),l),o(Ce(Si(.022,.022,.14,10),sx*.15,-.19,-.35),cMat),o(Ce(Wi(.04,.04,.18,.006),sx*.15,-.19,-.3),r));for(let sx of[-1,1])houndVm.add(o(Ce(Wi(.092,.105,.4,.012),sx*.25,-.16,-.36),u),o(Ce(Si(.024,.024,.46,12),sx*.25,-.15,-.48),l),o(Ce(Wi(.098,.024,.22,.004),sx*.25,-.15,-.36),aMat),o(Ce(Si(.032,.032,.07,10),sx*.25,-.15,-.68),r));droneVm.traverse(Me=>{Me.layers.set(zc)}),houndVm.traverse(Me=>{Me.layers.set(zc)}),droneVm.visible=!1,houndVm.visible=!1,i.camera.add(droneVm),i.camera.add(houndVm)}`,
    replacement: `let droneVm=new wt,houndVm=new wt,droneRotors=[],houndGuns=[];{let cMat=new Nn({color:3729663}),aMat=new Nn({color:16750632}),ivMat=new Qt({color:15397110,metalness:.3,roughness:.32}),chMat=new Qt({color:12104358,metalness:.72,roughness:.25}),dkMat=new Qt({color:1843238,metalness:.6,roughness:.4}),rDiscMat=new Nn({color:3729663,transparent:!0,opacity:.32,side:Sn});droneVm.add(o(Ce(Wi(.18,.058,.26,.012),0,-.21,-.32),ivMat),o(Ce(Wi(.13,.042,.16,.008),0,-.17,-.34),dkMat),o(Ce(new ls(.028,12,8),-.032,-.21,-.45),cMat),o(Ce(new ls(.022,12,8),.032,-.21,-.45),aMat),o(Ce(Wi(.06,.012,.02,.003),0,-.18,-.45),cMat));for(let sx of[-1,1]){let arm=o(Ce(Wi(.16,.018,.032,.005),sx*.16,-.18,-.42,0,sx*.32,0),dkMat),nac=o(Ce(ot(.028,.024,.045,10),sx*.23,-.17,-.47),chMat),rGrp=new wt;rGrp.position.set(sx*.23,-.145,-.47),rGrp.add(o(Ce(Wi(.17,.004,.018,.001),0,0,0),ivMat),o(Ce(Wi(.018,.004,.17,.001),0,0,0),ivMat),o(Ce(new O0(.02,.088,16,1).rotateX(-Math.PI/2),0,.002,0),rDiscMat)),droneRotors.push(rGrp),droneVm.add(arm,nac,rGrp,o(Ce(Si(.016,.016,.36,10),sx*.14,-.205,-.39),l),o(Ce(Si(.023,.023,.15,10),sx*.14,-.205,-.36),cMat),o(Ce(Wi(.042,.042,.19,.006),sx*.14,-.205,-.3),r))}houndVm.add(o(Ce(Wi(.22,.038,.14,.01),0,-.23,-.36),ivMat),o(Ce(Wi(.18,.024,.08,.005),0,-.21,-.42),dkMat),o(Ce(Wi(.11,.008,.02,.002),0,-.202,-.455),cMat),o(Ce(new ls(.016,10,8),-.048,-.212,-.455),cMat),o(Ce(new ls(.016,10,8),.048,-.212,-.455),cMat));for(let sx of[-1,1]){let shDrum=o(Ce(Ro(.052,.052,.095,14),sx*.24,-.19,-.32),chMat),shCap=o(Ce(Ro(.044,.038,.032,12),sx*.295,-.19,-.32),ivMat),shRing=o(Ce(Ro(.055,.055,.022,12),sx*.24,-.19,-.32),dkMat),cable=o(Fn([[sx*.11,-.23,-.33],[sx*.18,-.245,-.36],[sx*.23,-.195,-.33]],.009,6),dkMat),gGrp=new wt;gGrp.position.set(sx*.25,-.15,-.36),gGrp.add(o(Ce(Wi(.086,.096,.38,.012),0,0,0),ivMat),o(Ce(Wi(.092,.028,.24,.005),0,.01,.02),dkMat),o(Ce(Si(.022,.022,.48,12),0,.01,-.12),l),o(Ce(Wi(.096,.018,.24,.004),0,.012,0),aMat),o(Ce(Wi(.022,.012,.32,.003),0,.052,-.04),cMat),o(Ce(Si(.032,.032,.075,10),0,.01,-.33),chMat),o(Ce(Si(.026,.026,.03,10),0,.01,-.365),cMat)),houndGuns.push(gGrp),houndVm.add(shDrum,shCap,shRing,cable,gGrp)}droneVm.traverse(Me=>{Me.layers.set(zc)}),houndVm.traverse(Me=>{Me.layers.set(zc)}),droneVm.visible=!1,houndVm.visible=!1,i.camera.add(droneVm),i.camera.add(houndVm)}`
  },

  // 3. Animate droneRotors & houndGuns alternating recoil in Xe(Me), plus support Frenzy infinite ammo/fire-rate boost
  {
    label: 'bionic-fp-viewmodel-anim',
    target: `droneVm.position.set(lu*.5,de*.5,k.kZ.x*.35),droneVm.rotation.set(k.kP.x*.4,k.swY.x*.5,-ge*.05),houndVm.position.set(lu*1.2,de*1.2,k.kZ.x*.48),houndVm.rotation.set(k.kP.x*.55,k.swY.x*.6,-ge*.03)}`,
    replacement: `droneVm.position.set(lu*.5,de*.5,k.kZ.x*.35),droneVm.rotation.set(k.kP.x*.4,k.swY.x*.5,-ge*.05),houndVm.position.set(lu*1.2,de*1.2,k.kZ.x*.48),houndVm.rotation.set(k.kP.x*.55,k.swY.x*.6,-ge*.03);for(let ri=0;ri<droneRotors.length;ri++)droneRotors[ri].rotation.y+=Me*(ri%2?-28:28);for(let gi2=0;gi2<houndGuns.length;gi2++){let isAct=k.t-k.lastShot<.11&&k.burst%2===gi2;houndGuns[gi2].position.z=kn(houndGuns[gi2].position.z,isAct?-.29:-.36,24,Me)}}`
  },
  {
    label: 'bionic-frenzy-fire-boost',
    target: `for(;k.cooldown<=0&&ve.ammo>0&&Je<3;)Be(),k.cooldown+=60/O_,Je++`,
    replacement: `for(;k.cooldown<=0&&ve.ammo>0&&Je<3;){let fz=i.game&&i.game.run&&i.game.run.frenzyT>0;Be(),fz&&(ve.ammo=ve.magSize),k.cooldown+=60/O_*(fz?.68:1),Je++}`
  },

  // 4. Add HUD containers (#h-popups, #h-streak) & Pulse Strike tactical action in hM(t)
  {
    label: 'bionic-hud-popups-and-streak-dom',
    target: `t.append(hVisor,G,n,c,hMap,hScore,hBoss,hTac,hAch,d,y,v,x,m,E,w,S,O),e.appendChild(t);`,
    replacement: `let hPopups=li("div","h-popups");hPopups.id="h-popups";let hStreak=li("div","h-streak",'<div class="h-stk-k" id="h-stk-k">KILL STREAK</div><div class="h-stk-t" id="h-stk-t">DOUBLE KILL</div><div class="h-stk-s" id="h-stk-s"></div>');hStreak.id="h-streak";let hStkK=hStreak.querySelector("#h-stk-k"),hStkT=hStreak.querySelector("#h-stk-t"),hStkS=hStreak.querySelector("#h-stk-s"),stkT=0,popList=[];t.append(hVisor,G,hPopups,n,c,hMap,hScore,hBoss,hTac,hAch,hStreak,d,y,v,x,m,E,w,S,O),e.appendChild(t);`
  },
  {
    label: 'bionic-hud-tac-click-f',
    target: `act==="role"?i.game.switchRole&&i.game.switchRole():act==="avatar"?i.game.cycleAvatar&&i.game.cycleAvatar():act==="skillQ"?i.game.triggerSkillQ&&i.game.triggerSkillQ():act==="skillG"&&i.game.triggerSkillG&&i.game.triggerSkillG()`,
    replacement: `act==="role"?i.game.switchRole&&i.game.switchRole():act==="avatar"?i.game.cycleAvatar&&i.game.cycleAvatar():act==="skillQ"?i.game.triggerSkillQ&&i.game.triggerSkillQ():act==="skillG"?i.game.triggerSkillG&&i.game.triggerSkillG():act==="skillF"&&i.game.triggerPulseStrike&&i.game.triggerPulseStrike()`
  },
  {
    label: 'bionic-hud-methods',
    target: `toastAchievement(ach){if(!ach)return;hAchIc.textContent=ach.icon||"★",hAchT.textContent=\`\${ach.name} (+\${ach.bonus||0} pts)\`,achT=3.8,hAch.classList.add("on")},`,
    replacement: `toastAchievement(ach){if(!ach)return;hAchIc.textContent=ach.icon||"★",hAchT.textContent=\`\${ach.name} (+\${ach.bonus||0} pts)\`,achT=3.8,hAch.classList.add("on")},spawnPopup(worldPos,text,kind="hit"){if(!Q||!worldPos||!i.camera)return;oe.set(worldPos.x,worldPos.y+.65,worldPos.z).project(i.camera);if(oe.z>1)return;let sx=Math.round((oe.x*.5+.5)*ie+(Math.random()-.5)*28),sy=Math.round((-oe.y*.5+.5)*F-14+(Math.random()-.5)*18);if(sx<20||sx>ie-20||sy<20||sy>F-20)return;let el=li("div","h-pop "+kind,text);el.style.transform=\`translate3d(\${sx}px,\${sy}px,0)\`,hPopups.appendChild(el),popList.push({el,x:sx,y:sy,vy:kind==="crit"||kind==="skill"?-54:-38,life:kind==="crit"||kind==="skill"?1.05:.75,max:kind==="crit"||kind==="skill"?1.05:.75});for(;popList.length>18;)popList.shift().el.remove()},showStreak(title,sub,kicker="CATHARSIS OVERDRIVE // 战意狂飙",tier=2){hStkK.textContent=kicker,hStkT.textContent=title,hStkS.textContent=sub||"",hStreak.dataset.tier=String(tier),hStreak.classList.remove("on"),hStreak.offsetWidth,hStreak.classList.add("on"),stkT=2.6},`
  },
  {
    label: 'bionic-hud-update-popups',
    target: `achT>0&&(achT-=k,achT<=0&&hAch.classList.remove("on"));`,
    replacement: `achT>0&&(achT-=k,achT<=0&&hAch.classList.remove("on")),stkT>0&&(stkT-=k,stkT<=0&&hStreak.classList.remove("on"));for(let pi=popList.length-1;pi>=0;pi--){let pp=popList[pi];pp.life-=k,pp.y+=pp.vy*k;if(pp.life<=0){pp.el.remove(),popList.splice(pi,1)}else{let al=Math.min(1,pp.life/(pp.max*.45));pp.el.style.transform=\`translate3d(\${pp.x}px,\${Math.round(pp.y)}px,0)\`,pp.el.style.opacity=al.toFixed(2)}}`
  },

  // 5. Update Controls description so [F] is documented as Tactical Pulse Shockwave & Pack Flip Command
  {
    label: 'bionic-controls-key-f',
    target: `<div><dt>近战</dt><dd><kbd>F</kbd></dd></div>`,
    replacement: `<div><dt>脉冲震击 / 灵犬空翻</dt><dd><kbd>F</kbd> 或 鼠标中键</dd></div>`
  },

  // 6. Overhaul opHolo, spawnTurret, spawnAllyGuard, spawnWingman, triggerSkillQ, triggerSkillG,
  //    add buildBionicHoundRig, triggerPulseStrike, spawnOrbitalBolt, decorateEnemyUnit, and upgrade updateTacticalEntities
  {
    label: 'bionic-opholo-and-pulsering',
    target: `let holoMat=new Nn({color:3729663,wireframe:!0}),opHolo=new wt;{let hBody=new Qe(ot(.26,.32,1.25,10),holoMat);hBody.position.y=.75;let hHead=new Qe(new ls(.18,10,8),holoMat);hHead.position.y=1.56;let hRing=new Qe(new O0(.55,.68,24,1).rotateX(-Math.PI/2),new Nn({color:3729663,side:Sn}));hRing.position.y=.04,opHolo.add(hBody,hHead,hRing),opHolo.visible=!1,tacRoot.add(opHolo)}let empRing=new Qe(new O0(.75,1,32,1).rotateX(-Math.PI/2),new Nn({color:3729663,side:Sn}));empRing.visible=!1,tacRoot.add(empRing);`,
    replacement: `let holoMat=new Nn({color:3729663,wireframe:!0}),holoSolid=new Nn({color:3729663,transparent:!0,opacity:.38,side:Sn}),opHolo=new wt;{let hTorso=new Qe(Wi(.38,.54,.24,.02),holoMat);hTorso.position.y=1.08;let hChest=new Qe(Wi(.32,.28,.26,.01),holoSolid);hChest.position.y=1.14;let hHead=new Qe(new ls(.15,12,10),holoMat);hHead.position.y=1.54;let hVisor=new Qe(Wi(.22,.06,.16,.005),new Nn({color:16766720}));hVisor.position.set(0,1.55,.1);for(let sx of[-1,1]){let sh=new Qe(Wi(.14,.16,.2,.01),holoMat);sh.position.set(sx*.26,1.24,0);let leg=new Qe(ot(.08,.065,.76,8),holoMat);leg.position.set(sx*.11,.38,0),opHolo.add(sh,leg)}let hRifle=new Qe(Si(.035,.035,.62,8),new Nn({color:16766720}));hRifle.position.set(.16,1.08,.22);let hRing=new Qe(new O0(.55,.68,24,1).rotateX(-Math.PI/2),new Nn({color:3729663,side:Sn}));hRing.position.y=.04;let hRing2=new Qe(new O0(.32,.38,20,1).rotateX(-Math.PI/2),new Nn({color:16766720,side:Sn}));hRing2.position.y=.06,opHolo.add(hTorso,hChest,hHead,hVisor,hRifle,hRing,hRing2),opHolo.visible=!1,tacRoot.add(opHolo)}let empRing=new Qe(new O0(.75,1,32,1).rotateX(-Math.PI/2),new Nn({color:3729663,side:Sn}));empRing.visible=!1,tacRoot.add(empRing);let pulseRing=new Qe(new O0(.65,.95,32,1).rotateX(-Math.PI/2),new Nn({color:16758312,side:Sn}));pulseRing.visible=!1,tacRoot.add(pulseRing);`
  },
  {
    label: 'bionic-hound-turret-wingman-rigs',
    target: `function clearTacEntities(){for(let tr of c.turrets)tr.root&&tacRoot.remove(tr.root);c.turrets.length=0;for(let al of c.allies)al.root&&tacRoot.remove(al.root);c.allies.length=0;for(let wg of c.wingmen)wg.root&&tacRoot.remove(wg.root);c.wingmen.length=0,opHolo.visible=!1,empRing.visible=!1}function spawnTurret(pos,yaw){let root=new wt;root.position.copy(pos);let baseMat=i.mats.get("painted_iron",{color:2238000}),cyanMat=new Nn({color:3729663}),base=new Qe(ot(.42,.56,.26,10),baseMat);base.position.y=.13;let pillar=new Qe(ot(.18,.22,.52,10),baseMat);pillar.position.y=.48;let ring=new Qe(new O0(.52,.62,24,1).rotateX(-Math.PI/2),cyanMat);ring.position.y=.03;let head=new wt;head.position.y=.82,head.rotation.y=yaw||0;let pod=new Qe(Wi(.38,.24,.44,.02),baseMat),lens=new Qe(new ls(.07,10,8),cyanMat);lens.position.set(0,.02,.22),head.add(pod,lens);for(let sx of[-1,1]){let brl=new Qe(Si(.032,.032,.58,10),baseMat);brl.position.set(sx*.13,0,.34);let tip=new Qe(Si(.042,.042,.12,10),cyanMat);tip.position.set(sx*.13,0,.6),head.add(brl,tip)}root.add(base,pillar,ring,head),tacRoot.add(root);let tr={root,head,pos:root.position,yaw:yaw||0,cd:0,hp:115,maxHp:115,life:42,maxLife:42};return c.turrets.push(tr),tr}function spawnAllyGuard(pos){let root=new wt;root.position.copy(pos);let bodyMat=i.mats.get("painted_iron",{color:1849912}),allyGlow=new Nn({color:2686900}),body=new Qe(Wi(.42,.26,.92,.02),bodyMat);body.position.y=.68;let head=new Qe(Wi(.26,.18,.32,.02),bodyMat);head.position.set(0,.84,.42);let visor=new Qe(Wi(.22,.06,.05,.005),allyGlow);visor.position.set(0,.85,.58);let beacon=new Qe(new O0(.48,.58,24,1).rotateX(-Math.PI/2),allyGlow);beacon.position.y=.04,root.add(body,head,visor,beacon);for(let lx of[-.22,.22])for(let lz of[-.32,.32]){let leg=new Qe(ot(.05,.04,.64,8),bodyMat);leg.position.set(lx,.32,lz),root.add(leg)}tacRoot.add(root);let al={root,pos:root.position,yaw:0,cd:0,alive:!0,hp:155,maxHp:155};return c.allies.push(al),al}function spawnWingman(pos){let root=new wt;root.position.set(pos.x,Math.max(2.6,pos.y+2.6),pos.z);let bodyMat=i.mats.get("painted_iron",{color:2108982}),glowMat=new Nn({color:3729663}),core=new Qe(Wi(.34,.14,.56,.02),bodyMat),wing=new Qe(Wi(1.05,.04,.22,.01),bodyMat),eye=new Qe(new ls(.08,10,8),glowMat);eye.position.set(0,0,.28),root.add(core,wing,eye),tacRoot.add(root);let wg={root,pos:root.position,cd:0,life:26,ang:Math.random()*Math.PI*2,alive:!0};return c.wingmen.push(wg),wg}`,
    replacement: `function clearTacEntities(){for(let tr of c.turrets)tr.root&&tacRoot.remove(tr.root);c.turrets.length=0;for(let al of c.allies)al.root&&tacRoot.remove(al.root);c.allies.length=0;for(let wg of c.wingmen)wg.root&&tacRoot.remove(wg.root);c.wingmen.length=0;if(c.fxBolts){for(let fb of c.fxBolts)fb.mesh&&tacRoot.remove(fb.mesh);c.fxBolts.length=0}opHolo.visible=!1,empRing.visible=!1,pulseRing&&(pulseRing.visible=!1)}
function spawnTurret(pos,yaw){
  let root=new wt;root.position.copy(pos);
  let baseMat=i.mats.get("painted_iron",{color:2238000}),ivoryMat=new Qt({color:15266038,metalness:.32,roughness:.34}),solarMat=new Qt({color:1322312,metalness:.75,roughness:.2}),cyanMat=new Nn({color:3729663}),amberMat=new Nn({color:16758312});
  let hub=new Qe(ot(.32,.44,.22,12),baseMat);hub.position.y=.14;
  for(let li2=0;li2<3;li2++){
    let ang=li2*Math.PI*2/3,strut=new Qe(su([Math.cos(ang)*.22,.16,Math.sin(ang)*.22],[Math.cos(ang)*.54,.03,Math.sin(ang)*.54],.045,.035,8),baseMat),pad=new Qe(ot(.09,.11,.04,10),ivoryMat);
    pad.position.set(Math.cos(ang)*.54,.02,Math.sin(ang)*.54),root.add(strut,pad);
  }
  let pillar=new Qe(ot(.16,.2,.54,12),baseMat);pillar.position.y=.48;
  let batPack=new Qe(Wi(.26,.24,.26,.015),ivoryMat);batPack.position.y=.46;
  let batLed=new Qe(Wi(.28,.04,.16,.004),cyanMat);batLed.position.y=.52;
  for(let sx of[-1,1]){
    let wing=new wt;wing.position.set(sx*.24,.64,0),wing.rotation.z=-sx*.38;
    let panel=new Qe(Wi(.38,.022,.28,.004),ivoryMat),cells=new Qe(Wi(.34,.026,.24,.002),solarMat);
    wing.add(panel,cells),root.add(wing);
  }
  let ring=new Qe(new O0(.54,.64,28,1).rotateX(-Math.PI/2),cyanMat);ring.position.y=.03;
  let head=new wt;head.position.y=.84,head.rotation.y=yaw||0;
  let yoke=new Qe(Wi(.42,.12,.28,.015),ivoryMat);yoke.position.y=-.06;
  let pod=new Qe(Wi(.38,.24,.44,.025),ivoryMat),dome=new Qe(new ls(.14,14,10),baseMat);dome.position.set(0,.02,.14);
  let lens=new Qe(new ls(.065,12,10),cyanMat);lens.position.set(0,.03,.25);
  let subLens=new Qe(new ls(.032,10,8),amberMat);subLens.position.set(0,-.05,.24);
  let radar=new Qe(Wi(.24,.03,.08,.005),cyanMat);radar.position.set(0,.15,-.06);
  head.add(yoke,pod,dome,lens,subLens,radar);
  for(let sx of[-1,1]){
    let shroud=new Qe(Wi(.09,.11,.36,.01),baseMat);shroud.position.set(sx*.16,0,.18);
    let brl=new Qe(Si(.028,.028,.58,10),baseMat);brl.position.set(sx*.16,.02,.36);
    let brl2=new Qe(Si(.022,.022,.54,10),baseMat);brl2.position.set(sx*.16,-.03,.34);
    let tip=new Qe(Si(.038,.038,.11,10),cyanMat);tip.position.set(sx*.16,.02,.62);
    head.add(shroud,brl,brl2,tip);
  }
  root.add(hub,pillar,batPack,batLed,ring,head),tacRoot.add(root);
  let tr={root,head,radar,pos:root.position,yaw:yaw||0,cd:0,hp:135,maxHp:135,life:45,maxLife:45};
  return c.turrets.push(tr),tr;
}
function buildBionicHoundRig(){
  let root=new wt;
  let ivoryMat=new Qt({color:15397110,metalness:.26,roughness:.32}),
      champMat=new Qt({color:12104358,metalness:.68,roughness:.26}),
      darkMat=i.mats.get("gunmetal",{color:1975341}),
      visorMat=new Qt({color:724758,metalness:.88,roughness:.14}),
      cyanGlow=new Nn({color:2686944}),
      amberGlow=new Nn({color:16758312}),
      shockMat=new Nn({color:2686944,transparent:!0,opacity:.75,side:Sn});
  let bodyPivot=new wt;bodyPivot.position.y=.48,bodyPivot.scale.setScalar(1.12),root.add(bodyPivot);
  let dorsalShell=new Qe(Wi(.31,.13,.64,.032),ivoryMat);dorsalShell.position.set(0,.03,0);
  let frontCowl=new Qe(Wi(.29,.135,.24,.03),ivoryMat);frontCowl.position.set(0,.025,.26),frontCowl.rotation.x=.12;
  let rearHaunch=new Qe(Wi(.28,.115,.2,.025),ivoryMat);rearHaunch.position.set(0,.02,-.27),rearHaunch.rotation.x=-.1;
  let coreFrame=new Qe(Wi(.24,.11,.58,.015),darkMat);coreFrame.position.set(0,-.015,0);
  bodyPivot.add(dorsalShell,frontCowl,rearHaunch,coreFrame);
  for(let sx of[-1,1]){
    let sideFairing=new Qe(Wi(.032,.095,.46,.01),ivoryMat);sideFairing.position.set(sx*.158,.015,.01);
    let handleSlot=new Qe(Wi(.04,.032,.18,.006),darkMat);handleSlot.position.set(sx*.16,.042,.02);
    let sideLed=new Qe(Wi(.012,.014,.28,.003),cyanGlow);sideLed.position.set(sx*.172,.015,.01);
    bodyPivot.add(sideFairing,handleSlot,sideLed);
  }
  for(let fi=-2;fi<=2;fi++){
    let fin=new Qe(Wi(.2,.024,.032,.004),darkMat);fin.position.set(0,-.075,fi*.095),bodyPivot.add(fin);
  }
  for(let sx of[-1,1])for(let sz of[-1,1]){
    let pad=new Qe(Wi(.058,.024,.085,.005),darkMat);pad.position.set(sx*.088,-.082,sz*.19),bodyPivot.add(pad);
  }
  let batHousing=new Qe(Wi(.19,.082,.075,.01),darkMat);batHousing.position.set(0,.01,-.33);
  bodyPivot.add(batHousing);
  for(let bi=-1.5;bi<=1.5;bi+=1){
    let cell=new Qe(Wi(.028,.022,.02,.003),cyanGlow);cell.position.set(bi*.038,.018,-.365),bodyPivot.add(cell);
  }
  let keel=new Qe(Wi(.082,.17,.115,.016),ivoryMat);keel.position.set(0,.045,.32),keel.rotation.x=.34,bodyPivot.add(keel);
  let headGroup=new wt;headGroup.position.set(0,.125,.34),bodyPivot.add(headGroup);
  let hoodTop=new Qe(Wi(.235,.098,.27,.028),ivoryMat);hoodTop.position.set(0,.015,.02),hoodTop.rotation.x=.06;
  let hoodBrow=new Qe(Wi(.215,.038,.18,.012),ivoryMat);hoodBrow.position.set(0,.058,.07),hoodBrow.rotation.x=.14;
  let facePlate=new Qe(Wi(.198,.082,.065,.012),visorMat);facePlate.position.set(0,.008,.128);
  let tofPill=new Qe(Wi(.048,.02,.025,.006),cyanGlow);tofPill.position.set(0,.006,.156);
  let browBar=new Qe(Wi(.096,.01,.02,.003),cyanGlow);browBar.position.set(0,.042,.152);
  headGroup.add(hoodTop,hoodBrow,facePlate,tofPill,browBar);
  for(let sx of[-1,1]){
    let camRim=new Qe(Si(.027,.027,.038,12),champMat);camRim.position.set(sx*.058,.008,.148);
    let camLens=new Qe(Si(.019,.019,.044,10),cyanGlow);camLens.position.set(sx*.058,.008,.151);
    let cheek=new Qe(Wi(.026,.068,.19,.008),ivoryMat);cheek.position.set(sx*.112,-.004,.03);
    headGroup.add(camRim,camLens,cheek);
  }
  let legs=[],legCoords=[[-1,1],[1,1],[-1,-1],[1,-1]];
  for(let li2=0;li2<4;li2++){
    let [sx,sz]=legCoords[li2],hx=sx*.168,hz=sz*.245;
    let drum=new Qe(Ro(.076,.076,.088,14),champMat);drum.position.set(hx,0,hz);
    let coolRing=new Qe(Ro(.08,.08,.024,14),darkMat);coolRing.position.set(hx,0,hz);
    let cap=new Qe(Ro(.066,.056,.042,14),ivoryMat);cap.position.set(hx+sx*.052,0,hz);
    let bolt=new Qe(Ro(.022,.022,.05,10),darkMat);bolt.position.set(hx+sx*.056,0,hz);
    let cable=new Qe(Fn([[sx*.11,-.02,sz*.11],[sx*.188,-.048,sz*.175],[sx*.178,0,hz]],.0125,7),darkMat);
    bodyPivot.add(drum,coolRing,cap,bolt,cable);
    let hipPivot=new wt;hipPivot.position.set(hx+sx*.022,0,hz),hipPivot.rotation.x=.42,bodyPivot.add(hipPivot);
    let thighOuter=new Qe(Wi(.052,.22,.078,.014),ivoryMat);thighOuter.position.set(0,-.1,-.02);
    let thighTruss=new Qe(Wi(.056,.14,.038,.006),darkMat);thighTruss.position.set(0,-.1,-.02);
    let kneePivot=new wt;kneePivot.position.set(0,-.205,-.045),kneePivot.rotation.x=-.82;
    let kneeDrum=new Qe(Ro(.038,.038,.062,12),champMat);
    let shinBlade=new Qe(Wi(.036,.23,.048,.01),ivoryMat);shinBlade.position.set(0,-.11,.032),shinBlade.rotation.x=.34;
    let shinCore=new Qe(Wi(.04,.16,.024,.004),darkMat);shinCore.position.set(0,-.11,.032),shinCore.rotation.x=.34;
    let ankle=new Qe(Wi(.044,.042,.05,.008),champMat);ankle.position.set(0,-.21,.068);
    let paw=new Qe(new ls(.038,10,8),darkMat);paw.position.set(0,-.238,.074);
    let pawGlow=new Qe(new O0(.026,.04,12,1).rotateX(-Math.PI/2),cyanGlow);pawGlow.position.set(0,-.255,.074);
    kneePivot.add(kneeDrum,shinBlade,shinCore,ankle,paw,pawGlow);
    hipPivot.add(thighOuter,thighTruss,kneePivot);
    legs.push({hip:hipPivot,knee:kneePivot,sx,sz});
  }
  let deck=new Qe(Wi(.21,.028,.28,.006),darkMat);deck.position.set(0,.098,-.03),bodyPivot.add(deck);
  let turretPivot=new wt;turretPivot.position.set(0,.12,-.03),bodyPivot.add(turretPivot);
  let tPod=new Qe(Wi(.165,.082,.22,.012),champMat);tPod.position.y=.035;
  let tShield=new Qe(Wi(.18,.045,.16,.01),ivoryMat);tShield.position.set(0,.072,-.01);
  let tEye=new Qe(new ls(.028,10,8),amberGlow);tEye.position.set(0,.04,.115);
  turretPivot.add(tPod,tShield,tEye);
  for(let sx of[-1,1]){
    let brl=new Qe(Si(.018,.018,.34,10),darkMat);brl.position.set(sx*.056,.038,.18);
    let muz=new Qe(Si(.025,.025,.065,10),cyanGlow);muz.position.set(sx*.056,.038,.33);
    turretPivot.add(brl,muz);
  }
  let beacon=new Qe(new O0(.52,.62,28,1).rotateX(-Math.PI/2),cyanGlow);beacon.position.y=.035;
  let innerRing=new Qe(new O0(.3,.35,20,1).rotateX(-Math.PI/2),amberGlow);innerRing.position.y=.04;
  let flipRing=new Qe(new O0(.45,.68,28,1).rotateX(-Math.PI/2),shockMat);flipRing.position.y=.06,flipRing.visible=!1;
  root.add(beacon,innerRing,flipRing);
  return {root,bodyPivot,headGroup,turretPivot,legs,beacon,innerRing,flipRing,browBar,tofPill};
}
function spawnAllyGuard(pos){
  if(c.allies.length>=3){
    for(let al of c.allies)if(al.alive){al.hp=al.maxHp,al.flipT=.001,al.flipCd=4.5}
    return c.allies[0];
  }
  let rig=buildBionicHoundRig();
  rig.root.position.copy(pos),tacRoot.add(rig.root);
  let al={root:rig.root,rig,pos:rig.root.position,yaw:0,cd:0,alive:!0,hp:195,maxHp:195,gaitPhase:Math.random()*6.28,flipT:.001,flipCd:4.5,prevX:pos.x,prevZ:pos.z};
  return c.allies.push(al),al;
}
function spawnWingman(pos){
  let root=new wt;root.position.set(pos.x,Math.max(2.6,pos.y+2.6),pos.z);
  let bodyMat=new Qt({color:15266038,metalness:.35,roughness:.3}),darkMat=i.mats.get("painted_iron",{color:2108982}),glowMat=new Nn({color:3729663}),amberMat=new Nn({color:16758312}),rDisc=new Nn({color:3729663,transparent:!0,opacity:.32,side:Sn});
  let core=new Qe(Wi(.36,.13,.58,.025),bodyMat),canopy=new Qe(Wi(.24,.07,.32,.015),darkMat);canopy.position.set(0,.07,.04);
  let wing=new Qe(Wi(1.12,.036,.24,.01),bodyMat),tail=new Qe(Wi(.38,.08,.14,.008),darkMat);tail.position.set(0,.05,-.26);
  let eyeWide=new Qe(new ls(.062,12,10),glowMat);eyeWide.position.set(-.055,-.01,.3);
  let eyeTele=new Qe(new ls(.048,12,10),amberMat);eyeTele.position.set(.055,-.01,.3);
  let rotors=[];
  for(let sx of[-1,1]){
    let nac=new Qe(ot(.055,.045,.14,10),darkMat);nac.position.set(sx*.54,.02,0);
    let rGrp=new wt;rGrp.position.set(sx*.54,.095,0);
    rGrp.add(new Qe(Wi(.34,.008,.032,.002),bodyMat),new Qe(Wi(.032,.008,.34,.002),bodyMat),new Qe(new O0(.04,.17,16,1).rotateX(-Math.PI/2),rDisc));
    rotors.push(rGrp);
    let pod=new Qe(Si(.032,.032,.36,8),darkMat);pod.position.set(sx*.26,-.05,.08);
    let tip=new Qe(Si(.036,.036,.08,8),glowMat);tip.position.set(sx*.26,-.05,.26);
    root.add(nac,rGrp,pod,tip);
  }
  root.add(core,canopy,wing,tail,eyeWide,eyeTele),tacRoot.add(root);
  let wg={root,rotors,pos:root.position,cd:0,life:28,ang:Math.random()*Math.PI*2,alive:!0};
  return c.wingmen.push(wg),wg;
}
function decorateEnemyUnit(en){
  if(!en||!en.rig||!en.rig.bones||!en.rig.bones.body)return;
  if(!en._customDecor){
    let dGrp=new wt,bMat=new Qt({color:14098730,metalness:.65,roughness:.28}),gMat=new Nn({color:16724787}),aMat=new Nn({color:16758312});
    for(let sx of[-1,1]){
      let pauldron=new Qe(Wi(.11,.095,.26,.012),bMat);pauldron.position.set(sx*.2,.075,.04);
      let cannon=new Qe(Si(.024,.024,.38,8),bMat);cannon.position.set(sx*.13,.15,.12);
      let muz=new Qe(Si(.03,.03,.07,8),gMat);muz.position.set(sx*.13,.15,.31);
      let fin=new Qe(Wi(.022,.12,.18,.004),aMat);fin.position.set(sx*.18,.14,-.08),fin.rotation.z=-sx*.28;
      dGrp.add(pauldron,cannon,muz,fin);
    }
    let crest=new Qe(Wi(.14,.045,.18,.006),aMat);crest.position.set(0,.16,.18);
    dGrp.add(crest),en.rig.bones.body.add(dGrp),en._customDecor=dGrp;
    let aura=new Qe(new O0(.58,.72,24,1).rotateX(-Math.PI/2),gMat);aura.position.y=.04,en.rig.group.add(aura),en._customAura=aura;
  }
  let show=!!(en.alive&&(en.isBoss||en.isElite||en.isSaboteur));
  en._customDecor.visible=show,en._customAura&&(en._customAura.visible=!!(en.alive&&(en.isBoss||en.isElite)));
}
function spawnOrbitalBolt(targetPos){
  c.fxBolts||(c.fxBolts=[]);
  let bGrp=new wt;bGrp.position.copy(targetPos);
  let core=new Qe(ot(.18,.32,18,12),new Nn({color:3729663,transparent:!0,opacity:.85}));core.position.y=9;
  let ring=new Qe(new O0(.4,1.2,28,1).rotateX(-Math.PI/2),new Nn({color:16766720,side:Sn}));ring.position.y=.08;
  bGrp.add(core,ring),tacRoot.add(bGrp),c.fxBolts.push({mesh:bGrp,ring,life:.55,max:.55});
}
function triggerPulseStrike(autoFromLand=!1){
  if(_.state!=="playing"||!n.alive)return;
  c.fCd=c.fCd||0;
  if(!autoFromLand&&c.fCd>0){o.message&&o.message(\`战术脉冲震击冷却中 (\${c.fCd.toFixed(1)}s)\`,1.4);return}
  if(!autoFromLand)c.fCd=5.5;
  c.pulseT=.55,pulseRing.position.set(n.pos.x,n.pos.y+.12,n.pos.z),pulseRing.scale.setScalar(1),pulseRing.visible=!0;
  n.addShake&&n.addShake(.22),i.render&&i.render.lightPool&&i.render.lightPool.flash(n.pos,16758312,35,11,.08);
  let hitCnt=0,elist=i.enemies&&i.enemies.list||[],rad=autoFromLand?7.8:9.5,dmg=autoFromLand?60:78;
  for(let en of elist)if(en.alive){
    let d=en.pos.distanceTo(n.pos);
    if(d<rad){
      let dir=new W(en.pos.x-n.pos.x,.35,en.pos.z-n.pos.z).normalize();
      en.damage(dmg,en.pos,dir,"weak"),en.cool=Math.max(en.cool||0,1.35),hitCnt++;
      o.spawnPopup&&o.spawnPopup(en.pos,\`⚡\${dmg} 脉冲震击!\`,"skill");
    }
  }
  let flipCnt=0;
  for(let al of c.allies)if(al.alive&&al.flipT<=0){al.flipT=.001,al.flipCd=3.5,flipCnt++}
  if(!autoFromLand){
    o.feed&&o.feed(\`<b>战术脉冲震击 [F]</b> 震退 \${hitCnt} 台敌机 (\${dmg} DMG)\${flipCnt?\` · 协同 \${flipCnt} 台灵犬 720° 空翻震击\`:""}！\`);
    o.showStreak&&hitCnt>0&&o.showStreak("PULSE SHOCKWAVE // 脉冲破阵",\`震退 \${hitCnt} 敌机 · 灵犬协同空翻\`,autoFromLand?"BIONIC SLAM":"TACTICAL PULSE [F]",3);
  }
}`
  },

  // 7. Upgrade triggerSkillQ to trigger synchronized Pack 720° Flip & catharsis banner
  {
    label: 'bionic-skill-q-pack-overdrive',
    target: `if(i.role==="defend"){c.overdriveT=7;let spawnP=new W(n.pos.x+n.forward.x*3,0,n.pos.z+n.forward.z*3);spawnP.y=i.physics.groundHeight(spawnP.x,spawnP.z,n.pos.y+2);spawnAllyGuard(spawnP),o.feed&&o.feed("<b>战区支援 [Q]</b> 已空投【神眸 BC4】研极芯机械犬 + PT2C 炮塔 7s 超频！"),o.message&&o.message("神眸「BC4 研极芯」四足机械犬空投支援 · PT2C 炮塔超频 7 秒！",3)}`,
    replacement: `if(i.role==="defend"){c.overdriveT=7;let spawnP=new W(n.pos.x+n.forward.x*3,0,n.pos.z+n.forward.z*3);spawnP.y=i.physics.groundHeight(spawnP.x,spawnP.z,n.pos.y+2);spawnAllyGuard(spawnP);for(let al of c.allies)if(al.alive){al.hp=al.maxHp,al.flipT=.001}o.showStreak&&o.showStreak("BIONIC PACK OVERDRIVE","仿生灵犬集群 720° 空翻震击 · 哨兵炮塔全超频 7s","DEFENDER ULTIMATE [Q]",4),o.feed&&o.feed("<b>战区支援 [Q]</b> 已空投【神眸 BC4】研极芯机械犬 + PT2C 炮塔 7s 超频！"),o.message&&o.message("神眸「BC4 研极芯」四足机械犬空投支援 · PT2C 炮塔超频 7 秒！",3)}`
  },

  // 8. Upgrade updateTacticalEntities(P) with articulated Bionic Hound 4-leg trot gait, 720° backflip shockwave,
  //    Turret chain-lightning, Wingman rotor spin, Frenzy timer, Pulse ring expansion, and Enemy Elite/Boss armor sync
  {
    label: 'bionic-update-tactical-entities',
    target: `function updateTacticalEntities(P){c.qCd=Math.max(0,c.qCd-P);if(c.overdriveT>0){c.overdriveT=Math.max(0,c.overdriveT-P);if(c.overdriveT<=0&&i.role!=="defend")n.speedMult=1}if(c.comboT>0){c.comboT=Math.max(0,c.comboT-P);if(c.comboT<=0){c.combo=1,c.comboKills=0}}if(c.empT>0){c.empT-=P;let s=1+(1-c.empT/.65)*18;empRing.scale.setScalar(s),c.empT<=0&&(empRing.visible=!1)}opHolo.visible&&(opHolo.rotation.y+=P*1.8);let elist=i.enemies&&i.enemies.list||[];for(let ti=c.turrets.length-1;ti>=0;ti--){let tr=c.turrets[ti];tr.life-=P,tr.cd-=P*(c.overdriveT>0?1.7:1);let nearThreats=0;for(let en of elist)if(en.alive){let ed=en.pos.distanceTo(tr.pos);if(ed<7.5)nearThreats+=(en.isBoss?22:en.isElite?12:7)*(ed<4.2?1.6:1)}nearThreats>0&&(tr.hp-=nearThreats*P,Math.random()<.1&&i.fx&&i.fx.sparks&&i.fx.sparks(tr.pos,new W(0,1,0),4));if(tr.hp<=0||tr.life<=0){i.fx&&i.fx.sparks&&i.fx.sparks(tr.pos,new W(0,1,0),12),tacRoot.remove(tr.root),c.turrets.splice(ti,1),o.warn&&o.warn(tr.hp<=0?"神眸 PT2C 云台炮塔已被敌军摧毁！":"神眸 PT2C 电池续航耗尽下线！",2.6),q();continue}let best=null,bestD=26;for(let en of elist)if(en.alive){let d=en.pos.distanceTo(tr.pos);d<bestD&&(bestD=d,best=en)}if(best){let ty=Math.atan2(best.pos.x-tr.pos.x,best.pos.z-tr.pos.z);tr.yaw=ty,tr.head.rotation.y=ty;if(tr.cd<=0){tr.cd=.45;let muz=new W(tr.pos.x,tr.pos.y+.88,tr.pos.z),tgt=new W(best.pos.x,best.pos.y+.6,best.pos.z);i.fx&&i.fx.tracer&&i.fx.tracer(muz,tgt),i.fx&&i.fx.sparks&&i.fx.sparks(tgt,new W(0,1,0),4),i.render&&i.render.lightPool&&i.render.lightPool.flash(muz,3729663,20,5,.04),best.damage(11,tgt,null,"body")}}else tr.head.rotation.y+=P*.6}for(let ai=c.allies.length-1;ai>=0;ai--){let al=c.allies[ai];if(!al.alive)continue;al.cd-=P;let dmgIn=0,best=null,bestD=45;for(let en of elist)if(en.alive){let d=en.pos.distanceTo(al.pos);d<bestD&&(bestD=d,best=en),d<6.5&&(dmgIn+=en.isBoss?26:en.isElite?14:9)}dmgIn>0&&(al.hp-=dmgIn*P,Math.random()<.08&&i.fx&&i.fx.sparks&&i.fx.sparks(al.pos,new W(0,1,0),4));if(al.hp<=0){al.alive=!1,tacRoot.remove(al.root),c.allies.splice(ai,1),o.feed&&o.feed("神眸「BC4 研极芯」四足机械犬已被敌军击毁！"),q();continue}if(best){let dx=best.pos.x-al.pos.x,dz=best.pos.z-al.pos.z,dist=Math.hypot(dx,dz)||1;al.yaw=Math.atan2(dx,dz),al.root.rotation.y=al.yaw;if(dist>5.8){al.pos.x+=dx/dist*4.6*P,al.pos.z+=dz/dist*4.6*P,al.pos.y=i.physics.groundHeight(al.pos.x,al.pos.z,al.pos.y+1.5)}if(al.cd<=0&&dist<24){al.cd=.5;let muz=new W(al.pos.x,al.pos.y+.85,al.pos.z),tgt=new W(best.pos.x,best.pos.y+.55,best.pos.z);i.fx&&i.fx.tracer&&i.fx.tracer(muz,tgt),best.damage(14,tgt,null,"body")}}}for(let wi=c.wingmen.length-1;wi>=0;wi--){let wg=c.wingmen[wi];wg.life-=P,wg.ang+=P*1.9,wg.cd-=P;if(wg.life<=0){wg.alive=!1,tacRoot.remove(wg.root),c.wingmen.splice(wi,1),o.feed&&o.feed("神眸 BC4 Pro+ 双目突击僚机能量耗尽返航"),q();continue}let tx=n.pos.x+Math.cos(wg.ang)*2.3,tz=n.pos.z+Math.sin(wg.ang)*2.3,ty=n.pos.y+2.5+Math.sin(wg.ang*2)*.25;wg.pos.set(tx,ty,tz),wg.root.rotation.y=-wg.ang;let best=null,bestD=30;for(let en of elist)if(en.alive){let d=en.pos.distanceTo(wg.pos);d<bestD&&(bestD=d,best=en)}if(best){wg.root.lookAt(best.pos.x,best.pos.y+.6,best.pos.z);if(wg.cd<=0){wg.cd=.42;let tgt=new W(best.pos.x,best.pos.y+.6,best.pos.z);i.fx&&i.fx.tracer&&i.fx.tracer(wg.pos,tgt),i.fx&&i.fx.sparks&&i.fx.sparks(tgt,new W(0,1,0),4),best.damage(14,tgt,null,"body")}}}`,
    replacement: `function updateTacticalEntities(P){
  c.qCd=Math.max(0,c.qCd-P),c.fCd=Math.max(0,(c.fCd||0)-P);
  if(c.frenzyT>0){c.frenzyT=Math.max(0,c.frenzyT-P),n.speedMult=1.32;if(c.frenzyT<=0&&c.overdriveT<=0)n.speedMult=1}
  if(c.overdriveT>0){c.overdriveT=Math.max(0,c.overdriveT-P);if(c.overdriveT<=0&&!(c.frenzyT>0)&&i.role!=="defend")n.speedMult=1}
  if(c.comboT>0){c.comboT=Math.max(0,c.comboT-P);if(c.comboT<=0){c.combo=1,c.comboKills=0}}
  if(c.empT>0){c.empT-=P;let s=1+(1-c.empT/.65)*18;empRing.scale.setScalar(s),c.empT<=0&&(empRing.visible=!1)}
  if(c.pulseT>0){c.pulseT-=P;let s=1+(1-c.pulseT/.55)*11;pulseRing.scale.setScalar(s),c.pulseT<=0&&(pulseRing.visible=!1)}
  if(c.fxBolts){for(let bi=c.fxBolts.length-1;bi>=0;bi--){let fb=c.fxBolts[bi];fb.life-=P,fb.ring&&fb.ring.scale.setScalar(1+(1-fb.life/fb.max)*6);if(fb.life<=0){tacRoot.remove(fb.mesh),c.fxBolts.splice(bi,1)}}}
  opHolo.visible&&(opHolo.rotation.y+=P*1.8);
  let elist=i.enemies&&i.enemies.list||[];
  for(let en of elist)decorateEnemyUnit(en);
  for(let ti=c.turrets.length-1;ti>=0;ti--){
    let tr=c.turrets[ti];tr.life-=P,tr.cd-=P*(c.overdriveT>0?1.75:1),tr.radar&&(tr.radar.rotation.y+=P*4.5);
    let nearThreats=0;
    for(let en of elist)if(en.alive){let ed=en.pos.distanceTo(tr.pos);if(ed<7.5)nearThreats+=(en.isBoss?22:en.isElite?12:7)*(ed<4.2?1.6:1)}
    nearThreats>0&&(tr.hp-=nearThreats*P,Math.random()<.1&&i.fx&&i.fx.sparks&&i.fx.sparks(tr.pos,new W(0,1,0),4));
    if(tr.hp<=0||tr.life<=0){i.fx&&i.fx.sparks&&i.fx.sparks(tr.pos,new W(0,1,0),12),tacRoot.remove(tr.root),c.turrets.splice(ti,1),o.warn&&o.warn(tr.hp<=0?"神眸 PT2C 云台炮塔已被敌军摧毁！":"神眸 PT2C 电池续航耗尽下线！",2.6),q();continue}
    let best=null,bestD=28;
    for(let en of elist)if(en.alive){let d=en.pos.distanceTo(tr.pos);d<bestD&&(bestD=d,best=en)}
    if(best){
      let ty=Math.atan2(best.pos.x-tr.pos.x,best.pos.z-tr.pos.z);tr.yaw=ty,tr.head.rotation.y=ty;
      if(tr.cd<=0){
        tr.cd=.42;let muz=new W(tr.pos.x,tr.pos.y+.88,tr.pos.z),tgt=new W(best.pos.x,best.pos.y+.6,best.pos.z);
        i.fx&&i.fx.tracer&&i.fx.tracer(muz,tgt),i.fx&&i.fx.sparks&&i.fx.sparks(tgt,new W(0,1,0),4),i.render&&i.render.lightPool&&i.render.lightPool.flash(muz,3729663,20,5,.04),best.damage(13,tgt,null,"body");
        if(c.overdriveT>0){
          for(let en2 of elist)if(en2.alive&&en2!==best&&en2.pos.distanceTo(best.pos)<6.8){
            let tgt2=new W(en2.pos.x,en2.pos.y+.6,en2.pos.z);i.fx&&i.fx.tracer&&i.fx.tracer(tgt,tgt2),en2.damage(9,tgt2,null,"body");break;
          }
        }
      }
    }else tr.head.rotation.y+=P*.6;
  }
  for(let ai=c.allies.length-1;ai>=0;ai--){
    let al=c.allies[ai];if(!al.alive)continue;
    al.cd-=P*(c.overdriveT>0?1.65:1),al.flipCd=Math.max(0,(al.flipCd||0)-P);
    let dmgIn=0,best=null,bestD=48;
    for(let en of elist)if(en.alive){let d=en.pos.distanceTo(al.pos);d<bestD&&(bestD=d,best=en),d<6.5&&(dmgIn+=en.isBoss?22:en.isElite?12:7)}
    dmgIn>0&&(al.hp-=dmgIn*P,Math.random()<.08&&i.fx&&i.fx.sparks&&i.fx.sparks(al.pos,new W(0,1,0),4));
    if(al.hp<=0){al.alive=!1,tacRoot.remove(al.root),c.allies.splice(ai,1),o.feed&&o.feed("神眸「BC4 研极芯」四足机械犬已被敌军击毁！"),q();continue}
    let prevX=al.pos.x,prevZ=al.pos.z;
    if(best){
      let dx=best.pos.x-al.pos.x,dz=best.pos.z-al.pos.z,dist=Math.hypot(dx,dz)||1;
      al.yaw=Math.atan2(dx,dz),al.root.rotation.y=al.yaw;
      let moveSpd=c.overdriveT>0?6.4:4.9;
      if(dist>4.8){al.pos.x+=dx/dist*moveSpd*P,al.pos.z+=dz/dist*moveSpd*P,al.pos.y=i.physics.groundHeight(al.pos.x,al.pos.z,al.pos.y+1.5)}
      if(dist<6.8&&al.flipCd<=0&&al.flipT<=0){al.flipT=.001,al.flipCd=6.5}
      if(al.cd<=0&&dist<26){
        al.cd=.44;let muz=new W(al.pos.x,al.pos.y+.68,al.pos.z),tgt=new W(best.pos.x,best.pos.y+.55,best.pos.z);
        i.fx&&i.fx.tracer&&i.fx.tracer(muz,tgt),i.fx&&i.fx.sparks&&i.fx.sparks(tgt,new W(0,1,0),4),best.damage(16,tgt,null,"body");
      }
    }else if(n&&n.alive){
      let followX=n.pos.x+Math.cos(ai*2.1+.8)*2.4,followZ=n.pos.z+Math.sin(ai*2.1+.8)*2.4,dx=followX-al.pos.x,dz=followZ-al.pos.z,dist=Math.hypot(dx,dz);
      if(dist>1.6){al.yaw=Math.atan2(dx,dz),al.root.rotation.y=al.yaw,al.pos.x+=dx/dist*4.4*P,al.pos.z+=dz/dist*4.4*P,al.pos.y=i.physics.groundHeight(al.pos.x,al.pos.z,al.pos.y+1.5)}
    }
    let moved=Math.hypot(al.pos.x-prevX,al.pos.z-prevZ)/Math.max(P,.001),rig=al.rig;
    if(rig){
      rig.innerRing&&(rig.innerRing.rotation.z-=P*2.4);
      if(al.flipT>0){
        al.flipT+=P;let u=Math.min(1,al.flipT/.68);
        rig.bodyPivot.position.y=.48+Math.sin(u*Math.PI)*1.45;
        rig.bodyPivot.rotation.x=-u*Math.PI*4;
        rig.flipRing.visible=!0,rig.flipRing.scale.setScalar(1+u*5.5);
        for(let li2=0;li2<4;li2++){rig.legs[li2].hip.rotation.x=.85;rig.legs[li2].knee.rotation.x=-1.35}
        if(al.flipT>=.68){
          al.flipT=0,rig.bodyPivot.position.y=.48,rig.bodyPivot.rotation.x=0,rig.flipRing.visible=!1;
          i.fx&&i.fx.sparks&&i.fx.sparks(al.pos,new W(0,1,0),14),i.render&&i.render.lightPool&&i.render.lightPool.flash(al.pos,2686944,28,9,.07);
          for(let en of elist)if(en.alive&&en.pos.distanceTo(al.pos)<7.8){
            en.damage(65,en.pos,new W(0,1,0),"weak"),o.spawnPopup&&o.spawnPopup(en.pos,"🐾65 灵犬空翻震击!","skill");
          }
        }
      }else{
        rig.flipRing.visible=!1;
        if(moved>.25){
          al.gaitPhase=(al.gaitPhase||0)+P*(c.overdriveT>0?16:12);
          rig.bodyPivot.position.y=.48+Math.abs(Math.sin(al.gaitPhase))*.034;
          rig.bodyPivot.rotation.x=-.055+Math.cos(al.gaitPhase*2)*.025;
          rig.bodyPivot.rotation.z=Math.sin(al.gaitPhase)*.035;
          for(let li2=0;li2<4;li2++){
            let ph=al.gaitPhase+(li2===0||li2===3?0:Math.PI),lg=rig.legs[li2];
            lg.hip.rotation.x=.42+Math.sin(ph)*.45;
            lg.knee.rotation.x=-.82+Math.max(0,Math.cos(ph))*.54;
          }
        }else{
          let br=Math.sin(c.time*3.2+ai)*.014;
          rig.bodyPivot.position.y=.48+br,rig.bodyPivot.rotation.x=br*.5,rig.bodyPivot.rotation.z=0;
          rig.headGroup.rotation.y=Math.sin(c.time*1.7+ai)*.26;
          for(let li2=0;li2<4;li2++){rig.legs[li2].hip.rotation.x=.42;rig.legs[li2].knee.rotation.x=-.82}
        }
        if(best){rig.headGroup.rotation.y=0;rig.turretPivot.rotation.y=0}
      }
    }
  }
  for(let wi=c.wingmen.length-1;wi>=0;wi--){
    let wg=c.wingmen[wi];wg.life-=P,wg.ang+=P*1.9,wg.cd-=P;
    if(wg.rotors)for(let ri=0;ri<wg.rotors.length;ri++)wg.rotors[ri].rotation.y+=P*(ri%2?-26:26);
    if(wg.life<=0){wg.alive=!1,tacRoot.remove(wg.root),c.wingmen.splice(wi,1),o.feed&&o.feed("神眸 BC4 Pro+ 双目突击僚机能量耗尽返航"),q();continue}
    let tx=n.pos.x+Math.cos(wg.ang)*2.3,tz=n.pos.z+Math.sin(wg.ang)*2.3,ty=n.pos.y+2.5+Math.sin(wg.ang*2)*.25;
    wg.pos.set(tx,ty,tz),wg.root.rotation.y=-wg.ang;
    let best=null,bestD=30;
    for(let en of elist)if(en.alive){let d=en.pos.distanceTo(wg.pos);d<bestD&&(bestD=d,best=en)}
    if(best){
      wg.root.lookAt(best.pos.x,best.pos.y+.6,best.pos.z);
      if(wg.cd<=0){wg.cd=.4;let tgt=new W(best.pos.x,best.pos.y+.6,best.pos.z);i.fx&&i.fx.tracer&&i.fx.tracer(wg.pos,tgt),i.fx&&i.fx.sparks&&i.fx.sparks(tgt,new W(0,1,0),4),best.damage(15,tgt,null,"body")}
    }
  }`
  },

  // 9. Expose triggerPulseStrike on game object `_` and auto-deploy 1 Bionic Guardian Hound at Defender start in `H()`
  {
    label: 'bionic-expose-trigger-pulse',
    target: `let _={state:"title",flow:Yi,run:c,menus:l,switchRole,cycleAvatar,setAvatar,triggerSkillQ,triggerSkillG,`,
    replacement: `let _={state:"title",flow:Yi,run:c,menus:l,switchRole,cycleAvatar,setAvatar,triggerSkillQ,triggerSkillG,triggerPulseStrike,`
  },
  {
    label: 'bionic-autospawn-defender-hound',
    target: `let startInfo=isDef?{pos:new W(8,0,2),yaw:Math.PI/2}:s.playerStart;n.reset(startInfo),c.humanPos.copy(n.pos),a(i.weapon,"setVisible",!0),o.reset&&o.reset(),e.saturation=t,e.flash=0,q(),o.setRelays&&o.setRelays(0,c.relays.length),pushScoreHUD(),isDef||ie()`,
    replacement: `let startInfo=isDef?{pos:new W(8,0,2),yaw:Math.PI/2}:s.playerStart;n.reset(startInfo),c.humanPos.copy(n.pos),c.fCd=0,c.frenzyT=0,c.pulseT=0,a(i.weapon,"setVisible",!0),o.reset&&o.reset(),isDef&&spawnAllyGuard(new W(n.pos.x+1.8,i.physics.groundHeight(n.pos.x+1.8,n.pos.z+1.4,n.pos.y+2),n.pos.z+1.4)),e.saturation=t,e.flash=0,q(),o.setRelays&&o.setRelays(0,c.relays.length),pushScoreHUD(),isDef||ie()`
  },

  // 10. Wire Catharsis Kill-Streak Escalation, Floating Damage Popups, Hound Land Slam, and Relay Harmonic Wave
  {
    label: 'bionic-catharsis-kill-streak-events',
    target: `i.events.on("enemy:killed",k=>{if(_.state!=="playing")return;let eObj=k&&k.enemy||k;if(eObj&&eObj.id){if(c.scoredIds.has(eObj.id))return;c.scoredIds.add(eObj.id)}let pts=eObj&&eObj.isBoss?500:eObj&&eObj.isElite?200:eObj&&eObj.type==="hound"?130:90;addScore(pts,"击毁敌机",!0),unlockMedal("first_blood"),(n.avatar==="drone"||n.avatar==="hound")&&unlockMedal("neural_ace"),eObj&&eObj.isBoss&&unlockMedal("boss_slayer")}),i.events.on("player:hitEnemy",k=>{if(_.state!=="playing")return;k&&k.killed&&k.weak&&(addScore(60,"弱点命中",!1),unlockMedal("weak_master"))}),`,
    replacement: `i.events.on("enemy:hit",k=>{if(_.state!=="playing"||!k||!k.enemy)return;let dmg=Math.max(1,Math.round(k.damage||24)),isWk=k.part==="weak";o.spawnPopup&&o.spawnPopup(k.point||k.enemy.pos,isWk?\`⚡\${dmg} 暴击!\`:\`+\${dmg}\`,isWk?"crit":"hit")}),i.events.on("player:land",k=>{if(_.state==="playing"&&n.alive&&n.avatar==="hound"&&Math.abs(k&&k.speed||0)>3.2)triggerPulseStrike(!0)}),i.events.on("enemy:killed",k=>{if(_.state!=="playing")return;let eObj=k&&k.enemy||k;if(eObj&&eObj.id){if(c.scoredIds.has(eObj.id))return;c.scoredIds.add(eObj.id)}let pts=eObj&&eObj.isBoss?500:eObj&&eObj.isElite?200:eObj&&eObj.type==="hound"?130:90;addScore(pts,"击毁敌机",!0),unlockMedal("first_blood"),(n.avatar==="drone"||n.avatar==="hound")&&unlockMedal("neural_ace"),eObj&&eObj.isBoss&&unlockMedal("boss_slayer");let ck=c.comboKills||1;if(ck===2){addScore(60,"双重猎杀",!1),o.showStreak&&o.showStreak("DOUBLE KILL // 双重猎杀","连击倍率 ×"+c.combo.toFixed(1)+" · 战功 +60","COMBO ×2",2)}else if(ck===3){i.weapon&&(i.weapon.ammo=i.weapon.magSize||30),n.heal&&n.heal(25);for(let al of c.allies)if(al.alive)al.hp=Math.min(al.maxHp,al.hp+35);o.showStreak&&o.showStreak("TRIPLE STRIKE // 三连破阵","瞬时满弹匣 + 纳米修复 +25 HP + 灵犬回血","COMBO ×3",3),o.feed&&o.feed("🔥 <b>三连破阵奖励</b>：弹匣瞬满 + 纳米修复 +25 HP！")}else if(ck===4){c.qCd=Math.max(0,c.qCd-4.5),o.showStreak&&o.showStreak("QUADRA OVERLOAD // 四连超载","战术大招 [Q] 冷却缩减 4.5 秒！","COMBO ×4",4),o.feed&&o.feed("⚡ <b>四连超载奖励</b>：[Q] 战术大招冷却 -4.5s！")}else if(ck===5){c.frenzyT=5.5,i.weapon&&(i.weapon.ammo=i.weapon.magSize||30),o.showStreak&&o.showStreak("RAMPAGE // 五连暴走主宰","5.5 秒无限弹匣 + 射速飙升 35% + 机动超载！","HYPER FRENZY",5),o.feed&&o.feed("💥 <b>五连暴走主宰</b>：已激活 5.5 秒无限火力与射速超载！")}else if(ck>=6){c.frenzyT=Math.max(c.frenzyT||0,4.5);let elist=i.enemies&&i.enemies.list||[],victim=elist.find(en=>en.alive&&en!==eObj);if(victim){spawnOrbitalBolt(victim.pos),victim.damage(180,victim.pos,new W(0,1,0),"weak"),o.spawnPopup&&o.spawnPopup(victim.pos,"⚡180 苍穹天罚!","skill")}o.showStreak&&o.showStreak("SKYLINE DOMINATOR // 苍穹天罚",\`\${ck} 连杀达成 · 轨道电磁天罚已降临 (180 DMG)！\`,"GODLIKE STREAK",5)}}),i.events.on("player:hitEnemy",k=>{if(_.state!=="playing")return;k&&k.killed&&k.weak&&(addScore(60,"弱点命中",!1),unlockMedal("weak_master"))}),`
  },

  // 11. Wire [F] melee key in playing loop B(P) and Relay Harmonic Shockwave on relay cut / repair
  {
    label: 'bionic-relay-repair-harmonic',
    target: `if(isDef){if(V&&r.down("interact")){V.hp=Math.min(100,(V.hp??100)+P*32),V.hp>=99.5&&o.feed&&o.feed(\`<b>中继 \${V.short}</b> 纳米装甲已修复至 100%\`)}}`,
    replacement: `if(isDef){if(V&&r.down("interact")){let prevHp=V.hp??100;V.hp=Math.min(100,prevHp+P*36);if(prevHp<99.5&&V.hp>=99.5){n.heal&&n.heal(30);for(let al of c.allies)if(al.alive){al.hp=Math.min(al.maxHp,al.hp+45),al.flipT=.001}spawnOrbitalBolt(V.o.pos),o.showStreak&&o.showStreak("RELAY HARMONIC // 中继满载共鸣","中继 "+V.short+" 修复完成 · 友军回血 + 灵犬空翻震击","BASTION RESTORED",3),o.feed&&o.feed(\`<b>中继 \${V.short}</b> 纳米装甲已修复至 100% · 释放守护谐波！\`)}}}`
  },
  {
    label: 'bionic-relay-cut-harmonic',
    target: `function me(P){P.cut=!0,P.cutting=!1,P.t=1,c.cut++,O(P.o,"cut"),addScore(250,\`切断中继 \${P.short}\`,!0);`,
    replacement: `function me(P){P.cut=!0,P.cutting=!1,P.t=1,c.cut++,O(P.o,"cut"),addScore(250,\`切断中继 \${P.short}\`,!0),n.heal&&n.heal(30),spawnOrbitalBolt(P.o.pos),o.showStreak&&o.showStreak("RELAY SEVERED // 中继熔断超载","中继 "+P.short+" 已熔断 · 纳米护盾恢复 +30 HP","OBJECTIVE BREAKTHROUGH",4);for(let en of i.enemies&&i.enemies.list||[])if(en.alive&&en.pos.distanceTo(P.o.pos)<13){en.damage(85,en.pos,new W(0,1,0),"weak"),o.spawnPopup&&o.spawnPopup(en.pos,"⚡85 熔断震波!","skill")}`
  },
  {
    label: 'bionic-key-f-pulse-strike',
    target: `r.pressed("skillQ")&&triggerSkillQ(),r.pressed("skillG")&&triggerSkillG();`,
    replacement: `r.pressed("skillQ")&&triggerSkillQ(),r.pressed("skillG")&&triggerSkillG(),r.pressed("melee")&&triggerPulseStrike(!1);`
  }
];
