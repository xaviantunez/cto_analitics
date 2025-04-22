let tiempo = 0;
let intervalo = null;

function iniciarTiempo() {
  if (!intervalo) {
    intervalo = setInterval(() => {
      tiempo++;
      mostrarTiempo();
    }, 1000);
  }
}

function pausarTiempo() {
  clearInterval(intervalo);
  intervalo = null;
}

function resetearTiempo() {
  pausarTiempo();
  tiempo = 0;
  mostrarTiempo();
}

function mostrarTiempo() {
  const minutos = String(Math.floor(tiempo / 60)).padStart(2, '0');
  const segundos = String(tiempo % 60).padStart(2, '0');
  document.getElementById('tiempoTotal').textContent = `${minutos}:${segundos}`;
}

// Simular jugadores (en producción se debería cargar desde JSON)
const jugadores = [
  "Jugador 1",
  "Jugador 2",
  "Jugador 3",
  "Jugador 4"
];

function cargarJugadores() {
  const lista = document.getElementById("listaJugadores");
  lista.innerHTML = "";
  jugadores.forEach(jugador => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${jugador}</strong>
      <button onclick="registrarEvento('${jugador}', 'Gol')">Gol</button>
      <button onclick="registrarEvento('${jugador}', 'Asistencia')">Asistencia</button>
      <button onclick="registrarEvento('${jugador}', 'Falta')">Falta</button>
    `;
    lista.appendChild(li);
  });
}

function registrarEvento(jugador, tipo) {
  const log = document.getElementById("logEventos");
  const tiempoActual = document.getElementById("tiempoTotal").textContent;
  const li = document.createElement("li");
  li.textContent = `[${tiempoActual}] ${jugador} - ${tipo}`;
  log.appendChild(li);
}

function exportarExcel() {
  alert("Funcionalidad de exportar pendiente de implementar.");
  // Aquí podrías usar SheetJS o generar CSV directamente
}

function guardarEnHistorico() {
  const resumen = document.getElementById("resumenPartido").value;
  const equipoLocal = document.getElementById("equipoLocal").value;
  const equipoRival = document.getElementById("equipoRival").value;
  const fecha = document.getElementById("fechaPartido").value;
  const torneo = document.getElementById("torneo").value;

  const evento = {
    equipoLocal,
    equipoRival,
    fecha,
    torneo,
    resumen,
    eventos: [...document.querySelectorAll("#logEventos li")].map(li => li.textContent)
  };

  console.log("Guardar evento:", evento);
  alert("Partido guardado en histórico (simulado).");
}

window.onload = cargarJugadores;
