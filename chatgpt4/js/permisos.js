function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

function verificarAcceso(rolesPermitidos = [], funcionesPermitidas = []) {
  const usuario = obtenerUsuarioActual();
  if (!usuario) {
    alert('Debes iniciar sesión.');
    window.location.href = '../index.html';
    return;
  }

  const tieneRol = rolesPermitidos.includes(usuario.rol);
  const tieneFuncion = funcionesPermitidas.includes(usuario.funcion);

  if (!tieneRol && !tieneFuncion) {
    alert('No tienes permiso para acceder a esta página.');
    window.location.href = '../menu.html';
  }
}
