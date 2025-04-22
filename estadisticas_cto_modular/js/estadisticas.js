let tiempo = 0;
let cronometroActivo = false;
let intervalo;
let jugadores = JSON.parse(localStorage.getItem("jugadores")) || [
  { nombre: "Jugador 1", alineado: false, posicion: "" },
  { nombre: "Jugador 2", alineado: false, posicion: "" }
];

function actualizarCronometro() {
  const minutos = String(Math.floor(tiempo / 60)).padStart(2, '0');
  const segundos = String(tiempo % 60).padStart(2, '0');
  document.getElementById("cronometro").textContent = `${minutos}:${segundos}`;
}

function iniciarPartido() {
  if (!cronometroActivo) {
    const alineados = jugadores.filter(j => j.alineado);
    if (alineados.length < 6 || alineados.length > 8) {
      alert("Debes tener entre 6 y 8 jugadores alineados.");
      return;
    }
    cronometroActivo = true;
    logEvento("Inicio del tiempo. Jugadores alineados: " + alineados.map(j => j.nombre).join(", "));
    intervalo = setInterval(() => {
      tiempo++;
      actualizarCronometro();
    }, 1000);
  }
}

function pausarPartido() {
  if (cronometroActivo) {
    clearInterval(intervalo);
    cronometroActivo = false;
    logEvento("Pausa del tiempo.");
  }
}

function resetearPartido() {
  if (confirm("¿Resetear el tiempo y eventos?")) {
    clearInterval(intervalo);
    tiempo = 0;
    actualizarCronometro();
    cronometroActivo = false;
    document.getElementById("registro-eventos").innerHTML = "";
    localStorage.removeItem("eventos");
  }
}

function cargarJugadores() {
  const contenedor = document.getElementById("jugadores");
  contenedor.innerHTML = "";
  jugadores.forEach((j, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label>
        <input type="checkbox" ${j.alineado ? "checked" : ""} onchange="toggleAlineado(${index})">
        ${j.nombre}
      </label>
      <select onchange="cambiarPosicion(${index}, this.value)">
        <option value="">Posición</option>
        ${["portero", "defensa derecho", "defensa izquierdo", "banda izquierda", "banda derecha", "medio centro", "pivote", "medio ofensivo", "delantero"]
          .map(pos => `<option value="${pos}" ${j.posicion === pos ? "selected" : ""}>${pos}</option>`)
          .join("")}
      </select>
    `;
    contenedor.appendChild(div);
  });
}

function toggleAlineado(index) {
  jugadores[index].alineado = !jugadores[index].alineado;
  localStorage.setItem("jugadores", JSON.stringify(jugadores));
}

function cambiarPosicion(index, valor) {
  jugadores[index].posicion = valor;
  localStorage.setItem("jugadores", JSON.stringify(jugadores));
}

function logEvento(descripcion) {
  const ul = document.getElementById("registro-eventos");
  const li = document.createElement("li");
  const tiempoActual = document.getElementById("cronometro").textContent;
  li.textContent = `[${tiempoActual}] ${descripcion}`;
  ul.appendChild(li);

  // Guardar en localStorage
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  eventos.push({ tiempo: tiempoActual, descripcion });
  localStorage.setItem("eventos", JSON.stringify(eventos));
}

function guardarPartido() {
  const resumen = document.getElementById("resumen").value;
  const datos = {
    equipoLocal: document.getElementById("equipoLocal").value,
    equipoRival: document.getElementById("equipoRival").value,
    fechaHora: document.getElementById("fechaHora").value,
    torneo: document.getElementById("torneo").value,
    resumen,
    eventos: JSON.parse(localStorage.getItem("eventos")) || [],
    jugadores
  };

  const partidos = JSON.parse(localStorage.getItem("partidos")) || [];
  partidos.push(datos);
  localStorage.setItem("partidos", JSON.stringify(partidos));
  alert("Partido guardado en el historial");
}

function exportarExcel() {
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  let csv = "Tiempo,Descripción\n";
  eventos.forEach(e => {
    csv += `${e.tiempo},"${e.descripcion}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "eventos_partido.csv";
  link.click();
}

window.onload = () => {
  cargarJugadores();
  actualizarCronometro();
};
