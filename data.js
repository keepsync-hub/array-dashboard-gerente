/* ===========================================================
   Tecnodata S.A. — Cockpit BSC 360° · Gerencia País
   Fuente ÚNICA de datos del tablero (datos ficticios de demostración).

   Para editar indicadores: modificar SOLO este archivo.
   Cada KPI declara su origen de dato simulado (CRM / ERP / ITSM / HRIS / ...).
   =========================================================== */

const DATA = {
  meta: {
    empresa: 'Tecnodata S.A.',
    unidad: 'Gerencia País',
    periodo: 'Agosto 2026',
    // Umbrales de semáforo sobre el cumplimiento (actual/meta, invertido si sentido='down')
    umbrales: { verde: 0.95, ambar: 0.85 }
  },

  // Perspectivas del Balanced Scorecard, en orden de lectura del mapa (arriba -> abajo).
  perspectivas: [
    { id: 'financiera',  nombre: 'Financiera',              areas: ['finanzas'] },
    { id: 'clientes',    nombre: 'Clientes',                areas: ['ventas', 'marketing'] },
    { id: 'procesos',    nombre: 'Procesos Internos',       areas: ['logistica', 'servicio', 'ventas', 'marketing'] },
    { id: 'aprendizaje', nombre: 'Aprendizaje y Crecimiento', areas: ['transversal'] }
  ],

  // Las 5 áreas a cargo del country manager (+ 'transversal' para RRHH/Aprendizaje).
  areas: {
    marketing:   { nombre: 'Marketing',        icono: '📣' },
    ventas:      { nombre: 'Ventas',           icono: '📈' },
    logistica:   { nombre: 'Logística',        icono: '🚚' },
    servicio:    { nombre: 'Servicio Técnico', icono: '🛠️' },
    finanzas:    { nombre: 'Finanzas',         icono: '💰' },
    transversal: { nombre: 'Personas (RRHH)',  icono: '👥' }
  },

  // Orígenes de dato simulados (leyenda de fuentes).
  fuentes: {
    CRM:       { nombre: 'CRM',            ej: 'Salesforce / Dynamics 365' },
    CPQ:       { nombre: 'CRM · CPQ',      ej: 'Configurador de propuestas (preventa)' },
    ERP:       { nombre: 'ERP',            ej: 'SAP / Oracle' },
    ITSM:      { nombre: 'ITSM / Mesa de Ayuda (ITIL)', ej: 'ServiceNow / Remedy' },
    FSM:       { nombre: 'FSM (Terreno)',  ej: 'Field Service Management' },
    HRIS:      { nombre: 'HRIS / RRHH',    ej: 'Workday / BUK' },
    CX:        { nombre: 'CX / Encuestas', ej: 'Qualtrics / Medallia' },
    MERCADO:   { nombre: 'Estudio de mercado', ej: 'IDC / Consultora externa' },
    TELEMETRIA:{ nombre: 'Telemetría de plataformas', ej: 'Logs de uso CRM/FSM' }
  },

  /* ---- Catálogo de indicadores -------------------------------------------
     Campos:
       id, nombre, perspectiva, area, subarea?, unidad, formato,
       actual, meta, prev (periodo anterior), sentido ('up'|'down'),
       fuente (clave de DATA.fuentes), trend (8 puntos)
     'sentido:down' => menos es mejor (DSO, tiempos, rotación de personal).
  ------------------------------------------------------------------------- */
  kpis: [
    // ===== FINANCIERA =====
    { id:'ing_presu', nombre:'Ingresos vs presupuesto', perspectiva:'financiera', area:'finanzas',
      unidad:'%', formato:'pct1', actual:96.2, meta:100, prev:94.1, sentido:'up', fuente:'ERP',
      trend:[92,93,91,94,95,93,95,96.2] },
    { id:'ing_recur', nombre:'Ingresos recurrentes (contratos)', perspectiva:'financiera', area:'finanzas',
      unidad:'%', formato:'pct0', actual:68, meta:70, prev:66, sentido:'up', fuente:'ERP',
      trend:[60,62,63,64,65,66,67,68] },
    { id:'ebitda', nombre:'Margen EBITDA', perspectiva:'financiera', area:'finanzas',
      unidad:'%', formato:'pct1', actual:12.8, meta:14, prev:13.4, sentido:'up', fuente:'ERP',
      trend:[14.1,13.9,13.6,13.4,13.2,13.0,12.9,12.8] },
    { id:'dso', nombre:'DSO (días de cobro)', perspectiva:'financiera', area:'finanzas',
      unidad:'días', formato:'int', actual:62, meta:55, prev:59, sentido:'down', fuente:'ERP',
      trend:[54,55,57,56,58,59,61,62] },
    { id:'costo_servicio', nombre:'Costo de servicio en terreno', perspectiva:'financiera', area:'servicio',
      unidad:'', formato:'pct0', actual:122, meta:100, prev:114, sentido:'down', fuente:'ERP',
      trend:[104,106,109,112,114,117,120,122] },

    // ===== CLIENTES =====
    { id:'nps', nombre:'NPS', perspectiva:'clientes', area:'marketing',
      unidad:'pts', formato:'int', actual:54, meta:60, prev:57, sentido:'up', fuente:'CX',
      trend:[61,60,59,58,58,57,55,54] },
    { id:'renovacion', nombre:'Renovación de contratos', perspectiva:'clientes', area:'ventas',
      unidad:'%', formato:'pct0', actual:91, meta:93, prev:92, sentido:'up', fuente:'CRM',
      trend:[93,93,92,92,92,92,91,91] },
    { id:'market_share', nombre:'Market share', perspectiva:'clientes', area:'marketing',
      unidad:'%', formato:'pct1', actual:23.4, meta:25, prev:23.6, sentido:'up', fuente:'MERCADO',
      trend:[24.2,24.0,23.9,23.8,23.7,23.6,23.5,23.4] },
    { id:'clientes_nuevos', nombre:'Clientes nuevos (trimestre)', perspectiva:'clientes', area:'ventas',
      unidad:'', formato:'int', actual:18, meta:20, prev:19, sentido:'up', fuente:'CRM',
      trend:[21,20,20,19,19,19,18,18] },

    // ===== PROCESOS INTERNOS =====
    { id:'sla', nombre:'Cumplimiento SLA', perspectiva:'procesos', area:'servicio',
      unidad:'%', formato:'pct1', actual:90.2, meta:97, prev:93.0, sentido:'up', fuente:'ITSM',
      trend:[95.5,95.0,94.2,93.4,92.6,91.8,91.0,90.2] },
    { id:'uptime', nombre:'Uptime parque instalado', perspectiva:'procesos', area:'servicio',
      unidad:'%', formato:'pct1', actual:98.1, meta:98.5, prev:98.3, sentido:'up', fuente:'FSM',
      trend:[98.6,98.5,98.4,98.4,98.3,98.2,98.2,98.1] },
    { id:'ftf', nombre:'First-time-fix', perspectiva:'procesos', area:'servicio',
      unidad:'%', formato:'pct0', actual:72, meta:85, prev:78, sentido:'up', fuente:'FSM',
      trend:[80,79,78,77,76,75,74,72] },
    { id:'resolucion_remota', nombre:'Resolución remota (sin visita)', perspectiva:'procesos', area:'servicio',
      unidad:'%', formato:'pct0', actual:38, meta:60, prev:44, sentido:'up', fuente:'ITSM',
      trend:[52,50,48,46,44,42,40,38] },
    { id:'resp_tecnico', nombre:'Tiempo respuesta técnico', perspectiva:'procesos', area:'servicio',
      unidad:'h', formato:'dec1', actual:4.6, meta:4.0, prev:4.3, sentido:'down', fuente:'ITSM',
      trend:[3.9,4.0,4.1,4.2,4.3,4.4,4.5,4.6] },
    { id:'otif', nombre:'OTIF entregas', perspectiva:'procesos', area:'logistica',
      unidad:'%', formato:'pct0', actual:93, meta:95, prev:94, sentido:'up', fuente:'ERP',
      trend:[96,95,95,94,94,93,93,93] },
    { id:'rot_inventario', nombre:'Rotación de inventario', perspectiva:'procesos', area:'logistica',
      unidad:'x/año', formato:'dec1', actual:5.2, meta:6, prev:5.4, sentido:'up', fuente:'ERP',
      trend:[6.0,5.9,5.7,5.6,5.5,5.4,5.3,5.2] },
    { id:'leads', nombre:'Leads calificados (MQL→SQL)', perspectiva:'procesos', area:'marketing',
      unidad:'', formato:'int', actual:210, meta:260, prev:225, sentido:'up', fuente:'CRM',
      trend:[262,255,248,240,235,228,220,210] },
    { id:'conversion', nombre:'Conversión de pipeline', perspectiva:'procesos', area:'ventas',
      unidad:'%', formato:'pct0', actual:24, meta:28, prev:26, sentido:'up', fuente:'CRM',
      trend:[29,28,27,27,26,26,25,24] },
    { id:'productividad', nombre:'Productividad por ejecutivo', perspectiva:'procesos', area:'ventas',
      unidad:'M$/mes', formato:'int', actual:38, meta:45, prev:41, sentido:'up', fuente:'CRM',
      trend:[46,45,44,43,42,41,40,38] },
    // --- Preventa (subárea de Ventas · cuello de botella del embudo comercial) ---
    { id:'preventa_tiempo', nombre:'Preventa: tiempo respuesta propuesta', perspectiva:'procesos', area:'ventas', subarea:'preventa',
      unidad:'días', formato:'dec1', actual:7.5, meta:5, prev:6.4, sentido:'down', fuente:'CPQ',
      trend:[5.2,5.6,5.9,6.2,6.6,6.9,7.2,7.5] },
    { id:'preventa_plazo', nombre:'Preventa: propuestas dentro de plazo', perspectiva:'procesos', area:'ventas', subarea:'preventa',
      unidad:'%', formato:'pct0', actual:78, meta:90, prev:83, sentido:'up', fuente:'CPQ',
      trend:[91,89,87,85,84,82,80,78] },
    { id:'preventa_poc', nombre:'Preventa: éxito de POCs/demos', perspectiva:'procesos', area:'ventas', subarea:'preventa',
      unidad:'%', formato:'pct0', actual:70, meta:85, prev:74, sentido:'up', fuente:'CRM',
      trend:[86,84,82,80,78,76,73,70] },

    // ===== APRENDIZAJE Y CRECIMIENTO =====
    { id:'certificacion', nombre:'Técnicos/preingenieros certificados', perspectiva:'aprendizaje', area:'servicio',
      unidad:'%', formato:'pct0', actual:76, meta:85, prev:78, sentido:'up', fuente:'HRIS',
      trend:[84,83,82,81,80,79,77,76] },
    { id:'capacitacion', nombre:'Horas capacitación por persona', perspectiva:'aprendizaje', area:'transversal',
      unidad:'h', formato:'int', actual:14, meta:20, prev:16, sentido:'up', fuente:'HRIS',
      trend:[21,20,19,18,17,16,15,14] },
    { id:'rotacion', nombre:'Rotación voluntaria de personal', perspectiva:'aprendizaje', area:'transversal',
      unidad:'%', formato:'pct0', actual:11, meta:8, prev:10, sentido:'down', fuente:'HRIS',
      trend:[8,8,9,9,10,10,11,11] },
    { id:'enps', nombre:'eNPS', perspectiva:'aprendizaje', area:'transversal',
      unidad:'pts', formato:'int', actual:32, meta:40, prev:35, sentido:'up', fuente:'HRIS',
      trend:[41,40,39,38,37,35,34,32] },
    { id:'adopcion', nombre:'Adopción CRM/FSM', perspectiva:'aprendizaje', area:'ventas',
      unidad:'%', formato:'pct0', actual:71, meta:90, prev:74, sentido:'up', fuente:'TELEMETRIA',
      trend:[80,79,78,77,76,75,73,71] }
  ],

  /* ---- Grafo causal de impacto sistémico ---------------------------------
     {de, a, regla}: el KPI 'de' influye sobre el KPI 'a'; 'regla' es la
     explicación en una frase (tooltip de la arista). El grafo modela cómo el
     incumplimiento en una perspectiva se propaga hacia las demás (BSC).
  ------------------------------------------------------------------------- */
  impactos: [
    // (1) Servicio → Clientes → Financiera
    { de:'ftf', a:'sla', regla:'Baja reparación a la primera ⇒ múltiples visitas por caso ⇒ satura terreno y se incumple el SLA.' },
    { de:'resp_tecnico', a:'sla', regla:'Mayor tiempo de respuesta técnico ⇒ incumplimiento de SLA.' },
    { de:'uptime', a:'sla', regla:'Menor disponibilidad del parque ⇒ SLA en riesgo.' },
    { de:'sla', a:'nps', regla:'Incumplir SLA deteriora la experiencia ⇒ baja el NPS.' },
    { de:'nps', a:'renovacion', regla:'Clientes menos satisfechos renuevan menos contratos.' },
    { de:'renovacion', a:'ing_recur', regla:'Menos renovaciones ⇒ caen los ingresos recurrentes.' },
    { de:'ing_recur', a:'ebitda', regla:'Menos ingreso recurrente de alto margen ⇒ presiona el EBITDA.' },

    // (2) Marketing → Ventas → Financiera (payroll fijo, ventas planas)
    { de:'leads', a:'conversion', regla:'Menos leads calificados ⇒ menos oportunidades que convertir.' },
    { de:'conversion', a:'productividad', regla:'Menor conversión ⇒ menor productividad por ejecutivo.' },
    { de:'productividad', a:'ing_presu', regla:'Payroll fijo con ventas planas ⇒ no se cumple el presupuesto.' },
    { de:'ing_presu', a:'ebitda', regla:'Incumplir presupuesto de ingresos ⇒ cae el EBITDA.' },

    // (3) Logística → Servicio → Clientes
    { de:'rot_inventario', a:'resp_tecnico', regla:'Baja rotación/quiebres de repuestos ⇒ sube el tiempo de respuesta.' },
    { de:'otif', a:'resp_tecnico', regla:'Entregas fuera de plazo (OTIF) ⇒ el técnico espera repuestos.' },
    { de:'otif', a:'uptime', regla:'Repuestos que no llegan a tiempo ⇒ equipos detenidos, cae el uptime.' },

    // (4) Aprendizaje → Procesos → Clientes
    { de:'certificacion', a:'ftf', regla:'Desconocimiento técnico ⇒ reparación por prueba y error ⇒ baja el first-time-fix.' },
    { de:'capacitacion', a:'ftf', regla:'Menos capacitación ⇒ segundas visitas y prueba y error ⇒ baja el first-time-fix.' },

    // (4b) Servicio post-venta: resolución remota como palanca (evita visitas en terreno)
    { de:'adopcion', a:'resolucion_remota', regla:'Baja adopción de herramientas FSM/diagnóstico remoto ⇒ menos casos resueltos sin visita.' },
    { de:'certificacion', a:'resolucion_remota', regla:'Sin certificación técnica ⇒ menor capacidad de diagnosticar y resolver de forma remota.' },
    { de:'resolucion_remota', a:'ftf', regla:'Sin diagnóstico/resolución remota previa, el técnico llega sin el problema acotado ⇒ prueba y error en terreno ⇒ baja el first-time-fix.' },
    { de:'resolucion_remota', a:'sla', regla:'Todo el volumen de requerimientos se resuelve con visita ⇒ satura la capacidad de terreno ⇒ se incumple el SLA.' },
    { de:'resolucion_remota', a:'costo_servicio', regla:'Cada caso resuelto con visita en lugar de remoto ⇒ mayor costo de servicio en terreno.' },
    { de:'costo_servicio', a:'ebitda', regla:'Mayor costo de servicio en terreno ⇒ presiona el margen y el EBITDA.' },

    // (5) Aprendizaje → Ventas / Clientes
    { de:'adopcion', a:'conversion', regla:'Baja adopción de CRM ⇒ peor gestión de pipeline y conversión.' },
    { de:'adopcion', a:'preventa_tiempo', regla:'Poca adopción de herramientas ⇒ más tiempo armando propuestas.' },
    { de:'rotacion', a:'renovacion', regla:'Alta rotación de personal ⇒ se pierde conocimiento de cuentas.' },
    { de:'rotacion', a:'productividad', regla:'Rotar personal ⇒ curva de aprendizaje, baja productividad.' },
    { de:'enps', a:'rotacion', regla:'eNPS bajo anticipa mayor rotación voluntaria.' },

    // (6) Clientes → Financiera (caja)
    { de:'nps', a:'dso', regla:'Clientes insatisfechos/disputas ⇒ pagos más lentos, sube el DSO.' },
    { de:'dso', a:'ebitda', regla:'Mayor DSO ⇒ presión de caja y gasto financiero sobre el EBITDA.' },

    // (7) Preventa como cuello de botella del embudo comercial
    { de:'certificacion', a:'preventa_tiempo', regla:'Preingenieros sin certificar ⇒ propuestas más lentas.' },
    { de:'preventa_tiempo', a:'conversion', regla:'Propuestas fuera de tiempo ⇒ oportunidades se enfrían, cae conversión.' },
    { de:'preventa_plazo', a:'conversion', regla:'Propuestas fuera de plazo ⇒ el competidor responde antes.' },
    { de:'preventa_poc', a:'conversion', regla:'POCs/demos débiles ⇒ menor tasa de cierre.' },
    { de:'preventa_tiempo', a:'productividad', regla:'Ciclo de venta más largo ⇒ baja productividad comercial.' }
  ],

  // KPIs titulares del pulso ejecutivo (uno por perspectiva).
  destacados: ['ing_presu', 'nps', 'sla', 'enps'],

  /* ---- Planes de acción propuestos ---------------------------------------
     Un plan por frente crítico. 'kpi' es el indicador raíz del frente (el que
     detecta bottlenecks()); 'acciones' son concretas, con responsable y plazo;
     'impacto' es la cadena de indicadores que el plan destraba (en orden
     causa → efecto, terminando en lo financiero).
  ------------------------------------------------------------------------- */
  planes: [
    {
      id: 'plan_remoto',
      frente: 'Operativo · Servicio post-venta',
      kpi: 'resolucion_remota',
      titulo: 'Resolver remoto antes de despachar',
      objetivo: 'Subir la resolución remota de 38% a 60% y el First-Time-Fix de 72% a 85% en 2 trimestres.',
      acciones: [
        { txt: 'Triage de diagnóstico remoto obligatorio antes de despachar un técnico a terreno', resp: 'Servicio Técnico', plazo: '30 días' },
        { txt: 'Certificar en diagnóstico remoto y herramientas FSM al 85% de los técnicos', resp: 'Servicio + RRHH', plazo: '90 días' },
        { txt: 'Habilitar telemetría/acceso remoto en el parque instalado de los 20 clientes principales', resp: 'Servicio + TI', plazo: '60 días' },
        { txt: 'Tablero semanal de FTF y resolución remota por técnico, con metas individuales', resp: 'Jefatura de Servicio', plazo: '15 días' }
      ],
      impacto: ['resolucion_remota', 'ftf', 'sla', 'costo_servicio', 'nps', 'ebitda']
    },
    {
      id: 'plan_preventa',
      frente: 'Comercial · Preventa',
      kpi: 'preventa_tiempo',
      titulo: 'Destrabar el embudo en preventa',
      objetivo: 'Bajar el tiempo de respuesta de propuestas de 7,5 a 5 días y volver a ≥90% de propuestas dentro de plazo.',
      acciones: [
        { txt: 'Biblioteca de propuestas y precios estándar (CPQ) para los 10 servicios más vendidos', resp: 'Preventa + Ventas', plazo: '45 días' },
        { txt: 'Certificar a los preingenieros en el portafolio prioritario', resp: 'Preventa + RRHH', plazo: '90 días' },
        { txt: 'SLA interno de preventa: toda propuesta calificada se responde en ≤5 días', resp: 'Gerencia Comercial', plazo: '15 días' },
        { txt: 'Guion y ambiente estándar de POC/demo para elevar la tasa de éxito', resp: 'Preventa', plazo: '60 días' }
      ],
      impacto: ['preventa_tiempo', 'conversion', 'productividad', 'ing_presu', 'ebitda']
    }
  ]
};

