document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const localTeamInput = document.getElementById('local-team');
    const rivalTeamInput = document.getElementById('rival-team');
    const saveLocalTeamBtn = document.getElementById('save-local-team');
    const selectTeamDropdown = document.getElementById('select-team');
    const loadTeamBtn = document.getElementById('load-team');
    const deleteTeamBtn = document.getElementById('delete-team');
    const newPlayerInput = document.getElementById('new-player');
    const addPlayerBtn = document.getElementById('add-player');
    const playerList = document.getElementById('player-list');
    const startMatchBtn = document.getElementById('start-match');
    
    const matchSection = document.querySelector('.match-section');
    const matchTitle = document.getElementById('match-title');
    const matchTimeDisplay = document.getElementById('match-time');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const playerLineup = document.getElementById('player-lineup');
    const saveLineupBtn = document.getElementById('save-lineup');
    const statsTable = document.getElementById('stats-table');
    const statsBody = document.getElementById('stats-body');
    const addEventTypeBtn = document.getElementById('add-event-type');
    const newEventTypeInput = document.getElementById('new-event-type');
    const matchImpressions = document.getElementById('match-impressions');
    const saveNotesBtn = document.getElementById('save-notes');
    const exportLogBtn = document.getElementById('export-log');
    const clearLogBtn = document.getElementById('clear-log');
    const logBody = document.getElementById('log-body');
    const matchHistorySelect = document.getElementById('match-history-select');
    const loadMatchBtn = document.getElementById('load-match');
    const deleteMatchBtn = document.getElementById('delete-match');
    const endMatchBtn = document.getElementById('end-match');
    
    // Variables de estado
    let timerInterval;
    let matchSeconds = 0;
    let isTimerRunning = false;
    let currentPlayers = [];
    let eventTypes = ['Goles', 'Asistencias', 'Tarjetas Amarillas', 'Tarjetas Rojas', 'Faltas', 'Tiros', 'Tiros a puerta'];
    let lineup = [];
    let matchData = {
        localTeam: '',
        rivalTeam: '',
        players: [],
        events: [],
        log: [],
        notes: '',
        startTime: null,
        timerUpdates: []
    };
    
    // Posiciones de los jugadores
    const positions = [
        'Portero',
        'Defensa derecho',
        'Defensa izquierdo',
        'Banda izquierda',
        'Banda derecha',
        'Medio centro',
        'Pivote',
        'Medio ofensivo',
        'Delantero'
    ];
    
    // Inicialización
    init();
    
    function init() {
        loadTeamsDropdown();
        loadMatchHistory();
        
        // Cargar partido en curso si existe
        const currentMatch = storage.getCurrentMatch();
        if (currentMatch) {
            loadCurrentMatch(currentMatch);
            showMatchSection();
        }
        
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Configuración inicial
        saveLocalTeamBtn.addEventListener('click', saveTeam);
        loadTeamBtn.addEventListener('click', loadTeam);
        deleteTeamBtn.addEventListener('click', deleteTeam);
        addPlayerBtn.addEventListener('click', addPlayer);
        startMatchBtn.addEventListener('click', startMatch);
        
        // Durante el partido
        pauseTimerBtn.addEventListener('click', toggleTimer);
        resetTimerBtn.addEventListener('click', resetTimer);
        saveLineupBtn.addEventListener('click', saveLineup);
        addEventTypeBtn.addEventListener('click', addEventType);
        saveNotesBtn.addEventListener('click', saveNotes);
        exportLogBtn.addEventListener('click', exportToExcel);
        clearLogBtn.addEventListener('click', clearLog);
        loadMatchBtn.addEventListener('click', loadHistoricalMatch);
        deleteMatchBtn.addEventListener('click', deleteHistoricalMatch);
        endMatchBtn.addEventListener('click', endMatch);
    }
    
    // Funciones de equipos
    function saveTeam() {
        const teamName = localTeamInput.value.trim();
        if (!teamName) {
            alert('Por favor, introduce un nombre para el equipo');
            return;
        }
        
        const players = Array.from(playerList.children).map(li => li.textContent);
        storage.saveTeam(teamName, players);
        alert(`Equipo "${teamName}" guardado con ${players.length} jugadores`);
        loadTeamsDropdown();
    }
    
    function loadTeamsDropdown() {
        selectTeamDropdown.innerHTML = '<option value="">-- Seleccione un equipo --</option>';
        const teams = storage.getTeams();
        
        for (const teamName in teams) {
            const option = document.createElement('option');
            option.value = teamName;
            option.textContent = teamName;
            selectTeamDropdown.appendChild(option);
        }
    }
    
    function loadTeam() {
        const teamName = selectTeamDropdown.value;
        if (!teamName) return;
        
        const teams = storage.getTeams();
        const players = teams[teamName];
        
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            playerList.appendChild(li);
        });
        
        localTeamInput.value = teamName;
        currentPlayers = [...players];
        updateStartMatchButton();
    }
    
    function deleteTeam() {
        const teamName = selectTeamDropdown.value;
        if (!teamName) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el equipo "${teamName}"?`)) {
            storage.deleteTeam(teamName);
            loadTeamsDropdown();
            playerList.innerHTML = '';
            localTeamInput.value = '';
            alert(`Equipo "${teamName}" eliminado`);
        }
    }
    
    // Funciones de jugadores
    function addPlayer() {
        const playerName = newPlayerInput.value.trim();
        if (!playerName) return;
        
        const li = document.createElement('li');
        li.textContent = playerName;
        playerList.appendChild(li);
        newPlayerInput.value = '';
        
        currentPlayers.push(playerName);
        updateStartMatchButton();
    }
    
    // Funciones de partido
    function updateStartMatchButton() {
        const localTeam = localTeamInput.value.trim();
        const rivalTeam = rivalTeamInput.value.trim();
        startMatchBtn.disabled = !(localTeam && rivalTeam && currentPlayers.length > 0);
    }
    
    function startMatch() {
        matchData = {
            localTeam: localTeamInput.value.trim(),
            rivalTeam: rivalTeamInput.value.trim(),
            players: currentPlayers.map(name => ({
                name,
                position: '',
                isStarting: false,
                stats: {},
                playTime: 0
            })),
            events: [],
            log: [],
            notes: '',
            startTime: new Date(),
            timerUpdates: []
        };
        
        matchTitle.textContent = `Partido: ${matchData.localTeam} vs ${matchData.rivalTeam}`;
        showMatchSection();
        renderPlayerLineup();
        updateEventTypes();
        
        // Guardar estado inicial
        storage.saveCurrentMatch(matchData);
        addLogEntry('Partido iniciado');
    }
    
    function showMatchSection() {
        document.querySelector('.setup-section').style.display = 'none';
        matchSection.style.display = 'block';
        startTimer();
    }
    
    function renderPlayerLineup() {
        playerLineup.innerHTML = '';
        matchData.players.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = 'player-card';
            if (player.isStarting) card.classList.add('selected');
            
            card.innerHTML = `
                <h4>${player.name}</h4>
                <select class="position-select" data-player-index="${index}">
                    <option value="">-- Posición --</option>
                    ${positions.map(pos => `
                        <option value="${pos}" ${player.position === pos ? 'selected' : ''}>${pos}</option>
                    `).join('')}
                </select>
                <label>
                    <input type="checkbox" class="starting-checkbox" data-player-index="${index}" 
                           ${player.isStarting ? 'checked' : ''}>
                    Titular
                </label>
            `;
            
            playerLineup.appendChild(card);
        });
        
        // Añadir event listeners a los nuevos elementos
        document.querySelectorAll('.position-select').forEach(select => {
            select.addEventListener('change', updatePlayerPosition);
        });
        
        document.querySelectorAll('.starting-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateStartingPlayer);
        });
    }
    
    function updatePlayerPosition(e) {
        const playerIndex = parseInt(e.target.dataset.playerIndex);
        const position = e.target.value;
        
        matchData.players[playerIndex].position = position;
        storage.saveCurrentMatch(matchData);
        
        if (position && matchData.players[playerIndex].isStarting) {
            updateStatsTable();
        }
    }
    
    function updateStartingPlayer(e) {
        const playerIndex = parseInt(e.target.dataset.playerIndex);
        const isStarting = e.target.checked;
        
        matchData.players[playerIndex].isStarting = isStarting;
        
        // Actualizar clase CSS
        const card = e.target.closest('.player-card');
        if (isStarting) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
        
        storage.saveCurrentMatch(matchData);
        updateStatsTable();
    }
    
    function saveLineup() {
        const startingPlayers = matchData.players.filter(p => p.isStarting);
        
        if (startingPlayers.length < 6 || startingPlayers.length > 8) {
            alert('Debe haber entre 6 y 8 jugadores titulares');
            return;
        }
        
        const lineupTime = formatTime(matchSeconds);
        const lineupPlayers = startingPlayers.map(p => `${p.name} (${p.position})`).join(', ');
        
        addLogEntry(`Alineación guardada: ${lineupPlayers}`, lineupTime);
        
        // Guardar snapshot de la alineación
        matchData.timerUpdates.push({
            time: matchSeconds,
            action: 'lineup_saved',
            lineup: startingPlayers.map(p => ({
                name: p.name,
                position: p.position
            }))
        });
        
        storage.saveCurrentMatch(matchData);
    }
    
    // Funciones del temporizador
    function startTimer() {
        if (isTimerRunning) return;
        
        isTimerRunning = true;
        pauseTimerBtn.textContent = 'Pausar';
        
        // Recuperar tiempo acumulado si existe
        const currentMatch = storage.getCurrentMatch();
        if (currentMatch && currentMatch.timerUpdates.length > 0) {
            const lastUpdate = currentMatch.timerUpdates[currentMatch.timerUpdates.length - 1];
            if (lastUpdate.action === 'timer_paused') {
                matchSeconds = lastUpdate.time;
            }
        }
        
        timerInterval = setInterval(() => {
            matchSeconds++;
            matchTimeDisplay.textContent = formatTime(matchSeconds);
            
            // Actualizar tiempo de juego de los jugadores alineados
            matchData.players.forEach(player => {
                if (player.isStarting) {
                    player.playTime = (player.playTime || 0) + 1;
                }
            });
            
            storage.saveCurrentMatch(matchData);
        }, 1000);
    }
    
    function toggleTimer() {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    function pauseTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        pauseTimerBtn.textContent = 'Reanudar';
        
        // Registrar pausa
        matchData.timerUpdates.push({
            time: matchSeconds,
            action: 'timer_paused'
        });
        
        addLogEntry('Tiempo pausado');
        storage.saveCurrentMatch(matchData);
    }
    
    function resetTimer() {
        if (confirm('¿Estás seguro de que quieres reiniciar el temporizador?')) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            matchSeconds = 0;
            matchTimeDisplay.textContent = formatTime(matchSeconds);
            pauseTimerBtn.textContent = 'Iniciar';
            
            // Reiniciar tiempos de juego
            matchData.players.forEach(player => {
                player.playTime = 0;
            });
            
            addLogEntry('Temporizador reiniciado');
            storage.saveCurrentMatch(matchData);
        }
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Funciones de estadísticas
    function updateStatsTable() {
        statsBody.innerHTML = '';
        
        // Actualizar cabecera con tipos de evento
        const headerRow = statsTable.querySelector('thead tr');
        // Limpiar columnas de eventos (manteniendo Jugador, Posición y T. Juego)
        while (headerRow.children.length > 3) {
            headerRow.removeChild(headerRow.lastChild);
        }
        
        // Añadir columnas para cada tipo de evento
        eventTypes.forEach(eventType => {
            const th = document.createElement('th');
            th.textContent = eventType;
            headerRow.appendChild(th);
        });
        
        // Añadir filas para cada jugador alineado
        matchData.players
            .filter(player => player.isStarting)
            .forEach(player => {
                const row = document.createElement('tr');
                
                // Nombre
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                row.appendChild(nameCell);
                
                // Posición
                const posCell = document.createElement('td');
                posCell.textContent = player.position;
                row.appendChild(posCell);
                
                // Tiempo de juego
                const timeCell = document.createElement('td');
                timeCell.textContent = formatTime(player.playTime || 0);
                row.appendChild(timeCell);
                
                // Estadísticas para cada tipo de evento
                eventTypes.forEach(eventType => {
                    const statCell = document.createElement('td');
                    
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'event-value';
                    valueSpan.textContent = player.stats[eventType] || 0;
                    valueSpan.dataset.player = player.name;
                    valueSpan.dataset.event = eventType;
                    
                    const decBtn = document.createElement('button');
                    decBtn.className = 'event-btn';
                    decBtn.textContent = '-';
                    decBtn.onclick = () => updateStat(player.name, eventType, -1);
                    
                    const incBtn = document.createElement('button');
                    incBtn.className = 'event-btn';
                    incBtn.textContent = '+';
                    incBtn.onclick = () => updateStat(player.name, eventType, 1);
                    
                    const delBtn = document.createElement('button');
                    delBtn.className = 'event-btn delete-event';
                    delBtn.textContent = '×';
                    delBtn.onclick = () => removeStat(player.name, eventType);
                    
                    statCell.appendChild(decBtn);
                    statCell.appendChild(valueSpan);
                    statCell.appendChild(incBtn);
                    statCell.appendChild(delBtn);
                    
                    row.appendChild(statCell);
                });
                
                statsBody.appendChild(row);
            });
    }
    
    function updateStat(playerName, eventType, change) {
        const player = matchData.players.find(p => p.name === playerName);
        if (!player) return;
        
        if (!player.stats) player.stats = {};
        player.stats[eventType] = (player.stats[eventType] || 0) + change;
        if (player.stats[eventType] < 0) player.stats[eventType] = 0;
        
        // Actualizar visualización
        const valueSpan = document.querySelector(`.event-value[data-player="${playerName}"][data-event="${eventType}"]`);
        if (valueSpan) {
            valueSpan.textContent = player.stats[eventType];
        }
        
        // Registrar evento si el tiempo está en marcha
        if (isTimerRunning) {
            const action = change > 0 ? 'añadido' : 'eliminado';
            addLogEntry(`${playerName}: ${eventType} ${action} (${player.stats[eventType]})`);
        }
        
        storage.saveCurrentMatch(matchData);
    }
    
    function removeStat(playerName, eventType) {
        const player = matchData.players.find(p => p.name === playerName);
        if (!player || !player.stats || !player.stats[eventType]) return;
        
        delete player.stats[eventType];
        updateStatsTable();
        
        if (isTimerRunning) {
            addLogEntry(`${playerName}: ${eventType} eliminado`);
        }
        
        storage.saveCurrentMatch(matchData);
    }
    
    function addEventType() {
        const newType = newEventTypeInput.value.trim();
        if (!newType || eventTypes.includes(newType)) return;
        
        eventTypes.push(newType);
        newEventTypeInput.value = '';
        updateStatsTable();
        
        addLogEntry(`Nuevo tipo de evento añadido: ${newType}`);
        storage.saveCurrentMatch(matchData);
    }
    
    function updateEventTypes() {
        // Puedes cargar tipos de evento personalizados desde matchData si los guardas
    }
    
    // Funciones de registro de eventos
    function addLogEntry(description, customTime) {
        const time = customTime || formatTime(matchSeconds);
        const entry = { time, description };
        
        matchData.log.push(entry);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${time}</td>
            <td>${description}</td>
        `;
        logBody.appendChild(row);
        
        storage.saveCurrentMatch(matchData);
    }
    
    function clearLog() {
        if (confirm('¿Estás seguro de que quieres limpiar el registro de eventos?')) {
            logBody.innerHTML = '';
            matchData.log = [];
            storage.saveCurrentMatch(matchData);
        }
    }
    
    // Funciones de notas
    function saveNotes() {
        matchData.notes = matchImpressions.value;
        storage.saveCurrentMatch(matchData);
        addLogEntry('Notas del partido actualizadas');
    }
    
    // Funciones de historial de partidos
    function loadMatchHistory() {
        matchHistorySelect.innerHTML = '<option value="">-- Seleccione un partido --</option>';
        const matches = storage.getMatches();
        
        for (const matchId in matches) {
            const match = matches[matchId];
            const option = document.createElement('option');
            option.value = matchId;
            option.textContent = `${match.localTeam} vs ${match.rivalTeam} - ${new Date(match.startTime).toLocaleString()}`;
            matchHistorySelect.appendChild(option);
        }
    }
    
    function loadHistoricalMatch() {
        const matchId = matchHistorySelect.value;
        if (!matchId) return;
        
        const match = storage.getMatch(matchId);
        if (!match) return;
        
        // Cargar datos del partido
        matchData = match;
        matchSeconds = match.timerUpdates.reduce((total, update) => {
            return update.action === 'timer_paused' ? update.time : total;
        }, 0);
        
        // Actualizar UI
        matchTitle.textContent = `Partido: ${match.localTeam} vs ${match.rivalTeam}`;
        matchTimeDisplay.textContent = formatTime(matchSeconds);
        matchImpressions.value = match.notes || '';
        
        // Cargar eventos
        logBody.innerHTML = '';
        match.log.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.time}</td>
                <td>${entry.description}</td>
            `;
            logBody.appendChild(row);
        });
        
        // Cargar tipos de evento (asumiendo que están en matchData)
        if (match.eventTypes) {
            eventTypes = match.eventTypes;
        }
        
        renderPlayerLineup();
        updateStatsTable();
        
        showMatchSection();
        pauseTimer(); // Cargar en estado pausado
        
        addLogEntry('Partido cargado desde historial');
    }
    
    function deleteHistoricalMatch() {
        const matchId = matchHistorySelect.value;
        if (!matchId) return;
        
        if (confirm('¿Estás seguro de que quieres eliminar este partido del historial?')) {
            storage.deleteMatch(matchId);
            loadMatchHistory();
            alert('Partido eliminado del historial');
        }
    }
    
    function endMatch() {
        if (confirm('¿Estás seguro de que quieres finalizar el partido?')) {
            // Guardar en historial
            const matchId = storage.saveMatch(matchData);
            
            // Limpiar partido actual
            storage.clearCurrentMatch();
            resetTimer();
            
            // Volver a pantalla inicial
            matchSection.style.display = 'none';
            document.querySelector('.setup-section').style.display = 'block';
            
            // Actualizar historial
            loadMatchHistory();
            
            alert(`Partido guardado en el historial con ID: ${matchId}`);
        }
    }
    
    // Event listeners para inputs que afectan al botón de inicio
    localTeamInput.addEventListener('input', updateStartMatchButton);
    rivalTeamInput.addEventListener('input', updateStartMatchButton);
});