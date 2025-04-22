
const form = document.getElementById("formUsuario");
const lista = document.getElementById("listaUsuarios");
const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

function renderUsuarios() {
  lista.innerHTML = "";
  usuarios.forEach((u, i) => {
    const li = document.createElement("li");
    li.textContent = u.nombre + " (" + u.rol + ")";
    lista.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreUsuario").value;
  const pass = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;
  usuarios.push({ nombre, pass, rol });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  renderUsuarios();
});

renderUsuarios();
