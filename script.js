// Générateur de nombres avec Crypto, unicité et décimales
(function () {
  const form = document.getElementById('generator-form');
  const typeEl = document.getElementById('type');
  const minEl = document.getElementById('min');
  const maxEl = document.getElementById('max');
  const countEl = document.getElementById('count');
  const decimalsWrap = document.getElementById('decimals-wrap');
  const decimalsEl = document.getElementById('decimals');
  const uniqueEl = document.getElementById('unique');
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const btnCopy = document.getElementById('copy');
  const btnDownload = document.getElementById('download');

  const U32_MAX_PLUS_ONE = 4294967296; // 2^32

  function getRandomU32() {
    if (window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0];
    }
    // Fallback (moins sûr)
    return Math.floor(Math.random() * U32_MAX_PLUS_ONE);
  }

  function secureRandomIntInclusive(min, max) {
    // Génère un entier aléatoire uniforme dans [min, max]
    const range = max - min + 1;
    if (range <= 0 || !Number.isFinite(range)) throw new Error('Plage invalide');

    // Échantillonnage par rejet pour éviter le biais de modulo
    const limit = U32_MAX_PLUS_ONE - (U32_MAX_PLUS_ONE % range);
    let r;
    do {
      r = getRandomU32();
    } while (r >= limit);
    return min + (r % range);
  }

  function parseNumber(el) {
    const v = Number(el.value);
    return Number.isFinite(v) ? v : NaN;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.className = 'status' + (kind ? ' ' + kind : '');
  }

  function setActionsEnabled(enabled) {
    btnCopy.disabled = !enabled;
    btnDownload.disabled = !enabled;
  }

  function showResults(list) {
    resultsEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (const n of list) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = String(n);
      frag.appendChild(chip);
    }
    resultsEl.appendChild(frag);
    setActionsEnabled(list.length > 0);
  }

  function generateIntegers(min, max, count, unique) {
    const out = [];
    if (unique) {
      const space = Math.floor(max - min + 1);
      if (space <= 0) throw new Error('Plage invalide');
      if (count > space) {
        count = space;
        setStatus(`La quantité dépasse le nombre de valeurs possibles. Limité à ${space}.`, 'warn');
      }
      const used = new Set();
      while (out.length < count) {
        const n = secureRandomIntInclusive(min, max);
        if (!used.has(n)) {
          used.add(n);
          out.push(n);
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        out.push(secureRandomIntInclusive(min, max));
      }
    }
    return out;
  }

  function generateFloats(min, max, count, decimals, unique) {
    const scale = Math.pow(10, decimals);
    const minS = Math.ceil(min * scale);
    const maxS = Math.floor(max * scale);
    if (maxS < minS) throw new Error('Plage invalide pour ce nombre de décimales');

    const out = [];
    const toFloat = (n) => (n / scale).toFixed(decimals);

    if (unique) {
      const space = Math.floor(maxS - minS + 1);
      if (space <= 0) throw new Error('Plage invalide');
      if (count > space) {
        count = space;
        setStatus(`La quantité dépasse le nombre de valeurs possibles à ${decimals} décimales. Limité à ${space}.`, 'warn');
      }
      const used = new Set();
      while (out.length < count) {
        const n = secureRandomIntInclusive(minS, maxS);
        if (!used.has(n)) {
          used.add(n);
          out.push(toFloat(n));
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const n = secureRandomIntInclusive(minS, maxS);
        out.push(toFloat(n));
      }
    }
    return out;
  }

  function onTypeChange() {
    const type = typeEl.value;
    decimalsWrap.hidden = type !== 'float';
  }

  typeEl.addEventListener('change', onTypeChange);
  onTypeChange();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setStatus('', '');

    const type = typeEl.value;
    const min = parseNumber(minEl);
    const max = parseNumber(maxEl);
    let count = Math.max(1, Math.min(10000, Math.floor(parseNumber(countEl))));
    const unique = !!uniqueEl.checked;
    const decimals = Math.max(0, Math.min(10, Math.floor(parseNumber(decimalsEl) || 0)));

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      setStatus('Veuillez entrer des nombres valides pour min et max.', 'error');
      showResults([]);
      return;
    }
    if (min > max) {
      setStatus('Le minimum doit être inférieur ou égal au maximum.', 'error');
      showResults([]);
      return;
    }

    try {
      const list = type === 'int'
        ? generateIntegers(Math.ceil(min), Math.floor(max), count, unique)
        : generateFloats(min, max, count, decimals, unique);

      showResults(list);
      if (!statusEl.textContent) setStatus(`Généré ${list.length} valeur(s).`, 'ok');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Erreur lors de la génération.', 'error');
      showResults([]);
    }
  });

  btnCopy.addEventListener('click', async () => {
    const values = [...resultsEl.querySelectorAll('.chip')].map((el) => el.textContent);
    const text = values.join(', ');
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Résultats copiés dans le presse-papiers.', 'ok');
    } catch {
      setStatus('Impossible de copier automatiquement. Copiez manuellement.', 'warn');
    }
  });

  btnDownload.addEventListener('click', () => {
    const values = [...resultsEl.querySelectorAll('.chip')].map((el) => el.textContent);
    const blob = new Blob([values.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nombres.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('Téléchargement du fichier nombres.txt', 'ok');
  });

  form.addEventListener('reset', () => {
    setTimeout(() => {
      showResults([]);
      setStatus('Formulaire réinitialisé.', '');
      onTypeChange();
    }, 0);
  });
})();

