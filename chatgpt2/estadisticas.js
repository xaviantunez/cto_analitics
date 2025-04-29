let cronometro = null;
let segundos = 0;
let enMarcha = false;
let jugadores = [];
let alineados = new Set();
let eventos = [];
let registro = [];

const tiempoElemento = document.getElementById('tiempo');
const iniciarBtn = document.getElementById('iniciar');
const pausarBtn = document.getElementById('pausar');
const resetearBtn = document.getElementById('resetear');
const logEventos = document.getElementById('logEventos');
const jugadoresUl = document.getElementById('jugadoresAlineados');
const resumenTextarea = document.getElementById('resumenTexto');

// Simula jugadores (en producción esto vendría de datos locales o de un equipo)
jugadores = [
  { nombre: "Jugador 1", posicion: "portero" },
  { nombre: "Jugador 2", posicion: "defensa derecho" },
  { nombre: "Jugador 3", posicion: "medio centro" },
  { nombre: "Jugador 4", posicion: "delantero" },
  { nombre: "Jugador 5", posicion: "banda derecha" },
  { nombre: "Jugador 6", posicion: "pivote" },
  { nombre: "Jugador 7", posicion: "defensa izquierdo" },
  { nombre: "Jugador 8", posicion: "banda izquierda" }
];

function actualizarTiempo() {
  segundos++;
  const hrs = String(Math.floor(segundos / 3600)).padStart(2, '0');
  const mins = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
  const secs = String(segundos % 60).padStart(2, '0');
  tiempoElemento.textContent = `${hrs}:${mins}:${secs}`;
}

function registrarEvento(texto) {
  const marca = tiempoElemento.textContent;
  const li = document.createElement("li");
  li.textContent = `[${marca}] ${texto}`;
  logEventos.appendChild(li);
  registro.push({ tiempo: marca, descripcion: texto });
}

function iniciarCrono() {
  if (!enMarcha && alineados.size >= 6 && alineados.size <= 8) {
    cronometro = setInterval(actualizarTiempo, 1000);
    enMarcha = true;
    registrarEvento("Inicio del cronómetro");
    registrarEvento("Alineación activa: " + Array.from(alineados).join(", "));
  } else {
    alert("Deben estar alineados entre 6 y 8 jugadores.");
  }
}

function pausarCrono() {
  if (cronometro) {
    clearInterval(cronometro);
    enMarcha = false;
    registrarEvento("Pausa del cronómetro");
  }
}

function resetearCrono() {
  pausarCrono();
  segundos = 0;
  tiempoElemento.textContent = "00:00:00";
  registrarEvento("Cronómetro reseteado");
}

function cargarJugadores() {
  jugadoresUl.innerHTML = "";
  jugadores.forEach(j => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    label.textContent = j.nombre;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        alineados.add(j.nombre);
      } else {
        alineados.delete(j.nombre);
      }
    });

    const select = document.createElement("select");
    [
      "portero", "defensa derecho", "defensa izquierdo",
      "banda izquierda", "banda derecha",
      "medio centro", "pivote", "medio ofensivo", "delantero"
    ].forEach(pos => {
      const option = document.createElement("option");
      option.value = pos;
      option.textContent = pos;
      if (j.posicion === pos) option.selected = true;
      select.appendChild(option);
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(select);
    jugadoresUl.appendChild(li);
  });
}

function guardarPartido() {
  const resumen = resumenTextarea.value;
  const datos = {
    equipoLocal: document.getElementById("equipoLocal").value,
    equipoRival: document.getElementById("equipoRival").value,
    torneo: document.getElementById("torneo").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    resumen,
    registro,
    jugadoresAlineados: Array.from(alineados),
    tiempo: tiempoElemento.textContent
  };

  let historico = JSON.parse(localStorage.getItem("historicoPartidos") || "[]");
  historico.push(datos);
  localStorage.setItem("historicoPartidos", JSON.stringify(historico));

  alert("Partido guardado en el histórico.");
}

function exportarAExcel() {
  let csv = "Tiempo,Evento\n";
  registro.forEach(r => {
    csv += `"${r.tiempo}","${r.descripcion}"\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "registro_partido.csv";
  link.click();
}

iniciarBtn.addEventListener("click", iniciarCrono);
pausarBtn.addEventListener("click", pausarCrono);
resetearBtn.addEventListener("click", resetearCrono);
document.getElementById("guardarPartido").addEventListener("click", guardarPartido);
document.getElementById("exportarExcel").addEventListener("click", exportarAExcel);

window.addEventListener("load", cargarJugadores);
