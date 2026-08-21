/* Tecnodata S.A. — Dashboard Gerencia General
   Interacciones mínimas y render del gráfico de barras (SVG puro, sin dependencias). */

document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico en el footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Render del gráfico de barras
  renderBars();
});

function renderBars() {
  const group = document.querySelector('.bars-group');
  if (!group) return;

  const values = (group.dataset.values || '').split(',').map(Number);
  const labels = (group.dataset.labels || '').split(',');

  const chartW = 640, chartH = 260;
  const padLeft = 40, padRight = 20, padTop = 20, baseY = 220;
  const usableW = chartW - padLeft - padRight;
  const max = Math.max(...values) * 1.1;
  const slot = usableW / values.length;
  const barW = slot * 0.55;
  const SVGNS = 'http://www.w3.org/2000/svg';

  values.forEach((v, i) => {
    const h = ((baseY - padTop) * v) / max;
    const x = padLeft + slot * i + (slot - barW) / 2;
    const y = baseY - h;

    // Barra
    const rect = document.createElementNS(SVGNS, 'rect');
    rect.setAttribute('class', 'bar-rect');
    rect.setAttribute('x', x.toFixed(1));
    rect.setAttribute('width', barW.toFixed(1));
    rect.setAttribute('rx', '5');
    // Estado inicial (para animar el crecimiento)
    rect.setAttribute('y', baseY);
    rect.setAttribute('height', 0);
    group.appendChild(rect);

    // Valor sobre la barra
    const val = document.createElementNS(SVGNS, 'text');
    val.setAttribute('class', 'bar-value');
    val.setAttribute('x', (x + barW / 2).toFixed(1));
    val.setAttribute('y', (y - 6).toFixed(1));
    val.setAttribute('text-anchor', 'middle');
    val.textContent = v;
    group.appendChild(val);

    // Etiqueta del mes
    const lbl = document.createElementNS(SVGNS, 'text');
    lbl.setAttribute('class', 'bar-label');
    lbl.setAttribute('x', (x + barW / 2).toFixed(1));
    lbl.setAttribute('y', baseY + 20);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.textContent = labels[i] || '';
    group.appendChild(lbl);

    // Animación
    requestAnimationFrame(() => {
      rect.setAttribute('y', y.toFixed(1));
      rect.setAttribute('height', h.toFixed(1));
    });
  });
}
