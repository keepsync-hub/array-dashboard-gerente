# array-dashboard-gerente

Dashboard de ejemplo para la **Gerencia General de Tecnodata S.A. (Techno Global)**.

Sitio estático (HTML + CSS + JS, sin dependencias externas) pensado como punto de
partida para construir el panel gerencial.

## 🎨 Paleta de colores

| Rol             | Color     | Uso                                        |
|-----------------|-----------|--------------------------------------------|
| Negro           | `#000000` | Fondo del sitio                            |
| Azul periwinkle | `#97B4DE` | Botones "Ticket Servicios" y "Tienda"      |
| Teal profundo   | `#274B63` | Tarjeta SENAPRED (superior)                |
| Teal verdoso    | `#1E4B48` | Tarjeta SENAPRED (inferior)                |
| Blanco          | `#FFFFFF` | Tipografía sobre fondos oscuros            |

El tema es **oscuro / negro**, en línea con el logo de Tecnodata S.A.

## 📁 Estructura

```
index.html                    Página del dashboard
styles.css                    Estilos y paleta
app.js                        Gráfico de barras (SVG) e interacciones
assets/logo.svg               Logo Tecnodata S.A. (recreación vectorial)
.github/workflows/deploy-pages.yml   Publicación en GitHub Pages
```

## 🚀 Ver en local

Abrir `index.html` en el navegador, o servirlo:

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

## 🔄 Flujo de publicación (PR → Merge → GitHub Pages)

1. Se desarrolla en la rama `claude/techno-global-dashboard-*`.
2. Se abre un **Pull Request** hacia `main`.
3. Al hacer **Merge** a `main`, el workflow `Deploy Dashboard to GitHub Pages`
   se ejecuta automáticamente y publica el sitio.
4. **Requisito único:** en *Settings → Pages → Build and deployment → Source*
   seleccionar **GitHub Actions**.
