/* Petclube Experience — site demo Patron */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // CONFIRMAR: WhatsApp da loja. Nenhum número foi encontrado publicado (Google e Facebook, 13/11/2026).
  // Preencher só com DDI + DDD + número, sem símbolos (ex.: '5511900000000'). Vazio = o visitante escolhe a conversa.
  var WHATSAPP_NUMERO = '';
  var TELEFONE_TXT = '(11) 4508-0044';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- entrada das seções ---------- */
  var revela = $$('.revela');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add('visto'); obs.unobserve(i.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revela.forEach(function (el, n) { el.style.transitionDelay = (n % 4) * 70 + 'ms'; obs.observe(el); });
  } else {
    revela.forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- botão flutuante: aparece depois do topo ---------- */
  var flut = $('.flutuante');
  var hero = $('.hero');
  function checaFlutuante() {
    var passou = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 300);
    flut.classList.toggle('visivel', passou);
  }
  window.addEventListener('scroll', checaFlutuante, { passive: true });
  checaFlutuante();

  /* ---------- aberto agora (horário publicado no Google: seg–sáb 8h–20h, dom 10h–16h) ---------- */
  var HORARIO = { 0: [10, 16], 1: [8, 20], 2: [8, 20], 3: [8, 20], 4: [8, 20], 5: [8, 20], 6: [8, 20] };
  function agoraSP() {
    try {
      var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { dia: dias[o.weekday], hora: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
    } catch (e) { return null; }
  }
  (function seloAberto() {
    var a = agoraSP();
    var selo = $('#selo-aberto');
    if (!a || !selo || a.dia === undefined) return;
    var h = HORARIO[a.dia];
    var txt = $('#selo-aberto-txt');
    if (a.hora >= h[0] && a.hora < h[1]) {
      txt.textContent = 'Aberto agora · fecha às ' + h[1] + 'h';
    } else {
      selo.classList.add('fechado');
      if (a.hora < h[0]) {
        txt.textContent = 'Fechado agora · abre hoje às ' + h[0] + 'h';
      } else {
        var amanha = HORARIO[(a.dia + 1) % 7];
        txt.textContent = 'Fechado agora · abre amanhã às ' + amanha[0] + 'h';
      }
    }
    selo.hidden = false;
    $$('.horarios tr').forEach(function (tr) {
      var d = (tr.getAttribute('data-dias') || '').split(',');
      if (d.indexOf(String(a.dia)) > -1) tr.classList.add('hoje');
    });
  })();

  /* ---------- um dia aqui ---------- */
  var linha = $('#linha');
  var paradas = $$('.parada-btn', linha);
  var chips = $$('#dias .chip');
  var campoNome = $('#pet-nome');
  var fala = $('#pedido-fala');
  var titulo = $('#pedido-titulo');
  var btnZap = $('#btn-zap');
  var btnCopiar = $('#btn-copiar');
  var estado = { dia: '' };

  function lista(itens) {
    if (itens.length < 2) return itens.join('');
    return itens.slice(0, -1).join(', ') + ' e ' + itens[itens.length - 1];
  }
  function nomePet() { return campoNome.value.trim().replace(/\s+/g, ' '); }
  function escolhidos() {
    return paradas.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })
                  .map(function (b) { return b.getAttribute('data-servico'); });
  }
  function textoPedido() {
    var itens = escolhidos();
    var nome = nomePet();
    if (!itens.length) return '';
    var t = 'Olá! Vi o site do Petclube Experience e quero combinar um dia para ' + (nome ? 'o meu pet, ' + nome : 'o meu pet') + ': ' + lista(itens) + '.';
    if (estado.dia) t += ' De preferência ' + (estado.dia === 'sábado' || estado.dia === 'domingo' ? 'no ' : 'na ') + estado.dia + '.';
    t += ' Podem me passar os horários?';
    return t;
  }
  function avanco() {
    // a luz da linha do tempo vai até o último serviço escolhido
    var ultimo = null;
    paradas.forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') ultimo = b; });
    var px = 0;
    if (ultimo) {
      var li = ultimo.parentNode;
      px = li.offsetTop + li.offsetHeight / 2 - 28;
    }
    var todos = escolhidos().length === paradas.length;
    if (todos) px = linha.offsetHeight - 56;
    linha.style.setProperty('--avanco', Math.max(0, px) + 'px');
    linha.classList.toggle('completa', todos);
  }
  function atualiza() {
    var nome = nomePet();
    var t = textoPedido();
    titulo.textContent = nome ? 'O dia de ' + nome : 'O dia do seu pet';
    fala.textContent = t || 'Toque nos serviços da linha do tempo para montar o dia.';
    fala.classList.toggle('vazio', !t);
    var msg = t || 'Olá! Vi o site do Petclube Experience e quero combinar um dia para o meu pet. Podem me passar os horários?';
    btnZap.href = 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(msg);
    avanco();
  }

  paradas.forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      atualiza();
    });
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var ligado = c.getAttribute('aria-pressed') === 'true';
      chips.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', ligado ? 'false' : 'true');
      estado.dia = ligado ? '' : c.getAttribute('data-dia');
      atualiza();
    });
  });
  campoNome.addEventListener('input', atualiza);
  window.addEventListener('resize', avanco);

  var aviso = $('#aviso');
  var avisoT;
  function avisa(txt) {
    aviso.textContent = txt;
    aviso.classList.add('mostra');
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { aviso.classList.remove('mostra'); }, 2400);
  }
  btnCopiar.addEventListener('click', function () {
    var t = textoPedido();
    if (!t) { avisa('Escolha ao menos um serviço'); return; }
    t += ' (Telefone da loja: ' + TELEFONE_TXT + ')';
    function ok() { avisa('Pedido copiado'); }
    function reserva() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { avisa('Não foi possível copiar'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(ok, reserva);
    } else { reserva(); }
  });

  atualiza();

  /* ---------- faq: abre uma por vez ---------- */
  var faqs = $$('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
