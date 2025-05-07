const menuContainer = document.getElementById('menuContainer');
const usuario = JSON.parse(sessionStorage.getItem('usuario'));

const opcionesMenu = [
  { nombre: 'Mantenimiento de Usuarios', url: 'config/usuarios.html', roles: ['administrador'] },
  { nombre: 'Mantenimiento de Equipos', url: 'config/equipos.html', roles: ['administrador'], funciones: ['coordinador'] },
  { nombre: 'Mantenimiento de Jugadores', url: 'config/jugadores.html', roles: ['administrador'], funciones: ['coordinador'] },
  { nombre: 'Auditoría', url: 'config/auditoria.html', roles: ['administrador'] },
  { nombre: 'Estadísticas del Partido', url: 'gestion/estadisticas.html', roles: ['administrador', 'usuario'] },
  { nombre: 'Histórico de Partidos', url: 'gestion/historico.html', roles: ['administrador', 'usuario'] },
  { nombre: 'Análisis de Datos', url: 'gestion/analisis.html', roles: ['administrador', 'usuario'] }
];

function mostrarMenu() {
  if (!usuario) {
    alert('Debes iniciar sesión.');
    window.location.href = 'index.html';
    return;
  }

  opcionesMenu.forEach(opcion => {
    const permitido =
      (opcion.roles && opcion.roles.includes(usuario.rol)) ||
      (opcion.funciones && opcion.funciones.includes(usuario.funcion));

    if (permitido) {
      const enlace = document.createElement('a');
      enlace.href = opcion.url;
      enlace.textContent = opcion.nombre;
      menuContainer.appendChild(enlace);
    }
  });
}

mostrarMenu();
