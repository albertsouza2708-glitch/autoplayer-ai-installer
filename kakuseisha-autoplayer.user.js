// ==UserScript==
// @name         KAKUSEISHA AutoPlayer AI 3.0
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      0.6.0
// @description  AutoPlayer autônomo: missões, navegação real do personagem, combate, exploração, inventário, equipamentos e compras seguras.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-autoplayer.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-autoplayer.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// @sandbox      raw
// ==/UserScript==

(() => {
  "use strict";

  const ID = "kakuseisha-autoplayer-ai";
  document.getElementById(ID)?.remove();

  const host = document.createElement("div");
  host.id = ID;
  host.style.cssText = "position:fixed;z-index:2147483646;right:10px;bottom:76px;width:min(330px,calc(100vw - 20px));font:13px/1.4 system-ui,sans-serif;color:#f8fafc";
  const shadow = host.attachShadow({mode:"open"});
  shadow.innerHTML = `
    <style>
      *{box-sizing:border-box}.panel{background:#101827;border:1px solid #52627c;border-radius:14px;box-shadow:0 8px 30px #0009;overflow:hidden}
      .head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#1b2940;font-weight:800}
      .head small{display:block;color:#9fb2cf;font-size:10px;font-weight:500}
      button,select{border:0;border-radius:8px;padding:9px 10px;font:inherit;font-weight:700;color:white;background:#334155}
      button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}
      #close{padding:2px 9px;font-size:19px;background:#475569}
      .body{padding:10px 12px}.actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      #start{background:#15803d}#stop{background:#991b1b}
      select{width:100%;margin-top:8px;background:#26364d}
      .status{margin-top:9px;padding:9px;background:#0b1220;border:1px solid #29384e;border-radius:9px;min-height:48px;color:#fde68a;overflow-wrap:anywhere}
      .stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
      .stat{background:#1b2940;padding:7px;border-radius:8px;color:#cbd5e1;font-size:11px}
      .stat b{display:block;color:#fff;font-size:14px}
      .log{margin-top:8px;max-height:110px;overflow:auto;color:#9fb2cf;font-size:10px;white-space:pre-wrap}
      .foot{padding:7px 12px;color:#8293ad;font-size:10px;border-top:1px solid #29384e}
      .on{color:#86efac}.off{color:#fca5a5}
    </style>
    <div class="panel">
      <div class="head"><div>KAKUSEISHA <small>AutoPlayer AI · 0.6.0</small></div><button id="close" title="Fechar">×</button></div>
      <div class="body">
        <div class="actions"><button id="start">▶ INICIAR</button><button id="stop" disabled>■ PAUSAR</button></div>
        <select id="mode"><option value="balanced">Autônomo completo</option><option value="missions">Priorizar missões</option><option value="explore">Priorizar exploração</option></select>
        <div class="status" id="status">Aguardando o jogo carregar…</div>
        <div class="stats">
          <div class="stat">MOEDAS<b id="coins">—</b></div>
          <div class="stat">NÍVEL<b id="level">—</b></div>
          <div class="stat">MISSÕES<b id="missions">0</b></div>
          <div class="stat">ESTADO<b id="state">PARADO</b></div>
        </div>
        <div class="log" id="log">O bot só executa ações quando você aperta INICIAR.</div>
      </div>
      <div class="foot">Use somente nesta página e mantenha a aba aberta. Pausar interrompe novas ações.</div>
    </div>`;
  document.documentElement.appendChild(host);

  const $ = id => shadow.getElementById(id);
  let running = false, busy = false, timer = 0, lastActionAt = 0;
  let lastMission = "", missionCount = 0, shopUntil = 0, lastShopTry = 0;
  let targetObject = null, targetSince = 0, lastRefresh = 0;
  const logLines = [];

  function log(message) {
    const stamp = new Date().toLocaleTimeString("pt-BR");
    logLines.unshift(stamp + " · " + message);
    logLines.splice(7);
    $("log").textContent = logLines.join("\n");
  }
  function status(message) { $("status").textContent = message; }
  function gameReady() {
    try { return typeof JG !== "undefined" && JG && JG.tela === "jogando" && JG.est && JG.est.eu && JG.p; }
    catch (_) { return false; }
  }
  function state() {
    if (!gameReady()) return null;
    return { g:JG, d:JG.est, eu:JG.est.eu, r:JG.est.eu.rpg || {}, p:JG.p };
  }
  function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  function playerLevel(s) { return num(s.r.nivel || (s.eu.rpg && s.eu.rpg.nivel) || 1); }
  function updateHud(s) {
    $("coins").textContent = String(num(s.eu.moedas));
    $("level").textContent = String(playerLevel(s));
    $("missions").textContent = String(num(s.eu.total));
    $("state").textContent = running ? "ATIVO" : "PAUSADO";
    $("state").className = running ? "on" : "off";
  }
  function invoke(name, ...args) {
    try {
      const fn = ({comecar,irParaMissao,batalhaApi,lojaAcao,jornadaAcao,raidAcao,abrirExplor,objetosExplor,missoesAbertas,agoraSrv,novoPedido,renderJogo})[name];
      if (typeof fn !== "function") throw new Error("Função do jogo indisponível: " + name);
      return fn(...args);
    } catch (e) { throw e; }
  }
  function itemScore(item) {
    if (!item || typeof item !== "object") return 0;
    let score = 0;
    const weights = {atk:8,ataque:8,dano:7,def:5,defesa:5,hp:1.5,vida:1.5,crit:2,vel:2,velocidade:2,bonus:1,poder:1};
    const walk = (obj, depth) => {
      if (!obj || depth > 3 || typeof obj !== "object") return;
      for (const [k,v] of Object.entries(obj)) {
        const key = k.toLowerCase();
        if (typeof v === "number" && weights[key]) score += Math.max(0,v) * weights[key];
        else if (v && typeof v === "object") walk(v,depth+1);
      }
    };
    walk(item,0);
    const rarity = String(item.rar || item.raridade || "").toLowerCase();
    score += ({comum:0,raro:8,epico:18,épico:18,lendario:35,lendária:35,chefe:25}[rarity] || 0);
    return score;
  }
  function ownedWeapons(s) {
    try {
      const ids = s.eu.inv || [];
      const idx = typeof LOJA_IDX !== "undefined" ? LOJA_IDX : null;
      if (!idx || typeof idx.get !== "function") return [];
      return ids.map(id => idx.get(id)).filter(it => it && it.tipo === "arma");
    } catch (_) { return []; }
  }
  async function equipBestWeapon(s) {
    const weapons = ownedWeapons(s);
    if (!weapons.length || typeof lojaAcao !== "function") return false;
    const currentId = s.eu.equip && s.eu.equip.arma;
    const current = weapons.find(x => x.id === currentId);
    let best = weapons.map(it => {
      let improved = it;
      try { if (typeof itemMelhorado === "function") improved = itemMelhorado(it.id,s.r) || it; } catch (_) {}
      return {it,score:itemScore(improved)};
    }).sort((a,b)=>b.score-a.score)[0];
    const currentScore = current ? itemScore(current) : -1;
    if (best && best.it.id !== currentId && best.score > currentScore + 0.1) {
      status("Equipando a melhor arma que já está na mochila: " + (best.it.nome || best.it.id));
      await lojaAcao("equipar",{item:best.it.id});
      log("Arma equipada: " + (best.it.nome || best.it.id));
      return true;
    }
    return false;
  }
  function missionCandidate(s) {
    const d = s.d, done = new Set(s.eu.feitasHoje || []);
    let list = Array.isArray(d.diarias) ? d.diarias.filter(m => !done.has(m.id)) : [];
    if (!list.length) list = Array.isArray(d.missoes) ? d.missoes : [];
    const open = typeof missoesAbertas === "function" ? missoesAbertas() : true;
    if (!open || !list.length) return null;
    return list.filter(m=>m && m.id).sort((a,b) => {
      const sa = num(a.moedas || 1) / Math.max(1,num(a.seg || 30));
      const sb = num(b.moedas || 1) / Math.max(1,num(b.seg || 30));
      return sb-sa;
    })[0] || null;
  }
  async function startMission(s) {
    const m = missionCandidate(s);
    if (!m || typeof comecar !== "function") return false;
    status("Aceitando missão: " + (m.nome || m.id));
    await comecar(m.id);
    lastMission = String(m.id);
    log("Missão aceita: " + (m.nome || m.id));
    return true;
  }
  function bestHealingItem(s,b) {
    const bag = s.r.bag || {};
    const list = (s.d.consumiveis || []).filter(x => num(bag[x.id]) > 0);
    return list.find(x => /cura|curar|vida|hp|heal|restaur/i.test((x.nome||"")+" "+(x.desc||"")));
  }
  function chooseSkill(s,b) {
    const p = b.p || {}, cd = b.cds || {};
    const base = (s.d.habilidades || []).map(x=>({...x,liberada:p.nivel>=x.nivel}));
    const personal = b.pp && s.r.poder ? (s.r.poder.habs || []).map(x=>({...x,liberada:true})) : [];
    const tree = s.r.arvore && Array.isArray(s.r.arvore.habs) ? s.r.arvore.habs.filter(x=>x.aprendida).map(x=>({...x,liberada:p.nivel>=x.nivel})) : [];
    return [base[0],...personal,...tree,...base.slice(1)].filter(Boolean)
      .filter(x=>x.liberada && !num(cd[x.id]) && num(p.mp)>=num(x.mp))
      .map(x=>({x,score:itemScore(x)+num(x.dano||x.atk||x.poder)*5-num(x.mp)*0.15}))
      .sort((a,b)=>b.score-a.score)[0]?.x || null;
  }
  async function battleStep(s) {
    const b = s.r.batalha;
    if (!b) return false;
    if (b.fim) {
      const nextWave = !!(b.masm && b.masm.proxima && !b.masm.fim);
      status(nextWave ? "Vitória na onda! Indo para a próxima…" : "Combate encerrado. Atualizando o personagem…");
      await batalhaApi("batalha-fechar",{});
      if (nextWave) await batalhaApi("batalha",{});
      log(nextWave ? "Próxima onda da masmorra." : "Combate finalizado.");
      return true;
    }
    if (JG.batVista || JG.ocupado) return true;
    const p = b.p || {}, turno = b.turno, acaoId = typeof novoPedido === "function" ? novoPedido() : undefined;
    const heal = bestHealingItem(s,b);
    if (heal && num(p.hpMax) > 0 && num(p.hp)/num(p.hpMax) < 0.38) {
      await batalhaApi("batalha-acao",{tipo:"item",id:heal.id,turno,acaoId});
      log("Usou item de cura: " + heal.nome);
      return true;
    }
    if (b.e && b.e.carregando) {
      await batalhaApi("batalha-acao",{tipo:"defender",turno,acaoId});
      log("Defendeu o golpe carregado do inimigo.");
      return true;
    }
    const skill = chooseSkill(s,b);
    if (skill) {
      await batalhaApi("batalha-acao",{tipo:"hab",id:skill.id,turno,acaoId});
      log("Ataque: " + (skill.nome || skill.id));
      return true;
    }
    const pet = s.r.pet && s.r.pet.poder && !num(b.petCd);
    if (pet) {
      await batalhaApi("batalha-acao",{tipo:"pet",turno,acaoId});
      log("Pet atacou.");
      return true;
    }
    await batalhaApi("batalha-acao",{tipo:"defender",turno,acaoId});
    log("Sem habilidade disponível: recuperando MP com defesa.");
    return true;
  }
  async function finishMissionIfReady(s) {
    if (!s.g.atual) return false;
    try { if (typeof irParaMissao === "function") irParaMissao(); } catch (_) {}
    const button = document.getElementById("jConc");
    const expired = typeof agoraSrv === "function" && s.g.atual.fim && num(s.g.atual.fim)-num(agoraSrv()) <= 0;
    if (button && !button.disabled) {
      status("Missão concluída. Resgatando recompensa…");
      button.click();
      missionCount++;
      log("Recompensa da missão solicitada.");
      return true;
    }
    if (expired && button) {
      status("Tempo encerrado; aguardando o jogo liberar CONCLUIR.");
      return true;
    }
    status("A caminho do objetivo da missão…");
    return true;
  }
  function explorationTarget(s) {
    if (typeof objetosExplor !== "function") return null;
    let objects = [];
    try { objects = objetosExplor() || []; } catch (_) { return null; }
    const level = playerLevel(s), p = s.p;
    const candidates = objects.filter(o => {
      if (!o || !o.d || !Number.isFinite(o.x) || !Number.isFinite(o.y)) return false;
      if (o.tipo === "bau") return level >= Math.max(1,num(o.d.nivel)-15);
      if (o.tipo === "col") return !o.d.requer || (s.eu.inv||[]).some(id => {
        try { const it = LOJA_IDX.get(id); return it && it.ferramenta === o.d.requer; } catch (_) { return false; }
      });
      if (o.tipo === "mon") return (!o.d.minNivel || level >= o.d.minNivel) && num(o.d.nivel) <= level + 3 && o.d.rar !== "lendario" && o.d.rar !== "chefe";
      return false;
    });
    candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
    return candidates[0] || null;
  }
  async function exploreStep(s) {
    if (typeof abrirExplor !== "function") return false;
    if (targetObject && Date.now()-targetSince > 45000) targetObject = null;
    if (!targetObject) {
      targetObject = explorationTarget(s);
      targetSince = Date.now();
      if (!targetObject) return false;
      status("Explorando o mapa: indo até " + (targetObject.d.nome || targetObject.tipo) + "…");
      s.p.ir = {x:targetObject.x,y:targetObject.y+4,vel:55,toque:true};
      s.g.seguir = true;
      return true;
    }
    const distance = Math.hypot(targetObject.x-s.p.x,targetObject.y-s.p.y);
    if (distance > 20 || s.p.ir) return true;
    const o = targetObject;
    targetObject = null;
    abrirExplor(o);
    const action = document.getElementById("exOk");
    if (action && !action.disabled) {
      status("Executando exploração: " + (o.d.nome || o.tipo));
      action.click();
      log("Interagiu com " + (o.d.nome || o.tipo) + " (" + o.tipo + ").");
      return true;
    }
    return false;
  }
  async function claimEventReward(s) {
    const prizes = s.d.evento && s.d.evento.premios || [];
    const ready = prizes.find(p=>p.liberado && !p.resgatado);
    if (!ready || typeof jornadaAcao !== "function") return false;
    await jornadaAcao("evento",{acao:"resgatar",id:ready.id});
    log("Prêmio de evento resgatado: " + (ready.nome || ready.id));
    return true;
  }
  function tryShop(s) {
    if (Date.now() < lastShopTry+90000) return false;
    const panel = document.getElementById("jgC");
    if (!panel) return false;
    const buttons = [...panel.querySelectorAll("button:not(:disabled)")];
    const candidates = buttons.map(b=>{
      const card = b.closest(".item,.desaf,.produto,.lojaItem,.card,li") || b.parentElement;
      const text = ((card && card.innerText) || b.innerText || "").trim();
      const priceMatch = text.match(/(?:🪙|moedas?|preço|valor)[^0-9]{0,12}(\d[\d.,]*)/i) || text.match(/(\d[\d.,]*)\s*(?:moedas?)/i);
      const price = priceMatch ? num(priceMatch[1].replace(/\./g,"").replace(",", ".")) : NaN;
      const weapon = /arma|espada|katana|l[aâ]mina|machado|adaga/i.test(text);
      const buy = /comprar|adquirir|obter|forjar/i.test(b.innerText || "");
      return {b,text,price,weapon,buy};
    }).filter(x=>x.weapon && x.buy && Number.isFinite(x.price) && x.price <= num(s.eu.moedas));
    if (!candidates.length) return false;
    candidates.sort((a,b)=>a.price-b.price);
    const chosen = candidates[0];
    lastShopTry = Date.now();
    chosen.b.click();
    status("Solicitando compra de arma disponível por " + chosen.price + " moedas…");
    log("Compra de arma solicitada pela interface do jogo.");
    return true;
  }
  async function shopAndEquip(s) {
    if (await equipBestWeapon(s)) return true;
    if (typeof aba === "undefined" || typeof renderJogo !== "function") return false;
    if (Date.now() < shopUntil) {
      if (tryShop(s)) { shopUntil = 0; return true; }
      if (Date.now() > shopUntil-1200) {
        aba = "missoes";
        renderJogo();
        shopUntil = 0;
      }
      return true;
    }
    if (Date.now() > lastShopTry+90000 && num(s.eu.moedas) >= 50 && missionCount > 0 && missionCount % 3 === 0) {
      aba = "loja";
      if (typeof abaMerc !== "undefined") abaMerc = "vila";
      renderJogo();
      shopUntil = Date.now()+4500;
      status("Verificando a loja por uma arma melhor…");
      return true;
    }
    return false;
  }
  async function mainStep() {
    if (!running || busy) return;
    const s = state();
    if (!s) { status("Entre no jogo com seu personagem para iniciar o AutoPlayer."); return; }
    updateHud(s);
    if (JG.ocupado) { status("Aguardando o servidor terminar a ação atual…"); return; }
    busy = true;
    try {
      if (s.r.batalha && await battleStep(s)) return;
      if (s.g.atual && await finishMissionIfReady(s)) return;
      if (await claimEventReward(s)) return;
      if (await shopAndEquip(s)) return;
      const mode = $("mode").value;
      if (mode === "explore") {
        if (await exploreStep(s)) return;
        if (await startMission(s)) return;
      } else {
        if (await startMission(s)) return;
        if (mode === "balanced" && await exploreStep(s)) return;
      }
      status("Sem missão ou exploração disponível agora. Vou verificar novamente.");
      if (Date.now()-lastRefresh > 20000 && typeof api === "function") {
        lastRefresh = Date.now();
        try {
          const fresh = await api("estado?at="+encodeURIComponent(JG.at)+"&chave="+encodeURIComponent(JG.chave));
          if (fresh && fresh.eu) JG.est = fresh;
        } catch (_) {}
      }
    } catch (e) {
      status("Erro controlado: " + (e && e.message ? e.message : String(e)));
      log("Erro: " + (e && e.message ? e.message : String(e)));
    } finally {
      busy = false;
      updateHud(state() || {eu:{moedas:0,total:0},r:{nivel:0}});
    }
  }
  function start() {
    if (running) return;
    running = true;
    $("start").disabled = true;
    $("stop").disabled = false;
    status("AutoPlayer ligado. Lendo estado do personagem…");
    log("Autonomia iniciada.");
    timer = setInterval(mainStep,1100);
    mainStep();
  }
  function stop() {
    running = false;
    clearInterval(timer);
    timer = 0;
    $("start").disabled = false;
    $("stop").disabled = true;
    $("state").textContent = "PAUSADO";
    $("state").className = "off";
    status("Pausado. Nenhuma nova ação será iniciada.");
    log("Automação pausada pelo usuário.");
  }
  $("start").addEventListener("click",start);
  $("stop").addEventListener("click",stop);
  $("close").addEventListener("click",()=>{stop();host.remove();});
  window.addEventListener("beforeunload",stop,{once:true});
  status("Painel carregado. Entre no jogo e toque em INICIAR.");
  if (gameReady()) updateHud(state());
  log("Módulo carregado; aguardando autorização para jogar.");
})();