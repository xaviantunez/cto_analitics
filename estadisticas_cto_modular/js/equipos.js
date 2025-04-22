let equipos = JSON.parse(localStorage.getItem('equipos')) || {};
let equipoSeleccionado = null;

function guardarEquipos() {
  localStorage.setItem('equipos', JSON.stringify(equipos));
}

function crearEquipo() {
  const nombre = document.getElementById('nuevo-equipo').value.trim();
  if (nombre && !equipos[nombre]) {
    equipos[nombre] = [];
    guardarEquipos();
    renderEquipos();
    document.getElementById('nuevo-equipo').value = '';
  }
}

function renderEquipos() {
  const lista = document.getElementById('lista-equipos');
  lista.innerHTML = '';
  for (const equipo in equipos) {
    const li = document.createElement('li');
    li.textContent = equipo;
    li.onclick = () => seleccionarEquipo(equipo);
    const borrar = document.createElement('button');
    borrar.textContent = 'Eliminar';
    borrar.onclick = (e) => {
      e.stopPropagation();
      delete equipos[equipo];
      guardarEquipos();
      renderEquipos();
      document.getElementById('gestion-jugadores').style.display = 'none';
    };
    li.appendChild(borrar);
    lista.appendChild(li);
  }
}

function seleccionarEquipo(nombre) {
  equipoSeleccionado = nombre;
  document.getElementById('gestion-jugadores').style.display = 'block';
  document.getElementById('nombre-equipo').textContent = nombre;
  renderJugadores();
}

function agregarJugador() {
  const nombre = document.getElementById('nuevo-jugador').value.trim();
  if (nombre && !equipos[equipoSeleccionado].includes(nombre)) {
    equipos[equipoSeleccionado].push(nombre);
    guardarEquipos();
    renderJugadores();
    document.getElementById('nuevo-jugador').value = '';
  }
}

function renderJugadores() {
  const lista = document.getElementById('lista-jugadores');
  lista.innerHTML = '';
  for (const jugador of equipos[equipoSeleccionado]) {
    const li = document.createElement('li');
    li.textContent = jugador;
    const borrar = document.createElement('button');
    borrar.textContent = 'Eliminar';
    borrar.onclick = () => {
      equipos[equipoSeleccionado] = equipos[equipoSeleccionado].filter(j => j !== jugador);
      guardarEquipos();
      renderJugadores();
    };
    li.appendChild(borrar);
    lista.appendChild(li);
  }
}

renderEquipos();
