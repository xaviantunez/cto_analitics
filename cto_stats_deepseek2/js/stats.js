// stats.js - Estadísticas del partido
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Inicializar datos si no existen
    if (!localStorage.getItem('currentMatch')) {
        resetMatchData();
    }

    // Cargar datos
    loadTeams();
    loadEvents();
    loadMatchData();

    // Event listeners
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    document.getElementById('addEventType').addEventListener('click', addEventType);
    document.getElementById('saveMatch').addEventListener('click', saveMatch);
    document.getElementById('exportEvents').addEventListener('click', exportEvents);

    // Configurar permisos
    setupPermissions();
});

function setupPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isCoachOrDelegate = currentUser.functions && 
        (currentUser.functions.includes('entrenador') || currentUser.functions.includes('delegado'));
    
    if (!isCoachOrDelegate) {
        // Deshabilitar controles de edición
        document.querySelectorAll('.timer-controls button, #addEventType, #saveMatch').forEach(btn => {
            btn.disabled = true;
        });
    }
}

function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const localTeamSelect = document.getElementById('localTeam');
    localTeamSelect.innerHTML = '';
    
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        localTeamSelect.appendChild(option);
    });
}

function loadEvents() {
    const events = JSON.parse(localStorage.getItem('events')) || ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Tiro a puerta', 'Corner'];
    const eventTypeSelect = document.getElementById('eventType');
    eventTypeSelect.innerHTML = '';
    
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event;
        option.textContent = event;
        eventTypeSelect.appendChild(option);
    });
}

function loadMatchData() {
    const matchData = JSON.parse(localStorage.getItem('currentMatch'));
    
    // Información básica
    if (matchData.localTeam) {
        document.getElementById('localTeam').value = matchData.localTeam;
    }
    document.getElementById('rivalTeam').value = matchData.rivalTeam || '';
    document.getElementById('matchDate').value = matchData.date || '';
    document.getElementById('matchTime').value = matchData.time || '';
    document.getElementById('tournament').value = matchData.tournament || '';
    
    // Temporizador
    updateTimerDisplay(matchData.timerSeconds || 0);
    
    // Jugadores
    renderPlayers('local', matchData.localPlayers || []);
    renderPlayers('rival', matchData.rivalPlayers || []);
    
    // Eventos
    renderEventsLog(matchData.events || []);
    
    // Resumen
    document.getElementById('matchSummary').value = matchData.summary || '';
}

function renderPlayers(teamType, players) {
    const table = document.getElementById(`${teamType}Players`).querySelector('tbody');
    table.innerHTML = '';
    
    players.forEach(player => {
        const tr = document.createElement('tr');
        
        // Nombre
        const tdName = document.createElement('td');
        tdName.textContent = player.name;
        tr.appendChild(tdName);
        
        // Alineado
        const tdAligned = document.createElement('td');
        const alignedCheck = document.createElement('input');
        alignedCheck.type = 'checkbox';
        alignedCheck.checked = player.aligned || false;
        alignedCheck.dataset.teamType = teamType;
        alignedCheck.dataset.playerName = player.name;
        alignedCheck.addEventListener('change', togglePlayerAligned);
        tdAligned.appendChild(alignedCheck);
        tr.appendChild(tdAligned);
        
        // Posición
        const tdPosition = document.createElement('td');
        const positionSelect = document.createElement('select');
        positionSelect.dataset.teamType = teamType;
        positionSelect.dataset.playerName = player.name;
        
        const positions = ['Portero', 'Defensa derecho', 'Defensa izquierdo', 'Banda izquierda', 
                          'Banda derecha', 'Medio centro', 'Pivote', 'Medio ofensivo', 'Delantero'];
        
        positions.forEach(pos => {
            const option = document.createElement('option');
            option.value = pos;
            option.textContent = pos;
            option.selected = player.position === pos;
            positionSelect.appendChild(option);
        });
        
        positionSelect.addEventListener('change', updatePlayerPosition);
        tdPosition.appendChild(positionSelect);
        tr.appendChild(tdPosition);
        
        // Eventos
        const tdEvents = document.createElement('td');
        const matchData = JSON.parse(localStorage.getItem('currentMatch'));
        const playerEvents = (matchData.events || []).filter(e => e.player === player.name && e.teamType === teamType);
        
        playerEvents.forEach(event => {
            const eventSpan = document.createElement('span');
            eventSpan.className = 'event-badge';
            eventSpan.textContent = `${event.type}: ${event.value}`;
            tdEvents.appendChild(eventSpan);
        });
        
        tr.appendChild(tdEvents);
        
        // Acciones
        const tdActions = document.createElement('td');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isCoachOrDelegate = currentUser.functions && 
            (currentUser.functions.includes('entrenador') || currentUser.functions.includes('delegado'));
        
        if (isCoachOrDelegate) {
            const eventSelect = document.createElement('select');
            eventSelect.dataset.teamType = teamType;
            eventSelect.dataset.playerName = player.name;
            
            const events = JSON.parse(localStorage.getItem('events')) || [];
            events.forEach(event => {
                const option = document.createElement('option');
                option.value = event;
                option.textContent = event;
                eventSelect.appendChild(option);
            });
            
            const addBtn = document.createElement('button');
            addBtn.textContent = '+';
            addBtn.dataset.teamType = teamType;
            addBtn.dataset.playerName = player.name;
            addBtn.addEventListener('click', () => addPlayerEvent(eventSelect.value, teamType, player.name, 1));
            
            const minusBtn = document.createElement('button');
            minusBtn.textContent = '-';
            minusBtn.dataset.teamType = teamType;
            minusBtn.dataset.playerName = player.name;
            minusBtn.addEventListener('click', () => addPlayerEvent(eventSelect.value, teamType, player.name, -1));
            
            tdActions.appendChild(eventSelect);
            tdActions.appendChild(addBtn);
            tdActions.appendChild(minusBtn);
        }
        
        tr.appendChild(tdActions);
        
        table.appendChild(tr);
    });
}

function renderEventsLog(events) {
    const tbody = document.getElementById('eventsLog').querySelector('tbody');
    tbody.innerHTML = '';
    
    events.forEach(event => {
        const tr = document.createElement('tr');
        
        // Tiempo
        const tdTime = document.createElement('td');
        tdTime.textContent = formatTime(event.timestamp);
        tr.appendChild(tdTime);
        
        // Jugador
        const tdPlayer = document.createElement('td');
        tdPlayer.textContent = event.player;
        tr.appendChild(tdPlayer);
        
        // Evento
        const tdEvent = document.createElement('td');
        tdEvent.textContent = event.type;
        tr.appendChild(tdEvent);
        
        // Valor
        const tdValue = document.createElement('td');
        tdValue.textContent = event.value > 0 ? `+${event.value}` : event.value;
        tr.appendChild(tdValue);
        
        tbody.appendChild(tr);
    });
}

// ... (continuaría con las funciones del temporizador, manejo de eventos, etc.)