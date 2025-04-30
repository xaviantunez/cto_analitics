// teams.js - Gestión de equipos y jugadores
const TeamManager = {
    init: function() {
        if (!Auth.checkAuth(['admin'], ['coordinador', 'entrenador', 'delegado'])) {
            window.location.href = 'index.html';
            return;
        }

        this.loadTeams();
        this.setupEventListeners();
        this.renderTeamList();
    },

    loadTeams: function() {
        this.teams = DB.load('teams.json') || [];
    },

    setupEventListeners: function() {
        document.getElementById('addTeamBtn').addEventListener('click', this.addTeam.bind(this));
        document.getElementById('saveTeamsBtn').addEventListener('click', this.saveTeams.bind(this));
    },

    renderTeamList: function() {
        const container = document.getElementById('teamsContainer');
        container.innerHTML = '';

        this.teams.forEach(team => {
            const canEdit = this.canUserEditTeam(team);

            const teamElement = document.createElement('div');
            teamElement.className = 'team-card';
            teamElement.innerHTML = `
                <div class="team-header">
                    <h3 contenteditable="${canEdit}">${team.name}</h3>
                    ${canEdit ? `<button class="btn danger delete-team-btn" data-teamid="${team.id}">Eliminar</button>` : ''}
                </div>
                <div class="players-list">
                    <h4>Jugadores</h4>
                    <ul>
                        ${team.players.map(player => `
                            <li>
                                <span contenteditable="${canEdit}">${player.name}</span>
                                <span contenteditable="${canEdit}">${player.number}</span>
                                ${canEdit ? `<button class="btn danger delete-player-btn" data-teamid="${team.id}" data-playerid="${player.id}">Eliminar</button>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                    ${canEdit ? `
                        <div class="add-player-form">
                            <input type="text" placeholder="Nombre" class="new-player-name">
                            <input type="number" placeholder="Número" class="new-player-number">
                            <button class="btn add-player-btn" data-teamid="${team.id}">Añadir</button>
                        </div>
                    ` : ''}
                </div>
            `;

            if (canEdit) {
                teamElement.querySelector('.delete-team-btn')?.addEventListener('click', this.deleteTeam.bind(this));
                teamElement.querySelector('.add-player-btn')?.addEventListener('click', this.addPlayer.bind(this));

                const playerDeleteButtons = teamElement.querySelectorAll('.delete-player-btn');
                playerDeleteButtons.forEach(btn => {
                    btn.addEventListener('click', this.deletePlayer.bind(this));
                });

                // Manejar edición directa
                teamElement.querySelector('h3').addEventListener('blur', (e) => {
                    this.renameTeam(team.id, e.target.textContent);
                });

                const playerNames = teamElement.querySelectorAll('.players-list li span:first-child');
                playerNames.forEach((span, index) => {
                    span.addEventListener('blur', (e) => {
                        this.renamePlayer(team.id, team.players[index].id, e.target.textContent);
                    });
                });

                const playerNumbers = teamElement.querySelectorAll('.players-list li span:nth-child(2)');
                playerNumbers.forEach((span, index) => {
                    span.addEventListener('blur', (e) => {
                        this.changePlayerNumber(team.id, team.players[index].id, e.target.textContent);
                    });
                });
            }

            container.appendChild(teamElement);
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
            id: Math.max(...this.teams.map(t => t.id), 0) + 1,
            name: teamName,
            players: []
        };

        this.teams.push(newTeam);
        DB.save('teams.json', this.teams);
        Auth.logAction('add_team', `Equipo ${teamName} creado`);
        this.renderTeamList();
    },

    deleteTeam: function(e) {
        if (!Auth.hasRole('admin') && !Auth.hasFunction('coordinador')) {
            alert('No tienes permisos para eliminar equipos');
            return;
        }

        const teamId = parseInt(e.target.dataset.teamid);
        const teamIndex = this.teams.findIndex(t => t.id === teamId);

        if (teamIndex !== -1 && confirm(`¿Eliminar el equipo ${this.teams[teamIndex].name}?`)) {
            const teamName = this.teams[teamIndex].name;
            this.teams.splice(teamIndex, 1);
            DB.save('teams.json', this.teams);
            Auth.logAction('delete_team', `Equipo ${teamName} eliminado`);
            this.renderTeamList();
        }
    },

    renameTeam: function(teamId, newName) {
        const team = this.teams.find(t => t.id === teamId);
        if (team && team.name !== newName) {
            const oldName = team.name;
            team.name = newName;
            DB.save('teams.json', this.teams);
            Auth.logAction('rename_team', `Equipo renombrado de ${oldName} a ${newName}`);
        }
    },

    addPlayer: function(e) {
        const teamId = parseInt(e.target.dataset.teamid);
        const team = this.teams.find(t => t.id === teamId);

        if (!team) return;

        const playerName = e.target.closest('.add-player-form').querySelector('.new-player-name').value.trim();
        const playerNumber = e.target.closest('.add-player-form').querySelector('.new-player-number').value.trim();

        if (!playerName || !playerNumber) {
            alert('Nombre y número son obligatorios');
            return;
        }

        if (isNaN(playerNumber)) {
            alert('El número debe ser un valor numérico');
            return;
        }

        const newPlayer = {
            id: Math.max(...team.players.map(p => p.id), 0) + 1,
            name: playerName,
            number: parseInt(playerNumber)
        };

        team.players.push(newPlayer);
        DB.save('teams.json', this.teams);
        Auth.logAction('add_player', `Jugador ${playerName} añadido al equipo ${team.name}`);

        // Limpiar formulario
        e.target.closest('.add-player-form').querySelector('.new-player-name').value = '';
        e.target.closest('.add-player-form').querySelector('.new-player-number').value = '';

        this.renderTeamList();
    },

    deletePlayer: function(e) {
        const teamId = parseInt(e.target.dataset.teamid);
        const playerId = parseInt(e.target.dataset.playerid);

        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;

        const playerIndex = team.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1 && confirm(`¿Eliminar al jugador ${team.players[playerIndex].name}?`)) {
            const playerName = team.players[playerIndex].name;
            team.players.splice(playerIndex, 1);
            DB.save('teams.json', this.teams);
            Auth.logAction('delete_player', `Jugador ${playerName} eliminado del equipo ${team.name}`);
            this.renderTeamList();
        }
    },

    renamePlayer: function(teamId, playerId, newName) {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;

        const player = team.players.find(p => p.id === playerId);
        if (player && player.name !== newName) {
            const oldName = player.name;
            player.name = newName;
            DB.save('teams.json', this.teams);
            Auth.logAction('rename_player', `Jugador renombrado de ${oldName} a ${newName} en equipo ${team.name}`);
        }
    },

    changePlayerNumber: function(teamId, playerId, newNumber) {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;

        const player = team.players.find(p => p.id === playerId);
        if (player && player.number !== parseInt(newNumber)) {
            const oldNumber = player.number;
            player.number = parseInt(newNumber);
            DB.save('teams.json', this.teams);
            Auth.logAction('change_player_number', `Jugador ${player.name} cambió número de ${oldNumber} a ${newNumber}`);
        }
    },

    saveTeams: function() {
        DB.save('teams.json', this.teams);
        alert('Cambios guardados correctamente');
        Auth.logAction('save_teams', 'Todos los equipos guardados');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('teamsContainer')) {
        TeamManager.init();
    }
});