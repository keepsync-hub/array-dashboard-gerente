/* ===========================================================
   Tecnodata S.A. — Cockpit BSC 360° · Chat "Pregúntale a tus datos"
   Motor de Q&A 100% local (sin backend): interpreta la pregunta del CEO y
   responde con un diagnóstico construido sobre el grafo causal y los helpers
   de data.js. No hace llamadas externas → funciona en GitHub Pages.
   Requiere: data.js y app.js cargados antes (usa kpi, downstream, bottleneck,
   shortName, fmt, etc. desde el scope global).
   =========================================================== */

const CEOChat = (function () {

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const estadoTxt = st => st === 'ok' ? 'en meta' : st === 'warn' ? 'en riesgo' : st === 'bad' ? 'crítico' : 'sin dato';
  const chip = st => `<span class="c-chip c-${st}">${estadoTxt(st)}</span>`;
  const chainStr = ids => ids.map(id => `<span class="chip chip-${statusOf(kpi(id))}">${shortName(id)}</span>`).join('<span class="chain-arrow"> → </span>');
  const money = 'EBITDA';

  // Sinónimos → id de KPI
  const KPI_SYN = {
    ebitda:['ebitda','margen','rentabilidad','utilidad'],
    ing_presu:['presupuesto','ingresos','venta total','facturacion','cumplimiento de ingresos'],
    ing_recur:['recurrente','contratos recurrentes','ingreso recurrente','mrr'],
    dso:['dso','cobro','cobranza','cartera','dias de pago','morosidad'],
    nps:['nps','satisfaccion','recomendacion','experiencia cliente'],
    renovacion:['renovacion','retencion','churn','renovaciones'],
    market_share:['market share','participacion','cuota de mercado','mercado'],
    clientes_nuevos:['clientes nuevos','nuevos clientes','captacion'],
    sla:['sla','nivel de servicio','cumplimiento sla'],
    uptime:['uptime','disponibilidad','parque instalado','mif'],
    ftf:['first time fix','first-time-fix','ftf','reparacion a la primera','primera visita'],
    resp_tecnico:['tiempo de respuesta tecnico','respuesta tecnica','tiempo tecnico'],
    otif:['otif','entregas','despacho','entrega a tiempo'],
    rot_inventario:['inventario','rotacion de inventario','stock','repuestos'],
    leads:['leads','demanda','mql','sql','leads calificados','generacion de demanda'],
    conversion:['conversion','pipeline','cierre','tasa de cierre','embudo'],
    productividad:['productividad','productividad por ejecutivo','venta por vendedor'],
    preventa_tiempo:['preventa','tiempo de preventa','propuesta','propuestas','preventa tiempo','respuesta de preventa'],
    preventa_plazo:['propuestas dentro de plazo','plazo de propuestas'],
    preventa_poc:['poc','pocs','demo','demos','prueba de concepto'],
    certificacion:['certificacion','certificados','preingenieros'],
    capacitacion:['capacitacion','formacion','entrenamiento','horas de capacitacion'],
    rotacion:['rotacion de personal','rotacion voluntaria','fuga de talento','turnover'],
    enps:['enps','clima','engagement','satisfaccion interna'],
    adopcion:['adopcion','uso de crm','adopcion crm','herramientas digitales','digitalizacion']
  };
  // Sinónimos → área
  const AREA_SYN = {
    marketing:['marketing','mercadeo','demanda','campanas'],
    ventas:['ventas','comercial','vendedores','fuerza de venta'],
    logistica:['logistica','bodega','abastecimiento','supply','inventario'],
    servicio:['servicio tecnico','servicio','soporte','terreno','mesa de ayuda','post venta','postventa'],
    finanzas:['finanzas','financiero','finanza'],
    transversal:['personas','rrhh','recursos humanos','talento','capital humano']
  };
  const PERSP_SYN = {
    financiera:['financiera','financiero','finanzas','resultado','plata','dinero'],
    clientes:['clientes','cliente','mercado'],
    procesos:['procesos','operacion','operaciones','proceso interno','eficiencia'],
    aprendizaje:['aprendizaje','crecimiento','capacidades','personas','talento','capacitacion']
  };

  function detect(map, q) {
    const hits = [];
    for (const key in map) if (map[key].some(t => q.includes(t))) hits.push(key);
    return hits;
  }
  function findKpis(q) { return detect(KPI_SYN, q); }
  function findArea(q) { const h = detect(AREA_SYN, q); return h[0] || null; }
  function findPersp(q) { const h = detect(PERSP_SYN, q); return h[0] || null; }

  const reco = txt => `<div class="ans-reco"><span class="ans-reco-tag">Recomendación</span> ${txt}</div>`;

  /* ---------------- Generadores de respuesta ---------------- */

  function ansResumen() {
    const g = avgAttainment(DATA.kpis), gst = statusFromScore(g);
    const persps = DATA.perspectivas.map(p => ({ p, s: avgAttainment(kpisByPerspectiva(p.id)) }));
    const worst = persps.slice().sort((a, b) => a.s - b.s)[0];
    const bad = DATA.kpis.filter(k => statusOf(k) === 'bad').length;
    const warn = DATA.kpis.filter(k => statusOf(k) === 'warn').length;
    const bn = kpi(bottleneck());
    const top = topBrechas(3);
    return `El negocio está en <b>${pct(g)}</b> de salud global ${chip(gst)}.
      <ul class="ans-list">
        <li>Perspectiva más débil: <b>${worst.p.nombre}</b> (${pct(worst.s)}).</li>
        <li>Cuello de botella: <b>${bn.nombre}</b> — ${areaLabel(bn)}.</li>
        <li>Indicadores fuera de meta: <b>${bad}</b> críticos y <b>${warn}</b> en riesgo.</li>
      </ul>
      <div class="ans-sub">Prioridades del trimestre</div>
      <ol class="ans-list">${top.map(k => `<li><b>${k.nombre}</b> (${areaLabel(k)}) — ${fmt(k)} / meta ${fmtMeta(k)} ${chip(statusOf(k))}</li>`).join('')}</ol>
      ${reco(`Poner el foco en <b>${shortName(bn.id)}</b>: es la palanca que hoy más protege el ${money}.`)}`;
  }

  function ansBottleneck() {
    const id = bottleneck();
    if (!id) return 'No hay cuellos de botella activos: todos los indicadores clave están en meta.';
    const k = kpi(id);
    const chain = [id, ...downstream(id).filter(x => statusOf(kpi(x)) !== 'ok')];
    const enablers = upstream(id).filter(x => statusOf(kpi(x)) !== 'ok').sort((a, b) => gap(kpi(b)) - gap(kpi(a)));
    return `Tu cuello de botella es <b>${k.nombre}</b> (${areaLabel(k)}): <b>${fmt(k)}</b> vs meta ${fmtMeta(k)} ${chip(statusOf(k))}.
      <div class="ans-sub">Cómo se propaga</div>
      <div class="ans-chain">${chainStr(chain)}</div>
      ${enablers.length ? `<div class="ans-sub">Qué lo alimenta aguas arriba</div>
        <ul class="ans-list">${enablers.slice(0, 3).map(x => `<li>${shortName(x)} — ${fmt(kpi(x))} / meta ${fmtMeta(kpi(x))} ${chip(statusOf(kpi(x)))}</li>`).join('')}</ul>` : ''}
      ${reco(`Estandarizar y dar capacidad a <b>${areaLabel(k)}</b> desbloquea la conversión comercial y protege el ${money}. Es el movimiento de mayor retorno hoy.`)}`;
  }

  function ansOportunidades() {
    const cands = DATA.kpis.filter(k => statusOf(k) !== 'ok')
      .map(k => ({ k, imp: gap(k) * (downstreamProblemCount(k.id) + 1) * (downstream(k.id).some(x => kpi(x).perspectiva === 'financiera') ? 1.5 : 1) }))
      .sort((a, b) => b.imp - a.imp);
    const top = cands.slice(0, 3);
    // Quick win: brecha problemática sin causa aguas arriba fuera de meta (accionable de inmediato).
    const qw = cands.find(c => !(IN_edges(c.k.id).some(e => statusOf(kpi(e.de)) !== 'ok')));
    return `Tus mayores oportunidades, ordenadas por impacto en el resultado:
      <ol class="ans-list">
      ${top.map(({ k }) => {
        const tocaFin = downstream(k.id).some(x => kpi(x).perspectiva === 'financiera');
        return `<li><b>${k.nombre}</b> (${areaLabel(k)}) — ${fmt(k)} / meta ${fmtMeta(k)} ${chip(statusOf(k))}${tocaFin ? ` · <span class="muted">impacta el ${money}</span>` : ''}</li>`;
      }).join('')}
      </ol>
      ${qw ? reco(`Quick win: <b>${qw.k.nombre}</b> (${areaLabel(qw.k)}) es accionable de inmediato — no depende de otra área para moverse.`) : ''}`;
  }

  // Aristas entrantes (reconstruidas localmente para el quick win).
  function IN_edges(id) { return DATA.impactos.filter(e => e.a === id); }

  function ansCausa(id) {
    const k = kpi(id);
    const causes = upstream(id).filter(x => statusOf(kpi(x)) !== 'ok').sort((a, b) => gap(kpi(b)) - gap(kpi(a)));
    if (statusOf(k) === 'ok' && !causes.length)
      return `<b>${k.nombre}</b> está en meta (${fmt(k)} / ${fmtMeta(k)}) ${chip('ok')}. Sin causas críticas aguas arriba.`;
    const rootHint = causes.length ? causes[causes.length - 1] : null;
    return `<b>${k.nombre}</b> está en <b>${fmt(k)}</b> (meta ${fmtMeta(k)}) ${chip(statusOf(k))}.
      ${causes.length ? `<div class="ans-sub">Principales causas</div>
        <ul class="ans-list">${causes.slice(0, 3).map(x => `<li>${shortName(x)} — ${fmt(kpi(x))} / meta ${fmtMeta(kpi(x))} ${chip(statusOf(kpi(x)))}</li>`).join('')}</ul>
        <div class="ans-chain">${chainStr([...causes.slice(0, 3).reverse(), id])}</div>` : '<div class="muted">Sin causas aguas arriba fuera de meta.</div>'}
      ${rootHint ? reco(`Atacar la raíz — <b>${shortName(rootHint.id ? rootHint.id : rootHint)}</b> — es lo que destraba el resto de la cadena.`) : ''}`;
  }

  function ansImpacto(id) {
    const k = kpi(id);
    const out = downstream(id);
    if (!out.length) return `<b>${k.nombre}</b> no tiene efectos aguas abajo modelados: es un indicador de resultado.`;
    const fin = out.filter(x => kpi(x).perspectiva === 'financiera');
    return `Mejorar <b>${k.nombre}</b> (${areaLabel(k)}) se propaga así:
      <div class="ans-chain">${chainStr([id, ...out])}</div>
      ${fin.length ? `<div class="ans-note">Llega al resultado financiero: <b>${fin.map(shortName).join(', ')}</b>.</div>` : ''}
      ${reco(`Es una palanca con efecto sistémico: un avance aquí arrastra ${out.length} indicadores aguas abajo.`)}`;
  }

  function ansArea(area) {
    const ks = kpisByArea(area);
    if (!ks.length) return 'No tengo indicadores para esa área.';
    const s = avgAttainment(ks), st = statusFromScore(s);
    const enMeta = ks.filter(k => statusOf(k) === 'ok');
    const fuera = ks.filter(k => statusOf(k) !== 'ok').sort((a, b) => gap(b) - gap(a));
    const nombre = DATA.areas[area].nombre;
    return `<b>${nombre}</b> está en <b>${pct(s)}</b> ${chip(st)}.
      ${fuera.length ? `<div class="ans-sub">Lo que frena al área</div>
        <ul class="ans-list">${fuera.slice(0, 4).map(k => `<li><b>${k.nombre === undefined ? '' : (k.subarea === 'preventa' ? '⛔ ' : '')}${k.nombre}</b> — ${fmt(k)} / meta ${fmtMeta(k)} ${chip(statusOf(k))}</li>`).join('')}</ul>` : '<div class="ans-note">Sin brechas: el área está en meta.</div>'}
      ${enMeta.length ? `<div class="ans-note muted">En meta: ${enMeta.map(k => k.nombre).join(', ')}.</div>` : ''}
      ${fuera.length ? reco(`El freno principal del área es <b>${fuera[0].nombre}</b>. Actuar ahí mueve el resto.`) : ''}`;
  }

  function ansPersp(pid) {
    const ks = kpisByPerspectiva(pid), s = avgAttainment(ks), st = statusFromScore(s);
    const nombre = perspLabel(pid);
    // áreas que la arrastran
    const areas = [...new Set(ks.map(k => k.area))].map(a => ({ a, sc: avgAttainment(ks.filter(k => k.area === a)) })).sort((x, y) => x.sc - y.sc);
    const fuera = ks.filter(k => statusOf(k) !== 'ok').sort((a, b) => gap(b) - gap(a));
    return `La perspectiva <b>${nombre}</b> está en <b>${pct(s)}</b> ${chip(st)}.
      ${fuera.length ? `<div class="ans-sub">Indicadores fuera de meta</div>
        <ul class="ans-list">${fuera.slice(0, 4).map(k => `<li><b>${k.nombre}</b> (${areaLabel(k)}) — ${fmt(k)} / meta ${fmtMeta(k)} ${chip(statusOf(k))}</li>`).join('')}</ul>` : '<div class="ans-note">Todos los indicadores en meta.</div>'}
      ${areas.length > 1 ? reco(`El área que más arrastra esta perspectiva es <b>${DATA.areas[areas[0].a].nombre}</b> (${pct(areas[0].sc)}).`) : ''}`;
  }

  function ansKpi(id) {
    const k = kpi(id), st = statusOf(k), d = delta(k);
    const causes = upstream(id).filter(x => statusOf(kpi(x)) !== 'ok');
    const effects = downstream(id).filter(x => kpi(x).perspectiva === 'financiera');
    return `<b>${k.nombre}</b> (${areaLabel(k)}): <b>${fmt(k)}</b> vs meta ${fmtMeta(k)} ${chip(st)}.
      <div class="ans-note">${d.mejora ? 'Mejora' : 'Empeora'} respecto al periodo anterior (${d.texto.replace(/^[^ ]+ /, '')}). Fuente: ${DATA.fuentes[k.fuente].nombre}.</div>
      ${st !== 'ok' && causes.length ? `<div class="ans-note">Causas: ${causes.slice(0, 3).map(shortName).join(', ')}.</div>` : ''}
      ${st !== 'ok' && effects.length ? `<div class="ans-note">Si no se corrige, presiona: ${effects.map(shortName).join(', ')}.</div>` : ''}`;
  }

  function ansFuentes() {
    const usadas = [...new Set(DATA.kpis.map(k => k.fuente))];
    return `Cada indicador se alimenta de su sistema fuente (simulado):
      <ul class="ans-list">${usadas.map(f => `<li><b>${DATA.fuentes[f].nombre}</b> — <span class="muted">${DATA.fuentes[f].ej}</span></li>`).join('')}</ul>`;
  }

  function ansAyuda() {
    return `Puedo diagnosticar tu negocio a partir de los datos. Prueba con preguntas como:
      <ul class="ans-list">
        <li>¿Cuál es el principal cuello de botella?</li>
        <li>¿Dónde están mis mayores oportunidades de mejora?</li>
        <li>¿Por qué cae el EBITDA?</li>
        <li>¿Cómo va el área de Ventas?</li>
        <li>¿Qué impacto tiene mejorar la preventa?</li>
        <li>Dame un resumen ejecutivo del negocio.</li>
      </ul>`;
  }

  /* ---------------- Enrutamiento por intención ---------------- */
  function answer(text) {
    const q = norm(text);
    if (!q) return ansAyuda();
    const kpis = findKpis(q);

    if (/(fuente|origen del dato|de donde|que sistema|sistemas)/.test(q)) return ansFuentes();
    if (/(resumen|como estamos|como va el negocio|vision general|panorama|estado general|como vamos|overview|dashboard)/.test(q)) return ansResumen();
    if (/(impacto|si mejoro|que pasa si|si arreglo|si soluciono|beneficio de|efecto de|si subo|si aumento)/.test(q) && kpis.length) return ansImpacto(kpis[0]);
    if (/(por que|porque|causa|razon|a que se debe|motivo)/.test(q)) {
      if (kpis.length) return ansCausa(kpis[0]);
      // "por qué" sin KPI → asume el resultado financiero
      return ansCausa('ebitda');
    }
    if (/(cuello de botella|bottleneck|principal problema|mayor problema|que esta mal|que esta fallando|donde esta el problema|restriccion|traba|freno principal)/.test(q)) return ansBottleneck();
    if (/(oportunidad|mejorar|prioridad|prioridades|donde enfocar|quick win|donde invertir|palanca|donde poner el foco|que hago primero)/.test(q)) return ansOportunidades();

    const area = findArea(q);
    if (area && /(como va|estado|como esta|situacion|desempeno|salud|va el area|va la|resultados de)/.test(q)) return ansArea(area);
    const persp = findPersp(q);
    if (persp && /(como va|estado|como esta|situacion|perspectiva|salud)/.test(q)) return ansPersp(persp);

    if (kpis.length) return ansKpi(kpis[0]);
    if (area) return ansArea(area);
    if (persp) return ansPersp(persp);

    return `No estoy seguro de haber entendido la pregunta. ${ansAyuda()}`;
  }

  const SUGGESTIONS = [
    '¿Cuál es el principal cuello de botella?',
    '¿Dónde están mis mayores oportunidades?',
    '¿Por qué cae el EBITDA?',
    '¿Cómo va Ventas?',
    'Resumen ejecutivo',
    '¿Qué impacto tiene mejorar la preventa?'
  ];

  /* ---------------- Interfaz (DOM) ---------------- */
  let logEl, formEl, inputEl, suggestEl;

  function bubble(role, html) {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-' + role;
    const av = document.createElement('div');
    av.className = 'msg-av';
    av.textContent = role === 'user' ? 'CEO' : '◆';
    const body = document.createElement('div');
    body.className = 'msg-body';
    body.innerHTML = html;
    if (role === 'user') { wrap.appendChild(body); wrap.appendChild(av); }
    else { wrap.appendChild(av); wrap.appendChild(body); }
    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
    return wrap;
  }

  function ask(text) {
    if (!text.trim()) return;
    bubble('user', text.replace(/</g, '&lt;'));
    // pequeña pausa para simular "pensando"
    const think = bubble('bot', '<span class="typing"><i></i><i></i><i></i></span>');
    setTimeout(() => {
      think.querySelector('.msg-body').innerHTML = answer(text);
      logEl.scrollTop = logEl.scrollHeight;
    }, 260);
  }

  function renderSuggestions() {
    suggestEl.innerHTML = '';
    SUGGESTIONS.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sugg';
      b.textContent = s;
      b.addEventListener('click', () => ask(s));
      suggestEl.appendChild(b);
    });
  }

  function welcome() {
    const g = avgAttainment(DATA.kpis);
    const bn = kpi(bottleneck());
    bubble('bot', `Hola 👋 Soy tu asistente de datos. El negocio está en <b>${pct(g)}</b> de salud y hoy el principal freno es <b>${bn.nombre}</b> (${areaLabel(bn)}).
      <div class="ans-note">Pregúntame por un área, un indicador, las causas de un problema o las oportunidades de mejora. También puedes usar las sugerencias de abajo.</div>`);
  }

  function init() {
    logEl = document.getElementById('chat-log');
    formEl = document.getElementById('chat-form');
    inputEl = document.getElementById('chat-text');
    suggestEl = document.getElementById('chat-suggest');
    if (!logEl || !formEl) return;
    renderSuggestions();
    welcome();
    formEl.addEventListener('submit', ev => {
      ev.preventDefault();
      const t = inputEl.value;
      inputEl.value = '';
      ask(t);
    });
  }

  return { init, answer };
})();
