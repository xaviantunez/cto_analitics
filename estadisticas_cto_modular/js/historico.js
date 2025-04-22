document.addEventListener("DOMContentLoaded", () => {
  const equipoFiltro = document.getElementById("equipoFiltro");
  const partidosContainer = document.getElementById("partidosContainer");

  fetch("data/equipos.json")
    .then(res => res.json())
    .then(equipos => {
      equipos.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.nombre;
        opt.textContent = e.nombre;
        equipoFiltro.appendChild(opt);
      });
    });

  equipoFiltro.addEventListener("change", renderPartidos);

  function renderPartidos() {
    const filtro = equipoFiltro.value;
    partidosContainer.innerHTML = "";

    fetch("data/historico.json")
      .then(res => res.json())
      .then(partidos => {
        const filtrados = filtro === "todos"
          ? partidos
          : partidos.filter(p => p.equipo === filtro);

        if (filtrados.length === 0) {
          partidosContainer.textContent = "No hay partidos registrados.";
          return;
        }

        filtrados.forEach(p => {
          const div = document.createElement("div");
          div.className = "partido-card";
          div.innerHTML = `
            <h3>${p.equipo} vs ${p.rival}</h3>
            <p><strong>Fecha:</strong> ${p.fecha}</p>
            <p><strong>Resultado:</strong> ${p.resultado}</p>
            <p><strong>Resumen:</strong> ${p.resumen}</p>
            <button onclick='verDetalles(${JSON.stringify(p)})'>Ver Detalles</button>
          `;
          partidosContainer.appendChild(div);
        });
      });
  }

  window.verDetalles = (partido) => {
    alert(`Eventos:\n${partido.eventos.map(e => `${e.minuto}' - ${e.jugador}: ${e.evento}`).join('\n')}`);
  };

  renderPartidos();
});
