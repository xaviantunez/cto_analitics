// teams.js - Gestión de equipos y jugadores
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar equipos
    loadTeams();

    // Event listeners
    document.getElementById('addTeam').addEventListener('click', addTeam);
    document.getElementById('selectedTeam').addEventListener('change', loadTeamPlayers);
    document.getElementById('addPlayer').addEventListener('click', addPlayer);

    // Configurar permisos
    setupPermissions();
});

function setupPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = currentUser.role === 'admin';
    const isCoordinator = currentUser.functions && currentUser.functions.includes('coordinador');
    const isCoachOrDelegate = currentUser.functions && 
        (currentUser.functions.includes('entrenador') || currentUser.functions.includes('delegado'));
    
    if (!isAdmin && !isCoordinator) {
        document.getElementById('addTeam').disabled = true;
    }
    
    if (!isAdmin && !isCoordinator && !isCoachOrDelegate) {
        document.getElementById('addPlayer').disabled = true;
    }
}

function loadTeams() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamSelects = [
        document.getElementById('selectedTeam'),
        document.getElementById('localTeam')
    ];
    
    teamSelects.forEach(select => {
        if (select) {
            select.innerHTML = '';
            
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Seleccione un equipo';
            select.appendChild(emptyOption);
            
            teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.name;
                option.textContent = team.name;
                select.appendChild(option);
            });
        }
    });
    
    // Actualizar tabla de equipos
    const tbody = document.querySelector('#teamsTable tbody');
    tbody.innerHTML = '';
    
    teams.forEach(team => {
        const tr = document.createElement('tr');
        
        // Nombre
        const tdName = document.createElement('td');
        tdName.textContent = team.name;
        tr.appendChild(tdName);
        
        // Acciones
        const tdActions = document.createElement('td');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isAdmin = currentUser.role === 'admin';
        const isCoordinator = currentUser.functions && currentUser.functions.includes('coordinador');
        
        if (isAdmin || isCoordinator) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.teamName = team.name;
            deleteBtn.addEventListener('click', deleteTeam);
            tdActions.appendChild(deleteBtn);
        }
        
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
    });
}

function loadTeamPlayers() {
    const teamName = document.getElementById('selectedTeam').value;
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const team = teams.find(t => t.name === teamName);
    const tbody = document.querySelector('#playersTable tbody');
    tbody.innerHTML = '';
    
    if (team) {
        team.players.forEach(player => {
            const tr = document.createElement('tr');
            
            // Nombre
            const tdName = document.createElement('td');
            tdName.textContent = player;
            tr.appendChild(tdName);
            
            // Acciones
            const tdActions = document.createElement('td');
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const isAdmin = currentUser.role === 'admin';
            const isCoordinator = currentUser.functions && currentUser.functions.includes('coordinador');
            const isCoachOrDelegate = currentUser.functions && 
                (currentUser.functions.includes('entrenador') || currentUser.functions.includes('delegado'));
            
            if (isAdmin || isCoordinator || (isCoachOrDelegate && currentUser.team === teamName)) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Eliminar';
                deleteBtn.className = 'delete-btn';
                deleteBtn.dataset.playerName = player;
                deleteBtn.addEventListener('click', deletePlayer);
                tdActions.appendChild(deleteBtn);
            }
            
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    }
}

function addTeam() {
    const teamName = document.getElementById('newTeamName').value.trim();
    if (!teamName) {
        alert('Por favor, ingrese un nombre para el equipo');
        return;
    }
    
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    if (teams.some(t => t.name === teamName)) {
        alert('Ya existe un equipo con ese nombre');
        return;
    }
    
    teams.push({
        name: teamName,
        players: []
    });
    
    localStorage.setItem('teams', JSON.stringify(teams));
    logAudit('add_team', `Nuevo equipo creado: ${teamName}`);
    
    // Limpiar campo
    document.getElementById('newTeamName').value = '';
    
    // Recargar lista
    loadTeams();
}

function deleteTeam(e) {
    const teamName = e.target.dataset.teamName;
    if (confirm(`¿Está seguro de eliminar el equipo "${teamName}"? Esto también eliminará todos sus jugadores.`)) {
        let teams = JSON.parse(localStorage.getItem('teams')) || [];
        teams = teams.filter(t => t.name !== teamName);
        localStorage.setItem('teams', JSON.stringify(teams));
        logAudit('delete_team', `Equipo eliminado: ${teamName}`);
        
        // Actualizar usuarios que tenían este equipo asignado
        const users = JSON.parse(localStorage.getItem('users'));
        users.forEach(user => {
            if (user.team === teamName) {
                user.team = null;
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        // Recargar listas
        loadTeams();
        document.getElementById('selectedTeam').value = '';
        document.querySelector('#playersTable tbody').innerHTML = '';
    }
}

function addPlayer() {
    const teamName = document.getElementById('selectedTeam').value;
    const playerName = document.getElementById('newPlayerName').value.trim();
    
    if (!teamName) {
        alert('Por favor, seleccione un equipo');
        return;
    }
    
    if (!playerName) {
        alert('Por favor, ingrese un nombre para el jugador');
        return;
    }
    
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const team = teams.find(t => t.name === teamName);
    
    if (team && team.players.includes(playerName)) {
        alert('Este jugador ya existe en el equipo');
        return;
    }
    
    if (team) {
        team.players.push(playerName);
        localStorage.setItem('teams', JSON.stringify(teams));
        logAudit('add_player', `Nuevo jugador añadido: ${playerName} al equipo ${teamName}`, teamName);
        
        // Limpiar campo
        document.getElementById('newPlayerName').value = '';
        
        // Recargar lista
        loadTeamPlayers();
    }
}

function deletePlayer(e) {
    const playerName = e.target.dataset.playerName;
    const teamName = document.getElementById('selectedTeam').value;
    
    if (confirm(`¿Está seguro de eliminar al jugador "${playerName}" del equipo "${teamName}"?`)) {
        const teams = JSON.parse(localStorage.getItem('teams')) || [];
        const team = teams.find(t => t.name === teamName);
        
        if (team) {
            team.players = team.players.filter(p => p !== playerName);
            localStorage.setItem('teams', JSON.stringify(teams));
            logAudit('delete_player', `Jugador eliminado: ${playerName} del equipo ${teamName}`, teamName);
            
            // Recargar lista
            loadTeamPlayers();
        }
    }
}