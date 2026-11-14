// ==UserScript==
// @name         KAKUSEISHA - Inventário técnico
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      0.1.0
// @description  Inventário local de scripts e controles da página para desenvolvimento do AutoPlayer AI.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-inventory.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-inventory.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";
  if (document.getElementById("kakuseisha-inventory-tool")) return;

  const host = document.createElement("div");
  host.id = "kakuseisha-inventory-tool";
  host.style.cssText = "position:fixed;z-index:2147483647;left:10px;bottom:10px;font:13px system-ui,sans-serif;color:#fff";
  const shadow = host.attachShadow({mode:"open"});
  shadow.innerHTML = `
    <style>
      .wrap{background:#172033;border:1px solid #64748b;border-radius:12px;padding:10px;box-shadow:0 4px 20px #0008;max-width:min(310px,calc(100vw - 20px))}
      button{background:#3157a4;color:white;border:0;border-radius:8px;padding:10px 12px;font-weight:700}
      p{font-size:11px;color:#cbd5e1;margin:8px 0 0}
      #status{font-size:11px;color:#fde68a;margin-top:7px}
    </style>
    <div class="wrap">
      <button id="scan">Gerar relatório técnico</button>
      <p>Coleta apenas nomes de arquivos JavaScript e rótulos de controles. Não lê valores de campos, cookies ou credenciais.</p>
      <div id="status">Aguardando comando.</div>
    </div>`;
  document.documentElement.appendChild(host);

  function cleanUrl(value) {
    try {
      const u = new URL(value, location.href);
      if (u.origin !== location.origin) return null;
      return u.origin + u.pathname;
    } catch (_) { return null; }
  }

  function buildReport() {
    const scripts = new Set();
    for (const s of document.scripts) {
      if (s.src) {
        const u = cleanUrl(s.src);
        if (u && /\.js$/i.test(u)) scripts.add(u);
      }
    }
    for (const r of performance.getEntriesByType("resource")) {
      const u = cleanUrl(r.name);
      if (u && /\.js$/i.test(new URL(u).pathname)) scripts.add(u);
    }

    const ids = [...document.querySelectorAll("[id]")]
      .map(el => el.id)
      .filter(Boolean);
    const controls = [...document.querySelectorAll("button,a,[role='button'],input,select,textarea")]
      .slice(0, 100)
      .map(el => {
        const label = (el.getAttribute("aria-label") || el.innerText || el.textContent || el.getAttribute("title") || "").trim().replace(/\s+/g," ").slice(0,90);
        return {
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute("type") || "",
          id: el.id || "",
          label
        };
      });

    return [
      "KAKUSEISHA PAGE INVENTORY",
      "Page: " + location.origin + location.pathname,
      "Scripts same-origin (" + scripts.size + "):",
      ...[...scripts].sort(),
      "",
      "DOM IDs (" + ids.length + "):",
      ...ids.slice(0,250),
      "",
      "Visible/interactive control candidates (" + controls.length + "):",
      ...controls.map((c,i) => (i+1)+". <"+c.tag+"> type="+c.type+" id="+c.id+" label="+c.label)
    ].join("\n");
  }

  shadow.getElementById("scan").addEventListener("click", () => {
    const report = buildReport();
    const status = shadow.getElementById("status");
    const copyFallback = () => {
      const area = document.createElement("textarea");
      area.value = report;
      area.style.cssText = "position:fixed;opacity:0;left:-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      status.textContent = ok ? "Relatório copiado! Cole aqui na conversa." : "Não consegui copiar. Selecione e copie o relatório manualmente.";
      if (!ok) window.prompt("Copie o relatório abaixo:", report);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(report).then(
        () => { status.textContent = "Relatório copiado! Cole aqui na conversa."; },
        copyFallback
      );
    } else copyFallback();
  });
})();