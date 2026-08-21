# Documento de Requerimiento Funcional (FRD)
## Cockpit BSC 360° — Gerencia País · Tecnodata S.A.

> Empresa de servicios (análisis tipo Ricoh: impresión / servicios gestionados).
> Datos **ficticios** de demostración. Idioma es-CL.

---

## 1. Contexto y objetivo

El **country manager** dirige 5 áreas: **marketing, ventas (incluye preventa), logística,
servicio técnico y finanzas**. Requiere una visualización 360° bajo el framework
**Balanced Scorecard (BSC)** que apoye su toma de decisiones **en una sola vista**,
mostrando no solo el estado de cada indicador sino el **impacto sistémico**: cómo el
incumplimiento en una perspectiva se propaga a las demás.

Principios de diseño:

- **Una sola vista (cockpit):** sin navegación entre páginas; el detalle se abre inline.
- **Gestión por excepción:** lo verde no pide atención; lo rojo/ámbar sí.
- **Hilo conductor causal:** el mapa estratégico conecta las 4 perspectivas del BSC de
  abajo hacia arriba (las capacidades habilitan procesos → clientes → resultado financiero).
- **Trazabilidad del dato:** cada indicador declara su sistema fuente (simulado).

## 2. Marco Balanced Scorecard

Cuatro perspectivas, leídas en el mapa de arriba hacia abajo, con las áreas responsables:

| Perspectiva | Pregunta estratégica | Áreas |
|---|---|---|
| **Financiera** | ¿Cumplimos el resultado para los dueños? | Finanzas |
| **Clientes** | ¿Cómo nos ven y nos eligen los clientes? | Ventas, Marketing |
| **Procesos Internos** | ¿En qué procesos debemos ser excelentes? | Logística, Servicio Técnico, Ventas (Preventa), Marketing |
| **Aprendizaje y Crecimiento** | ¿Tenemos las capacidades para sostenerlo? | Personas / RRHH (transversal) |

## 3. Requerimientos funcionales

- **RF-01 · Vista única (cockpit).** Todo el tablero en una pantalla: pulso ejecutivo →
  (mapa estratégico | matriz 360°) → brechas y cadenas de impacto → fuentes. Responsive
  (apila bajo 1000px y 560px).
- **RF-02 · Pulso ejecutivo.** 4 tarjetas KPI, una por perspectiva (Ingresos vs
  presupuesto · NPS · Cumplimiento SLA · eNPS): semáforo, valor, meta, delta vs periodo
  anterior y sparkline de tendencia.
- **RF-03 · Mapa estratégico con hilo conductor.** SVG de 4 niveles (Financiera arriba →
  Aprendizaje abajo). Cada nivel: nombre, salud agregada (%) y áreas responsables; dentro,
  una píldora por KPI coloreada por semáforo (tooltip: actual, meta, cumplimiento y fuente).
- **RF-04 · Impacto sistémico (grafo causal KPI-a-KPI).** Aristas dirigidas entre píldoras.
  Al cargar se **enfoca la cadena del cuello de botella**; las píldoras conservan su color de
  estado y la cadena enfocada se resalta (aristas de color con flecha + anillo en los nodos).
  Clic en una píldora aísla su cadena (aguas arriba y abajo); tooltip de cada arista = la
  regla causal en una frase.
- **RF-05 · Matriz de Salud 360° (áreas × perspectivas).** Tabla áreas × 4 perspectivas;
  cada celda = cumplimiento promedio del área en esa perspectiva, coloreada por semáforo
  ("—" si no aplica); columna "Salud del área" y fila "Salud de la perspectiva". Marca de
  **riesgo importado** en celdas afectadas por una cadena originada en otra área. Clic en
  una fila expande inline los KPIs del área (valor/meta · bullet · sparkline · delta · fuente).
- **RF-06 · Brechas y cadenas de impacto.** Las peores brechas (peor primero): KPI · área ·
  perspectiva · fuente · actual vs meta · bullet · pill de estado, **más su cadena aguas
  abajo** como chips encadenados. Clic en la fila enciende esa cadena en el mapa.
