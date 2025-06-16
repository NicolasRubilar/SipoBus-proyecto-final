document.addEventListener('DOMContentLoaded', () => {
  // Precios por tipo de asiento
  const precios = {
    normal: 2000,
    'sillon-cama': 3000,
    discapacitado: 2000,
    comida: 1000
  };

  // Función para obtener el tipo de asiento por número (ej: 1A, 6C)
  function tipoAsiento(numero) {
    const fila = parseInt(numero);
    if (fila >= 1 && fila <= 2) return 'discapacitado';
    if (fila >= 3 && fila <= 5) return 'normal';
    if (fila >= 6 && fila <= 8) return 'sillon-cama';
    return 'normal'; // fallback
  }

  // Obtener datos del localStorage
  const asientosSeleccionados = JSON.parse(localStorage.getItem('asientos')) || [];
  const incluyeComida = localStorage.getItem('comida') === 'true';

  // Referencias al DOM para mostrar detalles (opcional)
  const asientosListaDiv = document.getElementById('asientosSeleccionados');
  const totalDiv = document.getElementById('totalCompra');

  // Mostrar asientos seleccionados con precio (opcional)
  if (asientosSeleccionados.length === 0) {
    asientosListaDiv.innerHTML = '<p>No hay asientos seleccionados.</p>';
    totalDiv.textContent = 'Total: $0 CLP';
  } else {
    asientosListaDiv.innerHTML = '';
    let total = 0;

    asientosSeleccionados.forEach(num => {
      const tipo = tipoAsiento(num);
      const precio = precios[tipo] || 0;
      total += precio;

      const div = document.createElement('div');
      div.textContent = `Asiento ${num} (${tipo.replace('-', ' ')}) - $${precio.toLocaleString('es-CL')} CLP`;
      asientosListaDiv.appendChild(div);
    });

    if (incluyeComida) {
      const precioComida = precios.comida * asientosSeleccionados.length;
      total += precioComida;

      const comidaDiv = document.createElement('div');
      comidaDiv.textContent = `Incluye comida (+$${precioComida.toLocaleString('es-CL')} CLP)`;
      asientosListaDiv.appendChild(comidaDiv);
    }

    totalDiv.textContent = `Total: $${total.toLocaleString('es-CL')} CLP`;
  }

  // Manejo del formulario de compra
  const form = document.getElementById('formCompra');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const origen = form.origen.value;
    const destino = form.destino.value;
    const fecha = form.fecha.value;
    const hora = form.hora.value;

    if (origen === destino) {
      alert('El origen y el destino no pueden ser iguales.');
      return;
    }

    if (asientosSeleccionados.length === 0) {
      alert('No hay asientos seleccionados.');
      return;
    }

    // Calcular total de nuevo por seguridad
    let total = 0;
    asientosSeleccionados.forEach(num => {
      const tipo = tipoAsiento(num);
      total += precios[tipo] || 0;
    });
    if (incluyeComida) {
      total += precios.comida * asientosSeleccionados.length;
    }

    // Guardar resumen en localStorage para siguiente página
    const resumenCompra = {
      origen,
      destino,
      fecha,
      hora,
      asientos: asientosSeleccionados.map(num => ({ id: num, tipo: tipoAsiento(num) })),
      comida: incluyeComida,
      total: `$${total.toLocaleString('es-CL')} CLP`
    };
    localStorage.setItem('resumenCompra', JSON.stringify(resumenCompra));

    // Redirigir a la página final (total_compra.html)
    window.location.href = 'total_compra.html';
  });
});
