let tiempoTotal = 0;
let cronometro = null;
let alineados = {};
let eventos = {};
let jugadores = ["Juan", "Pedro", "Luis", "Carlos", "Andrés", "David", "Mario", "Rafa"];
let posiciones = [
  "portero", "defensa derecho", "defensa izquierdo", "banda izquierda", 
  "banda derecha", "medio centro", "pivote", "medio ofensivo", "delantero"
];

window.onload = () => {
  cargarJugadores();
  document.getElementById("iniciar").onclick = iniciar;
  document.getElementById("pausar").onclick = pausar;
  document.getElementById("reiniciar").onclick = reiniciar;
  document.getElementById("guardarPartido").onclick = guardarPartido;
  document.getElementById("agregarEvento").onclick = agregarEventoGlobal;
};

function cargarJugadores() {
  const tabla = document.getElementById("tablaJugadores");
  jugadores.forEach(nombre => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = nombre;

    const tdCheck = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = () => alineados[nombre] = checkbox.checked;
    tdCheck.appendChild(checkbox);

    const tdCapitan = document.createElement("td");
    const capCheck = document.createElement("input");
    capCheck.type = "checkbox";
    tdCapitan.appendChild(capCheck);

    const tdPos = document.createElement("td");
    const select = document.createElement("select");
    posiciones.forEach(p => {
      const option = document.createElement("option");
      option.textContent = p;
      select.appendChild(option);
    });
    tdPos.appendChild(select);

    const tdMin = document.createElement("td");
    tdMin.textContent = "0";
    tdMin.id = `min_${nombre}`;

    const tdEventos = document.createElement("td");
    tdEventos.id = `ev_${nombre}`;

    tr.append(tdNombre, tdCheck, tdCapitan, tdPos, tdMin, tdEventos);
    tabla.appendChild(tr);

    eventos[nombre] = 0;
  });
}

function iniciar() {
  const jugadoresAlineados = Object.keys(alineados).filter(j => alineados[j]);
  if (jugadoresAlineados.length < 6 || jugadoresAlineados.length > 8) {
    alert("Debe haber entre 6 y 8 jugadores alineados.");
    return;
  }

  registrarEvento("Inicio del tiempo", jugadoresAlineados.join(", "));
  cronometro = setInterval(() => {
    tiempoTotal++;
    document.getElementById("reloj").textContent = formatoTiempo(tiempoTotal);
    jugadoresAlineados.forEach(j => {
      const el = document.getElementById(`min_${j}`);
      el.textContent = parseInt(el.textContent) + 1;
    });
  }, 60000); // 1 minuto
}

function pausar() {
  clearInterval(cronometro);
  cronometro = null;
  const jugadoresAlineados = Object.keys(alineados).filter(j => alineados[j]);
  registrarEvento("Pausa del tiempo", jugadoresAlineados.join(", "));
}

function reiniciar() {
  if (confirm("¿Seguro que quieres reiniciar el tiempo?")) {
    tiempoTotal = 0;
    document.getElementById("reloj").textContent = "00:00";
    clearInterval(cronometro);
  }
}

function registrarEvento(descripcion, jugadores = "") {
  const panel = document.getElementById("logEventos");
  const now = new Date().toLocaleTimeString();
  const linea = document.createElement("div");
  linea.textContent = `[${now}] ${descripcion}${jugadores ? " (" + jugadores + ")" : ""}`;
  panel.appendChild(linea);
}

function guardarPartido() {
  alert("Partido guardado correctamente (simulado).");
}

function formatoTiempo(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function agregarEventoGlobal() {
  const nombre = prompt("Nombre del evento:");
  if (!nombre) return;
  jugadores.forEach(j => {
    const td = document.getElementById(`ev_${j}`);
    const container = document.createElement("div");

    const label = document.createElement("span");
    label.textContent = `${nombre}: `;

    const contador = document.createElement("span");
    contador.textContent = "0";
    contador.id = `ev_${j}_${nombre}`;

    const btnMas = document.createElement("button");
    btnMas.textContent = "+";
    btnMas.onclick = () => {
      contador.textContent = parseInt(contador.textContent
