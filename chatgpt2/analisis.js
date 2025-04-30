document.addEventListener("DOMContentLoaded", async () => {
  const nav = await fetch("nav.html");
  document.getElementById("nav-placeholder").innerHTML = await nav.text();
  cargarEquipos();
});

function cargarEquipos() {
  const equipos = JSON.parse(localStorage.getItem("equipos")) || [];
  const select = document.getElementById("equipoAnalisis");
  equipos.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.nombre;
    opt.textContent = e.nombre;
    select.appendChild(opt);
  });

  select.addEventListener("change", cargarPartidos);
}

function cargarPartidos() {
  const equipo = document.getElementById("equipoAnalisis").value;
  const partidos = JSON.parse(localStorage.getItem("partidos")) || [];
  const select = document.getElementById("partidosAnalisis");
  select.innerHTML = "";

  partidos
    .filter(p => equipo === "" || p.equipoLocal === equipo || p.equipoVisitante === equipo)
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.fecha} ${p.equipoLocal} vs ${p.equipoVisitante}`;
      select.appendChild(opt);
    });
}

function analizar() {
  const partidosSeleccionados = Array.from(document.getElementById("partidosAnalisis").selectedOptions).map(o => o.value);
  const partidos = JSON.parse(localStorage.getItem("partidos")) || [];
  const datos = partidos.filter(p => partidosSeleccionados.includes(p.id));

  const goles = { aFavor: 0, enContra: 0 };
  const posiciones = {};
  const tiempoJugado = {};

  datos.forEach(p => {
    goles.aFavor += p.estadisticas.golesFavor || 0;
    goles.enContra += p.estadisticas.golesContra || 0;

    (p.jugadores || []).forEach(j => {
      if (!tiempoJugado[j.nombre]) tiempoJugado[j.nombre] = 0;
      tiempoJugado[j.nombre] += j.tiempo || 0;

      const pos = j.posicion || "Sin posición";
      posiciones[pos] = (posiciones[pos] || 0) + 1;
    });
  });

  generarGraficoBarras("graficoGoles", ["Goles a favor", "Goles en contra"], [goles.aFavor, goles.enContra]);
  generarGraficoTorta("graficoPosiciones", Object.keys(posiciones), Object.values(posiciones));
  generarGraficoBarras("graficoTiempoJugado", Object.keys(tiempoJugado), Object.values(tiempoJugado));
}

function generarGraficoBarras(id, etiquetas, datos) {
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: 'Cantidad',
        backgroundColor: ['#4caf50', '#f44336'],
        data: datos
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function generarGraficoTorta(id, etiquetas, datos) {
  new Chart(document.getElementById(id), {
    type: 'pie',
    data: {
      labels: etiquetas,
      datasets: [{
        backgroundColor: etiquetas.map(() => '#' + Math.floor(Math.random()*16777215).toString(16)),
        data: datos
      }]
    },
    options: {
      responsive: true
    }
  });
}