- **RF-07 · Preventa y cuello de botella.** El embudo comercial se modela en 3 eslabones:
  marketing genera demanda → ventas califica → **preventa construye la propuesta
  técnico-comercial y ejecuta POCs**. Preventa lleva 3 KPIs (subárea de Ventas). El helper
  `bottleneck()` identifica el indicador que restringe/propaga el mayor daño (severidad
  propia × alcance de impacto aguas abajo × toca-Financiera) y lo señala con insignia
  "⛔ Cuello de botella" en el diagnóstico, el mapa y las brechas.
- **RF-08 · Filtro por área.** El sidebar filtra por área: resalta y expande su fila en la
  matriz, filtra las brechas y aísla en el mapa las cadenas que tocan esa área.
- **RF-09 · Semáforo.** Cumplimiento = actual/meta (invertido si "menos es mejor").
  Verde ≥ 95% · Ámbar 85–95% · Rojo < 85% (umbrales configurables en `data.js`). Los
  agregados son promedios de cumplimiento.
- **RF-10 · Origen del dato por indicador.** Cada KPI declara su `fuente`; se muestra en
  tooltips, en el detalle de la matriz y en la leyenda de fuentes del pie.
- **RF-11 · Vista CEO (simplificada).** La primera pantalla está pensada para el CEO:
  una **banda de salud del negocio** (salud global + las 4 perspectivas BSC con semáforo),
  el **cuello de botella** destacado, y el **chat** como elemento central. El análisis
  denso (mapa estratégico, matriz, brechas, fuentes) queda en un desplegable "Ver análisis
  detallado", colapsado por defecto.
- **RF-12 · Chat "Pregúntale a tus datos".** Asistente conversacional **100% local** (sin
  backend ni llamadas externas; funciona en GitHub Pages) que interpreta preguntas en
  lenguaje natural y responde con un diagnóstico construido sobre el grafo causal y los
  helpers de datos. Intenciones soportadas: resumen ejecutivo, cuello de botella,
  oportunidades/prioridades (con quick win), causas de un problema ("¿por qué cae X?"),
  impacto de una mejora ("¿qué pasa si mejoro X?"), estado de un área, de una perspectiva o
  de un indicador, y origen de los datos. Al abrir muestra un mensaje de bienvenida con el
  diagnóstico actual y **preguntas sugeridas** clicables. Motor en `chat.js`.

### Preguntas de ejemplo (sugeridas en el chat)

- ¿Cuáles son los cuellos de botella?
- ¿Por qué está bajo el First-Time-Fix?
- ¿Qué impacto tiene mejorar la resolución remota?
- ¿Cómo va Servicio Técnico?
- ¿Dónde están mis mayores oportunidades de mejora?
- Dame un resumen ejecutivo del negocio.
- ¿Por qué cae el EBITDA? · ¿Qué impacto tiene mejorar la preventa?

## 4. Catálogo de indicadores (datos simulados) con fuente

