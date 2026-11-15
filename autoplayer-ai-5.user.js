// ==UserScript==
// @name         AutoPlayer AI 5.0 — Núcleo Autônomo
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      5.0.0-beta.1
// @description  Núcleo de automação baseado nas funções nativas confirmadas de Vila dos Despertos.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-5.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-5.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
"use strict";
const ROOT_ID="autoplayer-ai-5",CHANNEL="APAI5_NATIVE_BRIDGE",POS_KEY="apai5-panel-position";
if(document.getElementById(ROOT_ID))return;
const host=document.createElement("div");
host.id=ROOT_ID;
host.style.cssText="position:fixed;z-index:2147483646;pointer-events:none;left:auto;top:auto;right:8px;bottom:160px;font:13px/1.35 system-ui,sans-serif;color:#eef4ff;max-width:calc(100vw - 12px)";
const shadow=host.attachShadow({mode:"open"});
shadow.innerHTML="<style>*{box-sizing:border-box}#chip,#panel{pointer-events:auto}#chip{display:flex;align-items:center;gap:8px;border:1px solid #7185ad;background:#1b2942;color:#fff;border-radius:13px;padding:9px 11px;font-weight:850;box-shadow:0 4px 16px #0009;max-width:calc(100vw - 16px);touch-action:none;user-select:none}#chip .dot{width:8px;height:8px;border-radius:50%;background:#e6ad49}#panel{display:none;width:min(300px,calc(100vw - 16px));background:#111b2c;border:1px solid #7864b8;border-radius:14px;overflow:hidden;box-shadow:0 9px 30px #000b}#panel.open{display:block}header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:#202e49;border-bottom:1px solid #405174;touch-action:none;user-select:none;cursor:move}header strong{font-size:13px}.head{display:flex;gap:5px}button{font:inherit;cursor:pointer;border:0}header button{width:29px;height:28px;border-radius:8px;background:#405779;color:#fff;font-size:17px}#close:hover{background:#a73545}main{padding:10px}.status{white-space:pre-line;font-size:11px;line-height:1.5;background:#091321;border:1px solid #2c3b56;border-radius:9px;padding:9px;min-height:82px;color:#d9e5f8}.section{font-size:10px;color:#aebbd0;font-weight:800;letter-spacing:.6px;margin:10px 1px 4px}.toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 2px;border-top:1px solid #2b3950}.toggle b{display:block;font-size:12px}.toggle small{display:block;color:#99a9c2;font-size:10px;margin-top:2px}.toggle input{width:38px;height:22px;accent-color:#19a66b}.actions{display:flex;gap:7px;margin-top:10px}.actions button{flex:1;padding:10px 7px;border-radius:8px;color:#fff;background:#405779;font-weight:800;font-size:11px}#start{background:#14784e}#stop{background:#8b3444}.secondary{display:flex;gap:7px;margin-top:7px}.secondary button{flex:1;padding:8px 6px;border-radius:8px;background:#2c3c58;color:#dce8fa;font-size:10px;font-weight:700}.hint{font-size:10px;color:#91a2bd;line-height:1.45;margin:9px 1px 0}.status.good{border-color:#277a56}.status.warn{border-color:#9a7332}#chip[hidden]{display:none}</style><button id='chip' type='button'><span class='dot'></span><span>AUTOPLAYER AI 5.0</span><span>＋</span></button><section id='panel'><header id='drag'><strong>🤖 AUTOPLAYER AI 5.0</strong><span class='head'><button id='min' title='Minimizar'>−</button><button id='close' title='Fechar painel'>×</button></span></header><main><div id='status' class='status'>Iniciando ponte com o jogo...</div><div class='section'>AUTOMAÇÃO</div><label class='toggle'><span><b>🧠 Cérebro automático</b><small>Executa os módulos disponíveis</small></span><input id='master' type='checkbox'></label><label class='toggle'><span><b>🧭 Navegar pela missão ativa</b><small>Usa a rota nativa do próprio jogo</small></span><input id='missions' type='checkbox'></label><label class='toggle'><span><b>⚔️ Combate por turnos</b><small>Habilidades, defesa, cura e pet</small></span><input id='combat' type='checkbox'></label><div class='actions'><button id='start'>▶ INICIAR IA</button><button id='stop'>■ PARAR</button></div><div class='secondary'><button id='recheck'>RECONFERIR CONEXÃO</button><button id='hide'>RECOLHER</button></div><p class='hint'>Arraste esta barra para qualquer canto. A posição fica salva. O painel não captura toques fora dele. NPCs, aceite de novas missões e oficina só serão ativados quando os comandos internos correspondentes forem confirmados.</p></main></section>";
document.documentElement.appendChild(host);
const $=id=>shadow.getElementById(id);
const state={running:false,missions:false,combat:false,dragging:false,down:null,moved:false};
const send=(action,value)=>window.postMessage({channel:CHANNEL,direction:"command",action,value},location.origin);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function setPosition(x,y){
 const w=host.offsetWidth||300,h=host.offsetHeight||55;
 host.style.left=clamp(x,4,Math.max(4,innerWidth-w-4))+"px";
 host.style.top=clamp(y,4,Math.max(4,innerHeight-h-4))+"px";
 host.style.right="auto";host.style.bottom="auto";
 try{localStorage.setItem(POS_KEY,JSON.stringify({x:parseFloat(host.style.left),y:parseFloat(host.style.top)}))}catch(_){}
}
function loadPosition(){
 try{const p=JSON.parse(localStorage.getItem(POS_KEY)||"null");if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){setPosition(p.x,p.y);return}}catch(_){}
 // Área inicial discreta: no rodapé, onde ficam os atalhos do jogo.
 setPosition(Math.max(4,innerWidth-160),Math.max(70,Math.round(innerHeight*.42)));
}
function collapse(){ $("panel").classList.remove("open");$("chip").hidden=false; }
function expand(){ $("chip").hidden=true;$("panel").classList.add("open"); }
function beginDrag(e){
 if(e.target.closest("button")&&e.currentTarget===$("drag"))return;
 state.dragging=true;state.moved=false;
 const r=host.getBoundingClientRect();
 state.down={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,startX:e.clientX,startY:e.clientY};
 try{e.currentTarget.setPointerCapture(e.pointerId)}catch(_){}
}
function moveDrag(e){
 if(!state.dragging||!state.down||e.pointerId!==state.down.id)return;
 if(Math.abs(e.clientX-state.down.startX)+Math.abs(e.clientY-state.down.startY)>5)state.moved=true;
 if(state.moved)setPosition(e.clientX-state.down.dx,e.clientY-state.down.dy);
}
function endDrag(){state.dragging=false;state.down=null}
$("chip").addEventListener("pointerdown",beginDrag);
$("chip").addEventListener("pointermove",moveDrag);
$("chip").addEventListener("pointerup",()=>{if(!state.moved)expand();endDrag()});
$("chip").addEventListener("pointercancel",endDrag);
$("drag").addEventListener("pointerdown",beginDrag);
$("drag").addEventListener("pointermove",moveDrag);
$("drag").addEventListener("pointerup",endDrag);
$("drag").addEventListener("pointercancel",endDrag);
$("min").addEventListener("click",collapse);
$("close").addEventListener("click",collapse);
$("hide").addEventListener("click",collapse);
$("start").addEventListener("click",()=>{
 state.running=true;state.missions=true;state.combat=true;
 $("master").checked=$("missions").checked=$("combat").checked=true;
 send("configure",{running:true,missions:true,combat:true});
});
$("stop").addEventListener("click",()=>{
 state.running=state.missions=state.combat=false;
 $("master").checked=$("missions").checked=$("combat").checked=false;
 send("configure",{running:false,missions:false,combat:false});
});
for(const [id,key] of [["master","running"],["missions","missions"],["combat","combat"]]){
 $(id).addEventListener("change",()=>{
  state[key]=$(id).checked;
  if(id==="master"&&!state.running){state.missions=state.combat=false;$("missions").checked=$("combat").checked=false}
  send("configure",{running:state.running,missions:state.missions,combat:state.combat});
 });
}
$("recheck").addEventListener("click",()=>send("diagnostic",{}));
window.addEventListener("resize",()=>{const r=host.getBoundingClientRect();setPosition(r.left,r.top)});
window.addEventListener("message",e=>{
 const d=e.data;
 if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CHANNEL||d.direction!=="state")return;
 const p=d.payload||{};
 const lines=[
  "Ponte interna: "+(p.bridge?"CONECTADA":"NÃO ACESSÍVEL"),
  "Jogo: "+(p.screen||"carregando")+" · "+(p.player||"personagem não identificado"),
  "Missão: "+(p.mission||"nenhuma ativa"),
  "Posição: "+(p.position||"-")+" · Rota: "+(p.route||"sem rota"),
  "Combate: "+(p.battle||"inativo")+" · HP/MP: "+(p.hp||"-")+" / "+(p.mp||"-"),
  "Cérebro: "+(p.activity||"observando"),
  "Funções: "+(p.capabilities||"verificando")
 ];
 $("status").textContent=lines.join("\n");
 $("status").className="status "+(p.bridge?"good":"warn");
 $("master").checked=!!p.running;$("missions").checked=!!p.missions;$("combat").checked=!!p.combat;
});
loadPosition();
function pageRuntime(){
"use strict";
const CHANNEL="APAI5_NATIVE_BRIDGE";
if(window.__APAI5_NATIVE)return;
let running=false,autoMission=false,autoCombat=false,busy=false,lastTurn="",lastMission="",lastPos=null,lastMoveAt=0,lastActionAt=0,lastActivity="inicializando",lastDiagnostic=0,timer=null;
const now=()=>Date.now();
const game=()=>typeof JG!=="undefined"&&JG&&JG.tela==="jogando"&&JG.est&&JG.est.eu&&JG.p;
const norm=s=>(String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim());
const visible=el=>!!(el&&el.isConnected&&el.getClientRects().length&&!el.disabled);
const txt=el=>norm(el&&(el.innerText||el.textContent)||"");
const nativeCaps=()=>({
 JG:typeof JG!=="undefined",
 move:typeof irParaMissao==="function",
 battle:typeof batalhaApi==="function",
 requestId:typeof novoPedido==="function",
 monsterLookup:typeof monDe==="function",
 missionLookup:typeof misDe==="function",
 render:typeof renderJogo==="function"
});
function safeMissionName(){
 try{if(!JG.atual)return "";const m=typeof misDe==="function"?misDe(JG.atual.m):null;return m&&m.nome||JG.atual.nome||"missão ativa"}catch(_){return "missão ativa"}
}
function snapshot(){
 const caps=nativeCaps();
 if(!game())return{bridge:caps.JG,screen:typeof JG!=="undefined"?JG.tela:"não exposto",activity:lastActivity,running,missions:autoMission,combat:autoCombat,capabilities:Object.keys(caps).filter(k=>caps[k]).join(", ")||"nenhuma"};
 try{
  const p=JG.p,R=JG.est.eu.rpg||{},b=R.batalha,mission=JG.atual;
  const pos=Number.isFinite(p.x)&&Number.isFinite(p.y)?Math.round(p.x)+","+Math.round(p.y):"-";
  const route=p.ir?(Math.round(p.ir.x)+","+Math.round(p.ir.y)+(p.ir.m?" · missão":"")):"sem rota";
  const mon=b&&!b.fim&&typeof monDe==="function"?monDe(b.m):null;
  return{bridge:caps.JG,screen:JG.tela,player:JG.at||JG.est.eu.nome||"jogador",mission:mission?safeMissionName():"",position:pos,route,battle:b&&!b.fim?(mon&&mon.nome||"em andamento"):"",hp:b&&b.p?b.p.hp+"/"+b.p.hpMax:(R.p?R.p.hp+"/"+R.p.hpMax:"-"),mp:b&&b.p?b.p.mp+"/"+b.p.mpMax:(R.p?R.p.mp+"/"+R.p.mpMax:"-"),activity:lastActivity,running,missions:autoMission,combat:autoCombat,capabilities:Object.keys(caps).filter(k=>caps[k]).join(", ")};
 }catch(e){return{bridge:caps.JG,screen:"erro ao ler estado",activity:String(e).slice(0,100),running,missions:autoMission,combat:autoCombat,capabilities:Object.keys(caps).filter(k=>caps[k]).join(", ")}}
}
function publish(){try{window.postMessage({channel:CHANNEL,direction:"state",payload:snapshot()},location.origin)}catch(_){}}
function log(s){lastActivity=s;publish()}
function nativeCall(name,fn){
 try{if(typeof fn!=="function")throw new Error("função nativa não encontrada: "+name);return fn()}
 catch(e){log(name+": "+String(e&&e.message||e).slice(0,110));return false}
}
function moveMission(){
 if(!game())return false;
 if(!JG.atual){log("aguardando missão ativa; não existe missão atribuída");return false}
 if(typeof irParaMissao!=="function"){log("função nativa de rota não acessível neste contexto");return false}
 const key=String(JG.atual.ini||JG.atual.m||"active");
 try{
  if(!JG.p.ir||JG.p.ir.volta||JG.p.ir.m!==JG.atual.ini){
   irParaMissao();
   lastMission=key;
   lastPos={x:JG.p.x,y:JG.p.y};
   lastMoveAt=now();
   log("rota nativa iniciada para "+safeMissionName());
   return true;
  }
  JG.seguir=true;
  const p=JG.p,dx=p.x-(lastPos?lastPos.x:p.x),dy=p.y-(lastPos?lastPos.y:p.y);
  if(Math.hypot(dx,dy)>0.7){lastPos={x:p.x,y:p.y};lastMoveAt=now();if(lastActivity.indexOf("rota")!==0)log("personagem caminhando pela rota da missão")}
  else if(lastMoveAt&&now()-lastMoveAt>12000&&!JG.ocupado){
   // Recuperação: recalcula a rota usando a função nativa, sem simular teclas.
   p.ir=null;irParaMissao();lastPos={x:p.x,y:p.y};lastMoveAt=now();
   log("rota sem progresso; recalculando caminho nativo");
   return true;
  }
  return true;
 }catch(e){log("falha ao iniciar rota: "+String(e&&e.message||e).slice(0,100));return false}
}
function battleAction(tipo,id,turno){
 if(typeof batalhaApi!=="function"||!game())return false;
 const acaoId=typeof novoPedido==="function"?novoPedido():undefined;
 const payload={tipo,turno,acaoId};
 if(id!==undefined&&id!==null)payload.id=id;
 busy=true;lastTurn=String(turno)+":"+String(tipo)+":"+String(id||"");
 lastActionAt=now();log("combate: "+tipo+(id?" · "+id:""));
 let result;
 try{result=batalhaApi("batalha-acao",payload)}
 catch(e){busy=false;log("erro de combate: "+String(e&&e.message||e));return false}
 Promise.resolve(result).catch(e=>log("ação de combate falhou: "+String(e&&e.message||e))).finally(()=>{busy=false;publish()});
 return true;
}
function smartCombat(){
 if(!game()||!autoCombat)return false;
 const R=JG.est.eu.rpg||{},b=R.batalha;
 if(!b)return false;
 if(b.fim){
  if(busy)return true;
  if(typeof batalhaApi!=="function"){log("batalha terminou; função de fechamento indisponível");return true}
  busy=true;lastActionAt=now();log("fechando batalha concluída");
  Promise.resolve(batalhaApi("batalha-fechar",{})).catch(e=>log("não foi possível fechar batalha: "+String(e&&e.message||e))).finally(()=>{busy=false;lastTurn="";publish()});
  return true;
 }
 if(JG.ocupado||JG.batVista||busy||b.turno===undefined)return true;
 const turn=String(b.turno)+":"+String(b.m||"");
 if(turn===lastTurn)return true;
 const p=b.p||{},hp=Number(p.hp||0),hpMax=Math.max(1,Number(p.hpMax||1)),mp=Number(p.mp||0),mpMax=Math.max(1,Number(p.mpMax||1));
 const root=document.querySelector("#jgC")||document;
 const call=(type,id)=>battleAction(type,id,b.turno);
 // Chefes que anunciam golpe carregado: defender antes de atacar.
 if(b.e&&b.e.carregando&&!p.barreira)return call("defender");
 // Cura: usa primeiro item de cura realmente disponível no inventário e exposto pela interface.
 if(hp/hpMax<0.42){
  const itemTab=root.querySelector('[data-bt="item"]');
  let items=[...root.querySelectorAll("[data-item]")].filter(visible);
  if(!items.length&&itemTab){itemTab.click();lastActionAt=now();log("abrindo itens de combate para procurar cura");return true}
  const heal=items.find(x=>/cura|vida|hp|restaur|heal|recuper/i.test(txt(x)+" "+norm(x.title)));
  if(heal)return call("item",heal.dataset.item);
  const heals=[...root.querySelectorAll("[data-hab]")].filter(visible).filter(x=>/cura|vida|restaur|heal/i.test(txt(x)+" "+norm(x.title)));
  if(heals.length)return call("hab",heals[0].dataset.hab);
 }
 // O pet é uma ação nativa e só é usada se o botão estiver habilitado.
 const pet=root.querySelector("#batPet");
 if(pet&&visible(pet)&&!pet.disabled&&hp/hpMax>0.25)return call("pet");
 // Ataques disponíveis. Prioriza habilidade que mencione a fraqueza do monstro; caso não
 // haja metadado legível, usa a habilidade habilitada de menor custo de MP.
 const attacks=[...root.querySelectorAll("[data-hab]")].filter(visible);
 if(attacks.length){
  let weak=[];
  try{const mon=typeof monDe==="function"?monDe(b.m):null;weak=(mon&&Array.isArray(mon.fraco)?mon.fraco:[]).map(norm)}catch(_){}
  const score=x=>{
   const label=txt(x)+" "+norm(x.title);
   const match=weak.some(w=>w&&label.includes(w));
   const m=label.match(/(\d+)\s*mp/),cost=m?Number(m[1]):0;
   return (match?10000:0)-cost;
  };
  attacks.sort((a,b)=>score(b)-score(a));
  return call("hab",attacks[0].dataset.hab);
 }
 const defend=root.querySelector("#batDef");
 if(defend&&visible(defend))return call("defender");
 log("aguardando uma ação de combate habilitada");
 return true;
}
function tick(){
 if(!running||!game()||document.hidden)return;
 if(JG.ocupado||busy)return;
 const b=JG.est.eu.rpg&&JG.est.eu.rpg.batalha;
 if(autoCombat&&b){smartCombat();return}
 if(autoMission)moveMission();
}
function diagnostic(){
 const caps=nativeCaps();
 const result={...snapshot(),caps,active:!!game(),mission:!!(game()&&JG.atual),playerObject:!!(game()&&JG.p),position:game()?{x:JG.p.x,y:JG.p.y}:null,route:game()?JG.p.ir||null:null};
 log("diagnóstico: "+JSON.stringify(result));
 return result;
}
window.__APAI5_NATIVE={snapshot,diagnostic,moveMission,smartCombat,stop:()=>{running=autoMission=autoCombat=false;clearInterval(timer);log("parado")}};
window.addEventListener("message",e=>{
 const d=e.data;
 if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CHANNEL||d.direction!=="command")return;
 if(d.action==="configure"){
  const v=d.value||{};running=!!v.running;autoMission=running&&!!v.missions;autoCombat=running&&!!v.combat;
  if(!running){lastTurn="";lastMission="";lastMoveAt=0;lastPos=null}
  if(!timer)timer=setInterval(()=>{try{tick();if(now()-lastDiagnostic>900){lastDiagnostic=now();publish()}}catch(e){log("erro interno: "+String(e&&e.message||e).slice(0,100))}},700);
  log(running?"cérebro ligado":"cérebro parado");
 }
 if(d.action==="diagnostic")diagnostic();
});
timer=setInterval(()=>{try{if(running)tick();if(now()-lastDiagnostic>1000){lastDiagnostic=now();publish()}}catch(e){log("erro interno: "+String(e&&e.message||e).slice(0,100))}},700);
publish();
}
const script=document.createElement("script");
script.textContent=";("+pageRuntime.toString()+")();";
(document.documentElement||document.head).appendChild(script);
script.remove();
setTimeout(()=>send("diagnostic",{}),700);
})();