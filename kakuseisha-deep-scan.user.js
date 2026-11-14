// ==UserScript==
// @name         KAKUSEISHA - Deep Scan
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      0.2.0
// @description  Leitura estática dos scripts públicos carregados pelo jogo, sem executar ações.
// @homepageURL  https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @downloadURL  https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-deep-scan.user.js
// @updateURL    https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-deep-scan.user.js
// @match        https://viladosdespertos.com/*
// @match        https://www.viladosdespertos.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  "use strict";
  if (document.getElementById("kakuseisha-deep-scan")) return;

  const host = document.createElement("div");
  host.id = "kakuseisha-deep-scan";
  host.style.cssText = "position:fixed;z-index:2147483647;left:10px;bottom:58px;font:13px system-ui,sans-serif;color:#fff";
  const root = host.attachShadow({mode:"open"});
  root.innerHTML = `
    <style>
      .wrap{background:#172033;border:1px solid #64748b;border-radius:12px;padding:10px;box-shadow:0 4px 20px #0008;max-width:min(320px,calc(100vw - 20px))}
      button{background:#7c3aed;color:white;border:0;border-radius:8px;padding:10px 12px;font-weight:700}
      p,#status{font-size:11px;color:#cbd5e1;margin:8px 0 0}
      #status{color:#fde68a}
    </style>
    <div class="wrap">
      <button id="scan">Analisar scripts do jogo</button>
      <p>Leitura estática de arquivos JavaScript do próprio jogo. Não clica, não luta, não envia comandos e não lê cookies, senhas ou valores de campos.</p>
      <div id="status">Pronto para analisar.</div>
    </div>`;
  document.documentElement.appendChild(host);

  const uniq = a => [...new Set(a)];
  const clip = (s,n=180) => s.replace(/\s+/g," ").trim().slice(0,n);

  async function scan() {
    const urls = uniq([
      ...[...document.scripts].map(s => s.src),
      ...performance.getEntriesByType("resource").map(r => r.name)
    ].filter(Boolean).map(raw => {
      try {
        const u = new URL(raw, location.href);
        return u.origin === location.origin && /\.js$/i.test(u.pathname) ? u.href : null;
      } catch (_) { return null; }
    }).filter(Boolean));

    const out = ["KAKUSEISHA DEEP SCAN", "Página: " + location.origin + location.pathname, "Arquivos JS encontrados: " + urls.length, ""];
    const actionWord = /miss[aã]o|ca[cç]ar|lutar|ataque|atacar|batalha|combate|invent[aá]rio|mochila|equip|po[cç][aã]o|cura|heal|damage|enemy|inimigo|xp|experi[eê]ncia|recompensa|reward|colet|explor|raid|pet|di[aá]ria|claim|start|finish|complete/i;
    const interesting = /addEventListener\s*\(|\.onclick\s*=|function\s+[\w$]+\s*\(|(?:async\s+)?function\s*\(|\b(?:fetch|XMLHttpRequest)\b|localStorage\.(?:getItem|setItem|removeItem)\s*\(|document\.getElementById\s*\(/;

    for (const url of urls) {
      out.push("### " + new URL(url).pathname);
      try {
        const response = await fetch(url, {credentials:"same-origin"});
        if (!response.ok) { out.push("HTTP " + response.status, ""); continue; }
        const source = await response.text();
        const lines = source.split(/\n/);
        const matches = [];
        for (let i=0;i<lines.length;i++) {
          const line = lines[i];
          if (interesting.test(line) && actionWord.test(line)) {
            matches.push((i+1)+": "+clip(line));
          }
        }
        const declarations = uniq([
          ...[...source.matchAll(/\bfunction\s+([\w$]+)\s*\(/g)].map(m=>m[1]),
          ...[...source.matchAll(/\b(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g)].map(m=>m[1])
        ]).filter(n=>actionWord.test(n)).slice(0,80);
        const paths = uniq([...source.matchAll(/(?:fetch\s*\(\s*|open\s*\(\s*["'](?:GET|POST|PUT|DELETE)["']\s*,\s*)["']([^"'\s]+)["']/g)].map(m=>m[1])).slice(0,40);
        out.push("Tamanho: "+source.length+" caracteres");
        out.push("Funções com nomes relevantes: "+(declarations.join(", ") || "nenhuma identificada"));
        out.push("Rotas/requisições estáticas: "+(paths.join(", ") || "nenhuma identificada"));
        out.push("Trechos relevantes ("+Math.min(matches.length,70)+" de "+matches.length+"):");
        out.push(...matches.slice(0,70));
      } catch (e) {
        out.push("Falha ao ler arquivo: "+String(e).slice(0,140));
      }
      out.push("");
    }
    return out.join("\n");
  }

  root.getElementById("scan").addEventListener("click", async () => {
    const status = root.getElementById("status");
    status.textContent = "Analisando arquivos... aguarde.";
    const report = await scan();
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = report;
      ta.style.cssText = "position:fixed;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy"); ta.remove();
      status.textContent = ok ? "Relatório copiado. Cole aqui na conversa." : "Cópia automática falhou.";
      if (!ok) window.prompt("Copie o relatório:", report);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(report).then(
        ()=>status.textContent="Relatório copiado! Cole aqui na conversa.",
        fallback
      );
    } else fallback();
  });
})();