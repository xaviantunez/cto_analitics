// stats.js - Sistema de registro de estadísticas de partido
const MatchStats = {
    currentMatch: null,
    timerInterval: null,
    isRunning: false,
    elapsedTime: 0,
    eventTypes: ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Cambio', 'Lesión'],

    init: function() {
        if (!Auth.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }

        this.loadData();
        this.setupEventListeners();
        this.loadCurrentMatch();
        this.renderMatchInfo();
        this.renderPlayerLists();
    },

    loadData: function() {
        this.teams = JSON.parse(localStorage.getItem('teams')) || [];
        this.eventTypes = JSON.parse(localStorage.getItem('event_types')) || this.eventTypes;
    },

    setupEventListeners: function() {
        // Controles del temporizador
        document.getElementById('startTimerBtn').addEventListener('click', this.startTimer.bind(this));
        document.getElementById('pauseTimerBtn').addEventListener('click', this.pauseTimer.bind(this));
        document.getElementById('resetTimerBtn').addEventListener('click', this.resetTimer.bind(this));

        // Guardar partido
        document.getElementById('saveMatchBtn').addEventListener('click', this.saveMatch.bind(this));

        // Exportar a Excel
        document.getElementById('exportExcelBtn').addEventListener('click', this.exportToExcel.bind(this));

        // Añadir tipo de evento
        document.getElementById('addEventTypeBtn').addEventListener('click', this.addEventType.bind(this));
    },

    loadCurrentMatch: function() {
        const savedMatch = localStorage.getItem('currentMatch');
        if (savedMatch) {
            this.currentMatch = JSON.parse(savedMatch);
            this.elapsedTime = this.currentMatch.elapsedTime || 0;
            this.updateTimerDisplay();
        } else {
            this.createNewMatch();
        }
    },

    createNewMatch: function() {
        this.currentMatch = {
            id: Date.now(),
            localTeam: Auth.currentUser.team || '',
            rivalTeam: '',
            tournament: '',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            elapsedTime: 0,
            lineups: [],
            events: [],
            summary: '',
            createdAt: new Date().toISOString()
        };
        this.saveCurrentMatch();
    },

    saveCurrentMatch: function() {
        localStorage.setItem('currentMatch', JSON.stringify(this.currentMatch));
    },

    renderMatchInfo: function() {
        document.getElementById('localTeam').value = this.currentMatch.localTeam;
        document.getElementById('rivalTeam').value = this.currentMatch.rivalTeam;
        document.getElementById('tournament').value = this.currentMatch.tournament;
        document.getElementById('matchDate').value = this.currentMatch.date;
        document.getElementById('matchTime').value = this.currentMatch.time;
    },

    renderPlayerLists: function() {
        this.renderTeamPlayers('localPlayers', this.currentMatch.localTeam);
        this.renderTeamPlayers('rivalPlayers', this.currentMatch.rivalTeam);
    },

    renderTeamPlayers: function(containerId, teamName) {
        const container = document.getElementById(containerId);
        const team = this.teams.find(t => t.name === teamName);

        if (!team) {
            container.innerHTML = '<p>Selecciona un equipo primero</p>';
            return;
        }

        container.innerHTML = team.players.map(player => {
            const inLineup = this.currentMatch.lineups.some(l => l.playerId === player.id);
            const lineupData = inLineup ? 
                this.currentMatch.lineups.find(l => l.playerId === player.id) : 
                null;

            return `
                <div class="player-card" data-playerid="${player.id}">
                    <div class="player-header">
                        <span class="player-name">${player.name}</span>
                        <span class="player-number">${player.number}</span>
                        <label>
                            <input type="checkbox" class="lineup-checkbox" ${inLineup ? 'checked' : ''}>
                            Titular
                        </label>
                    </div>
                    ${inLineup ? `
                        <div class="player-details">
                            <select class="player-position">
                                <option value="">Posición</option>
                                ${['portero', 'defensa derecho', 'defensa izquierdo', 'banda derecha', 
                                   'banda izquierda', 'medio centro', 'pivote', 'medio ofensivo', 
                                   'delantero'].map(pos => `
                                    <option value="${pos}" ${lineupData?.position === pos ? 'selected' : ''}>
                                        ${pos}
                                    </option>
                                `).join('')}
                            </select>
                            <div class="player-stats">
                                ${this.eventTypes.map(event => `
                                    <div class="stat-row">
                                        <span>${event}</span>
                                        <div class="stat-controls">
                                            <button class="stat-decrease" data-event="${event}">-</button>
                                            <span class="stat-value">${
                                                this.currentMatch.events.filter(e => 
                                                    e.playerId === player.id && e.type === event
                                                ).length
                                            }</span>
                                            <button class="stat-increase" data-event="${event}">+</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Configurar event listeners
        container.querySelectorAll('.lineup-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.togglePlayerLineup.bind(this));
        });

        container.querySelectorAll('.player-position').forEach(select => {
            select.addEventListener('change', this.updatePlayerPosition.bind(this));
        });

        container.querySelectorAll('.stat-increase').forEach(btn => {
            btn.addEventListener('click', this.increaseStat.bind(this));
        });

        container.querySelectorAll('.stat-decrease').forEach(btn => {
            btn.addEventListener('click', this.decreaseStat.bind(this));
        });
    },

    // Control del temporizador
    startTimer: function() {
        if (this.isRunning) return;
        
        // Validar alineación (6-8 jugadores)
        if (this.currentMatch.lineups.length < 6 || this.currentMatch.lineups.length > 8) {
            alert('Debes alinear entre 6 y 8 jugadores para comenzar el partido');
            return;
        }

        this.isRunning = true;
        this.timerInterval = setInterval(() => {
            this.elapsedTime++;
            this.currentMatch.elapsedTime = this.elapsedTime;
            this.updateTimerDisplay();
            this.saveCurrentMatch();
        }, 1000);

        this.logEvent('Sistema', 'Partido iniciado');
    },

    pauseTimer: function() {
        if (!this.isRunning) return;
        
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.logEvent('Sistema', 'Partido pausado');
    },

    resetTimer: function() {
        this.pauseTimer();
        this.elapsedTime = 0;
        this.currentMatch.elapsedTime = 0;
        this.updateTimerDisplay();
        this.saveCurrentMatch();
        this.logEvent('Sistema', 'Temporizador reiniciado');
    },

    updateTimerDisplay: function() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // Gestión de jugadores
    togglePlayerLineup: function(e) {
        const playerCard = e.target.closest('.player-card');
        const playerId = parseInt(playerCard.dataset.playerid);
        const inLineup = e.target.checked;

        if (inLineup) {
            this.currentMatch.lineups.push({
                playerId,
                position: '',
                startTime: this.elapsedTime,
                endTime: null
            });
            this.logEvent('Sistema', `Jugador alineado: ${this.getPlayerName(playerId)}`);
        } else {
            const lineupIndex = this.currentMatch.lineups.findIndex(l => l.playerId === playerId);
            if (lineupIndex !== -1) {
                this.currentMatch.lineups[lineupIndex].endTime = this.elapsedTime;
                this.logEvent('Sistema', `Jugador sustituido: ${this.getPlayerName(playerId)}`);
            }
        }

        this.saveCurrentMatch();
        this.renderPlayerLists(); // Re-render para mostrar/ocultar detalles
    },

    updatePlayerPosition: function(e) {
        const playerId = parseInt(e.target.closest('.player-card').dataset.playerid);
        const position = e.target.value;

        const lineup = this.currentMatch.lineups.find(l => l.playerId === playerId);
        if (lineup) {
            lineup.position = position;
            this.saveCurrentMatch();
            this.logEvent('Sistema', `Cambio de posición: ${this.getPlayerName(playerId)} a ${position}`);
        }
    },

    // Gestión de estadísticas
    increaseStat: function(e) {
        const playerId = parseInt(e.target.closest('.player-card').dataset.playerid);
        const eventType = e.target.dataset.event;

        this.currentMatch.events.push({
            playerId,
            type: eventType,
            timestamp: this.elapsedTime,
            matchTime: this.formatMatchTime(this.elapsedTime),
            team: this.getPlayerTeam(playerId)
        });

        this.saveCurrentMatch();
        this.updateStatDisplay(playerId, eventType);
        this.logEvent(this.getPlayerName(playerId), eventType);
    },

    decreaseStat: function(e) {
        const playerId = parseInt(e.target.closest('.player-card').dataset.playerid);
        const eventType = e.target.dataset.event;

        // Encontrar el último evento de este tipo para este jugador
        const eventIndex = this.currentMatch.events.findLastIndex(e => 
            e.playerId === playerId && e.type === eventType
        );

        if (eventIndex !== -1) {
            this.currentMatch.events.splice(eventIndex, 1);
            this.saveCurrentMatch();
            this.updateStatDisplay(playerId, eventType);
            this.logEvent('Sistema', `Evento eliminado: ${eventType} de ${this.getPlayerName(playerId)}`);
        }
    },

    updateStatDisplay: function(playerId, eventType) {
        const playerCard = document.querySelector(`.player-card[data-playerid="${playerId}"]`);
        if (!playerCard) return;

        const statValue = playerCard.querySelector(`.stat-controls[data-event="${eventType}"] .stat-value`);
        if (statValue) {
            statValue.textContent = this.currentMatch.events.filter(e => 
                e.playerId === playerId && e.type === eventType
            ).length;
        }
    },

    // Registro de eventos
    logEvent: function(player, action) {
        const eventLog = document.getElementById('eventLog');
        const eventTime = this.formatMatchTime(this.elapsedTime);
        
        const eventElement = document.createElement('div');
        eventElement.className = 'log-entry';
        eventElement.innerHTML = `
            <span class="log-time">${eventTime}</span>
            <span class="log-player">${player}</span>
            <span class="log-action">${action}</span>
        `;
        
        eventLog.prepend(eventElement);
    },

    // Utilidades
    getPlayerName: function(playerId) {
        for (const team of this.teams) {
            const player = team.players.find(p => p.id === playerId);
            if (player) return player.name;
        }
        return 'Jugador desconocido';
    },

    getPlayerTeam: function(playerId) {
        for (const team of this.teams) {
            if (team.players.some(p => p.id === playerId)) {
                return team.name;
            }
        }
        return '';
    },

    formatMatchTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}'${secs.toString().padStart(2, '0')}"`;
    },

    // Guardar partido
    saveMatch: function() {
        // Actualizar información del partido
        this.currentMatch.localTeam = document.getElementById('localTeam').value;
        this.currentMatch.rivalTeam = document.getElementById('rivalTeam').value;
        this.currentMatch.tournament = document.getElementById('tournament').value;
        this.currentMatch.date = document.getElementById('matchDate').value;
        this.currentMatch.time = document.getElementById('matchTime').value;
        this.currentMatch.summary = document.getElementById('matchSummary').value;

        // Guardar en el historial
        const matches = JSON.parse(localStorage.getItem('matches')) || [];
        matches.push(this.currentMatch);
        localStorage.setItem('matches', JSON.stringify(matches));

        // Crear nuevo partido
        this.createNewMatch();
        this.resetTimer();
        this.renderMatchInfo();
        this.renderPlayerLists();

        alert('Partido guardado en el historial');
        Auth.logAction('save_match', `Partido guardado: ${this.currentMatch.localTeam} vs ${this.currentMatch.rivalTeam}`);
    },

    // Exportar a Excel
    exportToExcel: function() {
        let csvContent = "Tiempo,Jugador,Equipo,Acción\n";
        
        this.currentMatch.events.forEach(event => {
            csvContent += `"${event.matchTime}","${this.getPlayerName(event.playerId)}","${event.team}","${event.type}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `estadisticas_${this.currentMatch.localTeam}_vs_${this.currentMatch.rivalTeam}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        Auth.logAction('export_data', 'Estadísticas exportadas a CSV');
    },

    // Añadir tipo de evento
    addEventType: function() {
        const newType = document.getElementById('newEventType').value.trim();
        if (newType && !this.eventTypes.includes(newType)) {
            this.eventTypes.push(newType);
            localStorage.setItem('event_types', JSON.stringify(this.eventTypes));
            document.getElementById('newEventType').value = '';
            this.renderPlayerLists();
            Auth.logAction('add_event_type', `Nuevo tipo de evento: ${newType}`);
        }
    }
};

// Inicializar la página de estadísticas
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('timerDisplay')) {
        MatchStats.init();
    }
});