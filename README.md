# AutoPlayer AI

## Instalação

- [AutoPlayer AI 4.0.0-alpha.1 — instalar no Tampermonkey](https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-4.user.js)
- [Código-fonte 4.0](https://github.com/albertsouza2708-glitch/autoplayer-ai-installer/blob/main/autoplayer-ai-4.user.js)
- [AutoPlayer AI 3.0.0 — versão anterior](https://raw.githubusercontent.com/albertsouza2708-glitch/autoplayer-ai-installer/main/autoplayer-ai-3.user.js)
- [KAKUSEISHA — analisador técnico](https://github.com/albertsouza2708-glitch/autoplayer-ai-installer/blob/main/kakuseisha-inventory.user.js)

## AutoPlayer AI 4.0 alpha

- Painel compacto, recolhível, arrastável e com botão X.
- Segue a missão ativa com a função nativa `irParaMissao()`.
- Tenta lidar com botões de diálogo/aceite/entrega quando esses controles estão visíveis.
- Combate por turnos com prioridade para cura, poções, poder do pet, habilidades e defesa.
- Fecha a batalha concluída pela função nativa do jogo.
- Detecta opções visíveis da Loja/Oficina e tenta acionar a melhoria da arma uma única vez por opção.
- Botão para parar todas as automações.

## Limitações conhecidas da alpha

- Ainda não há integração confirmada com a lógica interna de localização/caminho até NPCs, nem com o sistema de seleção de missões oferecidas. Os diálogos só são acionados quando o próprio jogo apresenta os botões na tela.
- A oficina depende dos botões reais de navegação e melhoria estarem disponíveis na interface. Não há garantia de deslocamento físico até um ferreiro.
- Coleta, diárias, eventos, exploração e Raid ainda não fazem parte do ciclo autônomo.
- Precisa de teste real no Firefox/Tampermonkey dentro do jogo. O arquivo foi publicado e sua sintaxe JavaScript foi verificada; ainda não foi validado em execução no navegador.

A versão 4.0 é uma alpha de desenvolvimento. Use o botão **PARAR TUDO** se alguma ação não corresponder ao esperado.