| Perspectiva | KPI | Área | Actual / Meta | Sentido | Fuente |
|---|---|---|---|---|---|
| Financiera | Ingresos vs presupuesto | Finanzas | 96,2 / 100 % | ↑ | ERP |
| Financiera | Ingresos recurrentes (contratos) | Finanzas | 68 / 70 % | ↑ | ERP |
| Financiera | Margen EBITDA | Finanzas | 12,8 / 14 % | ↑ | ERP |
| Financiera | DSO (días de cobro) | Finanzas | 62 / 55 días | ↓ | ERP |
| Financiera | **Costo de servicio en terreno** (% del presupuesto) | Servicio | 122 / 100 % | ↓ | ERP |
| Clientes | NPS | Marketing | 54 / 60 pts | ↑ | CX/Encuestas |
| Clientes | Renovación de contratos | Ventas | 91 / 93 % | ↑ | CRM |
| Clientes | Market share | Marketing | 23,4 / 25 % | ↑ | Estudio mercado |
| Clientes | Clientes nuevos (trimestre) | Ventas | 18 / 20 | ↑ | CRM |
| Procesos | Cumplimiento SLA | Servicio | 90,2 / 97 % | ↑ | ITSM |
| Procesos | Uptime parque instalado | Servicio | 98,1 / 98,5 % | ↑ | FSM |
| Procesos | **First-time-fix** | Servicio | 72 / 85 % | ↑ | FSM |
| Procesos | **Resolución remota (sin visita)** | Servicio | 38 / 60 % | ↑ | ITSM |
| Procesos | Tiempo respuesta técnico | Servicio | 4,6 / 4,0 h | ↓ | ITSM |
| Procesos | OTIF entregas | Logística | 93 / 95 % | ↑ | ERP |
| Procesos | Rotación de inventario | Logística | 5,2 / 6 x/año | ↑ | ERP |
| Procesos | Leads calificados (MQL→SQL) | Marketing | 210 / 260 | ↑ | CRM |
| Procesos | Conversión de pipeline | Ventas | 24 / 28 % | ↑ | CRM |
| Procesos | Productividad por ejecutivo | Ventas | 38 / 45 M$/mes | ↑ | CRM+ERP |
| Procesos | **Preventa: tiempo respuesta propuesta** | Ventas · Preventa | 7,5 / 5 días | ↓ | CRM (CPQ) |
| Procesos | **Preventa: propuestas dentro de plazo** | Ventas · Preventa | 78 / 90 % | ↑ | CRM (CPQ) |
| Procesos | **Preventa: éxito de POCs/demos** | Ventas · Preventa | 70 / 85 % | ↑ | CRM |
| Aprendizaje | Técnicos/preingenieros certificados | Servicio | 76 / 85 % | ↑ | HRIS |
| Aprendizaje | Horas capacitación por persona | Personas | 14 / 20 h | ↑ | HRIS |
| Aprendizaje | Rotación voluntaria de personal | Personas | 11 / 8 % | ↓ | HRIS |
| Aprendizaje | eNPS | Personas | 32 / 40 pts | ↑ | HRIS |
| Aprendizaje | Adopción CRM/FSM | Ventas | 71 / 90 % | ↑ | Telemetría |

Cada KPI incluye además `prev` (periodo anterior) y `trend` (8 puntos) para deltas y sparklines.

### Fuentes de datos tradicionales (simuladas)

- **CRM** (ventas, marketing; módulo **CPQ** para preventa) — p. ej. Salesforce / Dynamics:
  pipeline, leads, clientes, renovaciones, propuestas y POCs.
- **ERP** (finanzas y logística) — p. ej. SAP / Oracle: contabilidad, presupuesto, cobranza
  (DSO), inventario, despachos (OTIF), payroll.
- **ITSM / Mesa de ayuda (ITIL)** + **FSM** de terreno (servicio técnico) — p. ej. ServiceNow:
  tickets, SLA, uptime, first-time-fix, tiempos de respuesta.
- **HRIS / RRHH** — p. ej. Workday / BUK: dotación, rotación, capacitación, certificaciones, eNPS.
- **CX / Encuestas** — p. ej. Qualtrics / Medallia: NPS.
- **Telemetría de plataformas**: adopción de CRM/FSM. **Estudio de mercado**: market share.

## 5. Modelo de impacto sistémico (grafo `impactos`)

El BSC afirma causalidad entre perspectivas; el tablero la hace operativa con un grafo
dirigido KPI-a-KPI declarado en `data.js`. Escenarios modelados:

1. **Servicio → Clientes → Financiera:** first-time-fix bajo / respuesta lenta → cae SLA →
   cae NPS → caen renovaciones → caen ingresos recurrentes → cae EBITDA.
2. **Marketing → Ventas → Financiera:** pocos leads calificados → cae conversión y
   productividad por ejecutivo → el payroll se mantiene con ventas planas → incumple
   presupuesto → cae EBITDA.
3. **Logística → Servicio → Clientes:** inventario/OTIF deficientes → sin repuestos → sube
   el tiempo de respuesta y cae uptime → cae SLA → cae NPS.
4. **Aprendizaje → Procesos → Clientes:** pocas certificaciones/capacitación → cae
   first-time-fix → cae uptime → cae SLA.
