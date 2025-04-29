document.addEventListener('DOMContentLoaded', () => {
  const teamFilter = document.getElementById('teamFilter');
  const dateFilter = document.getElementById('dateFilter');
  const analysisResults = document.getElementById('analysisResults');

  // Cargar los equipos para el filtro
  fetch('data/equipos.json')
    .then(response => response.json())
    .then(equipos => {
      equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.nombre;
        option.textContent = equipo.nombre;
        teamFilter.appendChild(option);
      });
    });

  // Función para cargar y analizar los partidos
  function loadAndAnalyzeMatches(teamFilterValue = 'all', dateFilterValue = '') {
    fetch('data/historico.json')
      .then(response => response.json())
      .then(historico => {
        analysisResults.innerHTML = '';
        const filteredMatches = historico.filter(match => {
          const matchTeam = teamFilterValue === 'all' || match.equipoLocal === teamFilterValue || match.equipoVisitante === teamFilterValue;
          const matchDate = !dateFilterValue || match.fecha === dateFilterValue;
          return matchTeam && matchDate;
        });

        if (filteredMatches.length === 0) {
          analysisResults.innerHTML = '<p>No se encontraron partidos para los filtros seleccionados.</p>';
          return;
        }

        // Aquí irían las gráficas y análisis de los partidos
        // Generamos los sumatorios y gráficos
        const totalVictorias = filteredMatches.filter(match => match.resultado === 'victoria').length;
        const totalDerrotas = filteredMatches.filter(match => match.resultado === 'derrota').length;
        const totalEmpates = filteredMatches.filter(match => match.resultado === 'empate').length;

        analysisResults.innerHTML = `
          <h2>Resumen de Análisis</h2>
          <p>Victorias: ${totalVictorias}</p>
          <p>Derrotas: ${totalDerrotas}</p>
          <p>Empates: ${totalEmpates}</p>
          <h3>Gráfica de Resultados</h3>
          <canvas id="resultsChart"></canvas>
        `;

        // Crear la gráfica (utilizando Chart.js o cualquier librería de gráficos)
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Victorias', 'Derrotas', 'Empates'],
            datasets: [{
              label: 'Resultados de los partidos',
              data: [totalVictorias, totalDerrotas, totalEmpates],
              backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
              borderColor: ['#388e3c', '#d32f2f', '#f57c00'],
              borderWidth: 1
            }]
          }
        });
      });
  }

  // Generar análisis al aplicar filtros
  document.getElementById('filterForm').addEventListener('submit', (event) => {
    event.preventDefault();
    loadAndAnalyzeMatches(teamFilter.value, dateFilter.value);
  });
});
