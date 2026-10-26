/* ============================================================================
   Cenários em papel recortado · Vivo Empresas · onboarding sem computador
   ----------------------------------------------------------------------------
   Um desenho só, usado em três lugares da página:
     1. o palco de abertura, em camadas que andam em velocidades diferentes;
     2. as trilhas dentro do celular (a cena inteira, achatada);
     3. o fundo das letras gigantes dos resultados (data URL).
   Coordenadas de cena: 1600 x 1000, chão em y ~ 850. As paredes e o céu passam
   bem das bordas para qualquer recorte de tela (celular em pé incluído).
   ========================================================================== */
(function (global) {
  'use strict';

  var COR = {
    purpura: '#660099', rosa: '#EB3C7D', lilas: '#BD4AFF', rose: '#FF96B2',
    roxo: '#380054', magenta: '#CC3D70', laranjaClaro: '#FFB84C', laranja: '#FF9900',
    menta: '#B2D682', papel: '#FCF9FD'
  };

  // Sorteio com semente: as caixas, estrelas e janelas saem sempre iguais.
  function sorteio(semente) {
    var s = semente;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  function r(x, y, w, h, cor, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + cor + '"' + (extra || '') + '/>';
  }

  // ---------------------------------------------------------------- pessoas --
  var PERFIS = {
    repositor: { pele: '#F6C9A8', cabelo: '#4A2A14', camisa: COR.lilas, calca: COR.roxo, sapato: '#24003A', chapeu: 'bone' },
    vigilante: { pele: '#C98E6A', cabelo: '#1E0F08', camisa: '#2E0047', calca: '#1F0031', sapato: '#12001C', chapeu: 'quepe', mangaLonga: true },
    atendente: { pele: '#8C5A3C', cabelo: '#2B1404', camisa: COR.rose, calca: COR.roxo, sapato: '#24003A', chapeu: 'coque' }
  };
  var OMBRO_Y = -338, BRACO = 100;

  // Braço articulado: ombro (grupo id) e antebraço (grupo id-ante). As poses
  // giram esses dois grupos; nada mais se mexe, como um boneco de papel.
  function braco(P, id, sx, rotO, rotA) {
    var ey = OMBRO_Y + BRACO;
    var ante = P.mangaLonga
      ? r(sx - 17, ey - 14, 34, 92, P.camisa, ' rx="17"') + '<circle cx="' + sx + '" cy="' + (ey + 94) + '" r="20" fill="' + P.pele + '"/>'
      : r(sx - 16, ey - 12, 32, 100, P.pele, ' rx="16"') + '<circle cx="' + sx + '" cy="' + (ey + 96) + '" r="20" fill="' + P.pele + '"/>';
    return '<g id="' + id + '" transform="rotate(' + rotO + ' ' + sx + ' ' + OMBRO_Y + ')">' +
      r(sx - 17, OMBRO_Y - 10, 34, 112, P.mangaLonga ? P.camisa : P.pele, ' rx="17"') +
      r(sx - 21, OMBRO_Y - 18, 42, P.mangaLonga ? 118 : 66, P.camisa, ' rx="21"') +
      '<g id="' + id + '-ante" transform="rotate(' + rotA + ' ' + sx + ' ' + ey + ')">' + ante + '</g>' +
      '</g>';
  }

  function cabeca(P, uid) {
    var s = '';
    s += '<circle cx="-51" cy="-420" r="11" fill="' + P.pele + '"/><circle cx="51" cy="-420" r="11" fill="' + P.pele + '"/>';
    s += '<circle cx="0" cy="-424" r="52" fill="' + P.pele + '"/>';
    s += '<g id="' + uid + '-olhos"><circle cx="-18" cy="-424" r="6" fill="' + COR.roxo + '"/><circle cx="18" cy="-424" r="6" fill="' + COR.roxo + '"/></g>';
    s += '<circle cx="-31" cy="-404" r="9" fill="' + COR.rose + '" opacity=".55"/><circle cx="31" cy="-404" r="9" fill="' + COR.rose + '" opacity=".55"/>';
    s += '<path d="M-17 -400 Q0 -386 17 -400" stroke="' + COR.roxo + '" stroke-width="5" stroke-linecap="round" fill="none"/>';
    if (P.chapeu === 'bone') {
      s += '<path d="M-54 -428 Q-55 -470 0 -476 Q55 -470 54 -428 Q48 -448 0 -450 Q-48 -448 -54 -428Z" fill="' + P.cabelo + '"/>';
      s += '<path d="M-55 -440 Q-53 -498 0 -500 Q53 -498 55 -440 Z" fill="' + COR.rosa + '"/>';
      s += '<path d="M2 -446 L94 -444 Q104 -443 99 -435 L96 -431 L2 -436 Z" fill="' + COR.magenta + '"/>';
      s += '<circle cx="0" cy="-499" r="6" fill="' + COR.magenta + '"/>';
    } else if (P.chapeu === 'quepe') {
      s += '<path d="M-54 -420 Q-56 -446 -40 -452 L-40 -424Z" fill="' + P.cabelo + '"/><path d="M54 -420 Q56 -446 40 -452 L40 -424Z" fill="' + P.cabelo + '"/>';
      s += '<path d="M-62 -452 Q-58 -500 0 -506 Q58 -500 62 -452 Z" fill="#24003A"/>';
      s += r(-58, -460, 116, 16, '#14001F', ' rx="4"');
      s += '<path d="M0 -492 L10 -484 L8 -472 L0 -467 L-8 -472 L-10 -484Z" fill="' + COR.laranjaClaro + '"/>';
      s += '<path d="M-54 -446 Q0 -428 54 -446 L50 -440 Q0 -424 -50 -440Z" fill="#12001C"/>';
    } else {
      s += '<circle cx="0" cy="-488" r="24" fill="' + P.cabelo + '"/>';
      s += '<path d="M-55 -418 Q-60 -482 0 -484 Q60 -482 55 -418 Q46 -458 8 -462 Q-30 -452 -55 -418Z" fill="' + P.cabelo + '"/>';
      s += '<circle cx="-52" cy="-404" r="5" fill="' + COR.laranjaClaro + '"/><circle cx="52" cy="-404" r="5" fill="' + COR.laranjaClaro + '"/>';
    }
    return s;
  }

  function tronco(P, tipo) {
    var s = '<path d="M-76 -196 L-82 -322 Q-82 -356 -48 -358 L48 -358 Q82 -356 82 -322 L76 -196 Z" fill="' + P.camisa + '"/>';
    s += '<path d="M-22 -358 L0 -330 L22 -358 Z" fill="' + P.pele + '"/>';
    if (tipo === 'repositor') {
      s += '<path d="M-22 -356 L-6 -282 M22 -356 L6 -282" stroke="' + COR.roxo + '" stroke-width="5" fill="none"/>';
      s += r(-20, -284, 40, 30, COR.papel, ' rx="4"') + r(-20, -284, 40, 9, COR.rosa, ' rx="3"');
      s += r(-78, -210, 156, 14, COR.purpura, ' rx="4"');
    } else if (tipo === 'vigilante') {
      s += '<path d="M-22 -358 L0 -330 L22 -358 L14 -358 L0 -340 L-14 -358Z" fill="' + COR.papel + '" opacity=".9"/>';
      s += r(-74, -360, 34, 12, COR.laranjaClaro, ' rx="4"') + r(40, -360, 34, 12, COR.laranjaClaro, ' rx="4"');
      s += '<path d="M24 -318 L52 -318 L52 -294 Q38 -280 24 -294Z" fill="' + COR.laranjaClaro + '"/>';
      s += r(-56, -322, 20, 38, '#12001C', ' rx="4"') + r(-50, -346, 5, 26, '#12001C');
      s += r(-78, -214, 156, 16, '#12001C', ' rx="4"') + r(-12, -216, 24, 20, COR.laranjaClaro, ' rx="3"');
    } else {
      s += '<path d="M-56 -318 L56 -318 L68 -170 L-68 -170Z" fill="' + COR.papel + '"/>';
      s += '<path d="M-44 -318 L-30 -358 M44 -318 L30 -358" stroke="' + COR.papel + '" stroke-width="8" fill="none"/>';
      s += r(14, -304, 34, 22, COR.rosa, ' rx="4"');
      s += r(-30, -232, 60, 40, '#F1E3F6', ' rx="6"');
    }
    return s;
  }

  // Pose de descanso: braços soltos, um pouco abertos.
  var DESCANSO = { be: [8, 0], bd: [-8, 0] };

  function pessoa(tipo, uid) {
    var P = PERFIS[tipo], s = '';
    s += '<ellipse cx="0" cy="2" rx="104" ry="16" fill="' + COR.roxo + '" opacity=".2"/>';
    s += '<g id="' + uid + '-corpo">';
    s += r(-46, -212, 42, 204, P.calca, ' rx="16"') + r(4, -212, 42, 204, P.calca, ' rx="16"');
    s += '<path d="M-62 0 Q-64 -24 -40 -26 L-4 -26 L-4 0 Z" fill="' + P.sapato + '"/>';
    s += '<path d="M4 -26 L40 -26 Q64 -24 62 0 L4 0 Z" fill="' + P.sapato + '"/>';
    s += r(-16, -394, 32, 50, P.pele, ' rx="8"');
    s += braco(P, uid + '-be', -66, DESCANSO.be[0], DESCANSO.be[1]);
    s += tronco(P, tipo);
    s += cabeca(P, uid);
    s += braco(P, uid + '-bd', 66, DESCANSO.bd[0], DESCANSO.bd[1]);
    s += '</g>';
    return s;
  }

  // ----------------------------------------------------------------- cenas --
  // Cada cena: camadas (do fundo para a frente), a pessoa, o alvo do mergulho
  // (onde a câmera entra para chegar à próxima cena) e o foco para telas em pé.

  function estoque(uid) {
    var rnd = sorteio(11), f = '', p = '', fr = '';
    f += '<defs><linearGradient id="' + uid + '-noite" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#22003A"/><stop offset="1" stop-color="#660099"/></linearGradient></defs>';
    f += r(-700, -700, 3000, 1560, '#F1E6F7');
    f += r(-700, -700, 3000, 760, '#E7D7F1');
    f += r(-700, 54, 3000, 24, '#D6C0E6');
    // a porta dos fundos, aberta para a noite lá fora: é por ela que a câmera sai
    f += r(606, 296, 388, 554, COR.purpura, ' rx="6"');
    f += r(636, 326, 328, 524, 'url(#' + uid + '-noite)');
    for (var i = 0; i < 14; i++) {
      f += '<circle cx="' + (650 + rnd() * 300).toFixed(0) + '" cy="' + (500 + rnd() * 160).toFixed(0) + '" r="' + (1.5 + rnd() * 2).toFixed(1) + '" fill="#fff" opacity="' + (0.4 + rnd() * 0.5).toFixed(2) + '"/>';
    }
    f += '<ellipse cx="760" cy="850" rx="140" ry="18" fill="' + COR.laranjaClaro + '" opacity=".25"/>';
    f += r(746, 620, 10, 230, '#1E0030') + '<circle cx="751" cy="616" r="15" fill="' + COR.laranjaClaro + '"/>';
    f += '<circle cx="751" cy="616" r="54" fill="' + COR.laranjaClaro + '" opacity=".18"/>';
    f += r(880, 700, 70, 150, '#4E0A78') + r(892, 716, 18, 16, COR.laranjaClaro) + r(920, 744, 18, 16, COR.laranjaClaro);
    f += r(636, 326, 328, 168, '#DCC8E8');
    for (var y = 340; y < 494; y += 16) f += r(636, y, 328, 4, '#C7AEDB');
    f += r(636, 488, 328, 12, COR.purpura);
    f += r(-700, 848, 3000, 900, '#DCC8E8') + r(-700, 848, 3000, 10, '#C9B0DB');
    f += r(560, 930, 480, 10, COR.laranjaClaro, ' opacity=".5"');

    [[40, 560], [1050, 1570]].forEach(function (u) {
      var x0 = u[0], x1 = u[1];
      p += r(x0 - 14, 176, x1 - x0 + 28, 18, COR.purpura);
      [384, 584, 784].forEach(function (yy) {
        var x = x0 + 26;
        while (x < x1 - 70) {
          var w = 70 + Math.round(rnd() * 64), h = 84 + Math.round(rnd() * 84), t = rnd();
          if (x + w > x1 - 24) break;
          if (t < 0.6) {
            p += r(x, yy - h, w, h, rnd() < 0.5 ? COR.laranjaClaro : '#F4AA3E', ' rx="3"');
            p += r(x + w / 2 - 6, yy - h, 12, h * 0.5, '#E39A2E');
            p += r(x + 10, yy - h * 0.42, w * 0.38, h * 0.18, COR.papel, ' rx="2" opacity=".85"');
          } else {
            var c = t < 0.82 ? COR.lilas : COR.rose, hh = Math.round(h * 0.66);
            p += r(x, yy - hh, w, hh, c, ' rx="7"');
            p += r(x + w * 0.3, yy - hh + 12, w * 0.4, 9, COR.roxo, ' rx="4" opacity=".28"');
          }
          x += w + 8 + Math.round(rnd() * 16);
        }
        p += r(x0 - 14, yy, x1 - x0 + 28, 18, COR.purpura);
      });
      p += r(x0 - 18, 176, 22, 680, '#4B0072') + r(x1 - 4, 176, 22, 680, '#4B0072');
    });

    // frente: luminárias, palete com caixas e carrinho
    [380, 1230].forEach(function (x) {
      fr += r(x - 2, -700, 4, 760, '#4B0072');
      fr += '<path d="M' + (x - 78) + ' 132 L' + (x + 78) + ' 132 L' + (x + 40) + ' 60 L' + (x - 40) + ' 60 Z" fill="' + COR.purpura + '"/>';
      fr += '<ellipse cx="' + x + '" cy="134" rx="40" ry="10" fill="' + COR.papel + '"/>';
    });
    fr += r(40, 948, 500, 20, '#E39A2E') + r(60, 968, 30, 30, '#C9831F') + r(270, 968, 30, 30, '#C9831F') + r(480, 968, 30, 30, '#C9831F');
    [[60, 770, 220, 178], [290, 800, 230, 148], [140, 610, 190, 160]].forEach(function (b) {
      fr += r(b[0], b[1], b[2], b[3], COR.laranjaClaro, ' rx="4"');
      fr += r(b[0] + b[2] / 2 - 9, b[1], 18, b[3] * 0.5, '#E39A2E');
      fr += r(b[0] + 18, b[1] + b[3] * 0.56, b[2] * 0.36, b[3] * 0.22, COR.papel, ' rx="3" opacity=".9"');
    });
    fr += '<path d="M1418 650 L1440 650 L1440 958 L1560 958" stroke="' + COR.roxo + '" stroke-width="14" fill="none" stroke-linejoin="round"/>';
    fr += r(1446, 820, 150, 130, '#F4AA3E', ' rx="4"') + r(1514, 820, 14, 64, '#E39A2E');
    fr += '<circle cx="1456" cy="972" r="26" fill="#24003A"/><circle cx="1456" cy="972" r="9" fill="' + COR.rose + '"/>';

    return {
      nome: 'estoque', tipo: 'repositor', foco: 1010, alvo: [800, 600],
      recorte: [540, 300, 880, 550],
      camadas: [{ svg: f, k: 4.6 }, { svg: p, k: 7.5 }, { pessoa: [1010, 904, 1.12], k: 9 }, { svg: fr, k: 13 }]
    };
  }

  function posto(uid) {
    var rnd = sorteio(29), f = '', m = '', fr = '';
    f += '<defs><linearGradient id="' + uid + '-ceu" x1="0" y1="0" x2="0" y2="1">' +
         '<stop offset="0" stop-color="#1C0030"/><stop offset=".75" stop-color="#4E0A7A"/><stop offset="1" stop-color="#660099"/></linearGradient></defs>';
    f += r(-700, -700, 3000, 1560, 'url(#' + uid + '-ceu)');
    for (var i = 0; i < 70; i++) {
      f += '<circle cx="' + (-600 + rnd() * 2800).toFixed(0) + '" cy="' + (-600 + rnd() * 1080).toFixed(0) + '" r="' + (1.2 + rnd() * 2.4).toFixed(1) + '" fill="#fff" opacity="' + (0.3 + rnd() * 0.6).toFixed(2) + '"/>';
    }
    f += '<circle cx="330" cy="170" r="48" fill="#FFE2A8"/><circle cx="352" cy="156" r="44" fill="#2A0046"/>';
    for (var x = -700; x < 2300; x += 70 + Math.round(rnd() * 50)) {
      var h = 140 + Math.round(rnd() * 200), w = 60 + Math.round(rnd() * 60);
      f += r(x, 830 - h, w, h, '#3E0862');
      for (var wy = 830 - h + 20; wy < 800; wy += 34) {
        if (rnd() < 0.3) f += r(x + 12, wy, 12, 12, COR.laranjaClaro, ' opacity=".55"');
      }
    }
    f += r(-700, 820, 3000, 900, '#2A0040') + r(-700, 820, 3000, 34, '#3B0A5A') + r(-700, 852, 3000, 6, '#4E0A78');

    // meio: guarita, cancela, poste e o prédio com a porta de vidro (alvo)
    m += r(150, 486, 340, 40, COR.roxo, ' rx="6"') + r(170, 522, 300, 310, COR.purpura);
    m += r(198, 560, 244, 128, COR.laranjaClaro, ' opacity=".92"') + r(316, 560, 8, 128, COR.purpura);
    m += r(198, 716, 244, 12, '#4B0072');
    m += r(478, 700, 22, 132, COR.roxo);
    for (var s = 0; s < 10; s++) m += r(500 + s * 40, 708, 40, 18, s % 2 ? COR.papel : COR.rosa);
    m += r(940, 150, 760, 682, '#4E0A78');
    for (var cx = 990; cx < 1640; cx += 110) {
      for (var cy = 200; cy < 500; cy += 90) {
        m += r(cx, cy, 70, 58, rnd() < 0.48 ? COR.laranjaClaro : '#3A0660', ' rx="3"');
      }
    }
    m += '<defs><linearGradient id="' + uid + '-vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0F5"/><stop offset="1" stop-color="' + COR.rose + '"/></linearGradient></defs>';
    m += r(1036, 534, 268, 28, COR.lilas, ' rx="4"');
    m += r(1066, 562, 208, 270, 'url(#' + uid + '-vidro)');
    m += r(1166, 562, 8, 270, COR.roxo) + r(1066, 562, 208, 8, COR.roxo);
    m += '<ellipse cx="1170" cy="842" rx="170" ry="16" fill="' + COR.rose + '" opacity=".28"/>';
    m += '<path d="M600 300 L580 300" stroke="#1E0030" stroke-width="10"/>';
    m += r(552, 300, 12, 532, '#1E0030') + r(552, 292, 76, 12, '#1E0030', ' rx="6"');
    m += '<path d="M600 312 L520 832 L760 832 L640 312 Z" fill="' + COR.laranjaClaro + '" opacity=".13"/>';
    m += '<ellipse cx="616" cy="308" rx="26" ry="12" fill="' + COR.laranjaClaro + '"/>';
    m += '<ellipse cx="640" cy="834" rx="150" ry="18" fill="' + COR.laranjaClaro + '" opacity=".2"/>';

    fr += '<path d="M-200 1000 Q-160 900 -40 910 Q20 840 120 880 Q200 850 250 920 Q320 930 330 1000 Z" fill="#20003A"/>';
    fr += '<path d="M1340 1000 Q1360 920 1450 930 Q1520 860 1620 900 Q1720 880 1800 1000 Z" fill="#20003A"/>';
    fr += '<path d="M392 990 L420 880 L444 880 L472 990 Z" fill="' + COR.rosa + '"/>' + r(404, 916, 56, 16, COR.papel) + r(378, 986, 108, 14, COR.rosa, ' rx="4"');

    return {
      nome: 'posto', tipo: 'vigilante', foco: 760, alvo: [1170, 700],
      recorte: [300, 310, 880, 550],
      camadas: [{ svg: f, k: 4.2 }, { svg: m, k: 6.4 }, { pessoa: [710, 906, 1.12], k: 9 }, { svg: fr, k: 13 }]
    };
  }

  function loja(uid) {
    var rnd = sorteio(5), f = '', b = '', fr = '';
    f += r(-700, -700, 3000, 1560, '#FFEAF2');
    f += r(-700, 856, 3000, 900, '#F6D3E1') + r(-700, 856, 3000, 10, '#EBB9CD');
    for (var tx = -700; tx < 2300; tx += 120) f += r(tx, 866, 4, 900, '#EBB9CD', ' opacity=".6"');
    f += r(30, 180, 300, 420, COR.papel, ' rx="10"') + r(50, 200, 260, 380, '#E8D2F6');
    f += '<circle cx="230" cy="300" r="40" fill="' + COR.laranjaClaro + '" opacity=".8"/>';
    f += '<path d="M50 520 Q120 470 190 510 Q250 470 310 500 L310 580 L50 580Z" fill="' + COR.menta + '" opacity=".9"/>';
    f += r(176, 200, 8, 380, COR.papel);
    [[430, 1530]].forEach(function (u) {
      [300, 440, 580].forEach(function (yy) {
        var x = u[0] + 10;
        while (x < u[1] - 40) {
          var t = rnd(), w = 34 + Math.round(rnd() * 40), h = 50 + Math.round(rnd() * 56);
          var c = [COR.rose, COR.lilas, COR.laranjaClaro, COR.purpura, COR.rosa][Math.floor(t * 5)];
          if (t < 0.25) f += '<circle cx="' + (x + w / 2) + '" cy="' + (yy - w / 2) + '" r="' + (w / 2) + '" fill="' + c + '"/>';
          else f += r(x, yy - h, w, h, c, ' rx="5"') + r(x + 6, yy - h * 0.55, w - 12, h * 0.2, COR.papel, ' rx="2" opacity=".85"');
          x += w + 10 + Math.round(rnd() * 12);
        }
        f += r(u[0] - 10, yy, u[1] - u[0] + 20, 14, COR.purpura, ' rx="3"');
      });
    });
    [560, 860, 1160].forEach(function (x) {
      f += r(x - 2, -700, 4, 790, COR.roxo);
      f += '<path d="M' + (x - 54) + ' 140 Q' + x + ' 50 ' + (x + 54) + ' 140 Z" fill="' + COR.rosa + '"/>';
      f += '<ellipse cx="' + x + '" cy="142" rx="22" ry="8" fill="' + COR.papel + '"/>';
    });

    b += r(500, 690, 760, 250, COR.purpura) + r(500, 742, 760, 14, COR.rosa);
    b += r(480, 670, 800, 30, COR.roxo, ' rx="6"');
    b += r(1020, 580, 64, 92, '#2B0040', ' rx="10"') + r(1032, 594, 40, 30, COR.lilas, ' rx="4"');
    b += '<path d="M600 672 L612 556 L716 556 L728 672 Z" fill="' + COR.laranjaClaro + '"/>';
    b += '<path d="M632 560 Q664 506 696 560" stroke="#E39A2E" stroke-width="8" fill="none"/>';
    b += r(1150, 618, 64, 54, COR.rosa, ' rx="6"') + '<circle cx="1170" cy="600" r="24" fill="' + COR.menta + '"/><circle cx="1196" cy="590" r="20" fill="' + COR.menta + '"/>';

    fr += '<path d="M120 1000 L150 870 L310 870 L340 1000 Z" fill="' + COR.rosa + '"/>';
    ['M230 870 Q120 760 60 640 Q170 700 230 870', 'M230 870 Q210 700 250 560 Q300 700 230 870', 'M230 870 Q330 740 420 680 Q380 800 230 870', 'M230 870 Q140 820 30 800 Q130 760 230 870'].forEach(function (d, i) {
      fr += '<path d="' + d + 'Z" fill="' + (i % 2 ? '#9CC46A' : COR.menta) + '"/>';
    });
    fr += '<path d="M1330 900 L1580 900 L1550 1010 L1360 1010 Z" fill="' + COR.rosa + '"/>';
    fr += '<path d="M1380 900 Q1455 800 1530 900" stroke="' + COR.magenta + '" stroke-width="14" fill="none"/>';
    fr += r(1340, 920, 230, 10, COR.magenta, ' opacity=".5"');

    return {
      nome: 'loja', tipo: 'atendente', foco: 860, alvo: [880, 560],
      recorte: [420, 300, 880, 550],
      camadas: [{ svg: f, k: 4 }, { pessoa: [860, 916, 1.1], k: 6 }, { svg: b, k: 8 }, { svg: fr, k: 12 }]
    };
  }

  var FABRICAS = { estoque: estoque, posto: posto, loja: loja };

  function svgPessoa(cena, uid) {
    var c = null;
    cena.camadas.forEach(function (k) { if (k.pessoa) c = k.pessoa; });
    return '<g id="' + uid + '-pos" transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')">' + pessoa(cena.tipo, uid) + '</g>';
  }

  // A cena inteira numa imagem só (trilhas do celular, letras gigantes).
  // O aceno vem desenhado: em miniatura a pessoa está sempre cumprimentando.
  function plana(nome, uid, opcoes) {
    opcoes = opcoes || {};
    var cena = FABRICAS[nome](uid), corpo = '';
    // Sombra de papel em tudo que não é fundo: é o que faz o recorte parecer recorte.
    corpo += '<defs><filter id="' + uid + '-sombra" x="-10%" y="-10%" width="120%" height="130%">' +
      '<feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#380054" flood-opacity=".28"/></filter></defs>';
    cena.camadas.forEach(function (k, i) {
      var miolo = k.pessoa ? svgPessoa(cena, uid) : k.svg;
      corpo += i === 0 ? miolo : '<g filter="url(#' + uid + '-sombra)">' + miolo + '</g>';
    });
    var vb = opcoes.inteira ? [0, 0, 1600, 1000] : cena.recorte;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '" preserveAspectRatio="xMidYMid slice">' + corpo + '</svg>';
    if (!opcoes.acenando) return svg;
    return acenar(svg, uid);
  }
  // Troca a pose de descanso do braço direito pela pose de aceno, no texto.
  function acenar(svg, uid) {
    return svg
      .replace('id="' + uid + '-bd" transform="rotate(-8 66 ' + OMBRO_Y + ')"', 'id="' + uid + '-bd" transform="rotate(-104 66 ' + OMBRO_Y + ')"')
      .replace('id="' + uid + '-bd-ante" transform="rotate(0 66 ' + (OMBRO_Y + BRACO) + ')"', 'id="' + uid + '-bd-ante" transform="rotate(-70 66 ' + (OMBRO_Y + BRACO) + ')"');
  }

  global.Cenas = {
    COR: COR, OMBRO_Y: OMBRO_Y, BRACO: BRACO,
    criar: function (nome, uid) { return FABRICAS[nome](uid); },
    pessoa: svgPessoa,
    plana: plana,
    dataURL: function (nome, uid, opcoes) {
      return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(plana(nome, uid, opcoes)) + '")';
    }
  };
})(window);