/* ===========================================================
   Helpers puros (sin DOM). Operan sobre DATA.
   =========================================================== */

// Índice id -> kpi
const KPI_BY_ID = DATA.kpis.reduce((m, k) => (m[k.id] = k, m), {});
function kpi(id) { return KPI_BY_ID[id]; }

// Cumplimiento normalizado (1 = en meta). Para sentido 'down', invierte.
function attainment(k) {
  if (!k || !k.meta) return 1;
  const r = k.sentido === 'down' ? (k.meta / k.actual) : (k.actual / k.meta);
  return r;
}

// Estado semáforo: 'ok' | 'warn' | 'bad'
function statusOf(k) {
  const a = attainment(k);
  const u = DATA.meta.umbrales;
  if (a >= u.verde) return 'ok';
  if (a >= u.ambar) return 'warn';
  return 'bad';
}

// Promedio de cumplimiento de un conjunto de KPIs (0..1), o null si vacío.
function avgAttainment(kpis) {
  if (!kpis.length) return null;
  const s = kpis.reduce((acc, k) => acc + Math.min(attainment(k), 1.15), 0);
  return s / kpis.length;
}

// Estado semáforo a partir de un cumplimiento agregado.
function statusFromScore(score) {
  if (score == null) return 'na';
  const u = DATA.meta.umbrales;
  if (score >= u.verde) return 'ok';
  if (score >= u.ambar) return 'warn';
  return 'bad';
}

