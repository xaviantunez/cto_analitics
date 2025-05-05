// analysis.js - Análisis de estadísticas y generación de gráficos
const Analysis = {
    init: function() {
        if (!Auth.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }
        
        this.loadData();
        this.setupEventListeners();
        this.renderTeamSelector();
        this.renderAnalysis();
    },
    
    loadData: function() {
        this.matches = DB.load('matches.json');
        this.teams = DB.load('teams.json');
        this.users = DB.load('users.json');
    },
    
    setupEventListeners: function() {
        document.getElementById('teamSelector').addEventListener('change', this.renderAnalysis.bind(this));
        document.getElementById('timeRange').addEventListener('change', this.renderAnalysis.bind(this));
        document.getElementById('exportAnalysisBtn').addEventListener('click', this.exportAnalysis.bind(this));
    },
    
    renderTeamSelector: function() {
        const selector = document.getElementById('teamSelector');
        selector.innerHTML = '';
        
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Todos los equipos';
        selector.appendChild(allOption);
        
        this.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            selector.appendChild(option);
        });
    },
    
    renderAnalysis: function() {
        const teamId = document.getElementById('teamSelector').value;
        const timeRange = document.getElementById('timeRange').value;
        
        let filteredMatches = [...this.matches];
        
        // Filtrar por equipo
        if (teamId !== 'all') {
            const team = this.teams.find(t => t.id === teamId);
            if (team) {
                filteredMatches = filteredMatches.filter(m => 
                    m.localTeam === team.name || m.rivalTeam === team.name
                );
            }
        }
        
        // Filtrar por rango de tiempo
        const now = new Date();
        let startDate = new Date(0);
        
        if (timeRange === 'last-month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1));
        } else if (timeRange === 'last-year') {
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        }
        
        filteredMatches = filteredMatches.filter(m => {
            return new Date(m.createdAt) >= startDate;
        });
        
        // Renderizar resultados
        this.renderStatsSummary(filteredMatches, teamId);
        this.renderPlayerStats(filteredMatches, teamId);
        this.renderCharts(filteredMatches, teamId);
    },
    
    renderStatsSummary: function(matches, teamId) {
        const statsContainer = document.getElementById('statsSummary');
        
        if (teamId === 'all') {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>Partidos registrados</h3>
                    <div class="stat-value">${matches.length}</div>
                </div>
            `;
            return;
        }
        
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;
        
        const stats = Utils.calculateStats(matches, team.name);
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>Partidos jugados</h3>
                <div class="stat-value">${stats.played}</div>
            </div>
            <div class="stat-card">
                <h3>Victorias</h3>
                <div class="stat-value">${stats.wins}</div>
                <div class="stat-label">${stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}%</div>
            </div>
            <div class="stat-card">
                <h3>Empates</h3>
                <div class="stat-value">${stats.draws}</div>
                <div class="stat-label">${stats.played > 0 ? Math.round((stats.draws / stats.played) * 100) : 0}%</div>
            </div>
            <div class="stat-card">
                <h3>Derrotas</h3>
                <div class="stat-value">${stats.losses}</div>
                <div class="stat-label">${stats.played > 0 ? Math.round((stats.losses / stats.played) * 100) : 0}%</div>
            </div>
            <div class="stat-card">
                <h3>Goles a favor</h3>
                <div class="stat-value">${stats.goalsFor}</div>
                <div class="stat-label">${stats.played > 0 ? (stats.goalsFor / stats.played).toFixed(1) : 0} por partido</div>
            </div>
            <div class="stat-card">
                <h3>Goles en contra</h3>
                <div class="stat-value">${stats.goalsAgainst}</div>
                <div class="stat-label">${stats.played > 0 ? (stats.goalsAgainst / stats.played).toFixed(1) : 0} por partido</div>
            </div>
            <div class="stat-card">
                <h3>Vallas invictas</h3>
                <div class="stat-value">${stats.cleanSheets}</div>
                <div class="stat-label">${stats.played > 0 ? Math.round((stats.cleanSheets / stats.played) * 100) : 0}%</div>
            </div>
        `;
    },
    
    renderPlayerStats: function(matches, teamId) {
        const container = document.getElementById('playerStats');
        
        if (teamId === 'all') {
            container.innerHTML = '<p>Selecciona un equipo para ver estadísticas de jugadores</p>';
            return;
        }
        
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;
        
        // Calcular estadísticas por jugador
        const playerStats = {};
        
        team.players.forEach(player => {
            playerStats[player.id] = {
                name: player.name,
                number: player.number,
                matchesPlayed: 0,
                matchesStarted: 0,
                minutesPlayed: 0,
                goals: 0,
                yellowCards: 0,
                redCards: 0,
                positions: {}
            };
        });
        
        matches.forEach(match => {
            if (match.localTeam === team.name || match.rivalTeam === team.name) {
                const isHome = match.localTeam === team.name;
                
                // Procesar alineaciones
                match.lineups.forEach(lineup => {
                    const player = playerStats[lineup.playerId];
                    if (player) {
                        player.matchesPlayed++;
                        if (lineup.startTime === 0) player.matchesStarted++;
                        
                        const endTime = lineup.endTime || match.elapsedTime;
                        player.minutesPlayed += (endTime - lineup.startTime) / 60;
                        
                        if (lineup.position) {
                            player.positions[lineup.position] = (player.positions[lineup.position] || 0) + 
                                ((endTime - lineup.startTime) / 60);
                        }
                    }
                });
                
                // Procesar eventos
                match.events.forEach(event => {
                    if ((isHome && event.team === match.localTeam) || 
                        (!isHome && event.team === match.rivalTeam)) {
                        const player = playerStats[event.playerId];
                        if (player) {
                            switch(event.type) {
                                case 'Gol':
                                    player.goals++;
                                    break;
                                case 'Tarjeta amarilla':
                                    player.yellowCards++;
                                    break;
                                case 'Tarjeta roja':
                                    player.redCards++;
                                    break;
                            }
                        }
                    }
                });
            }
        });
        
        // Convertir a array y ordenar
        const statsArray = Object.values(playerStats).map(player => ({
            ...player,
            mainPosition: this.getMainPosition(player.positions),
            goalsPerMatch: player.matchesPlayed > 0 ? (player.goals / player.matchesPlayed).toFixed(2) : 0,
            minutesPerMatch: player.matchesPlayed > 0 ? (player.minutesPlayed / player.matchesPlayed).toFixed(1) : 0
        }));
        
        // Ordenar por minutos jugados
        statsArray.sort((a, b) => b.minutesPlayed - a.minutesPlayed);
        
        // Renderizar tabla
        container.innerHTML = `
            <table class="player-stats">
                <thead>
                    <tr>
                        <th>Jugador</th>
                        <th>Partidos</th>
                        <th>Titular</th>
                        <th>Minutos</th>
                        <th>Min/Partido</th>
                        <th>Goles</th>
                        <th>Gol/Partido</th>
                        <th>TA</th>
                        <th>TR</th>
                        <th>Posición</th>
                    </tr>
                </thead>
                <tbody>
                    ${statsArray.map(player => `
                        <tr>
                            <td>${player.number}. ${player.name}</td>
                            <td>${player.matchesPlayed}</td>
                            <td>${player.matchesStarted}</td>
                            <td>${Math.round(player.minutesPlayed)}</td>
                            <td>${player.minutesPerMatch}</td>
                            <td>${player.goals}</td>
                            <td>${player.goalsPerMatch}</td>
                            <td>${player.yellowCards}</td>
                            <td>${player.redCards}</td>
                            <td>${this.formatPosition(player.mainPosition)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    getMainPosition: function(positions) {
        if (Object.keys(positions).length === 0) return '';
        
        return Object.entries(positions).reduce((a, b) => 
            a[1] > b[1] ? a : b
        )[0];
    },
    
    formatPosition: function(position) {
        if (!position) return '';
        
        const positionsMap = {
            'portero': 'POR',
            'defensa derecho': 'DFD',
            'defensa izquierdo': 'DFI',
            'banda derecha': 'LD',
            'banda izquierda': 'LI',
            'medio centro': 'MC',
            'pivote': 'PIV',
            'medio ofensivo': 'MCO',
            'delantero': 'DEL'
        };
        
        return positionsMap[position] || position;
    },
    
    renderCharts: function(matches, teamId) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está cargado - los gráficos no se mostrarán');
            return;
        }
        
        this.renderResultsChart(matches, teamId);
        this.renderGoalsChart(matches, teamId);
        this.renderPlayerPerformanceChart(matches, teamId);
    },
    
    renderResultsChart: function(matches, teamId) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        
        if (teamId === 'all') {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Partidos registrados'],
                    datasets: [{
                        label: 'Total',
                        data: [matches.length],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Partidos registrados'
                        }
                    }
                }
            });
            return;
        }
        
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;
        
        const stats = Utils.calculateStats(matches, team.name);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Victorias', 'Empates', 'Derrotas'],
                datasets: [{
                    data: [stats.wins, stats.draws, stats.losses],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(255, 99, 132, 0.5)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Resultados del equipo'
                    }
                }
            }
        });
    },
    
    renderGoalsChart: function(matches, teamId) {
        const ctx = document.getElementById('goalsChart').getContext('2d');
        
        if (teamId === 'all' || !this.teams.find(t => t.id === teamId)) {
            // Gráfico general para todos los equipos
            const goalsData = {};
            
            matches.forEach(match => {
                const homeGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.localTeam
                ).length;
                
                const awayGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.rivalTeam
                ).length;
                
                goalsData[match.localTeam] = (goalsData[match.localTeam] || 0) + homeGoals;
                goalsData[match.rivalTeam] = (goalsData[match.rivalTeam] || 0) + awayGoals;
            });
            
            const teams = Object.keys(goalsData);
            const goals = Object.values(goalsData);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: teams,
                    datasets: [{
                        label: 'Goles marcados',
                        data: goals,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Goles por equipo'
                        }
                    }
                }
            });
            return;
        }
        
        // Gráfico específico para un equipo
        const team = this.teams.find(t => t.id === teamId);
        const goalsFor = [];
        const goalsAgainst = [];
        const matchLabels = [];
        
        matches
            .filter(m => m.localTeam === team.name || m.rivalTeam === team.name)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(match => {
                const isHome = match.localTeam === team.name;
                
                const homeGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.localTeam
                ).length;
                
                const awayGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.rivalTeam
                ).length;
                
                goalsFor.push(isHome ? homeGoals : awayGoals);
                goalsAgainst.push(isHome ? awayGoals : homeGoals);
                matchLabels.push(`${match.localTeam} vs ${match.rivalTeam} (${Utils.formatDate(match.date)})`);
            });
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: matchLabels,
                datasets: [
                    {
                        label: 'Goles a favor',
                        data: goalsFor,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Goles en contra',
                        data: goalsAgainst,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución de goles'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    renderPlayerPerformanceChart: function(matches, teamId) {
        const ctx = document.getElementById('playerPerformanceChart').getContext('2d');
        
        if (teamId === 'all') {
            document.getElementById('playerPerformanceChart').style.display = 'none';
            return;
        }
        
        document.getElementById('playerPerformanceChart').style.display = 'block';
        const team = this.teams.find(t => t.id === teamId);
        if (!team || team.players.length === 0) return;
        
        // Calcular rendimiento de jugadores (simplificado)
        const playerPerformance = team.players.map(player => {
            const goals = matches.reduce((total, match) => {
                return total + match.events.filter(e => 
                    e.playerId === player.id && e.type === 'Gol' && 
                    (e.team === match.localTeam || e.team === match.rivalTeam)
                ).length;
            }, 0);
            
            const minutes = matches.reduce((total, match) => {
                const lineup = match.lineups.find(l => l.playerId === player.id);
                if (!lineup) return total;
                
                const endTime = lineup.endTime || match.elapsedTime;
                return total + (endTime - lineup.startTime) / 60;
            }, 0);
            
            return {
                name: player.name,
                goals,
                minutes,
                efficiency: minutes > 0 ? (goals / minutes * 90).toFixed(2) : 0
            };
        });
        
        // Ordenar por eficiencia
        playerPerformance.sort((a, b) => b.efficiency - a.efficiency);
        
        // Tomar los top 10
        const topPlayers = playerPerformance.slice(0, 10);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topPlayers.map(p => p.name),
                datasets: [{
                    label: 'Goles por cada 90 minutos',
                    data: topPlayers.map(p => p.efficiency),
                    backgroundColor: 'rgba(153, 102, 255, 0.5)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Rendimiento de jugadores (top 10)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },
    
    exportAnalysis: function() {
        const teamId = document.getElementById('teamSelector').value;
        const teamName = teamId === 'all' ? 'todos' : this.teams.find(t => t.id === teamId)?.name || 'desconocido';
        
        let csvContent = "Análisis de estadísticas\n\n";
        
        // Resumen
        csvContent += "RESUMEN\n";
        if (teamId === 'all') {
            csvContent += `Partidos registrados,${this.matches.length}\n`;
        } else {
            const stats = Utils.calculateStats(this.matches, teamName);
            csvContent += `Partidos jugados,${stats.played}\n`;
            csvContent += `Victorias,${stats.wins}\n`;
            csvContent += `Empates,${stats.draws}\n`;
            csvContent += `Derrotas,${stats.losses}\n`;
            csvContent += `Goles a favor,${stats.goalsFor}\n`;
            csvContent += `Goles en contra,${stats.goalsAgainst}\n`;
            csvContent += `Vallas invictas,${stats.cleanSheets}\n`;
        }
        
        // Estadísticas de jugadores
        if (teamId !== 'all') {
            csvContent += "\nJUGADORES\n";
            csvContent += "Nombre,Partidos,Titular,Minutos,Min/Partido,Goles,Gol/Partido,TA,TR,Posición\n";
            
            const tableRows = document.querySelectorAll('.player-stats tbody tr');
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const rowData = Array.from(cells).map(cell => cell.textContent).join(',');
                csvContent += `${rowData}\n`;
            });
        }
        
        Utils.downloadFile(csvContent, `analisis_${teamName}.csv`, 'text/csv');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('teamSelector')) {
        Analysis.init();
    }
});