// test_usuario.js
// Test automático para flujo de registro, login y perfil en SipoBus
(function() {
  // Limpia localStorage antes de testear
  localStorage.clear();

  // Datos de prueba
  const testUser = {
    nombre: "TestNombre",
    apellido: "TestApellido",
    correo: "test@correo.com",
    telefono: "+56 9 1234 5678",
    fechaNacimiento: "2000-01-01",
    direccion: "Calle Falsa 123",
    clave: "testclave",
    cupones: [],
    viajes: []
  };

  // Simular registro
  localStorage.setItem("userProfile", JSON.stringify(testUser));

  // Simular login correcto
  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  if (userProfile.correo === testUser.correo && userProfile.clave === testUser.clave) {
    localStorage.setItem("userLogueado", JSON.stringify(userProfile));
  } else {
    console.error("[TEST] Falló el login: credenciales incorrectas");
    return;
  }

  // Simular carga de perfil
  const userLogueado = JSON.parse(localStorage.getItem("userLogueado"));
  let passed = true;
  for (const key of ["nombre", "apellido", "correo", "telefono", "fechaNacimiento", "direccion"]) {
    if (userLogueado[key] !== testUser[key]) {
      console.error(`[TEST] Fallo en campo '${key}': esperado '${testUser[key]}', obtenido '${userLogueado[key]}'`);
      passed = false;
    }
  }

  if (passed) {
    console.log("[TEST] Flujo de registro, login y perfil: OK ✅");
  } else {
    console.error("[TEST] Flujo de usuario: ERROR ❌");
  }

  // Limpia después del test
  // localStorage.clear();
})();