// Cumplimiento del periodo anterior (misma normalización que attainment).
function attainmentPrev(k) {
  if (!k || !k.meta || k.prev == null) return attainment(k);
  return k.sentido === 'down' ? (k.meta / k.prev) : (k.prev / k.meta);
}

// Salud agregada del periodo anterior (para el delta de la banda ejecutiva).
function avgAttainmentPrev(kpis) {
  if (!kpis.length) return null;
  const s = kpis.reduce((acc, k) => acc + Math.min(attainmentPrev(k), 1.15), 0);
  return s / kpis.length;
}

// Periodos consecutivos sin mejora al final de la tendencia (según el sentido).
function stallStreak(k) {
  const t = k.trend || [];
  let n = 0;
  for (let i = t.length - 1; i > 0; i--) {
    const mejora = k.sentido === 'down' ? t[i] < t[i - 1] : t[i] > t[i - 1];
    if (mejora) break;
    n++;
  }
  return n;
}

// Alertas tempranas: indicadores AÚN en meta pero empeorando vs el periodo
// anterior. Es lo que el semáforo no muestra: verde que se está apagando.
function earlyWarnings() {
  return DATA.kpis
    .filter(k => statusOf(k) === 'ok' && !delta(k).mejora && delta(k).diff !== 0)
    .sort((a, b) => attainment(a) - attainment(b));
}

