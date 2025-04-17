document.addEventListener('DOMContentLoaded', function() {
    // Cargar equipos desde localStorage
    let teams = JSON.parse(localStorage.getItem('teams')) || [];

    // Función para mostrar los equipos
    function loadTeams() {
        const teamList = document.getElementById('team-list');
        teamList.innerHTML = '';  // Limpiar lista

        teams.forEach(team => {
            const teamDiv = document.createElement('div');
            teamDiv.classList.add('team-item');
            teamDiv.innerHTML = `
                <p><strong>Equipo:</strong> ${team.name}</p>
                <button class="add-player-btn" data-team="${team.name}">Agregar Jugador</button>
                <button class="delete-team-btn" data-team="${team.name}">Eliminar</button>
                <div class="player-list">
                    ${team.players.map(player => `<p>${player}</p>`).join('')}
                </div>
            `;
            teamList.appendChild(teamDiv);

            // Eventos para agregar y eliminar jugadores
            teamDiv.querySelector('.add-player-btn').addEventListener('click', function() {
                const playerName = prompt('Nombre del jugador:');
                if (playerName) {
                    team.players.push(playerName);
                    localStorage.setItem('teams', JSON.stringify(teams));
                    loadTeams();  // Recargar lista de equipos
                }
            });

            teamDiv.querySelector('.delete-team-btn').addEventListener('click', function() {
                teams = teams.filter(t => t.name !== team.name);
                localStorage.setItem('teams', JSON.stringify(teams));
                loadTeams();  // Recargar lista de equipos
            });
        });
    }

    loadTeams();

    // Evento para agregar equipo
    document.getElementById('add-team-btn').addEventListener('click', function() {
        const teamName = prompt('Nombre del equipo:');
        const newTeam = {
            name: teamName,
            players: []  // Lista de jugadores vacía inicialmente
        };
        teams.push(newTeam);
        localStorage.setItem('teams', JSON.stringify(teams));
        loadTeams();  // Recargar lista de equipos
    });
});
