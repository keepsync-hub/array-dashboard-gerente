/* ===========================================================
   Tecnodata S.A. — Cockpit BSC 360° · Gerencia País
   Render del tablero en una sola vista (SVG puro, sin dependencias).
   Lee todo desde DATA (data.js). No define datos aquí.
   =========================================================== */

const SVGNS = 'http://www.w3.org/2000/svg';

// Etiquetas cortas para las píldoras del mapa estratégico.
const SHORT = {
  ing_presu:'Presupuesto', ing_recur:'Ingreso recurrente', ebitda:'EBITDA', dso:'DSO',
  nps:'NPS', renovacion:'Renovación', market_share:'Market share', clientes_nuevos:'Clientes nuevos',
  sla:'SLA', uptime:'Uptime', ftf:'First-time-fix', resp_tecnico:'Resp. técnica',
  otif:'OTIF', rot_inventario:'Inventario', leads:'Leads calif.', conversion:'Conversión',
  productividad:'Prod. ventas', preventa_tiempo:'Preventa · Tiempo', preventa_plazo:'Preventa · Plazo',
  preventa_poc:'Preventa · POC', certificacion:'Certificación', capacitacion:'Capacitación',
  rotacion:'Rotación pers.', enps:'eNPS', adopcion:'Adopción CRM/FSM'
};
function shortName(id) { return SHORT[id] || (kpi(id) ? kpi(id).nombre : id); }

// Estado de interacción del tablero.
const STATE = { filtro: null, chain: null };