// Plan de acción asociado a un KPI: primero por raíz exacta, luego por
// pertenencia a la misma cadena causal (aguas arriba o abajo).
function planFor(id) {
  const planes = DATA.planes || [];
  const exact = planes.find(p => p.kpi === id);
  if (exact) return exact;
  const rel = new Set([id, ...upstream(id), ...downstream(id)]);
  return planes.find(p => rel.has(p.kpi)) || null;
}

function kpisByArea(area) { return DATA.kpis.filter(k => k.area === area); }
function kpisByPerspectiva(pid) { return DATA.kpis.filter(k => k.perspectiva === pid); }

// Puntaje de la celda (área × perspectiva) de la matriz. null si no aplica.
function cellScore(area, pid) {
  const ks = DATA.kpis.filter(k => k.area === area && k.perspectiva === pid);
  return avgAttainment(ks);
}

// Brecha de un KPI: cuánto falta para la meta (0 si cumple). Mayor = peor.
function gap(k) { return Math.max(0, 1 - attainment(k)); }

// Peores brechas del negocio (opcionalmente filtradas por área). Peor primero.
function topBrechas(n, area) {
  return DATA.kpis
    .filter(k => statusOf(k) !== 'ok')
    .filter(k => !area || k.area === area)
    .sort((a, b) => gap(b) - gap(a))
    .slice(0, n || DATA.kpis.length);
}

