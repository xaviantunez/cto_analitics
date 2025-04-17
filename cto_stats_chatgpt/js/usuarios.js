document.addEventListener("DOMContentLoaded", () => {
  if (!esAdmin()) {
    alert("Acceso denegado. Solo el administrador puede ver esta página.");
    window.location.href = "../index.html";
  }
  cargarFunciones();
  cargarUsuarios();
});

function esAdmin() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user && user.funciones.includes("admin");
}

function crearUsuario() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const equipo = document.getElementById("equipo").value.trim();
  const checkboxes = document.querySelectorAll("#funciones-lista input[type='checkbox']:checked");
  const funciones = Array.from(checkboxes).map(c => c.value);

  if (!username || !password || funciones.length === 0) {
    alert("Completa todos los campos y selecciona al menos una función.");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios.push({ username, password, equipo, funciones });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  cargarUsuarios();
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("equipo").value = "";
  checkboxes.forEach(c => c.checked = false);
}

function cargarUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const tbody = document.getElementById("tabla-usuarios");
  tbody.innerHTML = "";

  usuarios.forEach((usuario, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.username}</td>
      <td>${usuario.equipo || "-"}</td>
      <td>${usuario.funciones.join(", ")}</td>
      <td><button onclick="eliminarUsuario(${i})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function eliminarUsuario(index) {
  if (confirm("¿Eliminar este usuario?")) {
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios.splice(index, 1);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    cargarUsuarios();
  }
}

function agregarFuncion() {
  const nueva = document.getElementById("nueva-funcion").value.trim();
  if (!nueva) return;
  let funciones = JSON.parse(localStorage.getItem("funciones")) || ["admin", "coordinador", "entrenador", "delegado"];
  if (!funciones.includes(nueva)) funciones.push(nueva);
  localStorage.setItem("funciones", JSON.stringify(funciones));
  cargarFunciones();
  document.getElementById("nueva-funcion").value = "";
}

function eliminarFuncion(nombre) {
  let funciones = JSON.parse(localStorage.getItem("funciones")) || [];
  funciones = funciones.filter(f => f !== nombre);
  localStorage.setItem("funciones", JSON.stringify(funciones));
  cargarFunciones();
}

function cargarFunciones() {
  let funciones = JSON.parse(localStorage.getItem("funciones")) || ["admin", "coordinador", "entrenador", "delegado"];
  const contenedor = document.getElementById("funciones-lista");
  const ul = document.getElementById("lista-funciones");
  contenedor.innerHTML = "";
  ul.innerHTML = "";

  funciones.forEach(func => {
    const checkbox = document.createElement("label");
    checkbox.innerHTML = `<input type="checkbox" value="${func}"> ${func}`;
    contenedor.appendChild(checkbox);

    const li = document.createElement("li");
    li.textContent = func + " ";
    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => eliminarFuncion(func);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}