/* ============================ Utilidades DOM ============================ */
function el(tag, attrs, children) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'html') n.innerHTML = attrs[k];
    else if (k === 'text') n.textContent = attrs[k];
    else if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
    else n.setAttribute(k, attrs[k]);
  }
  (children || []).forEach(c => c && n.appendChild(c));
  return n;
}
function svg(tag, attrs) {
  const n = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

function statusClass(s) { return s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : s === 'bad' ? 'bad' : 'na'; }
function makeDot(status) {
  return el('span', { class: 'dot dot-' + statusClass(status), title: labelEstado(status) });
}
function labelEstado(s) { return s === 'ok' ? 'En meta' : s === 'warn' ? 'En riesgo' : s === 'bad' ? 'Crítico' : 'Sin dato'; }

/* ============================ Sparkline ============================ */
function renderSparkline(container, values, status) {
  const W = 120, H = 32, pad = 3;
  const s = svg('svg', { class: 'spark', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' });
  const min = Math.min(...values), max = Math.max(...values);
  const span = (max - min) || 1;
  const stepX = (W - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = H - pad - ((v - min) / span) * (H - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const path = svg('path', { d, class: 'spark-line spark-' + statusClass(status), fill: 'none' });
  s.appendChild(path);
  const last = pts[pts.length - 1];
  s.appendChild(svg('circle', { cx: last[0].toFixed(1), cy: last[1].toFixed(1), r: 2.4, class: 'spark-dot spark-' + statusClass(status) }));
  container.appendChild(s);
}

/* ============================ Bullet (actual vs meta) ============================ */
function renderBullet(container, k) {
  const W = 150, H = 14;
  const s = svg('svg', { class: 'bullet', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' });
  const att = Math.min(attainment(k), 1.15);        // relleno proporcional (capado)
  const st = statusOf(k);
  // pista
  s.appendChild(svg('rect', { x: 0, y: H / 2 - 3, width: W, height: 6, rx: 3, class: 'bullet-track' }));
  // relleno
  s.appendChild(svg('rect', { x: 0, y: H / 2 - 3, width: (att / 1.15 * W).toFixed(1), height: 6, rx: 3, class: 'bullet-fill fill-' + statusClass(st) }));
  // tick de meta (siempre en 1.0 = meta => posición meta/1.15)
  const tx = (1 / 1.15) * W;
  s.appendChild(svg('line', { x1: tx.toFixed(1), y1: 1, x2: tx.toFixed(1), y2: H - 1, class: 'bullet-target' }));
  container.appendChild(s);
}

/* ============================ Pulso ejecutivo ============================ */
function renderPulso() {
  const wrap = document.getElementById('pulso');
  clear(wrap);
  DATA.destacados.forEach(id => {
    const k = kpi(id);
    const st = statusOf(k);
    const d = delta(k);
    const card = el('article', { class: 'card kpi' }, [
      el('div', { class: 'kpi-top' }, [
        makeDot(st),
        el('p', { class: 'kpi-label', text: k.nombre })
      ]),
      el('p', { class: 'kpi-value', text: fmt(k) }),
      el('p', { class: 'kpi-sub muted', text: 'Meta ' + fmtMeta(k) }),
      el('p', { class: 'kpi-delta ' + (d.mejora ? 'up' : 'down'), text: d.texto })
    ]);
    const sparkBox = el('div', { class: 'kpi-spark' });
    renderSparkline(sparkBox, k.trend, st);
    card.appendChild(sparkBox);
    wrap.appendChild(card);
  });
}

/* ============================ Mapa estratégico ============================ */
function renderStrategyMap() {
  const host = document.getElementById('smap');
  clear(host);

  const W = 760, padX = 18, titleH = 30, pillH = 30, rowGap = 12, bandGap = 24, pillGapX = 10;
  const usableW = W - padX * 2;
  const bnecks = bottlenecks(2);            // dos frentes críticos
  const bneckSet = new Set(bnecks);

  // Modo de énfasis:
  //  - Filtro por área  -> se resaltan las aristas que tocan esa área.
  //  - Si no hay filtro -> se enfocan las cadenas de los cuellos de botella (o
  //    la del clic). Evita la maraña de mostrar todas las aristas juntas.
  let chainSet = null;
  if (!STATE.filtro) {
    const base = STATE.chain || bnecks.reduce((acc, id) => acc.concat(id, upstream(id), downstream(id)), []);
    chainSet = new Set(base);
  }

  // 1) Layout por tier (perspectivas en el orden declarado: financiera arriba).
  const pos = {};   // id -> {cx, cy}
  const layout = [];
  let y = 14;
  DATA.perspectivas.forEach(p => {
    const ks = DATA.kpis.filter(k => k.perspectiva === p.id);
    const count = ks.length;
    const rows = count <= 4 ? 1 : Math.ceil(count / Math.ceil(count / 4));
    const perRow = Math.ceil(count / rows);
    const pillW = (usableW - (perRow - 1) * pillGapX) / perRow;
    const bandH = titleH + rows * pillH + (rows - 1) * rowGap + 14;
    const pills = ks.map((k, i) => {
      const row = Math.floor(i / perRow);
      const inRow = ks.slice(row * perRow, row * perRow + perRow).length;
      const col = i - row * perRow;
      const rowW = inRow * pillW + (inRow - 1) * pillGapX;
      const offX = padX + (usableW - rowW) / 2;
      const px = offX + col * (pillW + pillGapX);
      const py = y + titleH + row * (pillH + rowGap);
      pos[k.id] = { cx: px + pillW / 2, cy: py + pillH / 2 };
      return { k, px, py, pillW };
    });
    layout.push({ p, ks, top: y, bandH, pills });
    y += bandH + bandGap;
  });
  const totalH = y - bandGap + 14;

  const s = svg('svg', { class: 'smap-svg', viewBox: `0 0 ${W} ${totalH}`, role: 'img', 'aria-label': 'Mapa estratégico BSC con cadenas de impacto' });

  // defs: marcador de flecha
  const defs = svg('defs');
  ['arrow', 'arrow-lit'].forEach(id => {
    const m = svg('marker', { id, markerWidth: 7, markerHeight: 7, refX: 6, refY: 3, orient: 'auto', markerUnits: 'userSpaceOnUse' });
    m.appendChild(svg('path', { d: 'M0,0 L6,3 L0,6 Z', class: id === 'arrow-lit' ? 'edge-head-lit' : 'edge-head' }));
    defs.appendChild(m);
  });
  s.appendChild(defs);

  // 2) Bandas + títulos
  layout.forEach(band => {
    const score = avgAttainment(band.ks);
    const st = statusFromScore(score);
    s.appendChild(svg('rect', { x: padX - 8, y: band.top, width: usableW + 16, height: band.bandH, rx: 12, class: 'smap-tier tier-' + statusClass(st) }));
    const areasTxt = band.p.areas.map(a => (DATA.areas[a] || {}).nombre || a).join(' · ');
    const t = svg('text', { x: padX, y: band.top + 20, class: 'smap-tier-name' });
    t.textContent = band.p.nombre;
    s.appendChild(t);
    const sub = svg('text', { x: padX, y: band.top + 20, class: 'smap-tier-sub', 'text-anchor': 'end' });
    sub.setAttribute('x', W - padX);
    sub.textContent = 'Salud ' + (score == null ? '—' : Math.round(score * 100) + '%') + '  ·  ' + areasTxt;
    s.appendChild(sub);
  });

  // 3) Aristas (debajo de las píldoras)
  DATA.impactos.forEach(e => {
    const a = pos[e.de], b = pos[e.a];
    if (!a || !b) return;
    const srcSt = statusOf(kpi(e.de));
    const lit = srcSt !== 'ok';
    let prominente, dim;
    if (STATE.filtro) {
      const tocaArea = kpi(e.de).area === STATE.filtro || kpi(e.a).area === STATE.filtro;
      prominente = lit && tocaArea;
      dim = !tocaArea;
    } else {
      const inChain = chainSet.has(e.de) && chainSet.has(e.a);
      prominente = lit && inChain;
      dim = !prominente;                // fuera de la cadena enfocada => tenue
    }
    // Curva en S con desvío lateral para separar aristas paralelas.
    const midY = (a.cy + b.cy) / 2;
    const bow = ((e.de.charCodeAt(0) + e.a.length) % 5 - 2) * 10;
    const d = `M ${a.cx.toFixed(1)} ${a.cy.toFixed(1)} C ${(a.cx + bow).toFixed(1)} ${midY.toFixed(1)}, ${(b.cx + bow).toFixed(1)} ${midY.toFixed(1)}, ${b.cx.toFixed(1)} ${b.cy.toFixed(1)}`;
    const cls = ['edge'];
    if (prominente) cls.push('edge-lit edge-' + statusClass(srcSt) + ' is-chain');
    else cls.push('edge-faint');
    if (dim) cls.push('is-dim');
    const path = svg('path', { d, class: cls.join(' '), fill: 'none', 'marker-end': prominente ? 'url(#arrow-lit)' : 'url(#arrow)' });
    const tt = svg('title'); tt.textContent = e.regla; path.appendChild(tt);
    s.appendChild(path);
  });

  // 4) Píldoras (encima de las aristas)
  layout.forEach(band => {
    band.pills.forEach(({ k, px, py, pillW }) => {
      const st = statusOf(k);
      // Las píldoras conservan su color de estado (visión 360°). Solo se atenúan
      // al filtrar por un área distinta. La cadena enfocada se marca con anillo.
      const dim = STATE.filtro && k.area !== STATE.filtro;
      const inChain = chainSet && chainSet.has(k.id);
      const g = svg('g', { class: 'smap-node node-' + statusClass(st) + (dim ? ' is-dim' : '') + (inChain ? ' in-chain' : '') + (bneckSet.has(k.id) ? ' is-bottleneck' : ''), tabindex: 0 });
      g.appendChild(svg('rect', { x: px.toFixed(1), y: py.toFixed(1), width: pillW.toFixed(1), height: pillH, rx: 8, class: 'node-rect' }));
      // punto de estado
      g.appendChild(svg('circle', { cx: (px + 12).toFixed(1), cy: (py + pillH / 2).toFixed(1), r: 4, class: 'node-dot dot-' + statusClass(st) }));
      const label = svg('text', { x: (px + 22).toFixed(1), y: (py + pillH / 2 + 3.5).toFixed(1), class: 'node-label' });
      label.textContent = (bneckSet.has(k.id) ? '⛔ ' : '') + shortName(k.id);
      g.appendChild(label);
      const tt = svg('title');
      tt.textContent = `${areaLabel(k)} — ${k.nombre}\nActual ${fmt(k)} · Meta ${fmtMeta(k)} · Cumpl. ${pct(attainment(k))}\nFuente: ${DATA.fuentes[k.fuente].nombre}` + (bneckSet.has(k.id) ? '\n⛔ Cuello de botella del sistema' : '');
      g.appendChild(tt);
      g.addEventListener('click', () => highlightChain(k.id));
      g.addEventListener('keydown', ev => { if (ev.key === 'Enter') highlightChain(k.id); });
      s.appendChild(g);
    });
  });

  host.appendChild(s);
}

// Al hacer clic en una píldora: iluminar su vecindario causal (arriba y abajo).
function highlightChain(id) {
  STATE.chain = [id, ...upstream(id), ...downstream(id)];
  STATE.filtro = null;
  syncSidebar();
  renderStrategyMap();
  renderMatrix();
  renderBrechas();
}

/* ============================ Matriz de Salud 360° ============================ */
function matrixAreas() {
  // Áreas presentes en los datos, en orden fijo (las 5 del CM + Personas transversal).
  const order = ['marketing', 'ventas', 'logistica', 'servicio', 'finanzas', 'transversal'];
  return order.filter(a => DATA.kpis.some(k => k.area === a));
}

function renderMatrix() {
  const host = document.getElementById('matrix');
  clear(host);
  const areas = matrixAreas();
  const persps = DATA.perspectivas;

  const table = el('table', { class: 'matrix' });
  // encabezado
  const thead = el('thead');
  const hr = el('tr', {}, [el('th', { class: 'mx-corner', text: 'Área \\ Perspectiva' })]);
  persps.forEach(p => hr.appendChild(el('th', { class: 'mx-persp', text: p.nombre })));
  hr.appendChild(el('th', { class: 'mx-total', text: 'Salud área' }));
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = el('tbody');
  areas.forEach(area => {
    const areaKpis = DATA.kpis.filter(k => k.area === area);
    const expanded = STATE.expandArea === area;
    const dimRow = STATE.filtro && STATE.filtro !== area && area !== 'transversal';
    const tr = el('tr', { class: 'mx-row' + (expanded ? ' is-expanded' : '') + (dimRow ? ' is-dim' : '') });
    const an = DATA.areas[area];
    tr.appendChild(el('td', { class: 'mx-area' }, [
      el('span', { class: 'mx-ico', text: an.icono }),
      el('span', { text: an.nombre })
    ]));
    persps.forEach(p => {
      const score = cellScore(area, p.id);
      const st = statusFromScore(score);
      const imported = score != null && importedRisk(area, p.id);
      const td = el('td', { class: 'mx-cell cell-' + statusClass(st) + (imported ? ' is-imported' : '') });
      if (score == null) { td.textContent = '—'; td.className = 'mx-cell cell-na'; }
      else {
        td.textContent = Math.round(score * 100) + '%';
        const names = DATA.kpis.filter(k => k.area === area && k.perspectiva === p.id).map(k => '• ' + k.nombre + ' (' + pct(attainment(k)) + ')').join('\n');
        td.title = names + (imported ? '\n⚠ Riesgo importado desde otra área' : '');
      }
      tr.appendChild(td);
    });
    // salud del área
    const areaScore = avgAttainment(areaKpis);
    tr.appendChild(el('td', { class: 'mx-cell mx-total cell-' + statusClass(statusFromScore(areaScore)), text: areaScore == null ? '—' : Math.round(areaScore * 100) + '%' }));
    tr.addEventListener('click', () => { STATE.expandArea = expanded ? null : area; renderMatrix(); });
    tbody.appendChild(tr);

    // fila expandida con KPIs del área
    if (expanded) {
      const trx = el('tr', { class: 'mx-detail-row' });
      const td = el('td', { colspan: persps.length + 2 });
      const box = el('div', { class: 'mx-detail' });
      areaKpis.forEach(k => box.appendChild(kpiRow(k)));
      td.appendChild(box);
      trx.appendChild(td);
      tbody.appendChild(trx);
    }
  });

  // fila de salud por perspectiva
  const trf = el('tr', { class: 'mx-foot' });
  trf.appendChild(el('td', { class: 'mx-area', text: 'Salud perspectiva' }));
  persps.forEach(p => {
    const score = avgAttainment(kpisByPerspectiva(p.id));
    trf.appendChild(el('td', { class: 'mx-cell cell-' + statusClass(statusFromScore(score)), text: score == null ? '—' : Math.round(score * 100) + '%' }));
  });
  const glob = avgAttainment(DATA.kpis);
  trf.appendChild(el('td', { class: 'mx-cell mx-total cell-' + statusClass(statusFromScore(glob)), text: Math.round(glob * 100) + '%' }));
  tbody.appendChild(trf);

  table.appendChild(tbody);
  host.appendChild(table);
}

// Fila detallada de un KPI (nombre · valor/meta · bullet · spark · delta · fuente)
function kpiRow(k) {
  const st = statusOf(k);
  const d = delta(k);
  const row = el('div', { class: 'kpi-row' }, [
    makeDot(st),
    el('div', { class: 'kr-name' }, [
      el('span', { text: k.nombre }),
      el('span', { class: 'kr-src', text: DATA.fuentes[k.fuente].nombre })
    ]),
    el('div', { class: 'kr-val' }, [
      el('span', { class: 'kr-actual', text: fmt(k) }),
      el('span', { class: 'kr-meta muted', text: '/ ' + fmtMeta(k) })
    ])
  ]);
  const bulletBox = el('div', { class: 'kr-bullet' }); renderBullet(bulletBox, k); row.appendChild(bulletBox);
  const sparkBox = el('div', { class: 'kr-spark' }); renderSparkline(sparkBox, k.trend, st); row.appendChild(sparkBox);
  row.appendChild(el('div', { class: 'kr-delta ' + (d.mejora ? 'up' : 'down'), text: d.texto }));
  return row;
}

/* ============================ Brechas y cadenas ============================ */
function renderBrechas() {
  const host = document.getElementById('brechas');
  clear(host);
  const bneckSet = new Set(bottlenecks(2));
  const brechas = topBrechas(6, STATE.filtro);

  if (!brechas.length) {
    host.appendChild(el('p', { class: 'muted', text: 'Sin brechas en el filtro actual — todos los indicadores en meta.' }));
    return;
  }

  brechas.forEach(k => {
    const st = statusOf(k);
    const chain = orderedDownstreamProblems(k.id);
    const row = el('div', { class: 'brecha' + (bneckSet.has(k.id) ? ' is-bottleneck' : '') });

    const head = el('div', { class: 'brecha-head' }, [
      makeDot(st),
      el('div', { class: 'brecha-id' }, [
        el('span', { class: 'brecha-name', text: (bneckSet.has(k.id) ? '⛔ ' : '') + k.nombre }),
        el('span', { class: 'brecha-meta muted', text: areaLabel(k) + ' · ' + perspLabel(k.perspectiva) + ' · fuente ' + DATA.fuentes[k.fuente].nombre })
      ]),
      el('div', { class: 'brecha-val' }, [
        el('span', { class: 'kr-actual', text: fmt(k) }),
        el('span', { class: 'kr-meta muted', text: 'meta ' + fmtMeta(k) })
      ]),
      el('span', { class: 'pill pill-' + (st === 'bad' ? 'bad' : 'warn'), text: st === 'bad' ? 'Crítico' : 'En riesgo' })
    ]);
    const bulletBox = el('div', { class: 'brecha-bullet' }); renderBullet(bulletBox, k); head.insertBefore(bulletBox, head.lastChild);
    row.appendChild(head);

    // cadena de impacto aguas abajo
    if (chain.length) {
      const chBox = el('div', { class: 'chain' });
      chBox.appendChild(el('span', { class: 'chain-lbl', text: 'Impacto sistémico:' }));
      const seq = [k.id, ...chain];
      seq.forEach((id, i) => {
        if (i) chBox.appendChild(el('span', { class: 'chain-arrow', text: '→' }));
        chBox.appendChild(el('span', { class: 'chip chip-' + statusClass(statusOf(kpi(id))), text: shortName(id) }));
      });
      row.appendChild(chBox);
    }
    row.addEventListener('click', () => {
      STATE.chain = [k.id, ...downstream(k.id)];
      STATE.filtro = null; syncSidebar();
      renderStrategyMap(); renderMatrix(); renderBrechas();
      document.getElementById('smap').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    host.appendChild(row);
  });
}

/* ============================ Diagnóstico (encabezado) ============================ */
function renderDiagnostico() {
  const host = document.getElementById('diagnostico');
  if (!host) return;
  clear(host);
  const ids = bottlenecks(2);
  if (!ids.length) { host.appendChild(el('span', { text: 'Sin cuellos de botella activos.' })); return; }

  const titulo = ids.length > 1 ? `${ids.length} frentes críticos` : 'Cuello de botella';
  host.appendChild(el('div', { class: 'diag-title' }, [
    el('span', { class: 'diag-badge', text: '⛔ ' + titulo })
  ]));

  ids.forEach(bId => {
    const b = kpi(bId);
    const chain = [bId, ...orderedDownstreamProblems(bId)];
    const cadena = chain.map(id => shortName(id)).join(' → ');
    host.appendChild(el('div', { class: 'diag-item', html:
      `<strong>${b.nombre}</strong> (${areaLabel(b)}) arrastra la cadena <em>${cadena}</em>.` }));
  });
}

/* ============================ Sidebar / filtro ============================ */
function buildSidebarFilter() {
  const nav = document.getElementById('area-filter');
  if (!nav) return;
  clear(nav);
  const items = [{ id: null, nombre: 'Todas las áreas', icono: '🌐' }]
    .concat(['marketing', 'ventas', 'logistica', 'servicio', 'finanzas'].map(a => ({ id: a, nombre: DATA.areas[a].nombre, icono: DATA.areas[a].icono })));
  items.forEach(it => {
    const a = el('a', { class: 'nav-item', href: '#', 'data-area': it.id || '' }, [
      el('span', { class: 'nav-ico', text: it.icono }),
      el('span', { text: it.nombre })
    ]);
    a.addEventListener('click', ev => {
      ev.preventDefault();
      STATE.filtro = it.id; STATE.chain = null; STATE.expandArea = it.id;
      syncSidebar(); renderStrategyMap(); renderMatrix(); renderBrechas();
    });
    nav.appendChild(a);
  });
  syncSidebar();
}
function syncSidebar() {
  document.querySelectorAll('#area-filter .nav-item').forEach(a => {
    const val = a.getAttribute('data-area') || null;
    a.classList.toggle('is-active', val === STATE.filtro);
  });
}

/* ============================ Banda ejecutiva (CEO) ============================ */
function renderExecBand() {
  // Salud global + delta vs periodo anterior + conteos de excepción
  const gEl = document.getElementById('exec-global');
  if (gEl) {
    const g = avgAttainment(DATA.kpis);
    const gPrev = avgAttainmentPrev(DATA.kpis);
    const st = statusFromScore(g);
    clear(gEl);
    gEl.appendChild(makeDot(st));
    gEl.appendChild(el('span', { class: 'exec-h-num', text: Math.round(g * 100) + '%' }));
    const diff = Math.round((g - gPrev) * 1000) / 10;   // puntos de salud, 1 decimal
    const up = diff >= 0;
    gEl.appendChild(el('span', {
      class: 'exec-h-delta ' + (up ? 'up' : 'down'),
      text: `${up ? '▲' : '▼'} ${Math.abs(diff).toLocaleString('es-CL')} pts vs per. anterior`
    }));
    const bad = DATA.kpis.filter(k => statusOf(k) === 'bad').length;
    const warn = DATA.kpis.filter(k => statusOf(k) === 'warn').length;
    const ew = earlyWarnings().length;
    gEl.appendChild(el('span', { class: 'exec-h-counts muted',
      text: `${bad} críticos · ${warn} en riesgo · ${ew} alertas tempranas` }));
  }
  // EBITDA como salud financiera del negocio (desde el business plan)
  const eEl = document.getElementById('exec-ebitda');
  const bpE = ((DATA.bp || {}).metricas || []).find(m => m.destacado);
  if (eEl && bpE) {
    clear(eEl);
    const c = bpCumpl(bpE, 'ytd');
    const st = statusFromScore(c);
    eEl.appendChild(el('span', { class: 'exec-h-label', text: 'EBITDA · salud financiera' }));
    const val = el('span', { class: 'exec-e-value' }, [
      makeDot(st),
      el('span', { class: 'exec-e-num', text: bpE.margen ? bpVal({ tipo: 'pct', ytd: bpE.margen.ytd }, 'ytd') : bpVal(bpE, 'ytd') })
    ]);
    eEl.appendChild(val);
    eEl.appendChild(el('span', { class: 'exec-e-sub muted',
      text: `${bpVal(bpE, 'ytd')} YTD · ${pct(c)} del plan · ${bpVsPy(bpE, 'ytd').texto} vs año ant.` }));
  }
  // Chips por perspectiva
  const pWrap = document.getElementById('exec-persps');
  if (pWrap) {
    clear(pWrap);
    DATA.perspectivas.forEach(p => {
      const s = avgAttainment(kpisByPerspectiva(p.id));
      const st = statusFromScore(s);
      pWrap.appendChild(el('div', { class: 'exec-chip chip-tone-' + statusClass(st) }, [
        el('span', { class: 'exec-chip-name', text: p.nombre }),
        el('span', { class: 'exec-chip-val' }, [makeDot(st), el('span', { text: Math.round(s * 100) + '%' })])
      ]));
    });
  }
}

/* ============================ Business Plan (financiero) ============================ */
// Venta, Facturación, Margen y EBITDA: mes y YTD vs plan, y vs año anterior.
function renderBP() {
  const host = document.getElementById('bp');
  if (!host || !DATA.bp) return;
  clear(host);
  const nota = document.getElementById('bp-nota');
  if (nota) nota.textContent = DATA.bp.nota;

  DATA.bp.metricas.forEach(m => {
    const cMes = bpCumpl(m, 'mes'), cYtd = bpCumpl(m, 'ytd');
    const tile = el('article', { class: 'bp-tile' + (m.destacado ? ' is-star' : '') });

    tile.appendChild(el('div', { class: 'bp-top' }, [
      el('span', { class: 'bp-name', text: m.nombre }),
      m.destacado ? el('span', { class: 'bp-star', text: '★ Salud financiera' }) : null
    ]));

    // Valor del mes en grande (+ margen EBITDA como subdato)
    const val = el('p', { class: 'bp-value' }, [
      el('span', { text: bpVal(m, 'mes') }),
      el('span', { class: 'bp-per muted', text: ' mes' })
    ]);
    tile.appendChild(val);
    if (m.margen) tile.appendChild(el('p', { class: 'bp-sub muted',
      text: `margen ${bpVal({ tipo: 'pct', mes: m.margen.mes }, 'mes')} mes · ${bpVal({ tipo: 'pct', ytd: m.margen.ytd }, 'ytd')} YTD` }));

    const rows = el('div', { class: 'bp-rows' });
    const row = (lbl, right) => el('div', { class: 'bp-row' }, [
      el('span', { class: 'bp-row-lbl muted', text: lbl }), right
    ]);
    rows.appendChild(row('Mes vs plan', el('span', { class: 'bp-row-val' }, [
      makeDot(statusFromScore(cMes)),
      el('span', { text: pctBP(cMes) }),
      el('span', { class: 'muted bp-plan', text: 'plan ' + bpVal(m, 'mes', 'plan') })
    ])));
    rows.appendChild(row('YTD vs plan', el('span', { class: 'bp-row-val' }, [
      makeDot(statusFromScore(cYtd)),
      el('span', { text: pctBP(cYtd) }),
      el('span', { class: 'muted bp-plan', text: bpVal(m, 'ytd') + ' / ' + bpVal(m, 'ytd', 'plan') })
    ])));
    const gMes = bpVsPy(m, 'mes'), gYtd = bpVsPy(m, 'ytd');
    rows.appendChild(row('Mes vs año ant.', el('span', { class: 'bp-row-val ' + (gMes.up ? 'up' : 'down'), text: (gMes.up ? '▲ ' : '▼ ') + gMes.texto })));
    rows.appendChild(row('YTD vs año ant.', el('span', { class: 'bp-row-val ' + (gYtd.up ? 'up' : 'down'), text: (gYtd.up ? '▲ ' : '▼ ') + gYtd.texto })));
    tile.appendChild(rows);

    host.appendChild(tile);
  });
}

/* ============================ Alertas tempranas ============================ */
// KPIs aún en meta pero empeorando: lo que el semáforo verde esconde.
function renderAlertas() {
  const host = document.getElementById('alertas');
  if (!host) return;
  clear(host);
  const ew = earlyWarnings();
  if (!ew.length) { host.style.display = 'none'; return; }
  host.style.display = '';
  host.appendChild(el('span', { class: 'alertas-badge', text: '📉 Alertas tempranas' }));
  const list = el('div', { class: 'alertas-list' });
  ew.forEach(k => {
    const streak = stallStreak(k);
    const item = el('span', { class: 'alerta-item',
      title: `${k.nombre}: ${fmt(k)} (meta ${fmtMeta(k)}) — aún en meta, pero empeora vs el periodo anterior.` }, [
      el('b', { text: k.nombre }),
      el('span', { class: 'muted', text: ` ${fmt(k)} · en meta, ${streak > 1 ? streak + ' periodos sin mejorar' : 'empeorando'}` })
    ]);
    list.appendChild(item);
  });
  host.appendChild(list);
  host.appendChild(el('span', { class: 'alertas-hint muted', text: 'Atender antes de que salgan de meta.' }));
}

/* ============================ Planes de acción ============================ */
function renderPlanes() {
  const host = document.getElementById('planes');
  if (!host) return;
  clear(host);
  (DATA.planes || []).forEach(p => {
    const root = kpi(p.kpi);
    const st = statusOf(root);
    const card = el('article', { class: 'plan' });

    card.appendChild(el('div', { class: 'plan-head' }, [
      el('span', { class: 'plan-frente', text: p.frente }),
      el('span', { class: 'pill pill-' + (st === 'bad' ? 'bad' : 'warn'), text: labelEstado(st) })
    ]));
    card.appendChild(el('h3', { class: 'plan-title', text: p.titulo }));
    card.appendChild(el('p', { class: 'plan-obj' }, [
      el('span', { class: 'plan-obj-tag', text: 'Objetivo' }),
      el('span', { text: ' ' + p.objetivo })
    ]));

    const ol = el('ol', { class: 'plan-acciones' });
    p.acciones.forEach(a => {
      ol.appendChild(el('li', {}, [
        el('span', { text: a.txt }),
        el('span', { class: 'plan-meta muted', text: `${a.resp} · ${a.plazo}` })
      ]));
    });
    card.appendChild(ol);

    const chBox = el('div', { class: 'chain' });
    chBox.appendChild(el('span', { class: 'chain-lbl', text: 'Impacto esperado:' }));
    p.impacto.forEach((id, i) => {
      if (i) chBox.appendChild(el('span', { class: 'chain-arrow', text: '→' }));
      chBox.appendChild(el('span', { class: 'chip chip-' + statusClass(statusOf(kpi(id))), text: shortName(id) }));
    });
    card.appendChild(chBox);

    const btn = el('button', { class: 'btn plan-ask', type: 'button', text: '💬 Preguntar por este plan' });
    btn.addEventListener('click', () => {
      if (typeof CEOChat !== 'undefined' && CEOChat.ask) {
        CEOChat.ask(`¿Qué plan de acción hay para ${root.nombre}?`);
        const chat = document.querySelector('.chat-card');
        if (chat) chat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    card.appendChild(btn);

    host.appendChild(card);
  });
}

/* ============================ Orquestación ============================ */
function renderAll() {
  renderExecBand();
  renderBP();
  renderDiagnostico();
  renderAlertas();
  renderPlanes();
  renderPulso();
  renderStrategyMap();
  renderMatrix();
  renderBrechas();
}

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const periodEl = document.getElementById('periodo');
  if (periodEl) periodEl.textContent = DATA.meta.periodo + ' · datos ficticios';

  buildSidebarFilter();
  // Al cargar: visión 360° completa (todas las cadenas encendidas + cuello de
  // botella señalado). El foco sobre una cadena se activa al hacer clic.
  STATE.chain = null;
  renderAll();

  // Chat "Pregúntale a tus datos" (motor local en chat.js)
  if (typeof CEOChat !== 'undefined') CEOChat.init();
});