// --- Grafo: adyacencias ---
const OUT = {}, IN = {};
DATA.impactos.forEach(e => {
  (OUT[e.de] = OUT[e.de] || []).push(e);
  (IN[e.a]  = IN[e.a]  || []).push(e);
});

// Cadena aguas abajo desde un KPI (lista de ids en orden BFS, sin el origen).
function downstream(id) {
  const seen = new Set([id]), order = [], q = [id];
  while (q.length) {
    const cur = q.shift();
    (OUT[cur] || []).forEach(e => {
      if (!seen.has(e.a)) { seen.add(e.a); order.push(e.a); q.push(e.a); }
    });
  }
  return order;
}

// Distancia causal (camino más largo) desde un KPI raíz a cada nodo aguas abajo.
// Sirve para ordenar la cadena de impacto de causa → efecto (ningún efecto
// aparece antes que su causa; el sumidero, EBITDA, queda al final).
function distFromRoot(rootId) {
  const dist = { [rootId]: 0 };
  const nodes = [rootId, ...downstream(rootId)];
  let changed = true;
  while (changed) {
    changed = false;
    nodes.forEach(u => {
      if (dist[u] === undefined) return;
      (OUT[u] || []).forEach(e => {
        const nd = dist[u] + 1;
        if (dist[e.a] === undefined || nd > dist[e.a]) { dist[e.a] = nd; changed = true; }
      });
    });
  }
  return dist;
}

