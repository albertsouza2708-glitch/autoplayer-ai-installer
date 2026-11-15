// ==UserScript==
// @name         AutoPlayer AI 3.0
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      3.0.0
// @description  Automacao assistida de missao atual e combate por turnos para Vila dos Despertos.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-3.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-3.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(() => {
  "use strict";
  const ID="autoplayer-ai-3", CH="AUTOPLAYER_AI_3_BRIDGE";
  if(document.getElementById(ID)) return;
  const host=document.createElement("div"); host.id=ID;
  host.style.cssText="position:fixed;right:12px;bottom:76px;z-index:2147483646";
  const root=host.attachShadow({mode:"open"});
  root.innerHTML='<style>*{box-sizing:border-box}.p{width:min(300px,calc(100vw - 24px));background:#101827;color:#edf2ff;border:1px solid #52617b;border-radius:13px;box-shadow:0 10px 30px #0009;font:13px system-ui;overflow:hidden}header{padding:10px;background:#1c2940;display:flex;justify-content:space-between;font-weight:800}main{padding:10px}.s{white-space:pre-line;background:#091321;padding:9px;border-radius:8px;font-size:11px;color:#cbd5e1;margin-bottom:8px}.r{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid #29364b}.r b{font-size:12px}.r small{display:block;color:#9eacc4;font-size:10px}.sw{width:38px;height:22px;accent-color:#16a36a}.btn{border:0;border-radius:7px;padding:9px;color:white;background:#405574;font-weight:bold}.hide main{display:none}.note{font-size:10px;color:#94a3b8}</style><section class="p"><header><span>AUTOPLAYER AI 3.0</span><button class="btn" id="fold">−</button></header><main><div class="s" id="status">Conectando ao jogo...</div><label class="r"><span><b>🧭 Seguir missão atual</b><small>Move até a missão ativa.</small></span><input class="sw" id="mission" type="checkbox"></label><label class="r"><span><b>⚔️ Combate automático</b><small>Usa a primeira habilidade; senão, defende.</small></span><input class="sw" id="combat" type="checkbox"></label><div style="display:flex;gap:7px;margin-top:9px"><button class="btn" id="refresh">Atualizar</button><button class="btn" id="stop">Parar tudo</button></div><p class="note">Não inicia missões, não compra nem gasta itens. Combate respeita o turno do jogo.</p></main></section>';
  document.documentElement.appendChild(host);
  const $=id=>root.getElementById(id); let last=null;
  const send=(action,value)=>window.postMessage({channel:CH,direction:"command",action,value},location.origin);
  const render=()=>{if(!last)return;$("status").textContent=["Jogador: "+(last.player||"-")+" · "+(last.screen||""),"Missão: "+(last.mission||"nenhuma"),"Combate: "+(last.battle||"inativo"),"Raid: "+(last.raid||"inativa"),last.busy?"Ação em andamento":"Conectado"].join("\n");$("mission").checked=!!last.autoMission;$("combat").checked=!!last.autoCombat;};
  window.addEventListener("message",e=>{const d=e.data;if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CH||d.direction!=="state")return;last=d.payload;render();});
  $("mission").onchange=e=>send("toggle",{name:"mission",enabled:e.target.checked});
  $("combat").onchange=e=>send("toggle",{name:"combat",enabled:e.target.checked});
  $("refresh").onclick=()=>send("refresh");
  $("stop").onclick=()=>{send("stop");$("mission").checked=false;$("combat").checked=false;};
  $("fold").onclick=()=>{root.querySelector(".p").classList.toggle("hide");$("fold").textContent=root.querySelector(".p").classList.contains("hide")?"+":"−";};
  function pageBridge(){
    const CH="AUTOPLAYER_AI_3_BRIDGE"; if(window.__APAI3)return; window.__APAI3=true;
    let autoMission=false,autoCombat=false,lastMission="",lastTurn="",busy=false;
    const game=()=>typeof JG!=="undefined"&&JG&&JG.tela==="jogando"&&JG.est&&JG.est.eu;
    const getState=()=>{try{if(!game())return{player:"",screen:typeof JG!=="undefined"?JG.tela:"carregando",mission:"",battle:"",raid:"",busy,autoMission,autoCombat};const eu=JG.est.eu,b=eu.rpg&&eu.rpg.batalha,md=JG.atual&&typeof misDe==="function"?misDe(JG.atual.m):null,mon=b&&!b.fim&&typeof monDe==="function"?monDe(b.m):null,raid=JG.raid&&JG.raid.sala;return{player:JG.at||eu.nome||eu.at||"jogador",screen:JG.tela,mission:JG.atual?(md&&md.nome||"missão ativa"):"",battle:b&&!b.fim?(mon&&mon.nome||"em andamento"):"",raid:raid?raid.status||"sala":"",busy:!!JG.ocupado||busy,autoMission,autoCombat};}catch(_){return null;}};
    const publish=()=>window.postMessage({channel:CH,direction:"state",payload:getState()},location.origin);
    window.addEventListener("message",e=>{const d=e.data;if(e.source!==window||e.origin!==location.origin||!d||d.channel!==CH||d.direction!=="command")return;if(d.action==="toggle"&&d.value&&d.value.name==="mission"){autoMission=!!d.value.enabled;if(!autoMission)lastMission="";}if(d.action==="toggle"&&d.value&&d.value.name==="combat"){autoCombat=!!d.value.enabled;if(!autoCombat)lastTurn="";}if(d.action==="stop"){autoMission=autoCombat=false;lastMission=lastTurn="";}publish();});
    setInterval(()=>{try{if(!game()||document.hidden)return;if(autoMission&&JG.atual&&typeof irParaMissao==="function"){const k=String(JG.atual.ini||JG.atual.m||"active");if(k!==lastMission||!JG.p||!JG.p.ir||JG.p.ir.volta){irParaMissao();lastMission=k;}}if(autoCombat&&!busy&&!JG.ocupado&&!JG.batVista){const b=JG.est.eu.rpg&&JG.est.eu.rpg.batalha;if(b&&!b.fim&&b.turno!==undefined){const k=String(b.turno)+":"+String(b.m||"");if(k!==lastTurn){const c=document.getElementById("jgC"),a=c&&(c.querySelector("[data-hab]")||c.querySelector("#batDef"));if(a&&!a.disabled){lastTurn=k;busy=true;a.click();setTimeout(()=>{busy=false;publish();},900);}}}}}catch(_){}publish();},700);
    publish();
  }
  const s=document.createElement("script");s.textContent=";("+pageBridge.toString()+")();";(document.documentElement||document.head).appendChild(s);s.remove();
})();