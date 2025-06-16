document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const errorCorreo = document.getElementById("error-correo");
    const errorContrasena = document.getElementById("error-contrasena");

    errorCorreo.textContent = "";
    errorContrasena.textContent = "";

    // Obtener usuario registrado
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    if (!userProfile || userProfile.correo !== correo) {
      errorCorreo.textContent = "Correo no registrado.";
      return;
    }
    if (userProfile.clave !== contrasena) {
      errorContrasena.textContent = "Contraseña incorrecta.";
      return;
    }

    // Guardar sesión
    localStorage.setItem("userLogueado", JSON.stringify(userProfile));
    window.location.href = "perfil.html";
  });
});
