/* @ds-bundle: {"format":3,"namespace":"RbiDesignSystem_7a8e1a","components":[],"sourceHashes":{"assets/orbi.js":"fd2830df88eb"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RbiDesignSystem_7a8e1a = window.RbiDesignSystem_7a8e1a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/orbi.js
try { (() => {
/* Órbi — astronauta sticker · gerador de SVG reutilizável.
   Clima Mundo Adesivo: contorno navy grosso, cores de brincar, formas macias.
   Técnica de membro: traço navy grosso + traço branco por cima = cápsula com contorno.

   API:
     OrbiChar.svg(pose, opts)   pose: 'acenando'|'comemorando'|'curioso'|'parado'
                                opts.bust:true → só cabeça+tronco (p/ ícone)
     OrbiChar.faceSvg(mood)     mood: 'feliz'|'uau'|'curioso'|'calmo' — só o capacete+rosto
     OrbiChar.inner(pose)       string interna (sem <svg>)
     OrbiChar.palette
*/
(function (root) {
  var NAVY = "#1C2746",
    SUN = "#FFC53D",
    BLUE = "#58B6E8",
    BLUESOFT = "#BEE5F8",
    CORAL = "#F0623E",
    CORALSOFT = "#FBC4B5",
    WHITE = "#fff";
  function limb(d) {
    return '<path d="' + d + '" fill="none" stroke="' + NAVY + '" stroke-width="30" stroke-linecap="round"/>' + '<path d="' + d + '" fill="none" stroke="' + WHITE + '" stroke-width="16" stroke-linecap="round"/>';
  }
  function hand(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="14" fill="' + WHITE + '" stroke="' + NAVY + '" stroke-width="7"/>';
  }
  function star(cx, cy, r, fill) {
    var p = '';
    for (var i = 0; i < 10; i++) {
      var ang = Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 === 0 ? r : r * 0.45;
      p += (i === 0 ? 'M' : 'L') + (cx + Math.cos(ang) * rad).toFixed(1) + ' ' + (cy - Math.sin(ang) * rad).toFixed(1) + ' ';
    }
    return '<path d="' + p + 'Z" fill="' + fill + '" stroke="' + NAVY + '" stroke-width="3.5" stroke-linejoin="round"/>';
  }

  // ---- pose → humor do rosto -------------------------------------
  function moodFor(pose) {
    if (pose === 'comemorando') return 'uau';
    if (pose === 'curioso') return 'curioso';
    return 'feliz'; // acenando, parado
  }

  // ---- rosto (dentro da viseira) ---------------------------------
  function face(mood) {
    var s = '<circle cx="86" cy="112" r="6" fill="' + CORALSOFT + '"/><circle cx="134" cy="112" r="6" fill="' + CORALSOFT + '"/>';
    if (mood === 'curioso') {
      s += '<circle cx="98" cy="97" r="8" fill="' + NAVY + '"/><circle cx="126" cy="97" r="8" fill="' + NAVY + '"/>';
      s += '<circle cx="100" cy="94" r="2.6" fill="' + WHITE + '"/><circle cx="128" cy="94" r="2.6" fill="' + WHITE + '"/>';
      s += '<path d="M86 84 Q96 80 104 84" fill="none" stroke="' + NAVY + '" stroke-width="4.5" stroke-linecap="round"/>';
      s += '<path d="M104 116 Q112 120 120 115" fill="none" stroke="' + NAVY + '" stroke-width="5.5" stroke-linecap="round"/>';
    } else if (mood === 'uau') {
      s += '<path d="M88 100 Q96 92 104 100" fill="none" stroke="' + NAVY + '" stroke-width="6" stroke-linecap="round"/>';
      s += '<path d="M116 100 Q124 92 132 100" fill="none" stroke="' + NAVY + '" stroke-width="6" stroke-linecap="round"/>';
      s += '<path d="M96 112 Q110 134 124 112 Z" fill="' + NAVY + '"/>';
      s += '<path d="M101 117 Q110 126 119 117 Z" fill="' + CORAL + '"/>';
    } else if (mood === 'calmo') {
      s += '<path d="M88 100 Q96 92 104 100" fill="none" stroke="' + NAVY + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<path d="M116 100 Q124 92 132 100" fill="none" stroke="' + NAVY + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<path d="M96 112 Q110 122 124 112" fill="none" stroke="' + NAVY + '" stroke-width="5.5" stroke-linecap="round"/>';
    } else {
      // feliz
      s += '<circle cx="96" cy="100" r="8" fill="' + NAVY + '"/><circle cx="124" cy="100" r="8" fill="' + NAVY + '"/>';
      s += '<circle cx="98" cy="97" r="2.6" fill="' + WHITE + '"/><circle cx="126" cy="97" r="2.6" fill="' + WHITE + '"/>';
      s += '<path d="M94 114 Q110 128 126 114" fill="none" stroke="' + NAVY + '" stroke-width="6" stroke-linecap="round"/>';
    }
    return s;
  }

  // ---- cabeça (capacete + brilho + viseira + rosto) --------------
  function head(mood) {
    return '<circle cx="110" cy="92" r="56" fill="' + WHITE + '" stroke="' + NAVY + '" stroke-width="8"/>' + '<path d="M80 64 Q92 52 108 52" fill="none" stroke="' + SUN + '" stroke-width="7" stroke-linecap="round" opacity="0.9"/>' + '<rect x="68" y="74" width="84" height="58" rx="29" fill="' + BLUESOFT + '" stroke="' + NAVY + '" stroke-width="7"/>' + face(mood);
  }
  function arms(pose) {
    if (pose === 'comemorando') return limb("M74 160 L46 120") + limb("M146 160 L174 120");
    if (pose === 'curioso') return limb("M74 162 L50 210") + limb("M146 162 L132 126");
    if (pose === 'parado') return limb("M74 160 L60 208") + limb("M146 160 L160 208");
    return limb("M74 162 L50 210") + limb("M146 158 L176 118"); // acenando
  }
  function hands(pose) {
    if (pose === 'comemorando') return hand(44, 116) + hand(176, 116);
    if (pose === 'curioso') return hand(48, 216) + hand(130, 122);
    if (pose === 'parado') return hand(58, 214) + hand(162, 214);
    return hand(48, 216) + hand(180, 114);
  }
  function extras(pose) {
    if (pose === 'comemorando') return star(30, 70, 9, SUN) + star(192, 84, 7, CORAL) + star(180, 40, 6, BLUE);
    if (pose === 'curioso') return star(186, 44, 11, SUN);
    return '';
  }
  function inner(pose) {
    return '' + '<line x1="110" y1="40" x2="110" y2="26" stroke="' + NAVY + '" stroke-width="6" stroke-linecap="round"/>' + '<circle cx="110" cy="18" r="8" fill="' + SUN + '" stroke="' + NAVY + '" stroke-width="4"/>' + limb("M94 214 L90 236") + limb("M126 214 L130 236") + '<ellipse cx="88" cy="240" rx="17" ry="11" fill="' + CORAL + '" stroke="' + NAVY + '" stroke-width="7"/>' + '<ellipse cx="132" cy="240" rx="17" ry="11" fill="' + CORAL + '" stroke="' + NAVY + '" stroke-width="7"/>' + arms(pose) + '<rect x="64" y="138" width="92" height="86" rx="36" fill="' + WHITE + '" stroke="' + NAVY + '" stroke-width="8"/>' + '<ellipse cx="110" cy="180" rx="26" ry="9" transform="rotate(-20 110 180)" fill="none" stroke="' + NAVY + '" stroke-width="4.5"/>' + '<circle cx="110" cy="180" r="15" fill="' + SUN + '" stroke="' + NAVY + '" stroke-width="5"/>' + hands(pose) + head(moodFor(pose)) + extras(pose);
  }
  function svg(pose, opts) {
    opts = opts || {};
    var vb = opts.bust ? '40 0 140 150' : '0 0 220 250';
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg">' + inner(pose) + '</svg>';
  }

  // só o capacete + rosto, p/ tira de expressões e favicons
  function faceSvg(mood) {
    return '<svg viewBox="50 32 120 120" xmlns="http://www.w3.org/2000/svg">' + head(mood) + '</svg>';
  }
  root.OrbiChar = {
    svg: svg,
    faceSvg: faceSvg,
    inner: inner,
    palette: {
      NAVY: NAVY,
      SUN: SUN,
      BLUE: BLUE,
      CORAL: CORAL,
      BLUESOFT: BLUESOFT
    }
  };
})(typeof window !== 'undefined' ? window : this);
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/orbi.js", error: String((e && e.message) || e) }); }

})();
