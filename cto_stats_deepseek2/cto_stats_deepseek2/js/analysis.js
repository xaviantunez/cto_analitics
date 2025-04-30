// analysis.js - Análisis de datos
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar filtros
    loadTeamsFilter();
    loadPlayersFilter();
    loadEventsFilter();
    
    // Cargar datos iniciales
    loadAnalysis();

    // Event listeners
    document.getElementById('applyAnalysis').addEventListener('click', loadAnalysis);
    document.getElementById('exportAnalysis').addEventListener('click', exportAnalysis);
});

function loadTeamsFilter() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamSelect = document.getElementById('analysisTeam');
    
    // Limpiar opciones excepto la primera
    while (teamSelect.options.length > 1) {
        teamSelect.remove(1);
    }
    
    // Añadir equipos
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

function loadPlayersFilter() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const playerSelect = document.getElementById('analysisPlayer');
    
    // Limpiar opciones excepto la primera
    playerSelect.innerHTML = '';
    
    const emptyOption = document.createElement('option');
    emptyOption.value = 'all';
    emptyOption.textContent = 'Todos los jugadores';
    playerSelect.appendChild(emptyOption);
    
    // Añadir jugadores de todos los equipos
    teams.forEach(team => {
        team.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = `${player} (${team.name})`;
            playerSelect.appendChild(option);
        });
    });
}

function loadEventsFilter() {
    const events = JSON.parse(localStorage.getItem('events')) || ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Tiro a puerta', 'Corner'];
    const eventSelect = document.getElementById('analysisEvent');
    
    // Limpiar opciones excepto la primera
    while (eventSelect.options.length > 1) {
        eventSelect.remove(1);
    }
    
    // Añadir eventos
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event;
        option.textContent = event;
        eventSelect.appendChild(option);
    });
}

