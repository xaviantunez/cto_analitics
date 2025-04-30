let tiempo = 0;
let cronometroInterval = null;
let enMarcha = false;

document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();

  const cronometro = document.getElementById("cronometro");
  const iniciar = document.getElementById("iniciar");
  const pausar = document.getElementById("pausar");
  const resetear = document.getElementById("resetear");

  iniciar.addEventListener("click", () => {
    if (enMarcha) return;
    cronometroInterval = setInterval(() => {
      tiempo++;
      cronometro.textContent = formatTime(tiempo);
    }, 1000);
    enMarcha = true;
    logEvento("Inicio del tiempo");
  });

  pausar.addEventListener("click", () => {
    clearInterval(cronometroInterval);
    enMarcha = false;
    logEvento("Pausa del tiempo");
  });

  resetear.addEventListener("click", () => {
    clearInterval(cronometroInterval);
    tiempo = 0;
    cronometro.textContent = "00:00";
    enMarcha = false;
    logEvento("Reinicio del tiempo");
  });

  cargarJugadores();
  cargarEventos();
});

function formatTime(t) {
  const mins = String(Math.floor(t / 60)).padStart(2, "0");
  const secs = String(t % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function logEvento(texto) {
  const log = document.getElementById("logEventos");
  const item = document.createElement("li");
  item.textContent = `[${formatTime(tiempo)}] ${texto}`;
  log.appendChild(item);
}

function cargarJugadores() {
  const tbody = document.querySelector("#tablaJugadores tbody");
  const jugadores = ["Juan", "Pedro", "Luis", "Carlos"];
  jugadores.forEach(j => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${j}</td>
      <td>
        <select>
          <option value="portero">Portero</option>
          <option value="defensa derecho">Defensa Derecho</option>
          <option value="defensa izquierdo">Defensa Izquierdo</option>
          <option value="banda izquierda">Banda Izquierda</option>
          <option value="banda derecha">Banda Derecha</option>
          <option value="medio centro">Medio Centro</option>
          <option value="pivote">Pivote</option>
          <option value="medio ofensivo">Medio Ofensivo</option>
          <option value="delantero">Delantero</option>
        </select>
      </td>
      <td><input type="checkbox" /></td>
      <td><button onclick="modificarEvento('${j}', 1)">+ Evento</button> <button onclick="modificarEvento('${j}', -1)">- Evento</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function modificarEvento(jugador, valor) {
  logEvento(`${jugador} ${valor > 0 ? 'recibe' : 'pierde'} evento`);
}

function cargarEventos() {
  const contenedor = document.getElementById("listaEventos");
  const eventos = ["Gol", "Asistencia", "Falta", "Tarjeta Amarilla", "Tarjeta Roja"];
  eventos.forEach(ev => {
    const div = document.createElement("div");
    div.innerHTML = `<span>${ev}</span> <button>+</button> <button>-</button>`;
    contenedor.appendChild(div);
  });
}
