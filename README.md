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

- **Salud del negocio** — salud global + las 4 perspectivas BSC (Financiera, Clientes,
  Procesos, Aprendizaje) con semáforo, y los **cuellos de botella** destacados (dos frentes
  críticos: servicio/First-Time-Fix y comercial/preventa).
- **💬 Chat "Pregúntale a tus datos"** — asistente conversacional **local** (sin backend)
  que responde preguntas sobre el negocio con un diagnóstico: cuellos de botella, causas,
  impacto de mejoras y oportunidades priorizadas. Trae preguntas de ejemplo sugeridas.
- **📊 Análisis detallado (desplegable)** — para quien quiere profundizar:
  - **Mapa estratégico & cadenas de impacto** — 4 niveles del BSC con hilo conductor causal;
    las flechas trazan cómo una brecha se propaga. Enfoca las cadenas de los cuellos de botella (⛔).
  - **Matriz de salud 360°** — áreas × perspectivas, con *riesgo importado* y detalle por área.
  - **Brechas prioritarias** — gestión por excepción con su cadena de impacto.
  - **Origen de los datos** — sistema fuente simulado de cada indicador (CRM, ERP, ITSM/FSM, HRIS, CX…).

### Ejemplos de preguntas al chat

> ¿Cuáles son los cuellos de botella? · ¿Por qué está bajo el First-Time-Fix? ·
> ¿Qué impacto tiene mejorar la resolución remota? · ¿Cómo va Servicio Técnico? ·
> ¿Dónde están mis mayores oportunidades? · Resumen ejecutivo

## ✏️ Editar indicadores

Toda la data vive en un solo archivo: **`data.js`** (catálogo de KPIs con `actual`, `meta`,
`prev`, `trend`, `fuente`; grafo de impacto `impactos`; umbrales del semáforo). La capa de
render (`app.js`) no define datos.

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
index.html                    Vista CEO (banda ejecutiva, chat) + análisis detallado
styles.css                    Estilos, tokens de marca y semáforo, responsive
data.js                       DATA (KPIs, grafo de impacto, fuentes) + helpers  ← EDITAR AQUÍ
app.js                        Render de banda ejecutiva, mapa, matriz y brechas (SVG puro)
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