5. **Aprendizaje → Ventas/Clientes:** baja adopción de CRM/FSM → cae conversión; rotación
   alta / eNPS bajo → se pierde conocimiento de cuentas → caen renovaciones y productividad.
6. **Clientes → Financiera (caja):** NPS bajo / disputas → pagos más lentos → sube DSO →
   presión de caja sobre el EBITDA.
7. **Preventa como cuello de botella:** aunque marketing genere demanda y ventas califique,
   un tiempo de respuesta de preventa alto / propuestas fuera de plazo / POCs débiles →
   las oportunidades se enfrían o las gana quien respondió antes → cae conversión y
   productividad → incumple presupuesto → cae EBITDA. Aguas arriba, la certificación de
   preingenieros y la adopción de herramientas alimentan el tiempo y la calidad de preventa.
8. **Servicio post-venta — First-Time-Fix y resolución remota (segundo frente crítico):**
   la **baja resolución remota** (no se diagnostica el problema antes de despachar) hace que
   el técnico llegue sin el problema acotado y repare por **prueba y error** — agravado por
   el **desconocimiento técnico** (baja certificación/capacitación) → **cae el First-Time-Fix**
   (múltiples visitas por caso). Esto **satura la capacidad de terreno**, **incumple el SLA**,
   deteriora el **NPS** y la **renovación de contratos** (→ ingresos recurrentes → EBITDA), y
   además **encarece el servicio** (más visitas en terreno = mayor **costo de servicio** →
   presiona el EBITDA). **Palanca:** potenciar la **resolución remota** (diagnóstico previo +
   herramientas FSM + certificación) para evitar visitas, subir FTF/SLA y bajar costo.

> **Dos frentes críticos.** El diagnóstico, el mapa y el chat presentan simultáneamente los
> dos cuellos de botella de mayor impacto y de cadenas distintas: **operativo/servicio**
> (resolución remota → FTF) y **comercial** (preventa). El helper `bottlenecks(n)` los
> selecciona de forma "greedy" evitando que ambos pertenezcan a la misma cadena.

## 6. Arquitectura (requisitos no funcionales)

- **Sitio estático sin dependencias** (HTML5 + CSS3 + ES6, SVG a mano): sin bundler, sin CDN.
  Se despliega a GitHub Pages subiendo la raíz del repositorio.
- **Marca Tecnodata S.A.** (logo y paleta oscura de marca). Idioma es-CL.
- **Un único lugar editable de datos:** `data.js`. La capa de render (`app.js`) no define datos.

### Estructura de archivos

```
index.html   Estructura de la vista (banda ejecutiva, chat y detalle desplegable)
styles.css   Estilos, tokens de marca y semáforo, responsive
data.js      DATA (KPIs, grafo de impacto, fuentes) + helpers puros  ← EDITAR AQUÍ
app.js       Render de la banda ejecutiva, pulso, mapa, matriz y brechas (SVG puro)
chat.js      Motor local del chat "Pregúntale a tus datos" (Q&A + diagnóstico)
docs/REQUERIMIENTOS.md   Este documento
assets/logo.png          Logo Tecnodata S.A.
```

## 7. Criterios de aceptación

1. La página carga sin errores de consola.
2. Mapa estratégico con 4 niveles en orden Financiera → Clientes → Procesos → Aprendizaje;
   salud agregada por nivel; al cargar se ve enfocada la cadena del cuello de botella
   (Preventa · Tiempo → Conversión → Prod. ventas → EBITDA) con la insignia ⛔.
3. Matriz áreas × perspectivas con totales por fila/columna, expansión inline (con fuente por
   KPI) y marcas de riesgo importado.
4. Brechas ordenadas peor-primero con sus chips de cadena; clic enciende la cadena en el mapa.
5. Filtro por área coherente en mapa, matriz y brechas.
6. Semáforo correcto en indicadores "menos es mejor" (DSO 62/55 → ámbar; Preventa 7,5/5 → rojo).
7. Tooltips y leyenda muestran el origen del dato (CRM/ERP/ITSM/HRIS/CX/…).

---
_Datos ficticios de demostración. No representan cifras reales de ninguna empresa._