// Problemas aguas abajo de un KPI, ordenados por distancia causal (causa→efecto).
function orderedDownstreamProblems(id) {
  const dist = distFromRoot(id);
  return downstream(id)
    .filter(x => statusOf(kpi(x)) !== 'ok')
    .sort((a, b) => (dist[a] || 0) - (dist[b] || 0));
}

// Cadena aguas arriba (ids que influyen sobre este KPI).
function upstream(id) {
  const seen = new Set([id]), order = [], q = [id];
  while (q.length) {
    const cur = q.shift();
    (IN[cur] || []).forEach(e => {
      if (!seen.has(e.de)) { seen.add(e.de); order.push(e.de); q.push(e.de); }
    });
  }
  return order;
}

// ¿Tiene alguna causa (aguas arriba directa) en estado rojo/ámbar?
function hasUpstreamProblem(id) {
  return (IN[id] || []).some(e => statusOf(kpi(e.de)) !== 'ok');
}

// Cadenas activas: cada causa raíz problemática (sin causa upstream problemática)
// con su recorrido aguas abajo que también está afectado.
function activeChains() {
  const roots = DATA.kpis.filter(k =>
    statusOf(k) !== 'ok' && !hasUpstreamProblem(k.id));
  return roots.map(root => {
    // Nodos aguas abajo alcanzados que además están fuera de meta.
    const chain = [root.id, ...downstream(root.id).filter(id => statusOf(kpi(id)) !== 'ok')];
    return { root: root.id, nodes: chain, score: chainWeight(root.id, chain) };
  }).sort((a, b) => b.score - a.score);
}

