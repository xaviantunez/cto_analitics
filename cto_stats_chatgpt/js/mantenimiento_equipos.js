let equipos = [];
let jugadores = [];

window.onload = () => {
  cargarEquipos();
};

function cargarEquipos() {
  const selectEquipo = document.getElementById("equipoSeleccionado");
  selectEquipo.innerHTML = '<option value="">Seleccionar Equipo</option>';  // Resetea la lista

  equipos.forEach(equipo => {
    const option = document.createElement("option");
    option.value = equipo.nombre;
    option.textContent = equipo.nombre;
    selectEquipo.appendChild(option);
  });

  actualizarTablaEquipos();
}

function crearEquipo() {
  const nombreEquipo = document.getElementById("nombreEquipo").value;

  if (nombreEquipo) {
    equipos.push({ nombre: nombreEquipo, jugadores: [] });
    cargarEquipos();
    document.getElementById("nombreEquipo").value = ""; // Limpiar input
  }
}

function actualizarTablaEquipos() {
  const tablaEquipos = document.getElementById("tablaEquipos").getElementsByTagName("tbody")[0];
  tablaEquipos.innerHTML = ""; // Limpiar tabla

  equipos.forEach(equipo => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = equipo.nombre;

    const tdJugadores = document.createElement("td");
    tdJugadores.textContent = equipo.jugadores.length;

    const tdAcciones = document.createElement("td");
    const botonVerJugadores = document.createElement("button");
    botonVerJugadores.textContent = "Ver Jugadores";
    botonVerJugadores.onclick = () => verJugadores(equipo);
    tdAcciones.appendChild(botonVerJugadores);

    tr.append(tdNombre, tdJugadores, tdAcciones);
    tablaEquipos.appendChild(tr);
  });
}

function verJugadores(equipo) {
  const jugadoresDiv = document.getElementById("jugadoresEquipo");
  jugadoresDiv.innerHTML = `<h3>Jugadores de ${equipo.nombre}</h3><ul></ul>`;
  const listaJugadores = jugadoresDiv.querySelector("ul");

  equipo.jugadores.forEach(jugador => {
    const li = document.createElement("li");
    li.textContent = jugador;
    listaJugadores.appendChild(li);
  });
}

function crearJugador() {
  const jugadorNombre = document.getElementById("jugadorNombre").value;
  const equipoSeleccionado = document.getElementById("equipoSeleccionado").value;

  if (jugadorNombre && equipoSeleccionado) {
    const equipo = equipos.find(equipo => equipo.nombre === equipoSeleccionado);
    if (equipo) {
      equipo.jugadores.push(jugadorNombre);
      document.getElementById("jugadorNombre").value = ""; // Limpiar input
      verJugadores(equipo); // Mostrar jugadores actualizados
    }
  }
}
