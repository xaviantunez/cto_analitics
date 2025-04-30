let equipos = leerDesdeJSON("equipos") || {};

const formEquipo = document.getElementById("formEquipo");
const formJugador = document.getElementById("formJugador");
const selectEquipo = document.getElementById("selectEquipo");
const listaJugadores = document.getElementById("listaJugadores");
const borrarEquipoBtn = document.getElementById("borrarEquipo");

const usuarioActual = JSON.parse(sessionStorage.getItem("usuario")) || {};

function puedeCrearBorrarEquipo() {
  return usuarioActual.rol === "administrador" || usuarioActual.funciones.includes("coordinador");
}

function puedeEditarJugadores(nombreEquipo) {
  return (
    usuarioActual.rol === "administrador" ||
    usuarioActual.funciones.includes("coordinador") ||
    (usuarioActual.equipo === nombreEquipo &&
     (usuarioActual.funciones.includes("entrenador") || usuarioActual.funciones.includes("delegado")))
  );
}

function renderEquipos() {
  selectEquipo.innerHTML = "";
  Object.keys(equipos).forEach(nombre => {
    const opt = document.createElement("option");
    opt.value = nombre;
    opt.textContent = nombre;
    selectEquipo.appendChild(opt);
  });
  renderJugadores();
}

formEquipo.onsubmit = e => {
  e.preventDefault();
  if (!puedeCrearBorrarEquipo()) return mostrarAlerta("Sin permisos para crear equipos", "error");

  const nuevo = document.getElementById("nuevoEquipo").value.trim();
  if (nuevo && !equipos[nuevo]) {
    equipos[nuevo] = [];
    guardarEnJSON("equipos", equipos);
    registrarAuditoria(usuarioActual, "Crear equipo", `Equipo: ${nuevo}`);
    formEquipo.reset();
    renderEquipos();
  }
};

formJugador.onsubmit = e => {
  e.preventDefault();
  const nombreEquipo = selectEquipo.value;
  if (!puedeEditarJugadores(nombreEquipo)) return mostrarAlerta("No puedes modificar jugadores de este equipo", "error");

  const jugador = document.getElementById("nuevoJugador").value.trim();
  if (jugador && !equipos[nombreEquipo].includes(jugador)) {
    equipos[nombreEquipo].push(jugador);
    guardarEnJSON("equipos", equipos);
    registrarAuditoria(usuarioActual, "Añadir jugador", `Jugador: ${jugador} a ${nombreEquipo}`);
    formJugador.reset();
    renderJugadores();
  }
};

function renderJugadores() {
  const equipo = selectEquipo.value;
  listaJugadores.innerHTML = "";
  if (!equipo || !equipos[equipo]) return;

  equipos[equipo].forEach((jug, idx) => {
    const li = document.createElement("li");
    li.textContent = jug;
    if (puedeEditarJugadores(equipo)) {
      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.onclick = () => {
        equipos[equipo].splice(idx, 1);
        guardarEnJSON("equipos", equipos);
        registrarAuditoria(usuarioActual, "Borrar jugador", `Jugador: ${jug} de ${equipo}`);
        renderJugadores();
      };
      li.appendChild(btn);
    }
    listaJugadores.appendChild(li);
  });
}

selectEquipo.onchange = renderJugadores;

borrarEquipoBtn.onclick = () => {
  const nombre = selectEquipo.value;
  if (!puedeCrearBorrarEquipo()) return mostrarAlerta("Sin permisos para borrar equipos", "error");
  if (nombre && confirm(`¿Seguro que deseas borrar el equipo "${nombre}"?`)) {
    delete equipos[nombre];
    guardarEnJSON("equipos", equipos);
    registrarAuditoria(usuarioActual, "Eliminar equipo", `Equipo: ${nombre}`);
    renderEquipos();
  }
};

renderEquipos();
