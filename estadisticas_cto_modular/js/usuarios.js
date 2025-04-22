let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

function guardarUsuarios() {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function crearUsuario() {
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value;
  const equipo = document.getElementById('equipo').value.trim();
  const funciones = document.getElementById('funcion').value.split(',').map(f => f.trim());
  const rol = document.getElementById('rol').value;

  if (!usuario || !password) return alert('Usuario y contraseña obligatorios');

  usuarios.push({ usuario, password, equipo, funciones, rol });
  guardarUsuarios();
  renderUsuarios();

  document.getElementById('usuario').value = '';
  document.getElementById('password').value = '';
  document.getElementById('equipo').value = '';
  document.getElementById('funcion').value = '';
}

function eliminarUsuario(index) {
  if (confirm('¿Eliminar este usuario?')) {
    usuarios.splice(index, 1);
    guardarUsuarios();
    renderUsuarios();
  }
}

function renderUsuarios() {
  const tabla = document.getElementById('tabla-usuarios');
  tabla.innerHTML = '';

  usuarios.forEach((u, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.usuario}</td>
      <td>${u.rol}</td>
      <td>${u.equipo}</td>
      <td>${u.funciones.join(', ')}</td>
      <td><button onclick="eliminarUsuario(${index})">Eliminar</button></td>
    `;
    tabla.appendChild(tr);
  });
}

renderUsuarios();
