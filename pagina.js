/* ============================================================================
   Roteiro da página. O motor (scrollcraft.js) fixa os palcos e calcula o
   progresso de cada ato; aqui cada progresso vira cena:
     palco   estoque → mergulho pela porta → posto → mergulho pelo vidro → loja
             → recuo com os três lado a lado → computador riscado
     virada  os três cenários voam para dentro do celular, viram trilhas,
             e o wi-fi cai sem a trilha parar
   Tudo é função do progresso (rolar para trás desfaz exatamente), menos a
   abertura: a entrada e o aceno do repositor correm no tempo, com a rolagem
   presa até o aceno terminar.
   ========================================================================== */
(function () {
  'use strict';

  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement, corpo = document.body;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var suave = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var saida = function (x) { return 1 - Math.pow(1 - clamp(x, 0, 1), 3); };
  var vaivem = function (x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var mola = function (x) { var c = 1.5; x = clamp(x, 0, 1) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };

  var OY = Cenas.OMBRO_Y, CY = Cenas.OMBRO_Y + Cenas.BRACO;

  // ------------------------------------------------------------ montar palco --
  var palcoEl = document.getElementById('palco');
  var stage = palcoEl.querySelector('[data-sc-stage]');
  var cenasEl = document.getElementById('cenas');
  var pcEl = document.getElementById('pc');
  var pcX = pcEl.querySelectorAll('.pc__x');

  var cenas = ['estoque', 'posto', 'loja'].map(function (nome, i) {
    var uid = 'c' + i, c = Cenas.criar(nome, uid);
    var el = document.createElement('div');
    el.className = 'cena cena--' + nome;
    c.camadas.forEach(function (k, j) {
      var d = document.createElement('div');
      d.className = 'camada' + (j ? ' camada--sombra' : '');
      d.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">' +
        (k.pessoa ? Cenas.pessoa(c, uid) : k.svg) + '</svg>';
      el.appendChild(d);
      k.el = d; k.svg = d.firstChild;
      if (k.pessoa) { c.base = k.pessoa; c.kPessoa = k; }
    });
    cenasEl.appendChild(el);
    c.el = el;
    var q = function (s) { return el.querySelector('#' + uid + s); };
    c.pos = q('-pos'); c.corpo = q('-corpo'); c.olhos = q('-olhos');
    c.bd = q('-bd'); c.bdA = q('-bd-ante'); c.be = q('-be'); c.beA = q('-be-ante');
    c.cache = {};
    return c;
  });

  // Escreve um atributo só quando muda: o laço roda a cada quadro.
  function attr(c, chave, el, nome, valor) {
    if (c.cache[chave] === valor) return;
    c.cache[chave] = valor; el.setAttribute(nome, valor);
  }
  function estilo(el, prop, valor) {
    if (el['_' + prop] === valor) return;
    el['_' + prop] = valor; el.style[prop] = valor;
  }

  function pose(c, rotO, rotA, rotE, dx, dy) {
    attr(c, 'bd', c.bd, 'transform', 'rotate(' + rotO.toFixed(1) + ' 66 ' + OY + ')');
    attr(c, 'bdA', c.bdA, 'transform', 'rotate(' + rotA.toFixed(1) + ' 66 ' + CY + ')');
    attr(c, 'be', c.be, 'transform', 'rotate(' + (rotE === undefined ? 8 : rotE).toFixed(1) + ' -66 ' + OY + ')');
    attr(c, 'pos', c.pos, 'transform', 'translate(' + (c.base[0] + (dx || 0)).toFixed(1) + ' ' + (c.base[1] + (dy || 0)).toFixed(1) + ') scale(' + c.base[2] + ')');
  }
  // Respiração e piscada: o tempo só mexe nisso. O resto obedece à rolagem.
  function vivo(c, t, i) {
    attr(c, 'corpo', c.corpo, 'transform', reduz ? '' : 'translate(0 ' + (Math.sin(t / 650 + i * 2) * 3).toFixed(1) + ')');
    var ciclo = (t + i * 1300) % 4200;
    attr(c, 'olhos', c.olhos, 'transform', ciclo < 130 ? 'translate(0 -424) scale(1 .15) translate(0 424)' : '');
  }

  // --------------------------------------------------------- enquadramento --
  // Cada cena escolhe o próprio recorte para caber na tela: largo no
  // computador, alto e centrado na pessoa no celular em pé.
  var W = 0, H = 0, celular = false, painel = { s: .25, gap: 24, cy: 0 };
  function medirPalco() {
    if (!stage.clientWidth || !stage.clientHeight) return;
    W = stage.clientWidth; H = stage.clientHeight;
    var ar = W / H;
    celular = W < 760;
    cenas.forEach(function (c) {
      var vb;
      if (ar >= 1.6) { var h = 1600 / ar; vb = [0, (1000 - h) * 0.72, 1600, h]; }
      else if (ar >= 1.05) { var w = 1000 * ar; vb = [clamp(c.foco - w * 0.55, 0, 1600 - w), 0, w, 1000]; }
      else { var hh = 1250, ww = hh * ar; vb = [clamp(c.foco - ww * 0.5, 0, 1600 - ww), -250, ww, hh]; }
      c.vb = vb;
      var s = vb.map(function (n) { return n.toFixed(1); }).join(' ');
      c.camadas.forEach(function (k) { k.svg.setAttribute('viewBox', s); });
      c.ax = (c.alvo[0] - vb[0]) / vb[2] * W;
      c.ay = (c.alvo[1] - vb[1]) / vb[3] * H;
    });
    painel.s = celular ? 0.29 : 0.25;
    painel.gap = celular ? 8 : 26;
    painel.cy = H * (celular ? 0.68 : 0.66);
    var pw = W * painel.s, ph = H * painel.s;
    var largura = Math.min(pw * 0.86, 260);
    pcEl.style.width = largura + 'px';
    pcEl._x = W / 2 - largura / 2;
    pcEl._y = painel.cy - ph / 2 - largura * 0.5;
    sujo = true;
  }

  // ------------------------------------------------------------- linha do tempo
  var MERG1 = [0.12, 0.29], VIGIA = [0.27, 0.45], MERG2 = [0.42, 0.59], ATENDE = [0.57, 0.74],
      RECUO = [0.71, 0.84], RISCA = [0.84, 0.94];

  function mostrar(c, sim) { estilo(c.el, 'visibility', sim ? 'visible' : 'hidden'); }
  function camadas(c, fn) { c.camadas.forEach(function (k, j) { fn(k, j); }); }
  function limparPainel(c) {
    estilo(c.el, 'transform', ''); estilo(c.el, 'borderRadius', ''); estilo(c.el, 'boxShadow', '');
  }

  // P1: a câmera entra pela porta. Quanto mais perto a camada, mais ela cresce.
  function mergulho(c, u) {
    var e = Math.pow(u, 1.6);
    estilo(c.el, 'opacity', '1');
    camadas(c, function (k, j) {
      estilo(k.el, 'transformOrigin', c.ax.toFixed(1) + 'px ' + c.ay.toFixed(1) + 'px');
      estilo(k.el, 'transform', reduz || u === 0 ? '' : 'scale(' + lerp(1, k.k, e).toFixed(4) + ')');
      var some = k === c.camadas[c.camadas.length - 1] ? seg(u, 0.15, 0.45) : k.pessoa ? seg(u, 0.2, 0.48) : 0;
      estilo(k.el, 'opacity', (1 - suave(some)).toFixed(3));
    });
  }
  // ...e a cena seguinte chega: começa pequena e cresce até o lugar.
  function chegada(c, u) {
    var w = seg(u, 0.5, 1), e = saida(w);
    estilo(c.el, 'opacity', suave(seg(u, 0.5, reduz ? 0.75 : 0.82)).toFixed(3));
    var inicio = [0.84, 0.74, 0.64, 0.5];
    camadas(c, function (k, j) {
      estilo(k.el, 'transformOrigin', '50% 58%');
      estilo(k.el, 'transform', reduz || e >= 1 ? '' : 'scale(' + lerp(inicio[j], 1, e).toFixed(4) + ')');
      estilo(k.el, 'opacity', '1');
    });
  }
  function emRepouso(c) { mergulho(c, 0); }

  // Recuo: os três cenários viram três cartões de papel lado a lado.
  function recuo(v, p) {
    var e = reduz ? (v > 0 ? 1 : 0) : vaivem(v);
    var s = painel.s, pw = W * s;
    cenas.forEach(function (c, i) {
      emRepouso(c); mostrar(c, true);
      var cx = W / 2 + (i - 1) * (pw + painel.gap), tx = cx - W / 2, ty = painel.cy - H / 2, sc, x, y, op;
      if (i === 2) { sc = lerp(1, s, e); x = lerp(0, tx, e); y = lerp(0, ty, e); op = 1; }
      else {
        var chega = reduz ? (v > 0 ? 1 : 0) : saida(seg(v, 0.35 + i * 0.12, 0.85 + i * 0.08));
        sc = s; x = tx; y = ty + (1 - chega) * H * 0.7; op = suave(chega * 1.4);
      }
      estilo(c.el, 'opacity', op.toFixed(3));
      estilo(c.el, 'transform', 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')');
      estilo(c.el, 'borderRadius', (lerp(0, 12, e) / sc).toFixed(1) + 'px');
      estilo(c.el, 'boxShadow', '0 0 0 ' + (lerp(0, 6, e) / sc).toFixed(1) + 'px #FCF9FD, 0 ' + (16 / sc).toFixed(0) + 'px ' + (36 / sc).toFixed(0) + 'px rgba(20,0,35,' + (0.5 * e).toFixed(2) + ')');
    });
    // O computador cai sobre os três e é riscado duas vezes.
    var w = seg(p, RISCA[0], RISCA[1]);
    var cai = reduz ? (w > 0 ? 1 : 0) : mola(seg(w, 0, 0.42));
    estilo(pcEl, 'opacity', suave(seg(w, 0, 0.12)).toFixed(3));
    estilo(pcEl, 'transform', 'translate3d(' + pcEl._x.toFixed(1) + 'px,' + (pcEl._y - (1 - cai) * H * 0.5).toFixed(1) + 'px,0) rotate(' + lerp(-14, -3, cai).toFixed(2) + 'deg)');
    estilo(pcX[0], 'transform', 'rotate(32deg) scaleX(' + saida(seg(w, 0.45, 0.62)).toFixed(3) + ')');
    estilo(pcX[1], 'transform', 'rotate(-32deg) scaleX(' + saida(seg(w, 0.6, 0.78)).toFixed(3) + ')');
  }

  // ---------------------------------------------------------- gestos e abertura
  // ?direto pula a entrada do repositor (testes e links internos).
  var direto = /[?&]direto\b/.test(location.search);
  var abertura = { inicio: 0, rodando: false, feita: direto };
  function poseRepositor(c, t) {
    if (!abertura.rodando && !abertura.feita) { pose(c, -8, 0, 8, reduz ? 0 : 900, 0); return; }
    if (abertura.feita) { pose(c, -8, 0, 8, 0, 0); return; }
    var d = t - abertura.inicio;
    if (reduz) {
      // Sem caminhada: ele já está no lugar, com a mão levantada um instante.
      var up = d < 1600 ? 1 : 1 - seg(d, 1600, 1900);
      pose(c, lerp(-8, -104, up), lerp(0, -70, up), 8, 0, 0);
      if (d > 1900) terminarAbertura();
      return;
    }
    var ANDA = 1500, SOBE = 1850, ACENA = 3350, DESCE = 3750;
    if (d < ANDA) {
      var k = d / ANDA, passo = Math.sin(d / 115);
      pose(c, -8 + passo * 16, 0, 8 - passo * 16, lerp(900, 0, saida(k)), -Math.abs(passo) * 12 * (1 - k * 0.6));
    } else if (d < SOBE) {
      var s = vaivem(seg(d, ANDA, SOBE));
      pose(c, lerp(-8, -104, s), lerp(0, -70, s), 8, 0, 0);
    } else if (d < ACENA) {
      var a = Math.sin(seg(d, SOBE, ACENA) * Math.PI * 6);
      pose(c, -104 + a * 4, -70 + a * 24, 8, 0, 0);
    } else {
      var b = vaivem(seg(d, ACENA, DESCE));
      pose(c, lerp(-104, -8, b), lerp(-70, 0, b), 8, 0, 0);
      if (d >= ACENA) liberarRolagem();
      if (d >= DESCE) terminarAbertura();
    }
  }
  function terminarAbertura() { abertura.rodando = false; abertura.feita = true; liberarRolagem(); }

  // Vigilante: leva a mão ao quepe enquanto a cena dele está parada.
  function poseVigilante(c, p) {
    var w = seg(p, VIGIA[0], VIGIA[1]);
    var up = suave(seg(w, 0.12, 0.38)) * (1 - suave(seg(w, 0.74, 0.95)));
    pose(c, lerp(-8, -126, up), lerp(0, -116, up), 8, 0, 0);
  }
  // Atendente: acena, e o aceno anda com a rolagem, como num vídeo.
  function poseAtendente(c, p) {
    var w = seg(p, ATENDE[0], ATENDE[1]);
    var up = suave(seg(w, 0.1, 0.3)) * (1 - suave(seg(w, 0.78, 0.97)));
    var a = Math.sin(w * Math.PI * 9) * up;
    pose(c, lerp(-8, -104, up) + a * 4, lerp(0, -70, up) + a * 24, 8, 0, 0);
  }

  // --------------------------------------------------------------- desenhar --
  var sujo = true, ultimoP = -1;
  function desenharPalco(p, t) {
    var est = cenas[0], pos = cenas[1], lo = cenas[2];
    poseRepositor(est, t);
    poseVigilante(pos, p);
    poseAtendente(lo, p);
    cenas.forEach(function (c, i) { vivo(c, t, i); });

    if (p === ultimoP && !sujo) return;
    ultimoP = p; sujo = false;

    var u1 = seg(p, MERG1[0], MERG1[1]), u2 = seg(p, MERG2[0], MERG2[1]), v = seg(p, RECUO[0], RECUO[1]);
    if (v > 0) { recuo(v, p); return; }
    estilo(pcEl, 'opacity', '0');
    cenas.forEach(limparPainel);
    if (u1 < 1) {
      mostrar(est, true); mergulho(est, u1);
      mostrar(pos, u1 > 0.5); if (u1 > 0.5) chegada(pos, u1);
      mostrar(lo, false);
    } else if (u2 < 1) {
      mostrar(est, false);
      mostrar(pos, true); mergulho(pos, u2);
      mostrar(lo, u2 > 0.5); if (u2 > 0.5) chegada(lo, u2);
    } else {
      mostrar(est, false); mostrar(pos, false);
      mostrar(lo, true); emRepouso(lo); estilo(lo.el, 'opacity', '1');
    }
  }

  // ------------------------------------------------------------------ virada --
  var viradaEl = document.getElementById('virada');
  var vStage = viradaEl.querySelector('[data-sc-stage]');
  var fone = document.getElementById('fone');
  var trilhas = Array.prototype.map.call(viradaEl.querySelectorAll('.trilha'), function (li, i) {
    var img = li.querySelector('.trilha__img');
    img.innerHTML = Cenas.plana(img.getAttribute('data-cena'), 'm' + i, { acenando: true });
    return { img: img, txt: li.querySelector('.trilha__txt'), barra: li.querySelector('s'), dx: 0, dy: 0, s0: 1 };
  });
  var CHEIA = [0.72, 0.48, 0.3];

  function medirVirada() {
    var sr = vStage.getBoundingClientRect(), vw = sr.width, vh = sr.height;
    var mob = vw < 760, ws = mob ? vw * 0.29 : Math.min(vw * 0.16, 240), gap = mob ? 8 : 20;
    trilhas.forEach(function (tr, i) {
      tr.img.style.transform = '';
      var r = tr.img.getBoundingClientRect();
      var fx = r.left - sr.left + r.width / 2, fy = r.top - sr.top + r.height / 2;
      var sx = vw / 2 + (i - 1) * (ws + gap), sy = vh * (mob ? 0.86 : 0.84);
      if (!mob) sx = vw * 0.28 + (i - 1) * (ws + gap);
      tr.dx = sx - fx; tr.dy = sy - fy; tr.s0 = ws / r.width;
    });
  }
  function desenharVirada(p) {
    trilhas.forEach(function (tr, i) {
      var e = reduz ? 1 : vaivem(seg(p, 0.04 + i * 0.08, 0.3 + i * 0.08));
      estilo(tr.img, 'transform', e >= 1 ? '' : 'translate3d(' + (tr.dx * (1 - e)).toFixed(1) + 'px,' + (tr.dy * (1 - e)).toFixed(1) + 'px,0) scale(' + lerp(tr.s0, 1, e).toFixed(4) + ')');
      estilo(tr.txt, 'opacity', suave(seg(e, 0.75, 1)).toFixed(3));
      var online = CHEIA[i] * suave(seg(p, 0.42 + i * 0.04, 0.6 + i * 0.04));
      var offline = (1 - CHEIA[i]) * suave(seg(p, 0.7 + i * 0.03, 0.92));
      estilo(tr.barra, 'transform', 'scaleX(' + (online + offline).toFixed(3) + ')');
    });
    fone.classList.toggle('off', p > 0.64);
  }

  // --------------------------------------------------------------- resultados --
  Array.prototype.forEach.call(document.querySelectorAll('.caso__num'), function (el, i) {
    el.style.backgroundImage = Cenas.dataURL(el.getAttribute('data-cena'), 'r' + i, { inteira: true, acenando: true });
  });

  // Carimbo da ficha: bate uma vez, quando a ficha está inteira na tela.
  var carimbo = document.getElementById('carimbo-custo');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        setTimeout(function () { carimbo.classList.add('bateu'); }, reduz ? 0 : 750);
        io.disconnect();
      });
    }, { threshold: 0.75 });
    io.observe(carimbo.parentNode);
  } else carimbo.classList.add('bateu');

  // --------------------------------------------------------------- o motor --
  var sc = ScrollCraft.mount(document.body);
  var atoPalco = null, atoVirada = null;
  sc.acts.forEach(function (a) {
    if (a.el === palcoEl) atoPalco = a;
    if (a.el === viradaEl) atoVirada = a;
  });

  function medirTudo() { medirPalco(); medirVirada(); }
  addEventListener('resize', function () { requestAnimationFrame(medirTudo); }, { passive: true });

  function quadro(t) {
    if (atoPalco && (atoPalco.live || !abertura.feita)) desenharPalco(atoPalco.p, t);
    if (atoVirada && atoVirada.live) desenharVirada(atoVirada.p);
    requestAnimationFrame(quadro);
  }

  // -------------------------------------------------------------- carregando --
  var carregando = document.getElementById('carregando');
  var barra = document.getElementById('carregando-barra');
  var liberada = false;
  function liberarRolagem() {
    if (liberada) return;
    liberada = true;
    corpo.classList.remove('travado');
    requestAnimationFrame(function () { sc.layout(); medirTudo(); });
  }
  document.querySelector('.pular').addEventListener('click', terminarAbertura);

  var tarefas = [document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()];
  Array.prototype.forEach.call(document.images, function (img) {
    if (img.loading === 'lazy') return;
    tarefas.push(img.complete ? Promise.resolve() : new Promise(function (ok) {
      img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true });
    }));
  });
  var feitas = 0;
  tarefas = tarefas.map(function (pr) {
    return pr.then(function () { feitas++; barra.style.transform = 'scaleX(' + (feitas / tarefas.length).toFixed(3) + ')'; });
  });
  var minimo = new Promise(function (ok) { setTimeout(ok, reduz || direto ? 300 : 1100); });
  if (direto) liberarRolagem();
  var limite = new Promise(function (ok) { setTimeout(ok, 6000); });

  var aberta = false;
  function abrir() {
    if (aberta) return;
    aberta = true;
    medirTudo();
    barra.style.transform = 'scaleX(1)';
    document.getElementById('carregando-texto').textContent = 'Página carregada';
    setTimeout(function () {
      carregando.classList.add('abrindo');
      setTimeout(function () { abertura.inicio = performance.now(); abertura.rodando = true; }, reduz ? 0 : 380);
      setTimeout(function () { carregando.classList.add('fim'); }, 1000);
    }, 180);
    // Se algo travar a abertura, a página não fica presa.
    setTimeout(liberarRolagem, 7000);
  }
  Promise.race([Promise.all(tarefas.concat([minimo])), limite]).then(abrir);

  medirTudo();
  requestAnimationFrame(quadro);
})();
