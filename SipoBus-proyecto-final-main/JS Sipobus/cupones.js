// modo-oscuro.js
document.addEventListener("DOMContentLoaded", () => {
// --- Modo oscuro/claro funcional y sincronizado ---
const boton = document.getElementById("toggle-modo");
if (boton) {
function setModoOscuroUI(modoOscuroActivo) {
    if (modoOscuroActivo) {
    document.body.classList.add("dark-mode");
    } else {
    document.body.classList.remove("dark-mode");
    }
}
document.getElementById('toggle-modo').addEventListener('click', () => {
document.body.classList.toggle('dark-mode');
localStorage.setItem('modoOscuro', document.body.classList.contains('dark-mode'));
});

// Al cargar la página, revisa si ya se había activado el modo oscuro
window.addEventListener('DOMContentLoaded', () => {
const modoOscuroActivo = localStorage.getItem('modoOscuro') === 'true';
if (modoOscuroActivo) {
    document.body.classList.add('dark-mode');
}
});

// Corrige: localStorage guarda booleano como string, comparar con "true"
let modoOscuroActivo = localStorage.getItem("modoOscuro");
if (modoOscuroActivo === null) {
    modoOscuroActivo = window.matchMedia("(prefers-color-scheme: dark)").matches;
    localStorage.setItem("modoOscuro", modoOscuroActivo ? "true" : "false");
} else {
    modoOscuroActivo = modoOscuroActivo === "true";
}
setModoOscuroUI(modoOscuroActivo);

boton.addEventListener("click", () => {
    const nuevoModo = !document.body.classList.contains("dark-mode");
    setModoOscuroUI(nuevoModo);
    localStorage.setItem("modoOscuro", nuevoModo ? "true" : "false");
});
}

// Mostrar y agregar cupones
const cuponesDiv = document.getElementById("cupones-lista");
const formAgregar = document.getElementById("formAgregarCupon");
const inputNuevo = document.getElementById("nuevo-cupon");
const mensajeCupon = document.getElementById("mensaje-cupon");

function getUser() {
let user = JSON.parse(localStorage.getItem("userLogueado") || "null");
if (!user) user = JSON.parse(localStorage.getItem("userProfile") || "null");
return user;
}
function setUser(user) {
localStorage.setItem("userLogueado", JSON.stringify(user));
localStorage.setItem("userProfile", JSON.stringify(user));
}

window.renderCupones = function() {
const user = getUser();
let cupones = (user && user.cupones) ? user.cupones : [];
if (cupones.length === 0) {
    cuponesDiv.innerHTML = "<p>No tienes cupones activos.</p>";
    return;
}
cuponesDiv.innerHTML = cupones.map(c => `
    <div class="cupon">
    <span style="font-weight:bold;">${c}</span>
    <button onclick="navigator.clipboard.writeText('${c}');this.textContent='¡Copiado!';setTimeout(()=>this.textContent='Copiar',1200);" style="margin-left:1rem;padding:0.3rem 0.7rem;border-radius:6px;background:var(--azul-oscuro);color:#fff;border:none;cursor:pointer;">Copiar</button>
    </div>
`).join("");
};

window.renderCupones();

if (formAgregar) {
formAgregar.onsubmit = function(e) {
    e.preventDefault();
    const codigo = inputNuevo.value.trim().toUpperCase();
    if (!codigo) return;
    let user = getUser();
    if (!user) {
    mensajeCupon.textContent = "Debes iniciar sesión para agregar cupones.";
    mensajeCupon.style.display = "block";
    return;
    }
    if (!user.cupones) user.cupones = [];
    if (user.cupones.includes(codigo)) {
    mensajeCupon.textContent = "¡Ya tienes este cupón!";
    mensajeCupon.style.display = "block";
    return;
    }
    user.cupones.push(codigo);
    setUser(user);
    mensajeCupon.textContent = "¡Cupón agregado!";
    mensajeCupon.style.display = "block";
    inputNuevo.value = "";
    window.renderCupones();
    setTimeout(() => mensajeCupon.style.display = "none", 2000);
};
}
});

