# AutoPlayer AI

## Instalação

- [AutoPlayer AI 5.0.0-beta.1 — instalar no Tampermonkey](https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-5.user.js)
- [Código-fonte 5.0](https://github.com/albertsouza2708-glitch/autoplayer-ai-installer/blob/main/autoplayer-ai-5.user.js)
- [AutoPlayer AI 4.0 — versão anterior](https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-4.user.js)
- [KAKUSEISHA — analisador técnico](https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/kakuseisha-inventory.user.js)

## AutoPlayer AI 5.0 beta

### O que foi implementado
- Painel móvel por toque, posição salva no navegador, minimização e botão X.
- Ponte de execução no contexto da página para testar acesso às variáveis/funções internas do jogo.
- Diagnóstico explícito de acesso a `JG`, `irParaMissao`, `batalhaApi`, `novoPedido`, `monDe`, `misDe` e `renderJogo`.
- Navegação pela missão atualmente ativa chamando a função nativa `irParaMissao()`; acompanha `JG.p.ir` e `JG.seguir`.
- Monitor de progresso de posição; se não houver deslocamento por 12 segundos, tenta recalcular a rota pelo próprio motor do jogo.
- Combate por turnos usando `batalhaApi()` e `novoPedido()`, com respeito a `JG.ocupado`, `JG.batVista` e ao turno atual.
- Prioridade para defesa contra golpe carregado, cura disponível, poder do pet e habilidades disponíveis.
- Fechamento nativo de batalhas concluídas.
- Não envia comandos de API inventados nem tenta aceitar missão, falar com NPC ou aprimorar arma por endpoints não confirmados.

### Limitações que ainda exigem integração e teste
- O jogo precisa expor as referências internas no contexto global de página. O painel mostra se a ponte consegue acessar `JG` e as funções nativas.
- O relatório estático 0.3.9 confirma a navegação e o combate, mas não documenta o fluxo completo de aceitar novas missões, selecionar NPCs, iniciar diálogos ou executar a melhoria na oficina.
- Portanto, aceite de missões, conversa com NPC, deslocamento até ferreiro, compra/evolução, coleta, diárias, exploração e Raid ainda não estão declarados como automáticos nesta beta.
- A movimentação real e o combate precisam ser testados no Firefox/Tampermonkey. A sintaxe JavaScript foi verificada; execução real no navegador ainda não foi validada.

Use **PARAR** se o comportamento não corresponder ao esperado. A versão 5.0 é uma beta de integração com o motor nativo, não uma promessa de autonomia total antes dos testes.
