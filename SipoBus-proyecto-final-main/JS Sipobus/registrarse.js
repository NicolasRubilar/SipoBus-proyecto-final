// Registro de usuario
// Este archivo solo debe registrar usuarios
const form = document.getElementById("formRegistro");
const clave = document.getElementById("clave");
const confirmarClave = document.getElementById("confirmar-clave");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (clave.value !== confirmarClave.value) {
    alert("Las contraseñas no coinciden.");
    confirmarClave.focus();
    return;
  }

  // Validación básica de campos vacíos
  const campos = ["nombre", "apellido", "correo", "telefono", "fecha-nacimiento", "direccion", "clave"];
  for (const id of campos) {
    const input = document.getElementById(id);
    if (!input.value.trim()) {
      alert("Por favor completa todos los campos.");
      input.focus();
      return;
    }
  }

  // Capturar datos completos
  const userProfile = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    fechaNacimiento: document.getElementById("fecha-nacimiento").value,
    direccion: document.getElementById("direccion").value.trim(),
    clave: clave.value,
    cupones: [],
    viajes: []
  };

  localStorage.setItem("userProfile", JSON.stringify(userProfile));
  localStorage.setItem("userLogueado", JSON.stringify(userProfile));
  alert("Registro exitoso!");
  window.location.href = "perfil.html";
});
