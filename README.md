# array-dashboard-gerente

**Cockpit BSC 360° — Gerencia País de Tecnodata S.A.**

Cuadro de Mando Integral (Balanced Scorecard) en una sola vista para el *country manager*,
que cubre las 5 áreas a su cargo — **marketing, ventas (con preventa), logística, servicio
técnico y finanzas** — y muestra el **impacto sistémico**: cómo el incumplimiento en una
perspectiva se propaga a las demás.

Sitio estático (HTML + CSS + JS, **sin dependencias externas**). Datos **ficticios** de demostración.

> 📄 Documentación funcional completa: [`docs/REQUERIMIENTOS.md`](docs/REQUERIMIENTOS.md)

## 🧭 Qué muestra

Pensado para un **CEO**: la primera pantalla es simple y accionable.

- **Salud del negocio** — salud global con **delta vs el periodo anterior** y conteo de
  críticos / en riesgo / alertas tempranas, + las 4 perspectivas BSC (Financiera, Clientes,
  Procesos, Aprendizaje) con semáforo, y los **cuellos de botella** destacados (dos frentes
  críticos: servicio/First-Time-Fix y comercial/preventa).
- **💰 Venta y resultado vs Business Plan** — Venta (cierre de negocios), Facturación,
  Margen bruto y **EBITDA** (★ la salud financiera del negocio): mes actual vs plan,
  acumulado **YTD vs plan** y comparación **vs año anterior**, con semáforo por
  cumplimiento. La banda ejecutiva muestra el EBITDA de forma permanente.
- **📉 Alertas tempranas** — indicadores **aún en meta pero empeorando** (el verde que se
  está apagando), con los periodos consecutivos sin mejora.
- **💬 Chat "Pregúntale a tus datos"** — asistente conversacional **local** (sin backend)
  que responde preguntas sobre el negocio con un diagnóstico: cuellos de botella, causas,
  impacto de mejoras, oportunidades priorizadas, tendencias y **planes de acción**. Trae
  preguntas de ejemplo sugeridas.
- **🎯 Planes de acción propuestos** — un plan por frente crítico: objetivo cuantificado,
  acciones con responsable y plazo, y la cadena de **impacto esperado** hasta el EBITDA.
  Cada tarjeta permite preguntar por el plan directamente en el chat.
- **📊 Análisis detallado (desplegable)** — para quien quiere profundizar:
  - **Mapa estratégico & cadenas de impacto** — 4 niveles del BSC con hilo conductor causal;
    las flechas trazan cómo una brecha se propaga. Enfoca las cadenas de los cuellos de botella (⛔).
  - **Matriz de salud 360°** — áreas × perspectivas, con *riesgo importado* y detalle por área.
  - **Brechas prioritarias** — gestión por excepción con su cadena de impacto.
  - **Origen de los datos** — sistema fuente simulado de cada indicador (CRM, ERP, ITSM/FSM, HRIS, CX…).

### Ejemplos de preguntas al chat

> Resumen ejecutivo · ¿Cuáles son los cuellos de botella? · ¿Qué plan de acción me
> propones? · ¿Qué está empeorando aunque esté en meta? · ¿Por qué cae el EBITDA? ·
> ¿Dónde están mis mayores oportunidades? · ¿Cómo va Servicio Técnico?

## ✏️ Editar indicadores

Toda la data vive en un solo archivo: **`data.js`** (catálogo de KPIs con `actual`, `meta`,
`prev`, `trend`, `fuente`; grafo de impacto `impactos`; **planes de acción** `planes`;
umbrales del semáforo). La capa de render (`app.js`) no define datos.

## 🎨 Paleta de colores

| Rol             | Color     | Uso                                   |
|-----------------|-----------|---------------------------------------|
| Negro           | `#000000` | Fondo del sitio                       |
| Azul periwinkle | `#97B4DE` | Acento / interacción                  |
| Teal profundo   | `#274B63` | Superficies de marca (avatar)         |
| Blanco          | `#FFFFFF` | Tipografía sobre fondos oscuros       |
| Verde / Ámbar / Rojo | `#6fd3a2` · `#e8c26a` · `#f0716f` | Semáforo BSC (en meta / riesgo / crítico) |

Tema **oscuro**, en línea con la marca Tecnodata S.A.

## 📁 Estructura

```
index.html                    Vista CEO (banda ejecutiva, alertas, chat, planes) + análisis detallado
tecnodata.html                Vista simplificada: indicadores financieros vs business plan + chat
styles.css                    Estilos, tokens de marca y semáforo, responsive
data.js                       DATA (KPIs, grafo de impacto, fuentes, planes) + helpers  ← EDITAR AQUÍ
app.js                        Render de banda ejecutiva, alertas, planes, mapa, matriz y brechas
chat.js                       Motor local del chat "Pregúntale a tus datos"
docs/REQUERIMIENTOS.md        Documento de requerimiento funcional (FRD)
assets/logo.png               Logo oficial Tecnodata S.A.
.github/workflows/deploy-pages.yml   Publicación en GitHub Pages
```

## 🚀 Ver en local

Abrir `index.html` en el navegador, o servirlo:

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## 🔄 Flujo de publicación (PR → Merge → GitHub Pages)

1. Se desarrolla en una rama de trabajo (`claude/...`).
2. Se abre un **Pull Request** hacia `main`.
3. Al hacer **Merge** a `main`, el workflow `Deploy Dashboard to GitHub Pages`
   se ejecuta automáticamente y publica el sitio.
4. **Requisito único:** en *Settings → Pages → Build and deployment → Source*
   seleccionar **GitHub Actions**.
