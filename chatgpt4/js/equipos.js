verificarAcceso(['administrador', 'coordinador']);

let equipos = [];
let jugadores = [];

async function cargarTemporadas() {
  const res = await fetch('../data/temporadas.json');
  const temporadas = await res.json();

  const filtro = document.getElementById('filtroTemporada');
  const selectNuevo = document.getElementById('temporadaEquipo');

  [filtro, selectNuevo].forEach(select => {
    select.innerHTML = '<option value="">Seleccionar Temporada</option>';
    temporadas.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      select.appendChild(opt);
    });
  });
}

async function cargarEquipos() {
  const temporadaSeleccionada = document.getElementById('filtroTemporada').value;
  const res = await fetch('../data/equipos.json');
  equipos = await res.json();
  const tbody = document.querySelector('#tablaEquipos tbody');
  tbody.innerHTML = '';

  equipos
    .filter(e => !temporadaSeleccionada || e.temporada === temporadaSeleccionada)
    .forEach((e, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.nombre}</td>
        <td>${e.temporada}</td>
        <td>${e.anioMaximo}</td>
        <td><button onclick="verJugadores(${i})">Ver</button></td>
        <td><button onclick="alert('Eliminar manual en equipos.json')">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });
}

async function cargarJugadores() {
  const res = await fetch('../data/jugadores.json');
  jugadores = await res.json();
}

async function guardarEquipo(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombreEquipo').value.trim();
  const temporada = document.getElementById('temporadaEquipo').value;
  const anioMaximo = parseInt(document.getElementById('anioMaximo').value);

  const res = await fetch('../data/equipos.json');
  const lista = await res.json();
  lista.push({ nombre, temporada, anioMaximo });

  const blob = new Blob([JSON.stringify(lista, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equipos.json';
  a.click();

  alert('Equipo guardado. Descarga y reemplaza manualmente el archivo equipos.json.');
  location.reload();
}

function verJugadores(indice) {
  const equipo = equipos[indice];
  const lista = document.getElementById('listaJugadores');
  lista.innerHTML = '';

  const jugadoresFiltrados = jugadores.filter(j =>
    j.equipo === equipo.nombre && j.anioNacimiento <= equipo.anioMaximo
  );

  if (jugadoresFiltrados.length === 0) {
    lista.innerHTML = '<li>No hay jugadores asignados que cumplan los requisitos.</li>';
    return;
  }

  jugadoresFiltrados.forEach(j => {
    const li = document.createElement('li');
    li.textContent = `${j.nombre} (${j.anioNacimiento})`;
    lista.appendChild(li);
  });
}

document.getElementById('equipoForm').addEventListener('submit', guardarEquipo);
document.getElementById('filtroTemporada').addEventListener('change', cargarEquipos);

cargarTemporadas();
cargarEquipos();
cargarJugadores();
