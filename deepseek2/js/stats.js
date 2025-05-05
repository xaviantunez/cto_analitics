// stats.js - Gestión de estadísticas en tiempo real para partidos de fútbol
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    const MatchStats = {
        currentMatch: null,
        timerInterval: null,
        isRunning: false,
        elapsedTime: 0,
        teams: [],
        eventTypes: [],
        positions: [
            'portero', 
            'defensa derecho', 
            'defensa izquierdo', 
            'banda derecha', 
            'banda izquierda', 
            'medio centro', 
            'pivote', 
            'medio ofensivo', 
            'delantero'
        ],

        init: function() {
            this.loadData();
            this.setupEventListeners();
            this.loadCurrentMatch();
            this.renderMatchInfo();
            this.renderTeamSelectors();
            this.renderPlayerLists();
            this.renderEventLog();
        },

        loadData: function() {
            this.teams = Storage.load('teams') || [];
            this.eventTypes = Storage.load('event_types') || [
                'Gol', 
                'Tarjeta amarilla', 
                'Tarjeta roja', 
                'Falta', 
                'Cambio', 
                'Lesión'
            ];
        },

        setupEventListeners: function() {
            // Controles del temporizador
            document.getElementById('startTimerBtn').addEventListener('click', () => this.startTimer());
            document.getElementById('pauseTimerBtn').addEventListener('click', () => this.pauseTimer());
            document.getElementById('resetTimerBtn').addEventListener('click', () => this.resetTimer());

            // Guardar información del partido
            document.getElementById('localTeam').addEventListener('change', (e) => this.updateMatchInfo('localTeam', e.target.value));
            document.getElementById('rivalTeam').addEventListener('change', (e) => this.updateMatchInfo('rivalTeam', e.target.value));
            document.getElementById('tournament').addEventListener('change', (e) => this.updateMatchInfo('tournament', e.target.value));
            document.getElementById('matchDate').addEventListener('change', (e) => this.updateMatchInfo('date', e.target.value));
            document.getElementById('matchTime').addEventListener('change', (e) => this.updateMatchInfo('time', e.target.value));

            // Guardar partido
            document.getElementById('saveMatchBtn').addEventListener('click', () => this.saveMatch());

            // Exportar a Excel
            document.getElementById('exportExcelBtn').addEventListener('click', () => this.exportToExcel());
        },

        loadCurrentMatch: function() {
            this.currentMatch = Storage.load('currentMatch');
            
            if (!this.currentMatch) {
                this.createNewMatch();
            } else {
                this.elapsedTime = this.currentMatch.elapsedTime || 0;
                this.updateTimerDisplay();
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
            Storage.save('currentMatch', this.currentMatch);
        },

        updateMatchInfo: function(field, value) {
            this.currentMatch[field] = value;
            this.saveCurrentMatch();
            
            if (field === 'localTeam' || field === 'rivalTeam') {
                this.renderPlayerLists();
            }
        },

        renderMatchInfo: function() {
            document.getElementById('localTeam').value = this.currentMatch.localTeam;
            document.getElementById('rivalTeam').value = this.currentMatch.rivalTeam;
            document.getElementById('tournament').value = this.currentMatch.tournament;
            document.getElementById('matchDate').value = this.currentMatch.date;
            document.getElementById('matchTime').value = this.currentMatch.time;
            document.getElementById('matchSummary').value = this.currentMatch.summary || '';
        },

        renderTeamSelectors: function() {
            const localSelect = document.getElementById('localTeam');
            const rivalSelect = document.getElementById('rivalTeam');

            // Limpiar selects
            localSelect.innerHTML = '<option value="">Seleccionar equipo</option>';
            rivalSelect.innerHTML = '<option value="">Seleccionar equipo</option>';

            // Llenar con equipos
            this.teams.forEach(team => {
                const option1 = document.createElement('option');
                option1.value = team.name;
                option1.textContent = team.name;
                localSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = team.name;
                option2.textContent = team.name;
                rivalSelect.appendChild(option2);
            });

            // Establecer valores actuales
            localSelect.value = this.currentMatch.localTeam;
            rivalSelect.value = this.currentMatch.rivalTeam;
        },

        renderPlayerLists: function() {
            this.renderTeamPlayers('localPlayers', this.currentMatch.localTeam);
            this.renderTeamPlayers('rivalPlayers', this.currentMatch.rivalTeam);
        },

        renderTeamPlayers: function(containerId, teamName) {
            const container = document.getElementById(containerId);
            const team = this.teams.find(t => t.name === teamName);

            if (!team) {
                container.innerHTML = '<p class="no-team">Selecciona un equipo primero</p>';
                return;
            }

            container.innerHTML = team.players.map(player => {
                const inLineup = this.currentMatch.lineups.some(l => l.playerId === player.id);
                const lineupData = inLineup ? 
                    this.currentMatch.lineups.find(l => l.playerId === player.id) : null;

                return `
                    <div class="player-card" data-playerid="${player.id}" data-team="${teamName}">
                        <div class="player-header">
                            <span class="player-name">${player.name}</span>
                            <span class="player-number">${player.number}</span>
                            <label class="lineup-toggle">
                                <input type="checkbox" class="lineup-checkbox" ${inLineup ? 'checked' : ''}>
                                <span class="toggle-label">${inLineup ? 'Alineado' : 'No alineado'}</span>
                            </label>
                        </div>
                        ${inLineup ? `
                            <div class="player-details">
                                <div class="player-position">
                                    <label>Posición:</label>
                                    <select class="position-select">
                                        <option value="">Seleccionar...</option>
                                        ${this.positions.map(pos => `
                                            <option value="${pos}" ${lineupData?.position === pos ? 'selected' : ''}>
                                                ${pos}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="player-stats">
                                    ${this.eventTypes.map(event => `
                                        <div class="stat-control" data-event="${event}">
                                            <span class="stat-name">${event}:</span>
                                            <div class="stat-buttons">
                                                <button class="stat-decrease btn small">-</button>
                                                <span class="stat-value">${this.getEventCount(player.id, event)}</span>
                                                <button class="stat-increase btn small">+</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            // Configurar event listeners para los jugadores
            container.querySelectorAll('.lineup-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => this.togglePlayerLineup(e));
            });

            container.querySelectorAll('.position-select').forEach(select => {
                select.addEventListener('change', (e) => this.updatePlayerPosition(e));
            });

            container.querySelectorAll('.stat-increase').forEach(btn => {
                btn.addEventListener('click', (e) => this.increaseStat(e));
            });

            container.querySelectorAll('.stat-decrease').forEach(btn => {
                btn.addEventListener('click', (e) => this.decreaseStat(e));
            });
        },

        getEventCount: function(playerId, eventType) {
            return this.currentMatch.events.filter(e => 
                e.playerId === playerId && e.type === eventType
            ).length;
        },

        // Control del temporizador
        startTimer: function() {
            if (this.isRunning) return;
            
            // Validar que hay entre 6 y 8 jugadores alineados
            const lineupCount = this.currentMatch.lineups.filter(l => l.endTime === null).length;
            if (lineupCount < 6 || lineupCount > 8) {
                alert('Debe haber entre 6 y 8 jugadores alineados para iniciar el partido');
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
            const teamName = playerCard.dataset.team;
            const inLineup = e.target.checked;

            if (inLineup) {
                this.currentMatch.lineups.push({
                    playerId,
                    team: teamName,
                    position: '',
                    startTime: this.elapsedTime,
                    endTime: null
                });
                this.logEvent(this.getPlayerName(playerId), 'Alineado');
            } else {
                const lineupIndex = this.currentMatch.lineups.findIndex(l => 
                    l.playerId === playerId && l.endTime === null
                );
                if (lineupIndex !== -1) {
                    this.currentMatch.lineups[lineupIndex].endTime = this.elapsedTime;
                    this.logEvent(this.getPlayerName(playerId), 'Sustituido');
                }
            }

            this.saveCurrentMatch();
            this.renderPlayerLists(); // Re-render para mostrar/ocultar detalles
        },

        updatePlayerPosition: function(e) {
            const playerId = parseInt(e.target.closest('.player-card').dataset.playerid);
            const position = e.target.value;

            const lineup = this.currentMatch.lineups.find(l => 
                l.playerId === playerId && l.endTime === null
            );
            
            if (lineup) {
                lineup.position = position;
                this.saveCurrentMatch();
                this.logEvent(
                    this.getPlayerName(playerId), 
                    `Cambio de posición a ${position}`
                );
            }
        },

        // Gestión de estadísticas
        increaseStat: function(e) {
            const playerCard = e.target.closest('.player-card');
            const playerId = parseInt(playerCard.dataset.playerid);
            const eventType = e.target.closest('.stat-control').dataset.event;
            const teamName = playerCard.dataset.team;

            this.currentMatch.events.push({
                playerId,
                team: teamName,
                type: eventType,
                timestamp: this.elapsedTime,
                matchTime: this.formatMatchTime(this.elapsedTime)
            });

            this.saveCurrentMatch();
            this.updateStatDisplay(playerId, eventType);
            this.logEvent(this.getPlayerName(playerId), eventType);
            this.renderEventLog();
        },

        decreaseStat: function(e) {
            const playerCard = e.target.closest('.player-card');
            const playerId = parseInt(playerCard.dataset.playerid);
            const eventType = e.target.closest('.stat-control').dataset.event;

            // Encontrar el último evento de este tipo para este jugador
            const eventIndex = this.currentMatch.events.findLastIndex(e => 
                e.playerId === playerId && e.type === eventType
            );

            if (eventIndex !== -1) {
                this.currentMatch.events.splice(eventIndex, 1);
                this.saveCurrentMatch();
                this.updateStatDisplay(playerId, eventType);
                this.logEvent(
                    'Sistema', 
                    `Evento eliminado: ${eventType} de ${this.getPlayerName(playerId)}`
                );
                this.renderEventLog();
            }
        },

        updateStatDisplay: function(playerId, eventType) {
            const playerCard = document.querySelector(`.player-card[data-playerid="${playerId}"]`);
            if (!playerCard) return;

            const statValue = playerCard.querySelector(`.stat-control[data-event="${eventType}"] .stat-value`);
            if (statValue) {
                statValue.textContent = this.getEventCount(playerId, eventType);
            }
        },

        // Registro de eventos
        logEvent: function(player, action) {
            this.currentMatch.events.push({
                type: 'Sistema',
                description: `${player}: ${action}`,
                timestamp: this.elapsedTime,
                matchTime: this.formatMatchTime(this.elapsedTime)
            });
            this.saveCurrentMatch();
            this.renderEventLog();
        },

        renderEventLog: function() {
            const logContainer = document.getElementById('eventLog');
            logContainer.innerHTML = '';

            // Ordenar eventos por tiempo (más reciente primero)
            const sortedEvents = [...this.currentMatch.events].sort((a, b) => b.timestamp - a.timestamp);

            sortedEvents.forEach(event => {
                const logEntry = document.createElement('div');
                logEntry.className = 'log-entry';
                
                if (event.type === 'Sistema') {
                    logEntry.innerHTML = `
                        <span class="log-time">${event.matchTime}</span>
                        <span class="log-system">${event.description}</span>
                    `;
                } else {
                    const playerName = this.getPlayerName(event.playerId);
                    logEntry.innerHTML = `
                        <span class="log-time">${event.matchTime}</span>
                        <span class="log-team">${event.team}</span>
                        <span class="log-player">${playerName}</span>
                        <span class="log-event">${event.type}</span>
                    `;
                }
                
                logContainer.appendChild(logEntry);
            });
        },

        // Utilidades
        getPlayerName: function(playerId) {
            for (const team of this.teams) {
                const player = team.players.find(p => p.id === playerId);
                if (player) return player.name;
            }
            return 'Jugador desconocido';
        },

        formatMatchTime: function(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}'${secs.toString().padStart(2, '0')}"`;
        },

        // Guardar partido en el historial
        saveMatch: function() {
            // Actualizar información del partido
            this.currentMatch.localTeam = document.getElementById('localTeam').value;
            this.currentMatch.rivalTeam = document.getElementById('rivalTeam').value;
            this.currentMatch.tournament = document.getElementById('tournament').value;
            this.currentMatch.date = document.getElementById('matchDate').value;
            this.currentMatch.time = document.getElementById('matchTime').value;
            this.currentMatch.summary = document.getElementById('matchSummary').value;

            // Guardar en el historial
            const matches = Storage.load('matches') || [];
            matches.push(this.currentMatch);
            Storage.save('matches', matches);

            // Crear nuevo partido
            this.createNewMatch();
            this.resetTimer();
            this.renderMatchInfo();
            this.renderPlayerLists();
            this.renderEventLog();

            alert('Partido guardado en el historial');
            Auth.logAction('save_match', `Partido guardado: ${this.currentMatch.localTeam} vs ${this.currentMatch.rivalTeam}`);
        },

        // Exportar a Excel (CSV)
        exportToExcel: function() {
            let csvContent = "Tiempo,Equipo,Jugador,Evento\n";
            
            // Filtrar solo eventos de juego (no mensajes del sistema)
            const gameEvents = this.currentMatch.events.filter(e => e.type !== 'Sistema');
            
            // Ordenar por tiempo
            const sortedEvents = [...gameEvents].sort((a, b) => a.timestamp - b.timestamp);
            
            sortedEvents.forEach(event => {
                const playerName = this.getPlayerName(event.playerId);
                csvContent += `"${event.matchTime}","${event.team}","${playerName}","${event.type}"\n`;
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
        }
    };

    MatchStats.init();
});