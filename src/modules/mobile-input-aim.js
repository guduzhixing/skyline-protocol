/**
 * Mobile Web-First Runtime, Touch Input, Cone Aim-Assist, Auto-Fire Pill & Gyro Aim
 * Module slots injected into `src/core/engine-base.html` by `scripts/build.mjs`.
 *
 * Key Invariants:
 * 1. `IS_TOUCH_DEV` detects touch devices on boot without polluting desktop (1440x900).
 * 2. `requestPointerLock()` is guarded so mobile & tabletop modes never trigger Chromium PointerLock rejection.
 * 3. Look-drag comms ("鼠标捕获不可用") is suppressed when playing on touch or tabletop mode.
 * 4. Aim-assist (`findMobAssistTarget`) runs in weapon update `dm(i)` with subtle cone magnetism + optional auto-fire.
 */
export const MOBILE_PATCHES = [
  {
    label: 'meta-and-title',
    target: '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>苍穹防线：零号协议 · CINMOORE 神眸 × SuperACME 战略护航</title>',
    replacement: '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<title>苍穹防线：零号协议 V3 · 手游×桌游双栖 3A 战术大作</title>'
  },
  {
    label: 'v3-viewport-detect',
    target: 'bindSAImgs(document);',
    replacement: `bindSAImgs(document);
const IS_TOUCH_DEV=/Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(navigator.userAgent)||(typeof window<"u"&&(("ontouchstart"in window)||window.matchMedia&&window.matchMedia("(pointer: coarse)").matches))||(navigator.maxTouchPoints>0&&Math.min(innerWidth,innerHeight)<1024);
function syncViewportEnv(){let doc=document.documentElement;let isMob=IS_TOUCH_DEV||innerWidth<900&&("ontouchstart"in window||navigator.maxTouchPoints>0);doc.classList.toggle("is-touch",!!isMob);let land=innerWidth>innerHeight&&innerHeight<=560;doc.classList.toggle("is-portrait",!!isMob&&!land);doc.classList.toggle("is-landscape",!!isMob&&!!land)}
syncViewportEnv(),addEventListener("resize",syncViewportEnv),addEventListener("orientationchange",()=>setTimeout(syncViewportEnv,80));
`
  },
  {
    label: 'mobile-shadow-1024',
    target: 'low:{name:"low",scale:.7,msaa:0,shadow:2048,tex:512,volSteps:12,ao:!1,planar:0,bloom:!0,motionBlur:!1,rain:.5}',
    replacement: 'low:{name:"low",scale:.7,msaa:0,shadow:1024,tex:512,volSteps:10,ao:!1,planar:0,bloom:!0,motionBlur:!1,rain:.45}'
  },
  {
    label: 'mobile-dpr-clamp',
    target: 'X=Math.min(window.devicePixelRatio||1,2)',
    replacement: 'X=Math.min(window.devicePixelRatio||1,IS_TOUCH_DEV?1.5:2)'
  },
  {
    label: 'guard-pointerlock-mobile-tabletop',
    target: 'function A(){if(!(f.touch||f.locked)){if(!e.requestPointerLock)',
    replacement: 'function A(){if(!(f.touch||IS_TOUCH_DEV||f.locked||(i.playMode&&i.playMode!=="fps"))){if(!e.requestPointerLock)'
  },
  {
    label: 'touch-ui-v3-elements',
    target: 'P.innerHTML=\'<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><button class="t-btn t-fire" data-a="fire" aria-label="开火"><span>开火</span></button><button class="t-btn t-ads" data-a="ads" aria-label="瞄准"><span>瞄准</span></button><button class="t-btn t-reload" data-a="reload" aria-label="换弹"><span>换弹</span></button><button class="t-btn t-jump" data-a="jump" aria-label="跳跃"><span>跳跃</span></button><button class="t-btn t-interact" data-a="interact" aria-label="Interact"><span>交互</span></button><button class="t-btn t-pause" data-a="pause" aria-label="暂停"><span>暂停</span></button>\'',
    replacement: 'P.innerHTML=\'<div class="t-stick"><i class="t-ring"></i><i class="t-nub"></i></div><div class="t-stick-idle"></div><button class="t-btn t-fire" data-a="fire" aria-label="开火"><span>开火</span></button><button class="t-btn t-ads" data-a="ads" aria-label="瞄准"><span>瞄准</span></button><button class="t-btn t-reload" data-a="reload" aria-label="换弹"><span>换弹</span></button><button class="t-btn t-jump" data-a="jump" aria-label="跳跃"><span>跳跃</span></button><button class="t-btn t-interact" data-a="interact" aria-label="Interact"><span>交互</span></button><button class="t-btn t-pause" data-a="pause" aria-label="暂停"><span>暂停</span></button><button class="t-assist" id="t-assist-btn" type="button">自动开火:开</button>\''
  },
  {
    label: 'touch-init-and-gyro',
    target: 'function K(){f.touch||(f.touch=!0,_(),M||(M=N()),M.root.classList.toggle("on",r),document.documentElement.classList.add("is-touch"),p("touch"))}',
    replacement: `function syncAssistBtn(){let ab=M&&M.root&&M.root.querySelector("#t-assist-btn");if(!ab)return;let on=!(i.settings&&i.settings.autoFire===!1);ab.textContent=on?"自动开火:开":"仅手控:关",ab.classList.toggle("off",!on)}
function K(){if(!f.touch){f.touch=!0,_();if(!M){M=N();let ab=M.root.querySelector("#t-assist-btn");if(ab){ab.addEventListener("click",ev=>{ev.stopPropagation(),i.toggleAutoFire&&i.toggleAutoFire(),syncAssistBtn()});ab.addEventListener("touchstart",ev=>{ev.preventDefault(),ev.stopPropagation(),i.toggleAutoFire&&i.toggleAutoFire(),syncAssistBtn()},{passive:!1})}}syncAssistBtn(),M.root.classList.toggle("on",r),document.documentElement.classList.add("is-touch"),p("touch")}}
IS_TOUCH_DEV&&K();i.syncTouchUI=syncAssistBtn;
(()=>{let lb=null,lg=null;addEventListener("deviceorientation",ev=>{if(!r||!(i.settings&&i.settings.gyroAim)||ev.beta==null||ev.gamma==null)return;if(lb===null){lb=ev.beta,lg=ev.gamma;return}let db=ev.beta-lb,dg=ev.gamma-lg;lb=ev.beta,lg=ev.gamma;Math.abs(db)<12&&Math.abs(dg)<12&&(f.look.dx+=-dg*.011*f.sensitivity,f.look.dy+=-db*.009*f.sensitivity*(f.invertY?-1:1))})})();`
  },
  {
    label: 'weapon-shot-aim-assist',
    target: 'ze.set(Math.cos(Oe)*pt,Math.sin(Oe)*pt,-1).normalize().applyQuaternion(we.quaternion),Ie.copy(Me.eye||we.position);let ut=null;',
    replacement: 'ze.set(Math.cos(Oe)*pt,Math.sin(Oe)*pt,-1).normalize().applyQuaternion(we.quaternion),Ie.copy(Me.eye||we.position);if((beTouchAssist())&&!beIsOff()){let at=findMobAssistTarget(7.5,85);if(at){dt.copy(at).sub(Ie).normalize(),ze.lerp(dt,.72).normalize()}}let ut=null;'
  },
  {
    label: 'dm-aim-assist-helper',
    target: 'function Be(){let Me=i.player,',
    replacement: `function beTouchAssist(){return!!(i.input&&i.input.touch&&(i.settings?i.settings.aimAssist!==!1:!0))}
function beIsOff(){return i.playMode&&i.playMode!=="fps"}
let _aaTmp=new gi,_aaFwd=new gi;
function findMobAssistTarget(maxDeg,maxDist){let pl=i.player,cam=i.camera,el=i.enemies&&i.enemies.list;if(!pl||!cam||!el)return null;let eye=pl.eye||cam.position;_aaFwd.set(0,0,-1).applyQuaternion(cam.quaternion);let minDot=Math.cos(maxDeg*Math.PI/180),bestD=minDot,bestP=null;for(let en of el){if(!en.alive)continue;let tp=en.sensor||en.pos;let dx=tp.x-eye.x,dy=tp.y-eye.y,dz=tp.z-eye.z,dist=Math.hypot(dx,dy,dz);if(dist<1.2||dist>maxDist)continue;_aaTmp.set(dx/dist,dy/dist,dz/dist);let dot=_aaFwd.dot(_aaTmp);if(dot>bestD&&(!i.physics||!i.physics.lineOfSight||i.physics.lineOfSight(eye,tp))){bestD=dot,bestP=tp}}return bestP}
i.findAssistTarget=findMobAssistTarget;
function Be(){let Me=i.player,`
  },
  {
    label: 'dm-mobile-autofire-magnet',
    target: 'let Oe=!!be.fire&&ve._vis&&!ce.noFire,pt=Oe&&!k.prevFire;',
    replacement: 'let autoTarget=(be.touch&&!beIsOff()&&i.settings&&i.settings.autoFire!==!1&&!k.reload)?findMobAssistTarget(4.5,65):null;if(beTouchAssist()&&!beIsOff()&&we.alive&&!k.reload){let magT=findMobAssistTarget(11,65);if(magT){let eye=we.eye||i.camera.position,dx=magT.x-eye.x,dy=magT.y-eye.y,dz=magT.z-eye.z,hz=Math.hypot(dx,dz)||1e-4,tyaw=Math.atan2(-dx,-dz),tpit=Math.atan2(dy,hz),dyaw=((tyaw-we.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;we.yaw+=dyaw*Math.min(1,Me*2.8),we.pitch=Zn(we.pitch+(tpit-we.pitch)*Math.min(1,Me*2.4),-1.45,1.45)}}let Oe=(!!be.fire||!!autoTarget)&&ve._vis&&!ce.noFire,pt=Oe&&!k.prevFire;'
  },
  {
    label: 'v3-settings-schema',
    target: 'var fM="saltline.settings.v1",XC={quality:"auto",sens:1,invertY:!1,volume:.8,fov:Pi.fov},dM=["low","medium","high","ultra"];function YC(){let i={...XC};try{let e=JSON.parse(localStorage.getItem(fM)||"null");e&&typeof e=="object"&&((e.quality==="auto"||dM.includes(e.quality))&&(i.quality=e.quality),Number.isFinite(e.sens)&&(i.sens=Math.min(3,Math.max(.2,e.sens))),i.invertY=!!e.invertY,Number.isFinite(e.volume)&&(i.volume=Math.min(1,Math.max(0,e.volume))),Number.isFinite(e.fov)&&(i.fov=Math.min(95,Math.max(60,e.fov))))}catch{}return i}',
    replacement: 'var fM="saltline.settings.v1",XC={quality:"auto",sens:1,invertY:!1,volume:.8,fov:Pi.fov,aimAssist:!0,autoFire:!0,gyroAim:!1,tableFlip:!0},dM=["low","medium","high","ultra"];function YC(){let i={...XC};try{let e=JSON.parse(localStorage.getItem(fM)||"null");e&&typeof e=="object"&&((e.quality==="auto"||dM.includes(e.quality))&&(i.quality=e.quality),Number.isFinite(e.sens)&&(i.sens=Math.min(3,Math.max(.2,e.sens))),i.invertY=!!e.invertY,Number.isFinite(e.volume)&&(i.volume=Math.min(1,Math.max(0,e.volume))),Number.isFinite(e.fov)&&(i.fov=Math.min(95,Math.max(60,e.fov))),typeof e.aimAssist=="boolean"&&(i.aimAssist=e.aimAssist),typeof e.autoFire=="boolean"&&(i.autoFire=e.autoFire),typeof e.gyroAim=="boolean"&&(i.gyroAim=e.gyroAim),typeof e.tableFlip=="boolean"&&(i.tableFlip=e.tableFlip))}catch{}return i}'
  },
  {
    label: 'guard-drag-msg-1',
    target: '_.state==="playing"&&(r.mode==="drag"||r.mode==="lock"&&!r.locked&&!i.params.shot&&!i.params.autostart)?o.message(V,r.mode==="drag"?7:4):',
    replacement: '_.state==="playing"&&!IS_TOUCH_DEV&&(i.playMode||"fps")==="fps"&&(r.mode==="drag"||r.mode==="lock"&&!r.locked&&!i.params.shot&&!i.params.autostart)?o.message(V,r.mode==="drag"?7:4):'
  },
  {
    label: 'guard-drag-msg-2',
    target: 'r.mode==="lock"&&!r.locked&&!r.touch&&!i.params.shot&&!i.params.autostart?(y-=P,y<=0&&(y=2,o.message(r.describeMode(),2.6))):y=.8',
    replacement: 'r.mode==="lock"&&!r.locked&&!r.touch&&!IS_TOUCH_DEV&&(i.playMode||"fps")==="fps"&&!i.params.shot&&!i.params.autostart?(y-=P,y<=0&&(y=2,o.message(r.describeMode(),2.6))):y=.8'
  }
];
