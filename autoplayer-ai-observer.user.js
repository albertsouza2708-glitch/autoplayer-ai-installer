// ==UserScript==
// @name         AutoPlayer AI 3.0 - Observador
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      0.2.0
// @description  Painel de diagnóstico somente leitura para Vila dos Despertos.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @supportURL   https://github.com/albertsouza2708-glitch/autoplayer-ai-installer/issues
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-observer.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-observer.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  // Primeira etapa: observar somente elementos visíveis do DOM.
  // Nenhum clique, tecla, requisição ou comando do jogo é executado.
  const ROOT_ID = "autoplayer-ai-observer";
  const TARGETS = [
    ["hHpT", "HP (identificador a confirmar)"],
    ["hMpT", "MP (identificador a confirmar)"],
    ["hXpT", "XP (identificador a confirmar)"],
    ["hMis", "Missões (identificador a confirmar)"],
    ["hEu", "Personagem (identificador a confirmar)"],
    ["mapa", "Mapa (identificador a confirmar)"]
  ];

  if (document.getElementById(ROOT_ID)) return;

  const host = document.createElement("aside");
  host.id = ROOT_ID;
  host.style.cssText = "position:fixed;z-index:2147483647;right:10px;bottom:10px;width:min(340px,calc(100vw - 20px));font:14px/1.4 system-ui,sans-serif;color:#eef3ff;";
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      *{box-sizing:border-box}
      .panel{background:#111827;border:1px solid #42516b;border-radius:14px;box-shadow:0 8px 30px #0008;overflow:hidden}
      header{display:flex;justify-content:space-between;align-items:center;padding:11px 13px;background:#1d2a40}
      h2{font-size:14px;margin:0;font-weight:800}
      .state{font-size:10px;color:#9fb0c9}
      .body{padding:12px}
      .note{font-size:11px;color:#a9b8ce;margin:0 0 10px}
      .item{display:grid;grid-template-columns:1fr auto;gap:8px;padding:7px 0;border-top:1px solid #2b3a51}
      .name{font-size:12px;color:#cbd6e7}
      .value{font-size:12px;color:#fff;text-align:right;max-width:155px;overflow-wrap:anywhere}
      .missing{color:#f6bd60}
      .actions{display:flex;gap:8px;margin-top:12px}
      button{border:1px solid #526482;border-radius:8px;padding:8px 10px;background:#273852;color:#fff;font:600 12px system-ui;cursor:pointer}
      button:focus-visible{outline:2px solid #8da7ff;outline-offset:2px}
      .foot{font-size:10px;color:#8fa1bc;margin-top:9px}
    </style>
    <section class="panel" aria-label="AutoPlayer AI observador">
      <header>
        <h2>🤖 AutoPlayer AI 3.0</h2>
        <span class="state" id="state">Observador ativo</span>
      </header>
      <div class="body">
        <p class="note">Diagnóstico somente leitura. Os nomes abaixo são hipóteses até conferirmos o DOM real.</p>
        <div id="results"></div>
        <div class="actions">
          <button id="refresh" type="button">Atualizar leitura</button>
          <button id="hide" type="button">Ocultar painel</button>
        </div>
        <p class="foot">Não executa ações no jogo nem envia dados para servidores externos.</p>
      </div>
    </section>
  `;

  const results = shadow.getElementById("results");
  const stateLabel = shadow.getElementById("state");
  let observer = null;

  function readElement(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    const raw = "value" in element && element.value !== ""
      ? element.value
      : element.innerText || element.textContent || "";
    const value = String(raw).replace(/\\s+/g, " ").trim();
    return {
      tag: element.tagName.toLowerCase(),
      value: value.slice(0, 180) || "(elemento encontrado, sem texto)"
    };
  }

  function refresh() {
    const rows = TARGETS.map(([id, label]) => {
      const found = readElement(id);
      const row = document.createElement("div");
      row.className = "item";

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = label + " · #" + id;

      const value = document.createElement("span");
      value.className = "value" + (found ? "" : " missing");
      value.textContent = found ? found.value : "Não encontrado";

      row.append(name, value);
      return row;
    });

    results.replaceChildren(...rows);
    stateLabel.textContent = "Leitura: " + new Date().toLocaleTimeString("pt-BR");
  }

  shadow.getElementById("refresh").addEventListener("click", refresh);
  shadow.getElementById("hide").addEventListener("click", () => {
    observer?.disconnect();
    host.remove();
  });

  document.documentElement.appendChild(host);
  refresh();

  // Atualiza quando o jogo altera o DOM, sem observar ou acionar comandos de gameplay.
  let updateQueued = false;
  observer = new MutationObserver(() => {
    if (updateQueued || !host.isConnected) return;
    updateQueued = true;
    queueMicrotask(() => {
      updateQueued = false;
      if (host.isConnected) refresh();
    });
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
  window.addEventListener("pagehide", () => observer?.disconnect(), { once: true });
})();
