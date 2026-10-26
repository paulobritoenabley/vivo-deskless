# Vivo Empresas · Treinar quem não tem computador

Landing page de apoio ao vídeo de onboarding da Plataforma Vivo Empresas. A rolagem troca a cena como num vídeo: repositor no estoque, vigilante no posto, atendente na loja.

## Rodar

É um site estático, sem build. Qualquer servidor local serve:

```
npx serve .
```

Abra `index.html`. Com `?direto` no fim do endereço, a entrada do repositor é pulada (útil para revisar).

Com `?diag`, aparece um painel no canto com o que o aparelho está fazendo: quadros por segundo, pior quadro, se o movimento reduzido está ligado e quantos quadros cada efeito chegou a desenhar. Feito para abrir no iPhone (inclusive em economia de energia) e mandar um print.

## Desempenho no celular

O que mantém a página leve num iPhone em economia de energia (30 quadros por segundo, processador reduzido):

- nenhuma variável CSS regravada na raiz a cada rolagem (sem `data-sc-drift`), e `--sc-p` barrado na entrada dos cenários e do celular;
- cenários escondidos com `opacity` + `content-visibility`, nunca `visibility` (que é herdada e recalcula cada forma do SVG);
- zoom do mergulho só até a porta encher a tela, e sem sombra borrada enquanto a câmera anda;
- sem animação contínua no palco parado (nada repinta sozinho);
- a cena segue a rolagem com ~0,1 s de atraso, para os efeitos passarem pelos quadros do meio mesmo quando o aparelho perde quadros;
- letras gigantes e miniaturas do celular em imagem (`assets/cenas`, gerada por `lab/cenas-raster.mjs` a partir de `cenas.js`: rode de novo se mudar o desenho).

Para medir: `lab/perf.mjs` (celular simulado com processador mais lento) e `lab/longos.mjs` (tarefas mais longas).

## Arquivos

- `index.html`: o texto da página
- `cenas.js`: os três cenários em papel recortado (SVG desenhado à mão) e os personagens articulados
- `pagina.js`: o roteiro da rolagem (carregamento, abertura, mergulhos, recuo, virada, resultados)
- `pagina.css`: estilo, seguindo o manual da marca Vivo 2023
- `scrollcraft.js` / `scrollcraft.css`: o motor de rolagem
- `BRIEF.md`: decisões de narrativa e marca
- `lab/`: scripts de captura para conferir a página (`npm i playwright-core` dentro de `lab/`)
