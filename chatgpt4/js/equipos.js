let equipos = [];
let jugadores = [];
let temporadas = [];
let equipoSeleccionado = null;
const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

async function cargarEquipos() {
  const res = await fetch('../data/equipos.json');
  equipos = await res.json();
  filtrarEquipos();
}

async function cargarJugadores() {
  const res = await fetch('data/jugadores.json');
  jugadores = await res.json();
}

async function cargarTemporadas() {
  const res = await fetch('data/temporadas.json');
  temporadas = await res.json();
  const select = document.getElementById('temporadaFiltro');
  select.innerHTML = '<option value="">-- Todas --</option>';
  temporadas.forEach(t => {
    const option = document.createElement('option');
    option.value = t;
    option.textContent = t;
    select.appendChild(option);
  });
}

function filtrarEquipos() {
  const filtro = document.getElementById('temporadaFiltro').value;
  const ul = document.getElementById('listaEquipos');
  ul.innerHTML = '';
  equipos
    .filter(e => !filtro || e.temporada === filtro)
    .forEach((e, index) => {
      const li = document.createElement('li');
      li.textContent = e.nombre + ' (' + e.temporada + ')';
      li.onclick = () => seleccionarEquipo(index);
      ul.appendChild(li);
    });
}

function seleccionarEquipo(index) {
  equipoSeleccionado = equipos[index];
  document.getElementById('nombreEquipoSeleccionado').textContent = equipoSeleccionado.nombre;
  document.getElementById('anioMaximo').textContent = equipoSeleccionado.anioNacimientoMaximo;
  document.getElementById('gestionEquipo').style.display = 'block';
  mostrarJugadoresEquipo();
  mostrarJugadoresDisponibles();
}

function mostrarJugadoresEquipo() {
  const ul = document.getElementById('listaJugadoresEquipo');
  ul.innerHTML = '';
  (equipoSeleccionado.jugadores || []).forEach(id => {
    const j = jugadores.find(j => j.id === id);
    if (j) {
      const li = document.createElement('li');
      li.textContent = `${j.nombre} ${j.apellidos}`;
      const btn = document.createElement('button');
      btn.textContent = 'Quitar';
      btn.onclick = () => quitarJugador(j.id);
      li.appendChild(btn);
      ul.appendChild(li);
    }
  });
}

function mostrarJugadoresDisponibles() {
  const ul = document.getElementById('listaJugadoresDisponibles');
  ul.innerHTML = '';
  jugadores
    .filter(j => j.anioNacimiento <= equipoSeleccionado.anioNacimientoMaximo)
    .filter(j => !(equipoSeleccionado.jugadores || []).includes(j.id))
    .forEach(j => {
      const li = document.createElement('li');
      li.textContent = `${j.nombre} ${j.apellidos}`;
      const btn = document.createElement('button');
      btn.textContent = 'Añadir';
      btn.onclick = () => agregarJugador(j.id);
      li.appendChild(btn);
      ul.appendChild(li);
    });
}

function agregarJugador(id) {
  if (!equipoSeleccionado.jugadores) equipoSeleccionado.jugadores = [];
  equipoSeleccionado.jugadores.push(id);
  registrarAuditoria(`Añadió jugador ${id} al equipo ${equipoSeleccionado.nombre}`);
  guardarEquipos();
}

function quitarJugador(id) {
  equipoSeleccionado.jugadores = equipoSeleccionado.jugadores.filter(jid => jid !== id);
  registrarAuditoria(`Quitó jugador ${id} del equipo ${equipoSeleccionado.nombre}`);
  guardarEquipos();
}

function guardarEquipos() {
  const blob = new Blob([JSON.stringify(equipos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equipos.json';
  a.click();
  mostrarJugadoresEquipo();
  mostrarJugadoresDisponibles();
  alert('Actualiza el archivo equipos.json en tu servidor.');
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
