// js/usuarios.js

let usuarios = [];
let auditoria = [];
let usuarioActual = JSON.parse(localStorage.getItem("usuario_actual")) || null;
let funciones = usuarioActual?.funciones || [];
let rol = usuarioActual?.rol || "";

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
  cargarAuditoria();
  configurarInterfaz();
  document.getElementById("crearUsuarioBtn").addEventListener("click", crearUsuario);
});

function cargarUsuarios() {
  fetch('data/usuarios.json')
    .then(response => response.json())
    .then(data => {
      usuarios = data;
      mostrarUsuarios();
    })
    .catch(error => console.error('Error al cargar los usuarios:', error));
}

function guardarUsuarios() {
  fetch('data/usuarios.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuarios)
  })
  .then(response => response.json())
  .then(() => console.log('Usuarios guardados correctamente'))
  .catch(error => console.error('Error al guardar los usuarios:', error));
}

function cargarAuditoria() {
  fetch('data/auditoria.json')
    .then(response => response.json())
    .then(data => {
      auditoria = data;
    })
    .catch(error => console.error('Error al cargar la auditoría:', error));
}

function guardarAuditoria() {
  fetch('data/auditoria.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auditoria)
  })
  .then(response => response.json())
  .then(() => console.log('Auditoría guardada correctamente'))
  .catch(error => console.error('Error al guardar la auditoría:', error));
}

function configurarInterfaz() {
  if (rol !== "administrador") {
    document.getElementById("crearUsuarioBtn").style.display = "none";
  }
}

function mostrarUsuarios() {
  const contenedor = document.getElementById("usuariosContainer");
  contenedor.innerHTML = "";
  usuarios.forEach((usuario, index) => {
    const div = document.createElement("div");
    div.className = "usuario-card";
    div.innerHTML = `
      <h3>${usuario.nombre}</h3>
      <p>Rol: ${usuario.rol}</p>
      <p>Funciones: ${usuario.funciones.join(", ")}</p>
      ${rol === "administrador" ? `
        <button onclick="editarUsuario(${index})">Editar</button>
        <button onclick="borrarUsuario(${index})">Borrar</button>
      ` : ""}
    `;
    contenedor.appendChild(div);
  });
}

function crearUsuario() {
  const nombre = prompt("Introduce el nombre del nuevo usuario:");
  const rol = prompt("Introduce el rol del nuevo usuario (administrador/usuario):");
  const funciones = prompt("Introduce las funciones del usuario (separadas por coma):").split(",").map(f => f.trim());

  if (nombre && rol && funciones.length > 0) {
    usuarios.push({ nombre, rol, funciones });
    guardarUsuarios();
    mostrarUsuarios();
    registrarAccion(`Creó el usuario ${nombre} con rol ${rol} y funciones ${funciones.join(", ")}`);
  } else {
    alert("Todos los campos son obligatorios.");
  }
}

function editarUsuario(index) {
  const usuario = usuarios[index];
  const nombre = prompt("Editar nombre del usuario:", usuario.nombre);
  const rol = prompt("Editar rol del usuario:", usuario.rol);
  const funciones = prompt("Editar funciones del usuario (separadas por coma):", usuario.funciones.join(", ")).split(",").map(f => f.trim());

  if (nombre && rol && funciones.length > 0) {
    usuarios[index] = { nombre, rol, funciones };
    guardarUsuarios();
    mostrarUsuarios();
    registrarAccion(`Editó el usuario ${nombre} con rol ${rol} y funciones ${funciones.join(", ")}`);
  } else {
    alert("Todos los campos son obligatorios.");
  }
}

function borrarUsuario(index) {
  const usuario = usuarios[index];
  if (confirm(`¿Estás seguro de que deseas borrar al usuario ${usuario.nombre}?`)) {
    usuarios.splice(index, 1);
    guardarUsuarios();
    mostrarUsuarios();
    registrarAccion(`Borró al usuario ${usuario.nombre}`);
  }
}

function registrarAccion(accion) {
  const ahora = new Date();
  auditoria.push({
    usuario: usuarioActual?.nombre || "desconocido",
    accion: accion,
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString()
  });
  guardarAuditoria();
}
