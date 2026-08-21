# array-dashboard-gerente

**Cockpit BSC 360° — Gerencia País de Tecnodata S.A.**

Cuadro de Mando Integral (Balanced Scorecard) en una sola vista para el *country manager*,
que cubre las 5 áreas a su cargo — **marketing, ventas (con preventa), logística, servicio
técnico y finanzas** — y muestra el **impacto sistémico**: cómo el incumplimiento en una
perspectiva se propaga a las demás.

Sitio estático (HTML + CSS + JS, **sin dependencias externas**). Datos **ficticios** de demostración.

> 📄 Documentación funcional completa: [`docs/REQUERIMIENTOS.md`](docs/REQUERIMIENTOS.md)

## 🧭 Qué muestra

- **Pulso ejecutivo** — 1 KPI titular por perspectiva BSC (Financiera, Clientes, Procesos,
  Aprendizaje) con semáforo, delta y tendencia.
- **Mapa estratégico & cadenas de impacto** — 4 niveles del BSC con hilo conductor causal;
  las flechas de color trazan cómo una brecha se propaga entre perspectivas. Al cargar
  enfoca la cadena del **cuello de botella** (⛔). Clic en un indicador aísla su cadena.
- **Matriz de salud 360°** — áreas × perspectivas, con salud por fila/columna, marca de
  *riesgo importado* y detalle inline de indicadores por área (con su fuente de dato).
- **Brechas prioritarias** — gestión por excepción, peor primero, con su cadena de impacto.
- **Origen de los datos** — cada indicador declara su sistema fuente simulado (CRM, ERP,
  ITSM/FSM, HRIS, CX…).

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
index.html                    Estructura de la vista única (la llena el JS)
styles.css                    Estilos, tokens de marca y semáforo, responsive
data.js                       DATA (KPIs, grafo de impacto, fuentes) + helpers  ← EDITAR AQUÍ
app.js                        Render del pulso, mapa, matriz y brechas (SVG puro)
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
