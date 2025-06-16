document.addEventListener('DOMContentLoaded', () => {
  // Protección: solo usuarios logueados pueden usar esta página
  if (!localStorage.getItem('userLogueado')) {
    alert('Debes iniciar sesión para comprar pasajes.');
    window.location.href = 'crear_usuario.html';
    return;
  }

  const busContainer = document.getElementById("bus-container");
  const btnComprar = document.getElementById("btnComprar");
  const comidaCheckbox = document.getElementById("agregar-comida");

  // Configuración de asientos:
  // - Discapacitados: primeras 2 filas (8 asientos)
  // - Normales: filas del medio (filas 2 a 5)
  // - Sillón cama: últimas 2 filas (filas 6 y 7)
  const filas = 8, columnas = 4;
  let asientos = [];
  for (let f = 0; f < filas; f++) {
    let fila = [];
    for (let c = 0; c < columnas; c++) {
      let tipo;
      if (f < 2) {
        tipo = "discapacitado";
      } else if (f < 6) {
        tipo = "normal";
      } else {
        tipo = "sillon-cama";
      }
      fila.push({ id: f * columnas + c + 1, tipo, seleccionado: false });
    }
    asientos.push(fila);
  }

  function renderBus() {
    busContainer.innerHTML = "";
    asientos.forEach((fila, i) => {
      const row = document.createElement("div");
      row.className = "fila-bus";
      fila.forEach((asiento, j) => {
        const btn = document.createElement("div");
        btn.className = `asiento ${asiento.tipo} ${asiento.seleccionado ? "seleccionado" : ""}`;
        btn.textContent = asiento.id;
        btn.onclick = () => {
          asiento.seleccionado = !asiento.seleccionado;
          renderBus();
        };
        row.appendChild(btn);
        if (j === 1) {
          const pasillo = document.createElement("div");
          pasillo.className = "pasillo";
          row.appendChild(pasillo);
        }
      });
      busContainer.appendChild(row);
    });
  }
  renderBus();

  btnComprar.onclick = function () {
    const seleccionados = [];
    asientos.flat().forEach(a => {
      if (a.seleccionado) seleccionados.push({ id: a.id, tipo: a.tipo });
    });
    if (seleccionados.length === 0) {
      alert("Selecciona al menos un asiento.");
      return;
    }
    // Obtener datos del viaje desde localStorage
    const origen = localStorage.getItem('origen');
    const destino = localStorage.getItem('destino');
    const fecha = localStorage.getItem('fecha');
    const hora = localStorage.getItem('hora');
    if (!origen || !destino || !fecha || !hora) {
      alert("Faltan datos del viaje. Vuelve a seleccionar origen y destino.");
      window.location.href = "resumen_compra.html";
      return;
    }
    const resumen = {
      origen,
      destino,
      fecha,
      hora,
      asientos: seleccionados,
      comida: comidaCheckbox.checked
    };
    localStorage.setItem("resumenCompra", JSON.stringify(resumen));
    window.location.href = "total_compra.html";
  };
});