function loadAnalysis() {
    const teamFilter = document.getElementById('analysisTeam').value;
    const playerFilter = document.getElementById('analysisPlayer').value;
    const eventFilter = document.getElementById('analysisEvent').value;
    const dateFrom = document.getElementById('analysisDateFrom').value;
    const dateTo = document.getElementById('analysisDateTo').value;
    
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    let filteredMatches = [...matches];
    
    // Aplicar filtros de fecha
    if (dateFrom) {
        filteredMatches = filteredMatches.filter(m => m.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredMatches = filteredMatches.filter(m => m.date <= dateTo);
    }
    
    // Procesar datos
    const stats = {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        players: {},
        events: {},
        positions: {}
    };
    
    filteredMatches.forEach(match => {
        // Solo considerar partidos del equipo filtrado
        if (teamFilter && teamFilter !== 'all' && match.localTeam !== teamFilter) {
            return;
        }
        
        stats.totalMatches++;
        
        // Determinar resultado (victoria, derrota o empate)
        const localGoals = match.events.filter(e => 
            e.teamType === 'local' && e.type === 'Gol' && e.value > 0
        ).length;
        
        const rivalGoals = match.events.filter(e => 
            e.teamType === 'rival' && e.type === 'Gol' && e.value > 0
        ).length;
        
        if (localGoals > rivalGoals) stats.wins++;
        else if (localGoals < rivalGoals) stats.losses++;
        else stats.draws++;
        
        // Procesar jugadores
        match.localPlayers.forEach(player => {
            if (playerFilter !== 'all' && player.name !== playerFilter) {
                return;
            }
            
            if (!stats.players[player.name]) {
                stats.players[player.name] = {
                    name: player.name,
                    timePlayed: 0,
                    matchesPlayed: 0,
                    starts: 0,
                    positions: {},
                    events: {}
                };
            }
            
            // Tiempo jugado
            if (player.aligned) {
                stats.players[player.name].timePlayed += match.timerSeconds || 0;
                stats.players[player.name].matchesPlayed++;
                
                // Contar como titular si jugó más de la mitad del partido
                if ((match.timerSeconds || 0) > 45 * 60 / 2) {
                    stats.players[player.name].starts++;
                }
            }
            
            // Posiciones
            if (player.position) {
                if (!stats.players[player.name].positions[player.position]) {
                    stats.players[player.name].positions[player.position] = 0;
                }
                stats.players[player.name].positions[player.position] += match.timerSeconds || 0;
            }
        });
        
        // Procesar eventos
        match.events.forEach(event => {
            if (eventFilter !== 'all' && event.type !== eventFilter) {
                return;
            }
            
            // Eventos por jugador
            if (stats.players[event.player]) {
                if (!stats.players[event.player].events[event.type]) {
                    stats.players[event.player].events[event.type] = 0;
                }
                stats.players[event.player].events[event.type] += event.value;
            }
            
            // Eventos generales
            if (!stats.events[event.type]) {
                stats.events[event.type] = 0;
            }
            stats.events[event.type] += event.value;
        });
    });
    
    // Mostrar resultados
    renderStatsSummary(stats);
    renderCharts(stats);
}

function renderStatsSummary(stats) {
    const summaryDiv = document.getElementById('statsSummary');
    summaryDiv.innerHTML = '';
    
    // Resumen general
    const generalDiv = document.createElement('div');
    generalDiv.innerHTML = `
        <h3>Resumen General</h3>
        <p><strong>Partidos jugados:</strong> ${stats.totalMatches}</p>
        <p><strong>Victorias:</strong> ${stats.wins} (${stats.totalMatches ? Math.round(stats.wins/stats.totalMatches*100) : 0}%)</p>
        <p><strong>Derrotas:</strong> ${stats.losses} (${stats.totalMatches ? Math.round(stats.losses/stats.totalMatches*100) : 0}%)</p>
        <p><strong>Empates:</strong> ${stats.draws} (${stats.totalMatches ? Math.round(stats.draws/stats.totalMatches*100) : 0}%)</p>
    `;
    summaryDiv.appendChild(generalDiv);
    
    // Eventos
    const eventsDiv = document.createElement('div');
    eventsDiv.innerHTML = '<h3>Eventos</h3>';
    
    for (const [event, count] of Object.entries(stats.events)) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${event}:</strong> ${count}`;
        eventsDiv.appendChild(p);
    }
    
    summaryDiv.appendChild(eventsDiv);
    
    // Jugadores (solo si hay filtro de jugador o no hay filtro de equipo)
    const teamFilter = document.getElementById('analysisTeam').value;
    const playerFilter = document.getElementById('analysisPlayer').value;
    
    if (playerFilter !== 'all' || (teamFilter === 'all' && Object.keys(stats.players).length <= 10)) {
        const playersDiv = document.createElement('div');
        playersDiv.innerHTML = '<h3>Jugadores</h3>';
        
        for (const player of Object.values(stats.players)) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-stats';
            playerDiv.innerHTML = `
                <h4>${player.name}</h4>
                <p><strong>Partidos jugados:</strong> ${player.matchesPlayed}</p>
                <p><strong>Titularidades:</strong> ${player.starts}</p>
                <p><strong>Tiempo jugado:</strong> ${formatTime(player.timePlayed)}</p>
            `;
            
            // Eventos del jugador
            if (Object.keys(player.events).length > 0) {
                const eventsP = document.createElement('p');
                eventsP.innerHTML = '<strong>Eventos:</strong>';
                playerDiv.appendChild(eventsP);
                
                const eventsList = document.createElement('ul');
                for (const [event, count] of Object.entries(player.events)) {
                    const li = document.createElement('li');
                    li.textContent = `${event}: ${count}`;
                    eventsList.appendChild(li);
                }
                playerDiv.appendChild(eventsList);
            }
            
            playersDiv.appendChild(playerDiv);
        }
        
        summaryDiv.appendChild(playersDiv);
    }
}

function renderCharts(stats) {
    // Gráfico de resultados
    const winsLossesCtx = document.getElementById('winsLossesChart').getContext('2d');
    new Chart(winsLossesCtx, {
        type: 'pie',
        data: {
            labels: ['Victorias', 'Derrotas', 'Empates'],
            datasets: [{
                data: [stats.wins, stats.losses, stats.draws],
                backgroundColor: ['#4CAF50', '#F44336', '#FFC107']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de resultados'
                }
            }
        }
    });
    
    // Gráfico de tiempo jugado por jugador
    const players = Object.values(stats.players);
    if (players.length > 0) {
        const playingTimeCtx = document.getElementById('playingTimeChart').getContext('2d');
        new Chart(playingTimeCtx, {
            type: 'bar',
            data: {
                labels: players.map(p => p.name),
                datasets: [{
                    label: 'Minutos jugados',
                    data: players.map(p => Math.round(p.timePlayed / 60)),
                    backgroundColor: '#2196F3'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tiempo jugado por jugador (minutos)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Gráfico de posiciones (para un jugador específico)
    const playerFilter = document.getElementById('analysisPlayer').value;
    if (playerFilter !== 'all' && stats.players[playerFilter]) {
        const player = stats.players[playerFilter];
        const positions = Object.entries(player.positions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (positions.length > 0) {
            const positionsCtx = document.getElementById('positionsChart').getContext('2d');
            new Chart(positionsCtx, {
                type: 'doughnut',
                data: {
                    labels: positions.map(p => p[0]),
                    datasets: [{
                        data: positions.map(p => Math.round(p[1] / 60)),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Posiciones de ${player.name} (minutos)`
                        }
                    }
                }
            });
        }
    }
}

function exportAnalysis() {
    // Implementar exportación a Excel
    alert('Funcionalidad de exportación a Excel se implementará aquí');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}