// Peso de una cadena: profundidad × severidad × (bonus si toca lo financiero).
function chainWeight(rootId, nodes) {
  const sev = gap(kpi(rootId));
  const depth = nodes.length;
  const tocaFinanciera = nodes.some(id => kpi(id).perspectiva === 'financiera') ? 1.6 : 1;
  return sev * depth * tocaFinanciera;
}

// Cantidad de indicadores fuera de meta que dependen (aguas abajo) de este KPI.
function downstreamProblemCount(id) {
  return downstream(id).filter(x => statusOf(kpi(x)) !== 'ok').length;
}

// Cuello de botella: el indicador fuera de meta que restringe/propaga el mayor
// daño al sistema = severidad propia × alcance de impacto aguas abajo × (bonus
// si su cadena alcanza lo financiero). No es necesariamente la causa raíz: es
// el nodo por donde pasa y se amplifica el mayor deterioro (típicamente un
// proceso operativo, como la preventa en el embudo comercial).
function bottleneckScore(id) {
  const tocaFin = downstream(id).some(x => kpi(x).perspectiva === 'financiera') ? 1.4 : 1;
  return gap(kpi(id)) * downstreamProblemCount(id) * tocaFin;
}

// Problemas NO financieros aguas abajo de un KPI (define el "frente": todas las
// cadenas convergen en el EBITDA, así que dos frentes son distintos si golpean
// resultados operativos/de cliente diferentes).
function nonFinDownstreamProblems(id) {
  return new Set([id, ...downstream(id)]
    .filter(x => statusOf(kpi(x)) !== 'ok' && kpi(x).perspectiva !== 'financiera'));
}

