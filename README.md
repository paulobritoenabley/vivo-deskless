# Vivo Empresas · Treinar quem não tem computador

Landing page de apoio ao vídeo de onboarding da Plataforma Vivo Empresas. A rolagem troca a cena como num vídeo: repositor no estoque, vigilante no posto, atendente na loja.

## Rodar

É um site estático, sem build. Qualquer servidor local serve:

```
npx serve .
```

Abra `index.html`. Com `?direto` no fim do endereço, a entrada do repositor é pulada (útil para revisar).

## Arquivos

- `index.html`: o texto da página
- `cenas.js`: os três cenários em papel recortado (SVG desenhado à mão) e os personagens articulados
- `pagina.js`: o roteiro da rolagem (carregamento, abertura, mergulhos, recuo, virada, resultados)
- `pagina.css`: estilo, seguindo o manual da marca Vivo 2023
- `scrollcraft.js` / `scrollcraft.css`: o motor de rolagem
- `BRIEF.md`: decisões de narrativa e marca
- `lab/`: scripts de captura para conferir a página (`npm i playwright-core` dentro de `lab/`)
