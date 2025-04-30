let cronometro = null;
let segundos = 0;
let alineados = {};
let eventos = [];
let usuario = JSON.parse(sessionStorage.getItem("usuario"));

function actualizarTiempo() {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const seg = String(segundos % 60).padStart(2, "0");
  document.getElementById("tiempoTotal").textContent = `${min}:${seg}`;
}

function iniciarCrono() {
  if (Object.values(alineados).filter(a => a).length < 6 || Object.values(alineados).filter(a => a).length > 8) {
    mostrarAlerta("Debe haber entre 6 y 8 jugadores alineados", "error");
    return;
  }

  cronometro = setInterval(() => {
    segundos++;
    actualizarTiempo();
  }, 1000);
  registrarEvento("Inicio del cronómetro");
}

function pausarCrono() {
  clearInterval(cronometro);
  cronometro = null;
  registrarEvento("Pausa del cronómetro");
}

function resetearCrono() {
  if (confirm("¿Resetear tiempo?")) {
    segundos = 0;
    actualizarTiempo();
    registrarEvento("Reset del cronómetro");
  }
}

function registrarEvento(desc) {
  const tiempo = document.getElementById("tiempoTotal").textContent;
  const evento = `${tiempo} - ${desc}`;
  eventos.push(evento);
  const li = document.createElement("li");
  li.textContent = evento;
  document.getElementById("registroEventos").appendChild(li);
}

function exportarEventos() {
  const csv = eventos.map(e => `"${e}"`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "eventos.csv";
  a.click();
}

function guardarPartido() {
  const partido = {
    equipoLocal: document.getElementById("equipoLocal").value,
    equipoRival: document.getElementById("equipoRival").value,
    fechaHora: document.getElementById("fechaHora").value,
    torneo: document.getElementById("torneo").value,
    resumen: document.getElementById("resumen").value,
    eventos,
    tiempoTotal: segundos,
  };

  const partidos = leerDesdeJSON("partidos") || [];
  partidos.push(partido);
  guardarEnJSON("partidos", partidos);
  registrarAuditoria(usuario, "Guardar partido", `Vs ${partido.equipoRival} - ${partido.fechaHora}`);
  mostrarAlerta("Partido guardado correctamente", "info");
}

document.getElementById("iniciar").onclick = iniciarCrono;
document.getElementById("pausar").onclick = pausarCrono;
document.getElementById("resetear").onclick = resetearCrono;
document.getElementById("exportarExcel").onclick = exportarEventos;
document.getElementById("guardarPartido").onclick = guardarPartido;

actualizarTiempo();
