// teams.js - Gestión de equipos y jugadores
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.checkAuth()) {
        window.location.href = 'index.html';
        return;
    }

    const TeamManager = {
        teams: [],

        init: function() {
            this.loadTeams();
            this.setupEventListeners();
            this.renderTeams();
        },

        loadTeams: function() {
            this.teams = Storage.load('teams') || [];
        },

        setupEventListeners: function() {
            document.getElementById('addTeamBtn').addEventListener('click', () => this.addTeam());
            document.getElementById('saveTeamsBtn').addEventListener('click', () => this.saveTeams());
        },

        renderTeams: function() {
            const container = document.getElementById('teamsContainer');
            container.innerHTML = '';

            this.teams.forEach(team => {
                const canEdit = this.canUserEditTeam(team);

                const teamCard = document.createElement('div');
                teamCard.className = 'team-card';
                teamCard.innerHTML = `
                    <div class="team-header">
                        <h3 contenteditable="${canEdit}">${team.name}</h3>
                        ${canEdit ? `<button class="btn danger delete-team" data-teamid="${team.id}">Eliminar</button>` : ''}
                    </div>
                    <div class="players-list">
                        <h4>Jugadores</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Número</th>
                                    ${canEdit ? '<th>Acciones</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                ${team.players.map(player => `
                                    <tr data-playerid="${player.id}">
                                        <td contenteditable="${canEdit}">${player.name}</td>
                                        <td contenteditable="${canEdit}">${player.number}</td>
                                        ${canEdit ? `<td><button class="btn danger delete-player" data-playerid="${player.id}">Eliminar</button></td>` : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${canEdit ? `
                            <div class="add-player-form">
                                <input type="text" class="new-player-name" placeholder="Nombre del jugador">
                                <input type="number" class="new-player-number" placeholder="Número" min="1">
                                <button class="btn add-player" data-teamid="${team.id}">Añadir Jugador</button>
                            </div>
                        ` : ''}
                    </div>
                `;

                // Event listeners para equipos editables
                if (canEdit) {
                    // Editar nombre de equipo
                    teamCard.querySelector('h3').addEventListener('blur', (e) => {
                        this.renameTeam(team.id, e.target.textContent);
                    });

                    // Eliminar equipo
                    const deleteBtn = teamCard.querySelector('.delete-team');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            this.deleteTeam(team.id);
                        });
                    }

                    // Editar jugadores
                    teamCard.querySelectorAll('td[contenteditable="true"]').forEach(td => {
                        td.addEventListener('blur', (e) => {
                            const row = e.target.closest('tr');
                            const playerId = parseInt(row.dataset.playerid);
                            const isName = e.target.cellIndex === 0;
                            
                            if (isName) {
                                this.renamePlayer(team.id, playerId, e.target.textContent);
                            } else {
                                this.changePlayerNumber(team.id, playerId, e.target.textContent);
                            }
                        });
                    });

                    // Eliminar jugadores
                    teamCard.querySelectorAll('.delete-player').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const playerId = parseInt(e.target.dataset.playerid);
                            this.deletePlayer(team.id, playerId);
                        });
                    });

                    // Añadir jugador
                    const addBtn = teamCard.querySelector('.add-player');
                    if (addBtn) {
                        addBtn.addEventListener('click', (e) => {
                            const form = e.target.closest('.add-player-form');
                            const nameInput = form.querySelector('.new-player-name');
                            const numberInput = form.querySelector('.new-player-number');
                            
                            this.addPlayer(team.id, nameInput.value, numberInput.value);
                            
                            // Limpiar formulario
                            nameInput.value = '';
                            numberInput.value = '';
                        });
                    }
                }

                container.appendChild(teamCard);
            });
        },

        canUserEditTeam: function(team) {
            // Admin puede editar todo
            if (Auth.hasRole('admin')) return true;

            // Coordinador puede editar todo
            if (Auth.hasFunction('coordinador')) return true;

            // Entrenador/Delegado solo puede editar su equipo
            if ((Auth.hasFunction('entrenador') || Auth.hasFunction('delegado')) {
                return Auth.currentUser.team === team.name;
            }

            return false;
        },

        addTeam: function() {
            if (!Auth.hasRole('admin') && !Auth.hasFunction('coordinador')) {
                alert('No tienes permisos para crear equipos');
                return;
            }

            const teamName = prompt('Nombre del nuevo equipo:');
            if (!teamName) return;

            const newTeam = {
                id: Date.now(),
                name: teamName,
                players: []
            };

            this.teams.push(newTeam);
            Storage.save('teams', this.teams);
            Auth.logAction('add_team', `Equipo creado: ${teamName}`);
            this.renderTeams();
        },

        renameTeam: function(teamId, newName) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team || team.name === newName) return;

            const oldName = team.name;
            team.name = newName;
            Storage.save('teams', this.teams);
            Auth.logAction('rename_team', `Equipo renombrado de ${oldName} a ${newName}`);
        },

        deleteTeam: function(teamId) {
            if (!Auth.hasRole('admin') && !Auth.hasFunction('coordinador')) {
                alert('No tienes permisos para eliminar equipos');
                return;
            }

            if (!confirm('¿Estás seguro de eliminar este equipo y todos sus jugadores?')) return;

            const teamIndex = this.teams.findIndex(t => t.id === teamId);
            if (teamIndex === -1) return;

            const deletedTeam = this.teams.splice(teamIndex, 1)[0];
            Storage.save('teams', this.teams);
            Auth.logAction('delete_team', `Equipo eliminado: ${deletedTeam.name}`);
            this.renderTeams();
        },

        addPlayer: function(teamId, name, number) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;

            if (!name || !number) {
                alert('Nombre y número son obligatorios');
                return;
            }

            if (isNaN(number)) {
                alert('El número debe ser un valor numérico');
                return;
            }

            const newPlayer = {
                id: Date.now(),
                name: name.trim(),
                number: parseInt(number)
            };

            team.players.push(newPlayer);
            Storage.save('teams', this.teams);
            Auth.logAction('add_player', `Jugador añadido: ${newPlayer.name} al equipo ${team.name}`);
            this.renderTeams();
        },

        renamePlayer: function(teamId, playerId, newName) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;

            const player = team.players.find(p => p.id === playerId);
            if (!player || player.name === newName) return;

            const oldName = player.name;
            player.name = newName.trim();
            Storage.save('teams', this.teams);
            Auth.logAction('rename_player', `Jugador renombrado de ${oldName} a ${newName} en equipo ${team.name}`);
        },

        changePlayerNumber: function(teamId, playerId, newNumber) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;

            const player = team.players.find(p => p.id === playerId);
            if (!player || isNaN(newNumber)) return;

            const oldNumber = player.number;
            player.number = parseInt(newNumber);
            Storage.save('teams', this.teams);
            Auth.logAction('change_player_number', `Jugador ${player.name} cambió número de ${oldNumber} a ${newNumber}`);
        },

        deletePlayer: function(teamId, playerId) {
            const team = this.teams.find(t => t.id === teamId);
            if (!team) return;

            if (!confirm('¿Estás seguro de eliminar este jugador?')) return;

            const playerIndex = team.players.findIndex(p => p.id === playerId);
            if (playerIndex === -1) return;

            const deletedPlayer = team.players.splice(playerIndex, 1)[0];
            Storage.save('teams', this.teams);
            Auth.logAction('delete_player', `Jugador eliminado: ${deletedPlayer.name} del equipo ${team.name}`);
            this.renderTeams();
        },

        saveTeams: function() {
            Storage.save('teams', this.teams);
            alert('Cambios guardados correctamente');
            Auth.logAction('save_teams', 'Todos los equipos guardados');
        }
    };

    TeamManager.init();
});