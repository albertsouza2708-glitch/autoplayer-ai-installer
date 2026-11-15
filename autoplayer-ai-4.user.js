// ==UserScript==
// @name         AutoPlayer AI 4.0 — Jogador Autônomo
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      4.0.0-alpha.1
// @description  Autopiloto experimental para Vila dos Despertos: missão ativa, diálogos visíveis, combate inteligente e oficina.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-4.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-4.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
"use strict";
const ID="autoplayer-ai-4",CHANNEL="AUTOPLAYER_AI_4_BRIDGE";
if(document.getElementById(ID))return;
const host=document.createElement("div");host.id=ID;
host.style.cssText="position:fixed;right:10px;bottom:92px;z-index:2147483646;pointer-events:none;font:13px system-ui,sans-serif";
const root=host.attachShadow({mode:"open"});
root.innerHTML="<style>*{box-sizing:border-box}#chip{pointer-events:auto;display:flex;align-items:center;gap:9px;background:#1d2b45;color:#fff;border:1px solid #647ca5;border-radius:16px;padding:10px 13px;box-shadow:0 5px 20px #0008;font-weight:800;cursor:pointer;max-width:calc(100vw - 20px)}#chip .plus{background:#38557e;border-radius:9px;padding:5px 10px;font-size:18px}#panel{pointer-events:auto;width:min(280px,calc(100vw - 20px));background:#111b2c;color:#edf3ff;border:1px solid #7861bd;border-radius:14px;box-shadow:0 8px 28px #000a;overflow:hidden;display:none}#panel.open{display:block}header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 11px;background:#202e49;border-bottom:1px solid #455477;cursor:move;touch-action:none;user-select:none}header strong{font-size:13px}.headBtns{display:flex;gap:5px}button{font:inherit;border:0;cursor:pointer}.headBtns button{width:28px;height:27px;border-radius:7px;background:#405577;color:white;font-size:17px}#close:hover{background:#b83245}main{padding:10px}#status{white-space:pre-line;background:#0a1322;border:1px solid #263752;border-radius:9px;padding:9px;color:#d5e2f8;font-size:11px;line-height:1.5;margin-bottom:8px;min-height:50px}.opt{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 2px;border-top:1px solid #29364c}.opt b{display:block;font-size:12px}.opt small{display:block;color:#9eacc4;font-size:10px;margin-top:2px}input{width:38px;height:22px;accent-color:#19a66b}.actions{display:flex;gap:7px;margin-top:9px}.actions button{flex:1;padding:9px 7px;border-radius:8px;background:#405779;color:white;font-weight:700;font-size:11px}#start{background:#14784e}#stop{background:#8c3444}.hint{font-size:10px;color:#91a2bd;line-height:1.4;margin:9px 1px 0}#chip[hidden]{display:none}</style><button id='chip' type='button'><span>🤖 AUTOPLAYER AI 4.0</span><span class='plus'>+</span></button><section id='panel'><header id='drag'><strong>🤖 AUTOPLAYER AI 4.0</strong><span class='headBtns'><button id='min' title='Recolher'>−</button><button id='close' title='Fechar painel'>×</button></span></header><main><div id='status'>Conectando ao jogo...</div><label class='opt'><span><b>🧠 Autopiloto completo</b><small>Missões, diálogos visíveis, combate e oficina</small></span><input id='master' type='checkbox'></label><label class='opt'><span><b>📜 Missões automáticas</b><small>Segue a missão ativa e tenta aceitar/entregar</small></span><input id='missions' type='checkbox'></label><label class='opt'><span><b>⚔️ Combate inteligente</b><small>Habilidades, pet, poções e defesa</small></span><input id='combat' type='checkbox'></label><label class='opt'><span><b>🔨 Melhorar arma</b><small>Usa a oficina quando houver opção disponível</small></span><input id='forge' type='checkbox'></label><div class='actions'><button id='start'>▶ INICIAR</button><button id='stop'>■ PARAR TUDO</button></div><p class='hint'>Painel recolhível e arrastável. NPC/oficina dependem dos controles reais apresentados pelo jogo; o robô não inventa comandos nem repete compras em loop.</p></main></section>";
document.documentElement.appendChild(host);
const $=id=>root.getElementById(id),send=(action,value)=>window.postMessage({channel:CHANNEL,direction:"command",action,value},location.origin);
const state={running:false,missions:false,combat:false,forge:false,dragging:false,x:0,y:0},panel=$("panel"),chip=$("chip");
const collapse=()=>{panel.classList.remove("open");chip.hidden=false},expand=()=>{chip.hidden=true;panel.classList.add("open")};
chip.addEventListener("click",expand);$("min").addEventListener("click",collapse);$("close").addEventListener("click",collapse);
const sync=()=>send("configure",{running:state.running,missions:state.missions,combat:state.combat,forge:state.forge});
$("start").addEventListener("click",()=>{Object.assign(state,{running:true,missions:true,combat:true,forge:true});for(const id of ["master","missions","combat","forge"])$(id).checked=true;sync()});
$("stop").addEventListener("click",()=>{Object.assign(state,{running:false,missions:false,combat:false,forge:false});for(const id of ["master","missions","combat","forge"])$(id).checked=false;sync()});
for(const [id,key] of [["master","running"],["missions","missions"],["combat","combat"],["forge","forge"]])$(id).addEventListener("change",()=>{state[key]=$(id).checked;if(id==="master"&&!state.running){state.missions=state.combat=state.forge=false;for(const k of ["missions","combat","forge"])$(k).checked=false}sync()});
const drag=$("drag");
drag.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;state.dragging=true;const r=host.getBoundingClientRect();state.x=e.clientX-r.left;state.y=e.clientY-r.top;drag.setPointerCapture(e.pointerId)});
drag.addEventListener("pointermove",e=>{if(!state.dragging)return;host.style.left=Math.max(4,Math.min(innerWidth-host.offsetWidth-4,e.clientX-state.x))+"px";host.style.top=Math.max(4,Math.min(innerHeight-host.offsetHeight-4,e.clientY-state.y))+"px";host.style.right="auto";host.style.bottom="auto"});
drag.addEventListener("pointerup",()=>state.dragging=false);drag.addEventListener("pointercancel",()=>state.dragging=false);
window.addEventListener("message",e=>{const d=e.data;if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CHANNEL||d.direction!=="state")return;const p=d.payload||{};$("status").textContent=["Jogador: "+(p.player||"aguardando login")+" · "+(p.screen||""),"Missão: "+(p.mission||"nenhuma ativa"),"Combate: "+(p.battle||"inativo"),"HP/MP: "+(p.hp||"-")+" / "+(p.mp||"-"),"Ação: "+(p.activity||"observando")].join("\n");for(const [id,key] of [["master","running"],["missions","missions"],["combat","combat"],["forge","forge"]])$(id).checked=!!p[key]});
function pageBridge(){
"use strict";
const CHANNEL="AUTOPLAYER_AI_4_BRIDGE";if(window.__APAI4)return;window.__APAI4=true;
let running=false,autoMissions=false,autoCombat=false,autoForge=false,busy=false,lastMission="",lastTurn="",lastForgeKey="",missionPanelOpened=false,forgeStage=0,actionAt=0,log="inicializando";
const now=()=>Date.now(),game=()=>typeof JG!=="undefined"&&JG&&JG.tela==="jogando"&&JG.est&&JG.est.eu;
const norm=s=>(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const visible=el=>!!(el&&el.isConnected&&el.getClientRects().length&&!el.disabled);
const buttons=()=>[...document.querySelectorAll("button")].filter(visible);
const clickLabel=(re,scope=document)=>{const b=[...scope.querySelectorAll("button")].find(x=>visible(x)&&re.test(norm(x.innerText||x.textContent)));if(!b)return false;b.click();actionAt=now();log="interagindo: "+norm(b.innerText||b.textContent).slice(0,55);return true};
const getState=()=>{try{if(!game())return{player:"",screen:typeof JG!=="undefined"?JG.tela:"carregando",activity:log,running,missions:autoMissions,combat:autoCombat,forge:autoForge};const eu=JG.est.eu,R=eu.rpg||{},b=R.batalha,m=JG.atual,md=m&&typeof misDe==="function"?misDe(m.m):null,mon=b&&!b.fim&&typeof monDe==="function"?monDe(b.m):null;return{player:JG.at||eu.nome||"jogador",screen:JG.tela,mission:m?(md&&md.nome||"missão ativa"):"",battle:b&&!b.fim?(mon&&mon.nome||"em andamento"):"",hp:b&&b.p?b.p.hp+"/"+b.p.hpMax:"-",mp:b&&b.p?b.p.mp+"/"+b.p.mpMax:"-",activity:log,running,missions:autoMissions,combat:autoCombat,forge:autoForge}}catch(_){return{activity:"lendo estado do jogo",running,missions:autoMissions,combat:autoCombat,forge:autoForge}}};
const publish=()=>window.postMessage({channel:CHANNEL,direction:"state",payload:getState()},location.origin),setLog=s=>{log=s;publish()};
window.addEventListener("message",e=>{const d=e.data;if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CHANNEL||d.direction!=="command")return;if(d.action==="configure"){const v=d.value||{};running=!!v.running;autoMissions=running&&!!v.missions;autoCombat=running&&!!v.combat;autoForge=running&&!!v.forge;if(!running){lastMission="";lastTurn="";lastForgeKey="";missionPanelOpened=false;forgeStage=0}setLog(running?"autopiloto ligado":"autopiloto parado")}});
function smartCombat(){
const R=JG.est.eu.rpg||{},b=R.batalha;if(!b)return false;
if(b.fim){if(typeof batalhaApi==="function"&&!busy){busy=true;lastTurn="fim:"+String(b.m||"");Promise.resolve(batalhaApi("batalha-fechar",{})).catch(()=>{}).finally(()=>{busy=false;setLog("batalha encerrada; retomando missão")});return true}return false}
if(b.turno===undefined||JG.batVista||JG.ocupado||busy)return true;
const turnKey=String(b.turno)+":"+String(b.m||"");if(turnKey===lastTurn)return true;
const p=b.p||{},hp=Number(p.hp||0),hpMax=Math.max(1,Number(p.hpMax||1)),mp=Number(p.mp||0),mpMax=Math.max(1,Number(p.mpMax||1)),bag=R.bag||{},items=JG.est.consumiveis||[];
const invoke=(tipo,id)=>{if(typeof batalhaApi!=="function")return false;lastTurn=turnKey;busy=true;actionAt=now();Promise.resolve(batalhaApi("batalha-acao",{tipo,id,turno:b.turno,acaoId:typeof novoPedido==="function"?novoPedido():undefined})).catch(()=>{}).finally(()=>{busy=false;publish()});setLog("combate: "+tipo+(id?"/"+id:""));return true};
if(hp/hpMax<0.38){const potion=items.find(x=>/vida|cura|recuper|heal/i.test(String(x.id)+" "+String(x.nome||""))&&(bag[x.id]||0)>0);if(potion&&invoke("item",potion.id))return true;const heal=[...document.querySelectorAll("#jgC [data-hab]")].find(x=>visible(x)&&/cura|heal|restaur/i.test(norm((x.innerText||"")+" "+(x.title||""))));if(heal){lastTurn=turnKey;heal.click();setLog("combate: habilidade de cura");return true}}
if(mp/mpMax<0.22){const potion=items.find(x=>/energia|mana|mp/i.test(String(x.id)+" "+String(x.nome||""))&&(bag[x.id]||0)>0);if(potion&&invoke("item",potion.id))return true}
const pet=document.querySelector("#jgC #batPet");if(pet&&visible(pet)&&!pet.disabled&&hp/hpMax>0.30){lastTurn=turnKey;pet.click();setLog("combate: poder do pet");return true}
const habs=[...document.querySelectorAll("#jgC [data-hab]")].filter(x=>visible(x)&&!x.disabled),heal=habs.find(x=>/cura|heal|restaur/i.test(norm((x.innerText||"")+" "+(x.title||""))));
if(hp/hpMax<0.65&&heal){lastTurn=turnKey;heal.click();setLog("combate: cura preventiva");return true}
const attacks=habs.filter(x=>!/cura|heal|restaur|barreira|defen|escudo/i.test(norm((x.innerText||"")+" "+(x.title||""))));
if(attacks.length){const cost=x=>{const m=(x.innerText||"").match(/(\d+)\s*mp/i);return m?Number(m[1]):0};attacks.sort((a,b)=>cost(b)-cost(a));lastTurn=turnKey;attacks[0].click();setLog("combate: habilidade "+norm(attacks[0].innerText).slice(0,40));return true}
const defend=document.querySelector("#jgC #batDef");if(defend&&visible(defend)&&!defend.disabled){lastTurn=turnKey;defend.click();setLog("combate: defesa");return true}return true
}
function missionAutomation(){
if(!autoMissions||!game())return false;const active=JG.atual;
if(active){missionPanelOpened=false;if(typeof irParaMissao==="function"){const key=String(active.ini||active.m||"active");if(key!==lastMission||!JG.p||!JG.p.ir||JG.p.ir.volta){irParaMissao();lastMission=key;setLog("seguindo missão: "+key)}}}
const dialog=document.querySelector(".dlg:not(.esconde),#npcDlg:not(.esconde),#dialogo:not(.esconde),[role=dialog]");
if(dialog&&clickLabel(/^(conversar|falar|interagir|aceitar|aceitar missao|entregar|concluir|continuar|confirmar)( agora)?$/,dialog))return true;
if(!active){if(!missionPanelOpened){const tab=buttons().find(b=>/^(missoes|quests)$/.test(norm(b.innerText||b.textContent)));if(tab){tab.click();missionPanelOpened=true;actionAt=now();setLog("abrindo painel de missões");return true}}if(clickLabel(/^(aceitar|aceitar missao|iniciar missao|pegar missao|comecar missao)$/))return true}
else if(clickLabel(/^(entregar missao|concluir missao|resgatar recompensa|entregar|concluir)$/))return true;
return false
}
function forgeAutomation(){
if(!autoForge||!game()||JG.atual||(JG.est.eu.rpg&&JG.est.eu.rpg.batalha&&!JG.est.eu.rpg.batalha.fim))return false;
if(forgeStage===0){if(clickLabel(/^(loja|mercado)$/)){forgeStage=1;return true}return false}
if(forgeStage===1){if(clickLabel(/^(oficina|ferreiro|⚒ oficina)$/)){forgeStage=2;return true}return false}
if(forgeStage===2){const upgrade=buttons().find(b=>/^(evoluir arma|melhorar arma|aprimorar arma|evoluir equipamento)$/.test(norm(b.innerText||b.textContent)));if(upgrade){const key=norm(upgrade.innerText||upgrade.textContent);if(key!==lastForgeKey){lastForgeKey=key;forgeStage=3;upgrade.click();actionAt=now();setLog("oficina: melhoria solicitada");return true}}}
return false
}
function tick(){
if(!running||!game()||document.hidden)return;if(JG.ocupado||busy)return;
const b=JG.est.eu.rpg&&JG.est.eu.rpg.batalha;if(autoCombat&&b){smartCombat();return}
if(now()-actionAt<1100)return;
if(autoMissions&&missionAutomation())return;
if(autoForge&&forgeAutomation())return;
if(autoMissions&&JG.atual&&typeof irParaMissao==="function"){const key=String(JG.atual.ini||JG.atual.m||"active");if(key!==lastMission){irParaMissao();lastMission=key;setLog("retomando rota da missão")}}
}
const timer=setInterval(()=>{try{tick();publish()}catch(e){setLog("aguardando jogo: "+String(e).slice(0,80))}},650);
publish();window.addEventListener("pagehide",()=>clearInterval(timer),{once:true})
}
const script=document.createElement("script");script.textContent=";("+pageBridge.toString()+")();";(document.documentElement||document.head).appendChild(script);script.remove();
setTimeout(()=>{if(!$("status").textContent.includes("Jogador:"))$("status").textContent="Painel pronto. Entre no jogo e toque em INICIAR."},1200);
})();