document.addEventListener("DOMContentLoaded", () => {
  // Proteger acceso: si no hay sesión, redirigir
  const userLogueadoJSON = localStorage.getItem("userLogueado");
  if (!userLogueadoJSON) {
    alert("Debes iniciar sesión para ver tu perfil.");
    window.location.href = "crear_usuario.html";
    return;
  }
  const user = JSON.parse(userLogueadoJSON);

  // Mostrar datos en perfil
  document.getElementById("nombre-usuario").textContent = user.nombre || "Nombre no disponible";
  if(document.getElementById("nombre-usuario-span")) {
    document.getElementById("nombre-usuario-span").textContent = user.nombre || "Nombre no disponible";
  }
  if(document.getElementById("apellido-usuario")) {
    document.getElementById("apellido-usuario").textContent = user.apellido || "Apellido no disponible";
  }
  document.getElementById("correo-usuario").textContent = user.correo || "Correo no disponible";
  document.getElementById("telefono-usuario").textContent = user.telefono || "Teléfono no disponible";
  document.getElementById("direccion-usuario").textContent = user.direccion || "Dirección no disponible";
  document.getElementById("fecha-usuario").textContent = user.fechaNacimiento || "Fecha no disponible";

  // Cupones y viajes
  const listaCupones = document.getElementById("lista-cupones");
  if (listaCupones) {
    // Nuevo: cupones usados
    if (!user.cuponesUsados) user.cuponesUsados = [];
    if (user.cupones && user.cupones.length) {
      listaCupones.innerHTML = user.cupones.map(c => {
        const usado = user.cuponesUsados.includes(c);
        return `<li style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-weight:bold;">${c}</span>
          <span style="padding:0.2rem 0.7rem;border-radius:6px;font-weight:bold;${usado ? 'background:#f7d4d4;color:#a12121;' : 'background:#d4f7d4;color:#217a21;'}">
            ${usado ? 'Usado' : 'Activo'}
          </span>
          <button onclick="navigator.clipboard.writeText('${c}');this.textContent='¡Copiado!';setTimeout(()=>this.textContent='Copiar',1200);" style="padding:0.2rem 0.7rem;border-radius:6px;background:#1e1e2f;color:#fff;border:none;cursor:pointer;font-size:0.95rem;">Copiar</button>
        </li>`;
      }).join("");
    } else {
      listaCupones.innerHTML = "<li>No tienes cupones activos.</li>";
    }
  }

  // Crear modal para editar viaje
  let modalEditarViaje = document.createElement("div");
  modalEditarViaje.id = "modalEditarViaje";
  modalEditarViaje.style.display = "none";
  modalEditarViaje.style.position = "fixed";
  modalEditarViaje.style.top = "0";
  modalEditarViaje.style.left = "0";
  modalEditarViaje.style.width = "100vw";
  modalEditarViaje.style.height = "100vh";
  modalEditarViaje.style.background = "rgba(0,0,0,0.3)";
  modalEditarViaje.style.justifyContent = "center";
  modalEditarViaje.style.alignItems = "center";
  modalEditarViaje.style.zIndex = "9999";
  modalEditarViaje.innerHTML = `
    <div style="background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:400px;width:90%;position:relative;">
      <button id="cerrarModalEditarViaje" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:1.3rem;cursor:pointer;">&times;</button>
      <h3 style="margin-top:0;">Editar viaje</h3>
      <form id="formEditarViaje" style="display:flex;flex-direction:column;gap:1rem;">
        <label>Origen: <input id="edit-viaje-origen" required></label>
        <label>Destino: <input id="edit-viaje-destino" required></label>
        <label>Fecha: <input id="edit-viaje-fecha" type="date" required></label>
        <label>Hora: <input id="edit-viaje-hora" type="time"></label>
        <label>Comida: <select id="edit-viaje-comida"><option value="true">Sí</option><option value="false">No</option></select></label>
        <label>Total: <input id="edit-viaje-total" type="number" min="0" step="0.01"></label>
        <button type="submit" style="background:#217a21;color:#fff;padding:0.6rem;border-radius:7px;border:none;font-weight:bold;cursor:pointer;">Guardar cambios</button>
      </form>
    </div>
  `;
  document.body.appendChild(modalEditarViaje);

  let viajeEditandoIdx = null;

  // Mostrar viajes activos (que no estén en viajesAnulados)
  const listaViajes = document.getElementById("lista-viajes");
  // Elimina la variable viajesActivos global, y muévela dentro de la función
  function renderViajesActivos() {
    // Recarga el usuario actualizado de localStorage
    const userActual = JSON.parse(localStorage.getItem("userLogueado"));
    let viajesActivos = Array.isArray(userActual.viajes) ? [...userActual.viajes] : [];
    if (Array.isArray(userActual.viajesAnulados) && userActual.viajesAnulados.length) {
      viajesActivos = viajesActivos.filter(v => {
        return !userActual.viajesAnulados.some(a =>
          a.origen === v.origen &&
          a.destino === v.destino &&
          a.fecha === v.fecha &&
          a.hora === v.hora
        );
      });
    }
    if (viajesActivos.length) {
      const hoy = new Date();
      listaViajes.innerHTML = viajesActivos.map((v, idx) => {
        // Parsear fecha (formato esperado: yyyy-mm-dd o similar)
        let disponible = false;
        if (v.fecha) {
          let fechaViaje = new Date(v.fecha);
          disponible = fechaViaje >= new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        }
        // Botón de anular viaje
        return `<li style="margin-bottom:1rem;">
          <div><strong>${v.origen} → ${v.destino}</strong> | Fecha: ${v.fecha} ${v.hora ? 'Hora: ' + v.hora : ''}</div>
          <div>Asientos: ${v.asientos ? v.asientos.map(a => a.id).join(', ') : v.asiento || ''} | Comida: ${v.comida ? 'Sí' : 'No'} | Total: ${v.totalFormateado || v.total || ''}</div>
          <span style="padding:0.2rem 0.7rem;border-radius:6px;font-weight:bold;${(() => { let disponible = false; if (v.fecha) { let fechaViaje = new Date(v.fecha); disponible = fechaViaje >= new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()); } return disponible ? 'background:#d4f7d4;color:#217a21;' : 'background:#f7d4d4;color:#a12121;'; })()}">
            ${(() => { let disponible = false; if (v.fecha) { let fechaViaje = new Date(v.fecha); disponible = fechaViaje >= new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()); } return disponible ? 'Disponible' : 'Vencido'; })()}
          </span>
          <button class="anular-viaje-btn" data-idx="${idx}" style="margin-left:1rem;padding:0.2rem 0.7rem;border-radius:6px;background:#a12121;color:#fff;border:none;cursor:pointer;font-size:0.95rem;">Anular</button>
          <button class="editar-viaje-btn" data-idx="${idx}" style="margin-left:0.5rem;padding:0.2rem 0.7rem;border-radius:6px;background:#1e1e2f;color:#fff;border:none;cursor:pointer;font-size:0.95rem;">Editar</button>
        </li>`;
      }).join("");
      // Asignar eventos a los botones de anular
      document.querySelectorAll(".anular-viaje-btn").forEach(btn => {
        btn.onclick = function() {
          const idx = parseInt(this.getAttribute("data-idx"));
          const viaje = viajesActivos[idx];
          if (!userActual.viajesAnulados) userActual.viajesAnulados = [];
          // Mover el viaje a viajesAnulados
          userActual.viajesAnulados.push(viaje);
          // Eliminar de viajes activos
          userActual.viajes = userActual.viajes.filter((v, i) =>
            !(v.origen === viaje.origen && v.destino === viaje.destino && v.fecha === viaje.fecha && v.hora === viaje.hora)
          );
          // Actualizar localStorage
          localStorage.setItem("userLogueado", JSON.stringify(userActual));
          localStorage.setItem("userProfile", JSON.stringify(userActual));
          // Actualizar arrays en memoria
          viajesActivos = Array.isArray(userActual.viajes) ? [...userActual.viajes] : [];
          // Refrescar listas
          renderViajesActivos();
          renderViajesAnulados();
          showToast("Pasaje eliminado exitosamente", "success");
        };
      });
      // Asignar eventos a los botones de editar
      document.querySelectorAll(".editar-viaje-btn").forEach(btn => {
        btn.onclick = function() {
          viajeEditandoIdx = parseInt(this.getAttribute("data-idx"));
          const viaje = viajesActivos[viajeEditandoIdx];
          document.getElementById("edit-viaje-origen").value = viaje.origen || "";
          document.getElementById("edit-viaje-destino").value = viaje.destino || "";
          document.getElementById("edit-viaje-fecha").value = viaje.fecha || "";
          document.getElementById("edit-viaje-hora").value = viaje.hora || "";
          document.getElementById("edit-viaje-comida").value = viaje.comida ? "true" : "false";
          document.getElementById("edit-viaje-total").value = viaje.total || "";
          modalEditarViaje.style.display = "flex";
        };
      });
    } else {
      listaViajes.innerHTML = "<li>No tienes viajes programados.</li>";
    }
  }
  renderViajesActivos();

  // Mostrar viajes anulados si existen
  const listaViajesAnulados = document.getElementById("lista-viajes-anulados");
  function renderViajesAnulados() {
    const userActual = JSON.parse(localStorage.getItem("userLogueado"));
    if (listaViajesAnulados) {
      if (userActual.viajesAnulados && userActual.viajesAnulados.length) {
        listaViajesAnulados.innerHTML = userActual.viajesAnulados.map(v => `
          <li class="viaje-anulado">
            <div><strong>${v.origen} → ${v.destino}</strong> | Fecha: ${v.fecha} ${v.hora ? 'Hora: ' + v.hora : ''}</div>
            <div>Asientos: ${v.asientos ? v.asientos.map(a => a.id).join(', ') : v.asiento || ''} | Comida: ${v.comida ? 'Sí' : 'No'} | Total: ${v.total || ''}</div>
            <span style="font-weight:bold;">Viaje anulado</span>
          </li>
        `).join("");
      } else {
        listaViajesAnulados.innerHTML = "<li>No tienes viajes anulados.</li>";
      }
    }
  }
  renderViajesAnulados();

  // Modal editar perfil
  const modal = document.getElementById("modalEditarPerfil");
  const editarBtn = document.getElementById("editarBtn");
  const cerrarModalBtn = document.getElementById("cerrarModalEditar");
  const formEditar = document.getElementById("formEditarPerfil");

  editarBtn.onclick = () => {
    document.getElementById("edit-nombre").value = user.nombre || "";
    document.getElementById("edit-apellido").value = user.apellido || "";
    document.getElementById("edit-correo").value = user.correo || "";
    document.getElementById("edit-telefono").value = user.telefono || "";
    document.getElementById("edit-direccion").value = user.direccion || "";
    document.getElementById("edit-fecha").value = user.fechaNacimiento || "";
    modal.style.display = "flex";
  };
  cerrarModalBtn.onclick = () => {
    modal.style.display = "none";
  };
  formEditar.onsubmit = function(e) {
    e.preventDefault();
    // Validar y guardar cambios
    user.nombre = document.getElementById("edit-nombre").value.trim();
    user.apellido = document.getElementById("edit-apellido").value.trim();
    user.correo = document.getElementById("edit-correo").value.trim();
    user.telefono = document.getElementById("edit-telefono").value.trim();
    user.direccion = document.getElementById("edit-direccion").value.trim();
    user.fechaNacimiento = document.getElementById("edit-fecha").value;
    // Actualizar localStorage
    localStorage.setItem("userLogueado", JSON.stringify(user));
    localStorage.setItem("userProfile", JSON.stringify(user));
    // Actualizar en pantalla
    document.getElementById("nombre-usuario").textContent = user.nombre;
    if(document.getElementById("nombre-usuario-span")) {
      document.getElementById("nombre-usuario-span").textContent = user.nombre;
    }
    if(document.getElementById("apellido-usuario")) {
      document.getElementById("apellido-usuario").textContent = user.apellido;
    }
    document.getElementById("correo-usuario").textContent = user.correo;
    document.getElementById("telefono-usuario").textContent = user.telefono;
    document.getElementById("direccion-usuario").textContent = user.direccion;
    document.getElementById("fecha-usuario").textContent = user.fechaNacimiento;
    modal.style.display = "none";
    showToast("Perfil actualizado correctamente.", "success");
    // Mejor: refrescar viajes y cupones tras editar perfil
    renderViajesActivos();
    renderViajesAnulados();
    // Si quieres refrescar cupones, puedes volver a renderizar la listaCupones aquí si lo deseas
  };

  // Cerrar sesión
  document.getElementById("cerrarSesion")?.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("userLogueado");
    showToast("Sesión cerrada. ¡Hasta pronto!", "success");
    setTimeout(() => {
      window.location.href = "inicio.html";
    }, 1200);
  });

  // Evento cerrar modal editar viaje
  document.getElementById("cerrarModalEditarViaje").onclick = () => {
    modalEditarViaje.style.display = "none";
    viajeEditandoIdx = null;
  };

  // Evento guardar cambios de viaje
  document.getElementById("formEditarViaje").onsubmit = function(e) {
    e.preventDefault();
    if (viajeEditandoIdx === null) return;
    const userActual = JSON.parse(localStorage.getItem("userLogueado"));
    let viajesActivos = Array.isArray(userActual.viajes) ? [...userActual.viajes] : [];
    let v = viajesActivos[viajeEditandoIdx];
    v.origen = document.getElementById("edit-viaje-origen").value.trim();
    v.destino = document.getElementById("edit-viaje-destino").value.trim();
    v.fecha = document.getElementById("edit-viaje-fecha").value;
    v.hora = document.getElementById("edit-viaje-hora").value;
    v.comida = document.getElementById("edit-viaje-comida").value === "true";
    v.total = document.getElementById("edit-viaje-total").value;
    userActual.viajes[viajeEditandoIdx] = v;
    localStorage.setItem("userLogueado", JSON.stringify(userActual));
    localStorage.setItem("userProfile", JSON.stringify(userActual));
    renderViajesActivos();
    modalEditarViaje.style.display = "none";
    showToast("Viaje modificado correctamente", "success");
    viajeEditandoIdx = null;
  };

  // Solo llama una vez a los renders iniciales
  renderViajesActivos();
  renderViajesAnulados();
});

// Utilidad para mostrar toasts modernos
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}