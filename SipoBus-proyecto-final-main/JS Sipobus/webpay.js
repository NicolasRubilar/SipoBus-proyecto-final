document.addEventListener('DOMContentLoaded', () => {
  const resumenDiv = document.getElementById('resumenCompra');
  const formPago = document.getElementById('formPago');
  const numeroTarjeta = document.getElementById('numeroTarjeta');
  const fechaExpiracion = document.getElementById('fechaExpiracion');
  const cvv = document.getElementById('cvv');
  const errorNumero = document.getElementById('errorNumero');
  const errorFecha = document.getElementById('errorFecha');
  const errorCVV = document.getElementById('errorCVV');
  const procesandoDiv = document.getElementById('procesando');

  const resumen = JSON.parse(localStorage.getItem('resumenCompra'));

  const precios = {
    normal: 2000,
    'sillon-cama': 3000,
    discapacitado: 2000,
    comida: 1000
  };

  function formatearPrecio(num) {
    return '$' + num.toLocaleString('es-CL') + ' CLP';
  }

  function mostrarResumen() {
    if (!resumen || !resumen.asientos || resumen.asientos.length === 0) {
      resumenDiv.innerHTML = '<p>No hay datos de la compra.</p>';
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
              <li>Asiento ${a.id} (${a.tipo.replace('-', ' ')}) - ${formatearPrecio(precios[a.tipo] || 0)}</li>
            `).join('')}
          </ul>
        </li>
        <li><strong>Comida:</strong> ${resumen.comida ? 'Sí (+ $1.000 por persona)' : 'No'}</li>
      </ul>
    `;

    // Calcular total exacto nuevamente
    let total = resumen.asientos.reduce((sum, a) => sum + (precios[a.tipo] || 0), 0);
    if (resumen.comida) {
      total += resumen.asientos.length * precios.comida;
    }

    html += `<p><strong>Total a pagar:</strong> ${formatearPrecio(total)}</p>`;
    resumenDiv.innerHTML = html;

    // Actualiza total en resumen, por si era incorrecto
    resumen.total = formatearPrecio(total);
    localStorage.setItem('resumenCompra', JSON.stringify(resumen));
  }

  function limpiarErrores() {
    [numeroTarjeta, fechaExpiracion, cvv].forEach(input => input.classList.remove('error'));
    [errorNumero, errorFecha, errorCVV].forEach(e => e.textContent = '');
  }

  function validarNumeroTarjeta(value) {
    return /^\d{16}$/.test(value.replace(/\s+/g, ''));
  }

  function validarFecha(value) {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mes, anio] = value.split('/').map(Number);
    const anioActual = new Date().getFullYear() % 100;
    return mes >= 1 && mes <= 12 && anio >= anioActual;
  }

  function validarCVV(value) {
    return /^\d{3,4}$/.test(value);
  }

  formPago.addEventListener('submit', e => {
    e.preventDefault();
    limpiarErrores();

    let valido = true;

    if (!validarNumeroTarjeta(numeroTarjeta.value)) {
      valido = false;
      numeroTarjeta.classList.add('error');
      errorNumero.textContent = 'Número de tarjeta inválido';
    }

    if (!validarFecha(fechaExpiracion.value)) {
      valido = false;
      fechaExpiracion.classList.add('error');
      errorFecha.textContent = 'Fecha inválida (MM/AA)';
    }

    if (!validarCVV(cvv.value)) {
      valido = false;
      cvv.classList.add('error');
      errorCVV.textContent = 'CVV inválido';
    }

    if (!valido) return;

    procesandoDiv.style.display = 'block';

    setTimeout(() => {
      procesandoDiv.style.display = 'none';
      // Guardar viaje en el usuario logueado
      let user = JSON.parse(localStorage.getItem('userLogueado'));
      if (user) {
        if (!user.viajes) user.viajes = [];
        // Estructura del viaje
        user.viajes.push({
          origen: resumen.origen,
          destino: resumen.destino,
          fecha: resumen.fecha,
          hora: resumen.hora,
          asientos: resumen.asientos,
          comida: resumen.comida,
          total: resumen.total, // número
          totalFormateado: resumen.totalFormateado // string formateado
        });
        localStorage.setItem('userLogueado', JSON.stringify(user));
        localStorage.setItem('userProfile', JSON.stringify(user));
      }
      alert('¡Pago exitoso! Gracias por tu compra en SipoBus.');
      window.location.href = 'simular_pago.html';
    }, 3000);
  });

  mostrarResumen();
});
