verificarAcceso(['administrador', 'coordinador']);

let jugadores = [];
let jugadorEditando = null;
const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

async function cargarJugadores() {
  const res = await fetch('../data/jugadores.json');
  jugadores = await res.json();
  mostrarJugadores();
}

function mostrarJugadores() {
  const filtroNombre = document.getElementById('filtroNombre').value.toLowerCase();
  const filtroApellidos = document.getElementById('filtroApellidos').value.toLowerCase();
  const filtroAnio = document.getElementById('filtroAnio').value;

  const tbody = document.querySelector('#tablaJugadores tbody');
  tbody.innerHTML = '';

  jugadores
    .filter(j =>
      j.nombre.toLowerCase().includes(filtroNombre) &&
      j.apellidos.toLowerCase().includes(filtroApellidos) &&
      (filtroAnio === '' || j.anioNacimiento == filtroAnio)
    )
    .forEach((j, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${j.nombre}</td>
        <td>${j.apellidos}</td>
        <td>${j.anioNacimiento}</td>
        <td>${j.numero}</td>
        <td>${j.telefono}</td>
        <td>${j.observaciones || ''}</td>
        <td>
          <button onclick="editarJugador(${index})">Editar</button>
          <button onclick="eliminarJugador(${index})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

function guardarJugador(e) {
  e.preventDefault();
  const nuevo = {
    nombre: document.getElementById('nombre').value.trim(),
    apellidos: document.getElementById('apellidos').value.trim(),
    anioNacimiento: parseInt(document.getElementById('anioNacimiento').value),
    numero: parseInt(document.getElementById('numero').value),
    telefono: document.getElementById('telefono').value.trim(),
    observaciones: document.getElementById('observaciones').value.trim()
  };

  if (jugadorEditando !== null) {
    jugadores[jugadorEditando] = nuevo;
    registrarAuditoria(`Editó jugador: ${nuevo.nombre} ${nuevo.apellidos}`);
  } else {
    jugadores.push(nuevo);
    registrarAuditoria(`Agregó jugador: ${nuevo.nombre} ${nuevo.apellidos}`);
  }

  exportarJugadores();
}

function editarJugador(index) {
  const j = jugadores[index];
  document.getElementById('nombre').value = j.nombre;
  document.getElementById('apellidos').value = j.apellidos;
  document.getElementById('anioNacimiento').value = j.anioNacimiento;
  document.getElementById('numero').value = j.numero;
  document.getElementById('telefono').value = j.telefono;
  document.getElementById('observaciones').value = j.observaciones || '';
  jugadorEditando = index;
}

function eliminarJugador(index) {
  const jugador = jugadores[index];
  if (confirm(`¿Eliminar al jugador ${jugador.nombre} ${jugador.apellidos}?`)) {
    jugadores.splice(index, 1);
    registrarAuditoria(`Eliminó jugador: ${jugador.nombre} ${jugador.apellidos}`);
    exportarJugadores();
  }
}

function exportarJugadores() {
  const blob = new Blob([JSON.stringify(jugadores, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jugadores.json';
  a.click();
  alert('Archivo jugadores.json actualizado. Reemplaza manualmente el archivo.');
  location.reload();
}

function registrarAuditoria(accion) {
  const auditoria = {
    usuario: usuarioActual?.usuario || 'desconocido',
    fecha: new Date().toISOString(),
    accion: accion
  };

  const blob = new Blob([JSON.stringify(auditoria, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria_${Date.now()}.json`;
  a.click();
}

document.getElementById('formJugador').addEventListener('submit', guardarJugador);
document.getElementById('filtroNombre').addEventListener('input', mostrarJugadores);
document.getElementById('filtroApellidos').addEventListener('input', mostrarJugadores);
document.getElementById('filtroAnio').addEventListener('input', mostrarJugadores);

cargarJugadores();
