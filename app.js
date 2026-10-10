(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'ruben-birthday-games-v1';
  const games = [
    { type: 'burpee', label: 'PRUEBA 01 · BURPEES', title: 'Al suelo. Arriba. A por otra.', help: 'Toca el botón para hacer un burpee. Seis y seguimos.', target: 6, unit: 'REPS', speech: '¿Burpees en mi cumpleaños? En serio.', cheers: ['¡Eso es! El primero siempre cuesta.', 'Dos. Y sin despeinarte.', '¡Mitad del trabajo hecha!', 'Sheila y Miguel están aplaudiendo.', '¡Una más y lo tienes!', '¡Seis de seis! Menuda máquina.'] },
    { type: 'tire', label: 'PRUEBA 02 · TIRE FLIP', title: 'Esa rueda no se mueve sola.', help: 'Mantén pulsado o da pequeños toques para empujar. ¡Cuatro volteos!', target: 4, unit: 'VOLTEOS', speech: '¿No había una rueda un poquito más pequeña?', cheers: ['¡Primer volteo! Ni tan pesada.', 'Dos. Vas sobre ruedas. Literalmente.', '¡Una más! Tu regalo ya tiembla.', '¡Rueda domada! Ahora toca remar.'] },
    { type: 'row', label: 'PRUEBA 03 · REMO', title: 'Cien metros. Todo corazón.', help: 'Alterna «Tira» y «Vuelve». Cada remada completa suma 10 metros.', target: 100, unit: 'METROS', speech: 'Como remar hacia la tarta. Pero sin tarta.', cheers: ['¡Buen ritmo, capitán!', 'Diez metros más cerca de la sorpresa.', '¡Sigue así! Después toca mirar hacia arriba.'] },
    { type: 'rope', label: 'PRUEBA 04 · ROPE CLIMB', title: 'El regalo está en lo más alto.', help: 'Cada clic en «¡Un tirón!» te sube un tramo. Ocho tirones y toca la campana.', target: 8, unit: 'TRAMOS', speech: 'Vale, pero arriba me espera el regalo, ¿no?', cheers: ['¡Buen agarre! Ya estás en la cuerda.', 'Manos arriba, pies bien sujetos.', '¡Tercer tramo! Ni mires abajo.', '¡A mitad de camino! Menudo escalador.', 'Cinco. Sheila y Miguel te animan desde abajo.', '¡Dos tirones más! Ya se ve la campana.', '¡El último! Ese regalo ya es casi tuyo.', '¡DING! Has tocado el cielo. Y la campana.'] },
  ];
  const lastGame = games.length - 1;
  const newState = () => ({ game: 0, counts: games.map(() => 0), finished: false });
  let state = newState();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.counts) && [3, games.length].includes(saved.counts.length)) {
      // Keep the original three rounds when upgrading an existing saved game.
      state.counts = games.map((game, i) => {
        const n = saved.counts[i];
        return Number.isFinite(n) ? Math.max(0, Math.min(game.target, Math.floor(n))) : 0;
      });
      // Later rounds only count when the preceding rounds are complete.
      for (let i = 1; i < games.length; i++) if (state.counts[i - 1] < games[i - 1].target) state.counts[i] = 0;
      state.game = state.counts.findIndex((n, i) => n < games[i].target);
      state.finished = state.game === -1;
      if (state.finished) state.game = lastGame;
    }
  } catch { /* The game also works when browser storage is unavailable. */ }
  let busy = false;
  let animationTimer;
  let popTimer;
  let holdFrame;
  let holdStart = 0;
  let holdProgress = 0;
  let holding = false;
  let pressStarted = 0;
  let rowPulled = false;
  const arena = $('#arena');
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {} };
  const count = () => state.counts[state.game];
  const isComplete = () => count() >= games[state.game].target;
  const feedback = (text) => { $('#game-feedback').textContent = text; };

  function updateProgress(extra = 0) {
    const game = games[state.game];
    $('#rep-count').textContent = count();
    $('#game-progress').style.width = `${Math.min(100, (count() + extra) / game.target * 100)}%`;
    $('.progress-track').setAttribute('aria-valuenow', count());
    $('#completed-count').textContent = `${state.counts.filter((n, i) => n >= games[i].target).length} / ${games.length}`;
    arena.style.setProperty('--climb-y', `${282 - (game.type === 'rope' ? count() * 14 : 0)}px`);
    arena.classList.toggle('grip-left', game.type === 'rope' && count() % 2 === 1);
    arena.classList.toggle('rope-complete', game.type === 'rope' && isComplete());
    document.querySelectorAll('[data-step]').forEach((el, i) => {
      const done = state.counts[i] >= games[i].target;
      el.classList.toggle('done', done);
      el.classList.toggle('current', i === state.game && !state.finished);
      el.querySelector('b').textContent = done ? '✓' : i === state.game ? '●' : '○';
      if (i === state.game) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
  }

  function renderGame() {
    stopHold();
    clearTimeout(animationTimer);
    busy = false;
    rowPulled = false;
    holdProgress = 0;
    const game = games[state.game];
    arena.classList.remove('burpeeing', 'flipping', 'pushing', 'pulling');
    arena.dataset.game = game.type;
    $('.arena-word').textContent = game.type === 'rope' ? 'TOCA EL CIELO' : 'BEAST MODE';
    $('#game-label').textContent = game.label;
    $('#game-title').textContent = game.title;
    $('#game-help').textContent = game.help;
    $('#arena-speech').textContent = game.speech;
    $('#rep-target').textContent = `/ ${game.target} ${game.unit}`;
    $('.progress-track').setAttribute('aria-valuemax', game.target);
    $('#rep-button').hidden = game.type !== 'burpee' || isComplete();
    $('#rep-button').disabled = false;
    $('#hold-button').hidden = game.type !== 'tire' || isComplete();
    $('#row-controls').hidden = game.type !== 'row' || isComplete();
    $('#climb-button').hidden = game.type !== 'rope' || isComplete();
    $('#pull-button').disabled = false;
    $('#return-button').disabled = true;
    $('#next-button').hidden = !isComplete();
    $('#next-button').innerHTML = state.game === lastGame ? 'Descubrir mi regalo <span>↓</span>' : 'Siguiente prueba <span>→</span>';
    feedback(state.finished ? 'WOD completado. Tu regalo te espera más abajo.' : 'A tu ritmo. Aquí lo importante es disfrutar.');
    updateProgress();
  }

  function pop(text) {
    const el = $('#rep-pop');
    clearTimeout(popTimer);
    el.textContent = text;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    popTimer = setTimeout(() => el.classList.remove('pop'), 800);
  }

  function addRep(amount = 1) {
    if (isComplete()) return;
    const game = games[state.game];
    state.counts[state.game] = Math.min(game.target, count() + amount);
    updateProgress();
    pop(game.type === 'rope' ? '+1 TRAMO' : amount === 10 ? '+10 M' : '+1 REP');
    const cheersIndex = game.type === 'row' ? Math.floor(count() / 10 - 1) % game.cheers.length : count() - 1;
    feedback(game.cheers[cheersIndex]);
    save();
    if (isComplete()) {
      stopHold();
      $('#rep-button').hidden = true;
      $('#hold-button').hidden = true;
      $('#row-controls').hidden = true;
      $('#climb-button').hidden = true;
      $('#next-button').hidden = false;
      $('#arena-speech').textContent = 'REP VÁLIDA. LEYENDA CONFIRMADA. ✓';
      $('#next-button').innerHTML = state.game === lastGame ? 'Descubrir mi regalo <span>↓</span>' : 'Siguiente prueba <span>→</span>';
      // Keep keyboard focus on a visible control after the last repetition.
      $('#next-button').focus({ preventScroll: true });
      if (state.game === lastGame) {
        state.finished = true;
        save();
        feedback('¡DING! Cuatro pruebas superadas. Ahora sí: te lo has ganado.');
        revealFinish(true);
      }
    }
  }

  $('#rep-button').addEventListener('click', () => {
    if (busy || isComplete() || state.game !== 0) return;
    busy = true;
    $('#rep-button').disabled = true;
    arena.classList.add('burpeeing');
    animationTimer = setTimeout(() => {
      arena.classList.remove('burpeeing');
      busy = false;
      $('#rep-button').disabled = false;
      addRep();
    }, reducedMotion.matches ? 100 : 750);
  });

  $('#climb-button').addEventListener('click', () => {
    if (games[state.game].type !== 'rope' || isComplete()) return;
    addRep();
  });

  function holdTick(now) {
    if (!holding) return;
    holdProgress += Math.min(now - holdStart, 80) / 950;
    holdStart = now;
    if (holdProgress >= 1) {
      holdProgress -= 1;
      arena.classList.remove('flipping');
      void arena.offsetWidth;
      arena.classList.add('flipping');
      addRep();
    }
    if (holding) {
      updateProgress(holdProgress);
      holdFrame = requestAnimationFrame(holdTick);
    }
  }
  function startHold() {
    if (holding || state.game !== 1 || isComplete()) return;
    holding = true;
    arena.classList.add('pushing');
    holdStart = performance.now();
    pressStarted = holdStart;
    holdFrame = requestAnimationFrame(holdTick);
  }
  function stopHold() {
    holding = false;
    cancelAnimationFrame(holdFrame);
    arena.classList.remove('pushing');
  }
  function finishPush() {
    const quickTap = holding && performance.now() - pressStarted < 220;
    stopHold();
    if (!quickTap || isComplete()) return;
    holdProgress += .34;
    if (holdProgress >= 1) {
      holdProgress -= 1;
      arena.classList.remove('flipping');
      void arena.offsetWidth;
      arena.classList.add('flipping');
      addRep();
    }
    updateProgress(holdProgress);
  }
  const holdButton = $('#hold-button');
  holdButton.style.touchAction = 'none';
  holdButton.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    holdButton.focus({ preventScroll: true });
    holdButton.setPointerCapture(event.pointerId);
    startHold();
  });
  holdButton.addEventListener('pointerup', finishPush);
  ['pointercancel', 'lostpointercapture'].forEach(type => holdButton.addEventListener(type, stopHold));
  holdButton.addEventListener('keydown', (event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); startHold(); } });
  holdButton.addEventListener('keyup', (event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); finishPush(); } });
  holdButton.addEventListener('blur', stopHold);
  holdButton.addEventListener('contextmenu', event => event.preventDefault());
  // Assistive technologies may activate a button without a pointer/key sequence.
  holdButton.addEventListener('click', event => { if (event.detail === 0 && !holding && !isComplete() && state.game === 1) addRep(); });
  window.addEventListener('blur', stopHold);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopHold(); });

  $('#pull-button').addEventListener('click', () => {
    if (rowPulled || isComplete() || state.game !== 2) return;
    rowPulled = true;
    arena.classList.add('pulling');
    $('#pull-button').disabled = true;
    $('#return-button').disabled = false;
    $('#return-button').focus({ preventScroll: true });
    feedback('¡Bien! Ahora vuelve para completar la remada.');
  });
  $('#return-button').addEventListener('click', () => {
    if (!rowPulled || isComplete() || state.game !== 2) return;
    rowPulled = false;
    arena.classList.remove('pulling');
    $('#pull-button').disabled = false;
    $('#return-button').disabled = true;
    $('#pull-button').focus({ preventScroll: true });
    addRep(10);
  });
  $('#next-button').addEventListener('click', () => {
    if (!isComplete()) return;
    if (state.game < lastGame) {
      state.game += 1;
      renderGame();
      save();
      const nextControl = { tire: holdButton, row: $('#pull-button'), rope: $('#climb-button') };
      nextControl[games[state.game].type].focus({ preventScroll: true });
    } else {
      $('#finish-banner').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      $('#finish-banner').focus({ preventScroll: true });
    }
  });

  const photos = [
    ['14e63ddc-e770-423a-b79a-28c94990b8ca', 'CADA REP CUENTA', 'Rubén levantando una barra por encima de la cabeza'],
    ['2b7a0fdf-20c8-48ee-ae9b-eb93290c8bd2', 'A POR LA SIGUIENTE OLA', 'Rubén surfeando'],
    ['2bda2aa3-8030-43c1-a1ba-86496db1a93e', 'SIN MIEDO A LAS ALTURAS', 'Rubén escalando con casco y arnés'],
    ['d9868545-84d0-4dc5-ac03-dc9d20bad574', 'LO BONITO ES EL CAMINO', 'Rubén celebrando su llegada a Santiago'],
    ['66adbe0a-3d22-42af-93bd-7c6af336d080', 'NADA SE TE RESISTE', 'Rubén volteando una rueda en competición'],
    ['02b19cbd-3af9-4a93-ba12-4024a6fdbc65', 'FUERZA Y CABEZA', 'Rubén entrenando en las anillas'],
    ['079e53c8-61f0-402a-bbf8-05ea56ecf40e', 'SIEMPRE UN PASO MÁS', 'Rubén haciendo senderismo'],
    ['2dacb00d-0cf0-4cef-b626-d01367902ec5', 'DÁNDOLO TODO', 'Rubén compitiendo con mancuernas'],
    ['be7dd997-b1eb-42a4-8321-c8e6e5e98a68', 'MODO BESTIA: ON', 'Rubén levantando pesas junto a una piscina'],
    ['544ebbcc-5672-4285-b3f5-ca500242a155', 'TU PRÓXIMA AVENTURA', 'Rubén en una vía ferrata'],
    ['a54976ae-6214-4972-b8b6-015c32ee4a7b', 'SUPERÁNDOTE SIEMPRE', 'Rubén entrenando colgado de una barra'],
    ['690c06ff-3ada-4704-9d7f-c2a6fe874275', 'QUE NO PAREN LAS OLAS', 'Rubén cogiendo una ola en el mar'],
    ['da944e2e-913c-416f-bfba-f90a832b9a7a', 'HASTA LA ÚLTIMA REP', 'Rubén compitiendo con cuerdas'],
    ['17b4c2d0-9eab-4d1e-a906-33e79c6eb857', 'ACTITUD DE CAMPEÓN', 'Rubén levantando una mancuerna al aire libre'],
    ['7cee6804-0887-45fe-9d74-925cc3147aa7', 'NUESTRO ATLETA FAVORITO', 'Rubén preparado para una sentadilla con barra'],
  ];
  let galleryBuilt = false;
  function revealFinish(celebrate = false) {
    $('#finish').hidden = false;
    $('#locked-reward').hidden = true;
    if (!galleryBuilt) {
      for (const [name, caption, alt] of photos) {
        const figure = document.createElement('figure');
        figure.className = 'memory-photo';
        const image = document.createElement('img');
        image.src = `assets/photos/${name}.jpeg`;
        image.alt = alt;
        image.loading = 'lazy';
        image.decoding = 'async';
        const label = document.createElement('figcaption');
        label.textContent = caption;
        figure.append(image, label);
        $('#photo-wall').append(figure);
      }
      galleryBuilt = true;
    }
    if (celebrate && !reducedMotion.matches) {
      const colors = ['#ff7043', '#efece1', '#b9c996', '#dfb944'];
      for (let i = 0; i < 55; i++) {
        const piece = document.createElement('i');
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * .8}s`;
        piece.style.setProperty('--drift', `${Math.random() * 250 - 125}px`);
        $('#confetti').append(piece);
      }
      setTimeout(() => $('#confetti').replaceChildren(), 4200);
    }
  }
  $('#voucher-button').addEventListener('click', () => {
    const open = $('#voucher').hidden;
    $('#voucher').hidden = !open;
    $('#voucher-button').setAttribute('aria-expanded', String(open));
    $('#voucher-button').innerHTML = open ? 'Cerrar cupón <span>−</span>' : 'Abrir mi cupón <span>↗</span>';
    if (open) $('#voucher').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });
  $('#copy-code').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#voucher-code').textContent);
      $('#copy-status').textContent = '¡Código copiado! Ahora toca dejarse cuidar.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#voucher-code'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      $('#copy-status').textContent = 'Código seleccionado. Mantén pulsado o usa Ctrl/Cmd + C para copiarlo.';
    }
  });
  $('#replay').addEventListener('click', () => {
    stopHold();
    state = newState();
    save();
    $('#finish').hidden = true;
    $('#voucher').hidden = true;
    $('#voucher-button').setAttribute('aria-expanded', 'false');
    $('#voucher-button').innerHTML = 'Abrir mi cupón <span>↗</span>';
    $('#copy-status').textContent = '';
    $('#locked-reward').hidden = false;
    renderGame();
    $('#wod').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    $('#rep-button').focus({ preventScroll: true });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  let scrollScheduled = false;
  const parallax = $('[data-parallax]');
  function updateParallax() {
    if (!reducedMotion.matches && window.scrollY < $('.hero').offsetHeight + 100) parallax.style.transform = `translateY(${Math.min(window.scrollY * .12, 110)}px)`;
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateParallax); } }, { passive: true });
  renderGame();
  if (state.finished) revealFinish();
})();
