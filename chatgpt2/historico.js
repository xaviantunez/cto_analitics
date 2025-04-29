document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('teamSelect');
  const matchList = document.getElementById('matchList');

  // Cargar los equipos para el filtro
  fetch('data/equipos.json')
    .then(response => response.json())
    .then(equipos => {
      equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.nombre;
        option.textContent = equipo.nombre;
        teamSelect.appendChild(option);
      });
    });

  // Función para cargar los partidos
  function loadMatches(teamFilter = 'all') {
    fetch('data/partidos.json')
      .then(response => response.json())
      .then(partidos => {
        matchList.innerHTML = '';
        const filteredMatches = teamFilter === 'all' 
          ? partidos 
          : partidos.filter(partido => partido.equipoLocal === teamFilter || partido.equipoVisitante === teamFilter);

        filteredMatches.forEach(partido => {
          const matchItem = document.createElement('div');
          matchItem.classList.add('match-item');
          matchItem.innerHTML = `
            <h3>${partido.equipoLocal} vs ${partido.equipoVisitante}</h3>
            <p>Fecha: ${partido.fecha} | Hora: ${partido.hora}</p>
            <a href="estadisticas.html?id=${partido.id}">Ver Estadísticas</a>
          `;
          matchList.appendChild(matchItem);
        });
      });
  }

  teamSelect.addEventListener('change', (event) => {
    loadMatches(event.target.value);
  });

  // Cargar partidos inicialmente
  loadMatches();
});
