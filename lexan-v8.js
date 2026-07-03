(() => {
  'use strict';

  const T = window.LEXAN_TABLE;
  const $ = (id) => document.getElementById(id);

  const state = {
    thickness: '2T',
    color: '블루',
    total: 0
  };

  const els = {
    thicknessOptions: $('thicknessOptions'),
    colorOptions: $('colorOptions'),
    width: $('width'),
    height: $('height'),
    qty: $('qty'),
    minus: $('minus'),
    plus: $('plus'),
    area: $('area'),
    total: $('total'),
    sizeText: $('sizeText'),
    thicknessText: $('thicknessText'),
    colorText: $('colorText'),
    basis: $('basis'),
    unit: $('unit'),
    qtyText: $('qtyText'),
    copy: $('copy'),
    toggleTable: $('toggleTable'),
    tables: $('tables'),
    table2: $('table2'),
    table3: $('table3')
  };

  function comma(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function won(n) {
    return comma(n) + '원';
  }

  function roundUp(n, unit) {
    return Math.ceil(n / unit) * unit;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function bracket(arr, value) {
    if (value <= arr[0]) return [0, 1];
    if (value >= arr[arr.length - 1]) return [arr.length - 2, arr.length - 1];
    for (let i = 0; i < arr.length - 1; i++) {
      if (value >= arr[i] && value <= arr[i + 1]) return [i, i + 1];
    }
    return [0, 1];
  }

  function interpolatePrice(thickness, width, height) {
    const widths = T.widths;
    const heights = T.heights;
    const table = T.prices[thickness];

    const [x1i, x2i] = bracket(widths, width);
    const [y1i, y2i] = bracket(heights, height);

    const x1 = widths[x1i];
    const x2 = widths[x2i];
    const y1 = heights[y1i];
    const y2 = heights[y2i];

    const tx = (width - x1) / (x2 - x1);
    const ty = (height - y1) / (y2 - y1);

    const q11 = table[y1i][x1i];
    const q21 = table[y1i][x2i];
    const q12 = table[y2i][x1i];
    const q22 = table[y2i][x2i];

    const top = lerp(q11, q21, tx);
    const bottom = lerp(q12, q22, tx);

    return {
      value: lerp(top, bottom, ty),
      basis: `가로 ${x1}~${x2} / 세로 ${y1}~${y2} 비례계산`
    };
  }

  function setTotal(next) {
    els.total.textContent = won(next);
    state.total = next;
  }

  function updateActiveButtons() {
    [...els.thicknessOptions.children].forEach(btn => {
      btn.classList.toggle('isActive', btn.dataset.value === state.thickness);
    });
    [...els.colorOptions.children].forEach(btn => {
      btn.classList.toggle('isActive', btn.dataset.value === state.color);
    });
  }

  function renderOptionButtons() {
    els.thicknessOptions.innerHTML = '';
    els.colorOptions.innerHTML = '';

    T.thickness.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'optBtn';
      btn.dataset.value = value;
      btn.textContent = value;
      btn.addEventListener('click', () => {
        state.thickness = value;
        updateActiveButtons();
        calculate();
      });
      els.thicknessOptions.appendChild(btn);
    });

    T.colors.forEach(value => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'optBtn';
      btn.dataset.value = value;
      btn.textContent = value;
      btn.addEventListener('click', () => {
        state.color = value;
        updateActiveButtons();
        calculate();
      });
      els.colorOptions.appendChild(btn);
    });

    updateActiveButtons();
  }

  function renderTable(tableEl, thickness) {
    const rows = T.prices[thickness];
    let html = '<tr><th>세로\\가로</th>' + T.widths.map(w => `<th>${w}</th>`).join('') + '</tr>';
    rows.forEach((row, i) => {
      html += `<tr><th>${T.heights[i]}</th>` + row.map(v => `<td>${comma(v)}</td>`).join('') + '</tr>';
    });
    tableEl.innerHTML = html;
  }

  function resetResult(qty) {
    setTotal(0);
    els.area.textContent = '0.000㎡';
    els.sizeText.textContent = '사이즈를 입력해주세요';
    els.basis.textContent = '사이즈를 입력해주세요';
    els.unit.textContent = '0원';
    els.qtyText.textContent = qty + '장';
    els.thicknessText.textContent = state.thickness;
    els.colorText.textContent = state.color;
  }

  function calculate() {
    const widthRaw = String(els.width.value).trim();
    const heightRaw = String(els.height.value).trim();
    const qty = Math.max(1, Number(els.qty.value || 1));

    if (!widthRaw || !heightRaw) {
      resetResult(qty);
      return { width: 0, height: 0, qty, unit: 0, total: 0, basis: '사이즈를 입력해주세요', area: '0.000' };
    }

    const width = Math.max(0, Number(widthRaw));
    const height = Math.max(0, Number(heightRaw));

    if (!width || !height) {
      resetResult(qty);
      return { width: 0, height: 0, qty, unit: 0, total: 0, basis: '사이즈를 입력해주세요', area: '0.000' };
    }

    const result = interpolatePrice(state.thickness, width, height);
    const unit = roundUp(result.value, T.roundUnit);
    const total = unit * qty;
    const area = ((width * height) / 1000000).toFixed(3);

    setTotal(total);
    els.area.textContent = area + '㎡';
    els.sizeText.textContent = `${width} × ${height}mm`;
    els.thicknessText.textContent = state.thickness;
    els.colorText.textContent = state.color;
    els.basis.textContent = result.basis;
    els.unit.textContent = won(unit);
    els.qtyText.textContent = qty + '장';

    return { width, height, qty, unit, total, basis: result.basis, area };
  }

  async function copyEstimate() {
    const r = calculate();
    const text = `강동자바라 렉산 재단 견적 문의\n\n두께: ${state.thickness}\n색상: ${state.color}\n가로: ${r.width}mm\n세로: ${r.height}mm\n면적: ${r.area}㎡\n수량: ${r.qty}장\n계산기준: ${r.basis}\n장당 금액: ${won(r.unit)}\n예상금액: ${won(r.total)}\n배송비: 착불\n\n문의: 010-7595-0484\n네이버 톡톡: https://talk.naver.com/ct/w4a85f?frm=psf`;

    try {
      await navigator.clipboard.writeText(text);
      alert('견적내용이 복사되었습니다.');
    } catch (e) {
      prompt('아래 내용을 복사해주세요.', text);
    }
  }

  function bindEvents() {
    [els.width, els.height, els.qty].forEach(el => el.addEventListener('input', calculate));

    els.minus.addEventListener('click', () => {
      els.qty.value = Math.max(1, Number(els.qty.value || 1) - 1);
      calculate();
    });

    els.plus.addEventListener('click', () => {
      els.qty.value = Number(els.qty.value || 1) + 1;
      calculate();
    });

    els.copy.addEventListener('click', copyEstimate);
    els.toggleTable.addEventListener('click', () => els.tables.classList.toggle('open'));
  }

  function init() {
    renderOptionButtons();
    renderTable(els.table2, '2T');
    renderTable(els.table3, '3T');
    bindEvents();
    calculate();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