// Cuellos de botella de FRENTES DISTINTOS (selección greedy): toma el de mayor
// impacto y excluye a los que compartan su cadena (aguas arriba/abajo) o un
// resultado no financiero aguas abajo. El siguiente elegido es un frente
// independiente. Con los datos demo devuelve dos frentes: servicio (resolución
// remota/FTF) y comercial (preventa), ambos con impacto en el EBITDA.
function bottlenecks(n) {
  let cands = DATA.kpis
    .filter(k => statusOf(k) !== 'ok' && downstreamProblemCount(k.id) > 0)
    .map(k => ({ id: k.id, score: bottleneckScore(k.id) }))
    .sort((a, b) => b.score - a.score);
  const out = [];
  while (cands.length && out.length < (n || 1)) {
    const pick = cands[0].id;
    out.push(pick);
    const rel = new Set([pick, ...upstream(pick), ...downstream(pick)]);
    const pf = nonFinDownstreamProblems(pick);
    cands = cands.filter(c => {
      if (rel.has(c.id)) return false;
      for (const x of nonFinDownstreamProblems(c.id)) if (pf.has(x)) return false;
      return true;
    });
  }
  return out;
}

// Cuello de botella principal (compatibilidad).
function bottleneck() {
  const b = bottlenecks(1);
  return b.length ? b[0] : null;
}

// Todos los ids de aristas "encendidas" (origen fuera de meta) para el mapa.
function litEdges() {
  return DATA.impactos.filter(e => statusOf(kpi(e.de)) !== 'ok');
}

// ¿La celda (área × perspectiva) recibe riesgo importado desde otra área?
// Verdadero si algún KPI de la celda tiene una causa upstream fuera de meta
// que pertenece a un área distinta.
function importedRisk(area, pid) {
  const cells = DATA.kpis.filter(k => k.area === area && k.perspectiva === pid);
  return cells.some(k =>
    (IN[k.id] || []).some(e => {
      const src = kpi(e.de);
      return statusOf(src) !== 'ok' && src.area !== area;
    }));
}

/* ---- Formato es-CL ---- */
function fmt(k) {
  const v = k.actual;
  switch (k.formato) {
    case 'pct1': return v.toLocaleString('es-CL', { minimumFractionDigits:1, maximumFractionDigits:1 }) + '%';
    case 'pct0': return Math.round(v).toLocaleString('es-CL') + '%';
    case 'dec1': return v.toLocaleString('es-CL', { minimumFractionDigits:1, maximumFractionDigits:1 }) + (k.unidad ? ' ' + k.unidad : '');
    case 'int':  return Math.round(v).toLocaleString('es-CL') + (k.unidad ? ' ' + k.unidad : '');
    default:     return String(v) + (k.unidad ? ' ' + k.unidad : '');
  }
}
function fmtMeta(k) {
  const v = k.meta;
  switch (k.formato) {
    case 'pct1': return v.toLocaleString('es-CL', { minimumFractionDigits:1, maximumFractionDigits:1 }) + '%';
    case 'pct0': return Math.round(v).toLocaleString('es-CL') + '%';
    case 'dec1': return v.toLocaleString('es-CL', { minimumFractionDigits:1, maximumFractionDigits:1 }) + (k.unidad ? ' ' + k.unidad : '');
    case 'int':  return Math.round(v).toLocaleString('es-CL') + (k.unidad ? ' ' + k.unidad : '');
    default:     return String(v) + (k.unidad ? ' ' + k.unidad : '');
  }
}
function pct(x) { return Math.round(x * 100) + '%'; }

// Delta vs periodo anterior (con signo y flecha), respetando el sentido.
function delta(k) {
  const diff = k.actual - k.prev;
  const mejora = k.sentido === 'down' ? diff < 0 : diff > 0;
  const arrow = diff === 0 ? '■' : (diff > 0 ? '▲' : '▼');
  const abs = Math.abs(diff).toLocaleString('es-CL', { maximumFractionDigits:1 });
  return { texto: `${arrow} ${abs} vs per. anterior`, mejora, diff };
}

// Etiqueta de área (rotula preventa como "Ventas · Preventa").
function areaLabel(k) {
  if (k.subarea === 'preventa') return 'Ventas · Preventa';
  return (DATA.areas[k.area] || {}).nombre || k.area;
}
function perspLabel(pid) {
  const p = DATA.perspectivas.find(p => p.id === pid);
  return p ? p.nombre : pid;
}
