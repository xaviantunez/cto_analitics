document.addEventListener('DOMContentLoaded', function() {
    // Simular datos de goles por equipo y posiciones de jugadores
    const data = {
        goals: {
            local: 3,
            rival: 2
        },
        positions: {
            forward: 4,
            midfielder: 3,
            defender: 2
        }
    };

    // Crear gráfico de barras para goles
    const barChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Local', 'Rival'],
            datasets: [{
                label: 'Goles',
                data: [data.goals.local, data.goals.rival],
                backgroundColor: ['#4caf50', '#f44336'],
                borderColor: ['#388e3c', '#d32f2f'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Crear gráfico de torta para posiciones
    const pieChart = new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: ['Delanteros', 'Centrocampistas', 'Defensores'],
            datasets: [{
                data: [data.positions.forward, data.positions.midfielder, data.positions.defender],
                backgroundColor: ['#ff9800', '#2196f3', '#8bc34a']
            }]
        }
    });
});
