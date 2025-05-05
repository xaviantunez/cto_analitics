// auth.js

// Función para cargar usuarios desde el archivo JSON
async function cargarUsuarios() {
  try {
    const respuesta = await fetch('usuarios.json');  // Cargar el archivo usuarios.json desde el servidor
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el archivo de usuarios');
    }
    const usuarios = await respuesta.json();
    return usuarios;
  } catch (error) {
    console.error('Error al cargar los usuarios:', error);
    return [];
  }
}

// Función para validar el inicio de sesión
async function iniciarSesion() {
  const usuario = document.getElementById("usuario").value;
  const contraseña = document.getElementById("contraseña").value;

  const usuarios = await cargarUsuarios();

  // Buscar el usuario que coincida con el nombre de usuario y contraseña
  const usuarioValido = usuarios.find(u => u.usuario === usuario && u.contraseña === contraseña);

  if (usuarioValido) {
    sessionStorage.setItem("usuario", JSON.stringify(usuarioValido));
    window.location.href = "index.html"; // Redirigir a la página principal
  } else {
    alert("Usuario o contraseña incorrectos.");
  }
}

// Función para cerrar sesión
function cerrarSesion() {
  sessionStorage.removeItem("usuario");
  window.location.href = "login.html"; // Redirigir a la página de login
}

// Verificar si el usuario tiene sesión iniciada
function verificarSesion() {
  const usuarioGuardado = JSON.parse(sessionStorage.getItem("usuario"));

  if (!usuarioGuardado) {
    window.location.href = "login.html"; // Redirigir al login si no está logueado
  }
  return usuarioGuardado;
}

// Función para verificar el rol del usuario y redirigir si no tiene acceso
async function verificarAcceso(rolesPermitidos) {
  const usuarioGuardado = verificarSesion();

  if (!rolesPermitidos.includes(usuarioGuardado.rol)) {
    alert("No tienes permisos para acceder a esta página.");
    window.location.href = "index.html"; // Redirigir a la página principal si no tiene permisos
  }
}

// Función para obtener el rol del usuario actual
function obtenerRol() {
  const usuarioGuardado = verificarSesion();
  return usuarioGuardado ? usuarioGuardado.rol : null;
}

// Llamar esta función al cargar las páginas que requieren autenticación
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.id === "mantenimientoUsuarios") {
    verificarAcceso(["administrador"]);
  }
});
