document.addEventListener("DOMContentLoaded", function () {
  const resumenDiv = document.getElementById("resumenCompra");
  const btnPagar = document.getElementById("btnPagar");
  // --- NUEVO: campo para cupón
  let cuponInput, cuponBtn, cuponMsg;

  const precios = {
    normal: 2000,
    "sillon-cama": 3000,
    discapacitado: 2000,
    comida: 1000
  };

  function formatearPrecio(num) {
    return "$" + num.toLocaleString("es-CL") + " CLP";
  }

  function getUserCupones() {
    let user = JSON.parse(localStorage.getItem("userLogueado") || "null");
    if (!user) user = JSON.parse(localStorage.getItem("userProfile") || "null");
    return user && user.cupones ? user.cupones : [];
  }

  let resumen = JSON.parse(localStorage.getItem("resumenCompra"));
  let cupDescuento = 0;
  let cupUsado = "";

  function renderResumen() {
    if (!resumen || !resumen.asientos || resumen.asientos.length === 0) {
      resumenDiv.innerHTML = "<p>No hay datos de la compra.</p>";
      btnPagar.style.display = "none";
      return;
    }
    let html = `
      <ul>
        <li><strong>Origen:</strong> ${resumen.origen}</li>
        <li><strong>Destino:</strong> ${resumen.destino}</li>
        <li><strong>Fecha:</strong> ${resumen.fecha}</li>
        <li><strong>Hora:</strong> ${resumen.hora}</li>
        <li><strong>Asientos:</strong>
          <ul>
            ${resumen.asientos.map(a => `
              <li>Asiento ${a.id} (${a.tipo.replace("-", " ")}) - ${formatearPrecio(precios[a.tipo] || 0)}</li>
            `).join("")}
          </ul>
        </li>
        <li><strong>Comida:</strong> ${resumen.comida ? "Sí (+ $1.000 por persona)" : "No"}</li>
      </ul>
    `;
    let total = resumen.asientos.reduce((sum, a) => sum + (precios[a.tipo] || 0), 0);
    if (resumen.comida) {
      total += resumen.asientos.length * precios.comida;
    }
    if (cupDescuento > 0) {
      html += `<p style="color:green;"><strong>Descuento aplicado (${cupUsado}): -${formatearPrecio(cupDescuento)}</strong></p>`;
    }
    html += `<p><strong>Total a pagar:</strong> ${formatearPrecio(total - cupDescuento)}</p>`;
    resumenDiv.innerHTML = html;

    // Campo para cupón
    if (!document.getElementById("cupon-section")) {
      const cuponSection = document.createElement("div");
      cuponSection.id = "cupon-section";
      cuponSection.style.margin = "1.5rem 0";
      cuponSection.innerHTML = `
        <input type="text" id="cupon-input" placeholder="Código de cupón" style="padding:0.5rem;border-radius:6px;border:1px solid #ccc;">
        <button id="cupon-btn" style="padding:0.5rem 1rem;border-radius:6px;background:var(--azul-oscuro);color:#fff;border:none;margin-left:0.5rem;">Aplicar cupón</button>
        <span id="cupon-msg" style="margin-left:1rem;font-weight:600;"></span>
      `;
      resumenDiv.parentNode.insertBefore(cuponSection, resumenDiv.nextSibling);
      cuponInput = document.getElementById("cupon-input");
      cuponBtn = document.getElementById("cupon-btn");
      cuponMsg = document.getElementById("cupon-msg");

      cuponBtn.onclick = function () {
        const codigo = cuponInput.value.trim().toUpperCase();
        if (!codigo) return;
        const cupones = getUserCupones();
        if (!cupones.includes(codigo)) {
          cuponMsg.textContent = "Cupón no válido o no disponible.";
          cuponMsg.style.color = "red";
          return;
        }
        if (cupUsado && cupUsado === codigo) {
          cuponMsg.textContent = "Ya aplicaste este cupón.";
          cuponMsg.style.color = "orange";
          return;
        }
        // Descuento: 10% del total antes de descuento
        let totalBase = resumen.asientos.reduce((sum, a) => sum + (precios[a.tipo] || 0), 0);
        if (resumen.comida) totalBase += resumen.asientos.length * precios.comida;
        cupDescuento = Math.round(totalBase * 0.10);
        cupUsado = codigo;
        cuponMsg.textContent = "¡Cupón aplicado! 10% de descuento.";
        cuponMsg.style.color = "green";
        renderResumen();
      };
    }
    // Actualiza total en resumen, por si era incorrecto
    resumen.total = total - cupDescuento;
    resumen.totalFormateado = formatearPrecio(total - cupDescuento);
    localStorage.setItem("resumenCompra", JSON.stringify(resumen));
  }

  renderResumen();

  btnPagar.onclick = function () {
    window.location.href = "webpay.html";
  };
});
