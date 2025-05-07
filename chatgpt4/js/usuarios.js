verificarAcceso(['administrador']);

async function cargarEquipos() {
  try {
    const res = await fetch('../data/equipos.json');
    const equipos = await res.json();
    const select = document.getElementById('nuevoEquipo');
    equipos.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.nombre;
      opt.textContent = e.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando equipos:', err);
  }
}

async function cargarUsuarios() {
  const res = await fetch('../data/usuarios.json');
  const usuarios = await res.json();
  const tbody = document.querySelector('#tablaUsuarios tbody');
  tbody.innerHTML = '';
  usuarios.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.usuario}</td>
      <td>${u.rol}</td>
      <td>${u.funcion}</td>
      <td>${u.equipo || '-'}</td>
      <td><button onclick="eliminarUsuario(${i})">Eliminar</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function guardarUsuario(e) {
  e.preventDefault();

  const usuario = document.getElementById('nuevoUsuario').value.trim();
  const contrasena = document.getElementById('nuevaContrasena').value;
  const rol = document.getElementById('nuevoRol').value;
  const funcion = document.getElementById('nuevaFuncion').value;
  const equipo = document.getElementById('nuevoEquipo').value;

  const res = await fetch('../data/usuarios.json');
  const usuarios = await res.json();

  usuarios.push({ usuario, contrasena, rol, funcion, equipo });

  const blob = new Blob([JSON.stringify(usuarios, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'usuarios.json';
  a.click();

  alert('Usuario guardado. Descarga y reemplaza manualmente el archivo usuarios.json.');
  location.reload();
}

function eliminarUsuario(index) {
  alert('Debes eliminar el usuario manualmente en el archivo usuarios.json.');
}

document.getElementById('usuarioForm').addEventListener('submit', guardarUsuario);
cargarEquipos();
cargarUsuarios();
