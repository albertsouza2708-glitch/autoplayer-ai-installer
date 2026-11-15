// ==UserScript==
// @name         KAKUSEISHA - Analisador técnico
// @namespace    https://github.com/albertsouza2708-glitch/autoplayer-ai-installer
// @version      0.3.1
// @description  Análise estática ampliada dos scripts públicos do jogo, sem executar ações. Corrige inicialização da interface.
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
  const HOST_ID = "kakuseisha-inventory-tool";
  const existing = document.getElementById(HOST_ID);
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "position:fixed;z-index:2147483647;left:10px;bottom:58px;font:13px system-ui,sans-serif;color:#fff";
  const root = host.attachShadow({mode:"open"});
  root.innerHTML = `
    <style>
      .wrap{background:#172033;border:1px solid #64748b;border-radius:12px;padding:10px;box-shadow:0 4px 20px #0008;max-width:min(340px,calc(100vw - 20px))}
      button{background:#7c3aed;color:white;border:0;border-radius:8px;padding:10px 12px;font-weight:700}
      p,#status{font-size:11px;color:#cbd5e1;margin:8px 0 0}
      #status{color:#fde68a}
    </style>
    <div class="wrap">
      <button id="scan">Analisar código do jogo</button>
      <p>Leitura estática de JavaScript público. Não clica, não luta, não envia comandos e não lê cookies, senhas ou valores de campos.</p>
      <div id="status">Pronto para analisar.</div>
    </div>`;
  document.documentElement.appendChild(host);

  const uniq = a => [...new Set(a)];
  const clean = s => s.replace(/\s+/g," ").trim();
  const actionWord = /miss[aã]o|ca[cç]ar|lutar|ataque|atacar|batalha|combate|invent[aá]rio|mochila|equip|po[cç][aã]o|cura|heal|damage|enemy|inimigo|xp|experi[eê]ncia|recompensa|reward|colet|explor|raid|pet|di[aá]ria|claim|start|finish|complete|jogar|evento|comprar|vender|usar|drop|loot|energia|mana|vida|hp|mp/i;
  const sensitive = /cookie|password|passwd|authorization|bearer|localStorage\.getItem\s*\(\s*["'][^"']*(?:token|senha|pass|auth)/i;

  function getUrls() {
    return uniq([
      ...[...document.scripts].map(s => s.src),
      ...performance.getEntriesByType("resource").map(r => r.name)
    ].filter(Boolean).map(raw => {
      try {
        const u = new URL(raw, location.href);
        return u.origin === location.origin && /\.js$/i.test(u.pathname) ? u.href : null;
      } catch (_) { return null; }
    }).filter(Boolean));
  }

  function extract(source) {
    const declarations = [];
    const declRe = /\bfunction\s+([\w$]+)\s*\(|\b(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[\w$]+\s*=>)/g;
    for (const m of source.matchAll(declRe)) {
      const name = m[1] || m[2];
      if (name && actionWord.test(name)) declarations.push(name);
    }

    const eventLines = [];
    const eventRe = /(?:addEventListener\s*\(\s*["'][^"']+["']|\.on(?:click|submit|change|input)\s*=)/gi;
    for (const m of source.matchAll(eventRe)) {
      const start = Math.max(0, m.index - 220);
      const end = Math.min(source.length, m.index + 420);
      const snippet = clean(source.slice(start,end));
      if (!sensitive.test(snippet) && (actionWord.test(snippet) || /getElementById|querySelector|onclick|addEventListener/i.test(snippet))) eventLines.push(snippet);
    }

    const keywordSnippets = [];
    const kwRe = /miss[aã]o|ca[cç]ar|lutar|ataque|combate|recompensa|reward|invent[aá]rio|mochila|po[cç][aã]o|heal|damage|enemy|inimigo|experi[eê]ncia|claim|raid|di[aá]ria|coletar|explorar|energia|mana|jogar|evento/gi;
    for (const m of source.matchAll(kwRe)) {
      const start = Math.max(0, m.index - 180);
      const end = Math.min(source.length, m.index + 300);
      const snippet = clean(source.slice(start,end));
      if (!sensitive.test(snippet) && !keywordSnippets.includes(snippet)) keywordSnippets.push(snippet);
      if (keywordSnippets.length >= 35) break;
    }

    const endpoints = uniq([
      ...[...source.matchAll(/(?:fetch\s*\(\s*|open\s*\(\s*["'](?:GET|POST|PUT|DELETE)["']\s*,\s*)["']([^"'\s]+)["']/g)].map(m=>m[1]),
      ...[...source.matchAll(/["'](\/(?:api|ajax|action|game|quest|mission|battle|combat)[^"']*)["']/gi)].map(m=>m[1])
    ]).filter(x=>!sensitive.test(x)).slice(0,50);

    const globals = uniq([...source.matchAll(/\b(?:window\.)?([A-Za-z_$][\w$]*)\s*=\s*function\s*\(/g)].map(m=>m[1]))
      .filter(n=>actionWord.test(n)).slice(0,60);

    return {
      declarations:uniq(declarations).slice(0,100),
      globals,
      events:uniq(eventLines).slice(0,25),
      snippets:keywordSnippets,
      endpoints
    };
  }

  async function scan() {
    const urls = getUrls();
    const out = ["KAKUSEISHA STATIC ANALYSIS 0.3.0","Página: "+location.origin+location.pathname,"Arquivos JS encontrados: "+urls.length,""];
    for (const url of urls) {
      out.push("### "+new URL(url).pathname);
      try {
        const response = await fetch(url,{credentials:"same-origin"});
        if (!response.ok) { out.push("Falha HTTP: "+response.status,""); continue; }
        const source = await response.text();
        const data = extract(source);
        out.push("Tamanho: "+source.length+" caracteres");
        out.push("Funções com nomes relevantes: "+(data.declarations.join(", ")||"nenhuma identificada"));
        out.push("Funções globais relevantes: "+(data.globals.join(", ")||"nenhuma identificada"));
        out.push("Rotas estáticas: "+(data.endpoints.join(", ")||"nenhuma identificada"));
        out.push("Eventos e controles relacionados:");
        out.push(...(data.events.length?data.events.map((x,i)=>(i+1)+". "+x):["Nenhum trecho identificado"]));
        out.push("Trechos próximos a palavras de ação:");
        out.push(...(data.snippets.length?data.snippets.map((x,i)=>(i+1)+". "+x):["Nenhum trecho identificado"]));
      } catch(e) { out.push("Falha ao ler arquivo: "+String(e).slice(0,160)); }
      out.push("");
    }
    return out.join("\n");
  }

  root.getElementById("scan").addEventListener("click",async()=>{
    const status=root.getElementById("status");
    status.textContent="Analisando arquivos... aguarde.";
    try {
      const report=await scan();
      const fallback=()=>{
        const ta=document.createElement("textarea");
        ta.value=report;
        ta.style.cssText="position:fixed;left:-9999px;opacity:0";
        document.body.appendChild(ta);ta.select();
        const ok=document.execCommand("copy");ta.remove();
        status.textContent=ok?"Relatório copiado. Cole aqui na conversa.":"Cópia automática falhou.";
        if(!ok) window.prompt("Copie o relatório:",report);
      };
      if(navigator.clipboard?.writeText) navigator.clipboard.writeText(report).then(
        ()=>status.textContent="Relatório copiado! Cole aqui na conversa.",fallback
      ); else fallback();
    } catch(e) { status.textContent="Erro na análise: "+String(e).slice(0,120); }
  });
})();