// js/equipos.js

let equipos = [];
let auditoria = [];
let usuarioActual = JSON.parse(localStorage.getItem("usuario_actual")) || null;
let funciones = usuarioActual?.funciones || [];
let rol = usuarioActual?.rol || "";

document.addEventListener("DOMContentLoaded", () => {
  cargarEquipos();
  cargarAuditoria();
  configurarInterfaz();
  document.getElementById("crearEquipoBtn").addEventListener("click", crearEquipo);
});

function cargarEquipos() {
  await fetch('data/equipos.json')
    .then(response => response.json())
    .then(data => {
      equipos = data;
      mostrarEquipos();
    })
    .catch(error => console.error('Error al cargar los equipos:', error));
}

function guardarEquipos() {
  await fetch('data/equipos.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipos)
  })
  .then(response => response.json())
  .then(() => console.log('Equipos guardados correctamente'))
  .catch(error => console.error('Error al guardar los equipos:', error));
}

function cargarAuditoria() {
  await fetch('data/auditoria.json')
    .then(response => response.json())
    .then(data => {
      auditoria = data;
    })
    .catch(error => console.error('Error al cargar la auditoría:', error));
}

function guardarAuditoria() {
  await fetch('data/auditoria.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auditoria)
  })
  .then(response => response.json())
  .then(() => console.log('Auditoría guardada correctamente'))
  .catch(error => console.error('Error al guardar la auditoría:', error));
}

function configurarInterfaz() {
  if (rol !== "administrador" && !funciones.includes("coordinador")) {
    document.getElementById("crearEquipoBtn").style.display = "none";
  }
}

function mostrarEquipos() {
  const contenedor = document.getElementById("equiposContainer");
  contenedor.innerHTML = "";
  equipos.forEach((equipo, index) => {
    const div = document.createElement("div");
    div.className = "equipo-card";
    div.innerHTML = `
      <h3>${equipo.nombre}</h3>
      <ul>
        ${equipo.jugadores.map((j, i) => `
          <li>
            ${j.nombre} (${j.posicion || "sin posición"})
            ${puedeEditarJugadores(equipo.nombre) ? `<button onclick="eliminarJugador(${index}, ${i})">❌</button>` : ""}
          </li>
        `).join("")}
      </ul>
      ${puedeEditarJugadores(equipo.nombre) ? `
        <input type="text" id="jugadorNombre_${index}" placeholder="Nombre del jugador">
        <select id="jugadorPosicion_${index}">
          <option value="">-- Posición --</option>
          <option>portero</option>
          <option>defensa derecho</option>
          <option>defensa izquierdo</option>
          <option>banda izquierda</option>
          <option>banda derecha</option>
          <option>medio centro</option>
          <option>pivote</option>
          <option>medio ofensivo</option>
          <option>delantero</option>
        </select>
        <button onclick="añadirJugador(${index})">➕ Añadir jugador</button>
      ` : ""}
      ${puedeEditarEquipo() ? `<button onclick="borrarEquipo(${index})">🗑️ Borrar equipo</button>` : ""}
    `;
    contenedor.appendChild(div);
  });
}

function crearEquipo() {
  const nombre = prompt("Introduce el nombre del nuevo equipo:");
  if (nombre && !equipos.some(eq => eq.nombre === nombre)) {
    equipos.push({ nombre, jugadores: [] });
    guardarEquipos();
    mostrarEquipos();
    registrarAccion(`Creó el equipo ${nombre}`);
  } else {
    alert("Nombre no válido o ya existe.");
  }
}

function borrarEquipo(index) {
  if (confirm("¿Estás seguro de que deseas borrar este equipo?")) {
    const nombre = equipos[index].nombre;
    equipos.splice(index, 1);
    guardarEquipos();
    mostrarEquipos();
    registrarAccion(`Borró el equipo ${nombre}`);
  }
}

function añadirJugador(equipoIndex) {
  const nombreInput = document.getElementById(`jugadorNombre_${equipoIndex}`);
  const posicionSelect = document.getElementById(`jugadorPosicion_${equipoIndex}`);
  const nombre = nombreInput.value.trim();
  const posicion = posicionSelect.value;

  if (!nombre) return alert("Escribe el nombre del jugador.");

  equipos[equipoIndex].jugadores.push({ nombre, posicion });
  guardarEquipos();
  mostrarEquipos();
  registrarAccion(`Añadió a ${nombre} como ${posicion} al equipo ${equipos[equipoIndex].nombre}`);
}

function eliminarJugador(equipoIndex, jugadorIndex) {
  const jugador = equipos[equipoIndex].jugadores[jugadorIndex];
  equipos[equipoIndex].jugadores.splice(jugadorIndex, 1);
  guardarEquipos();
  mostrarEquipos();
  registrarAccion(`Eliminó a ${jugador.nombre} del equipo ${equipos[equipoIndex].nombre}`);
}

function puedeEditarEquipo() {
  return rol === "administrador" || funciones.includes("coordinador");
}

function puedeEditarJugadores(nombreEquipo) {
  if (rol === "administrador" || funciones.includes("coordinador")) return true;
  return funciones.includes("entrenador") || funciones.includes("delegado") &&
         usuarioActual.equipo === nombreEquipo;
}

function registrarAccion(accion) {
  const ahora = new Date();
  auditoria.push({
    usuario: usuarioActual?.usuario || "desconocido",
    accion: accion,
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString()
  });
  guardarAuditoria();
}
