// history.js - Histórico de partidos
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos iniciales
    loadTeamsFilter();
    loadMatches();

    // Event listeners
    document.getElementById('applyFilter').addEventListener('click', loadMatches);
    document.getElementById('closeDetails').addEventListener('click', closeMatchDetails);
});

function loadTeamsFilter() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const filterTeamSelect = document.getElementById('filterTeam');
    
    // Limpiar opciones excepto la primera
    while (filterTeamSelect.options.length > 1) {
        filterTeamSelect.remove(1);
    }
    
    // Añadir equipos
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        filterTeamSelect.appendChild(option);
    });
}

function loadMatches() {
    const teamFilter = document.getElementById('filterTeam').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    let filteredMatches = [...matches];
    
    // Aplicar filtros
    if (teamFilter && teamFilter !== 'all') {
        filteredMatches = filteredMatches.filter(m => 
            m.localTeam === teamFilter || m.rivalTeam === teamFilter
        );
    }
    
    if (dateFrom) {
        filteredMatches = filteredMatches.filter(m => m.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredMatches = filteredMatches.filter(m => m.date <= dateTo);
    }
    
    // Ordenar por fecha (más reciente primero)
    filteredMatches.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    
    // Mostrar resultados
    renderMatchesTable(filteredMatches);
}

function renderMatchesTable(matches) {
    const tbody = document.querySelector('#matchesTable tbody');
    tbody.innerHTML = '';
    
    matches.forEach(match => {
        const tr = document.createElement('tr');
        tr.dataset.matchId = match.id;
        tr.addEventListener('click', () => showMatchDetails(match.id));
        
        // Fecha
        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(match.date);
        tr.appendChild(tdDate);
        
        // Local
        const tdLocal = document.createElement('td');
        tdLocal.textContent = match.localTeam;
        tr.appendChild(tdLocal);
        
        // Visitante
        const tdRival = document.createElement('td');
        tdRival.textContent = match.rivalTeam;
        tr.appendChild(tdRival);
        
        // Torneo
        const tdTournament = document.createElement('td');
        tdTournament.textContent = match.tournament || '-';
        tr.appendChild(tdTournament);
        
        // Acciones
        const tdActions = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'Ver';
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showMatchDetails(match.id);
        });
        tdActions.appendChild(viewBtn);
        tr.appendChild(tdActions);
        
        tbody.appendChild(tr);
    });
}

function showMatchDetails(matchId) {
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    const match = matches.find(m => m.id === matchId);
    
    if (!match) return;
    
    // Mostrar información básica
    document.getElementById('detailTeams').textContent = `${match.localTeam} vs ${match.rivalTeam}`;
    document.getElementById('detailDate').textContent = `${formatDate(match.date)} a las ${match.time}`;
    document.getElementById('detailTournament').textContent = `Torneo: ${match.tournament || 'No especificado'}`;
    
    // Mostrar estadísticas
    const statsDiv = document.getElementById('detailStats');
    statsDiv.innerHTML = '';
    
    // Tiempo total
    const timeDiv = document.createElement('div');
    timeDiv.innerHTML = `<strong>Tiempo total:</strong> ${formatTime(match.timerSeconds || 0)}`;
    statsDiv.appendChild(timeDiv);
    
    // Eventos por equipo
    const localEvents = match.events.filter(e => e.teamType === 'local');
    const rivalEvents = match.events.filter(e => e.teamType === 'rival');
    
    const eventsDiv = document.createElement('div');
    eventsDiv.innerHTML = `
        <h4>Eventos</h4>
        <p><strong>${match.localTeam}:</strong> ${localEvents.length} eventos</p>
        <p><strong>${match.rivalTeam}:</strong> ${rivalEvents.length} eventos</p>
    `;
    statsDiv.appendChild(eventsDiv);
    
    // Jugadores alineados
    const localPlayers = match.localPlayers.filter(p => p.aligned);
    const rivalPlayers = match.rivalPlayers.filter(p => p.aligned);
    
    const playersDiv = document.createElement('div');
    playersDiv.innerHTML = `
        <h4>Jugadores alineados</h4>
        <p><strong>${match.localTeam}:</strong> ${localPlayers.length} jugadores</p>
        <p><strong>${match.rivalTeam}:</strong> ${rivalPlayers.length} jugadores</p>
    `;
    statsDiv.appendChild(playersDiv);
    
    // Mostrar resumen
    document.getElementById('detailSummary').textContent = match.summary || 'No hay resumen disponible';
    
    // Mostrar sección de detalles
    document.getElementById('matchDetails').style.display = 'block';
    document.querySelector('.matches-section').style.display = 'none';
}

function closeMatchDetails() {
    document.getElementById('matchDetails').style.display = 'none';
    document.querySelector('.matches-section').style.display = 'block';
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}