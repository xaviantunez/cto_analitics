// audit.js - Registros de auditoría
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Cargar filtros
    loadUsersFilter();
    loadTeamsFilter();
    loadActionsFilter();
    
    // Cargar registros
    loadAuditLogs();

    // Event listeners
    document.getElementById('applyAuditFilter').addEventListener('click', loadAuditLogs);
    document.getElementById('exportAudit').addEventListener('click', exportAuditLogs);
});

function loadUsersFilter() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userSelect = document.getElementById('auditUser');
    
    // Limpiar opciones excepto la primera
    while (userSelect.options.length > 1) {
        userSelect.remove(1);
    }
    
    // Añadir usuarios
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = user.username;
        userSelect.appendChild(option);
    });
}

function loadTeamsFilter() {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const teamSelect = document.getElementById('auditTeam');
    
    // Limpiar opciones excepto la primera
    while (teamSelect.options.length > 1) {
        teamSelect.remove(1);
    }
    
    // Añadir equipos
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });
}

function loadActionsFilter() {
    const actions = ['login', 'login_failed', 'logout', 'add_user', 'delete_user', 
                    'update_user_team', 'update_user_functions', 'add_function', 
                    'remove_function', 'add_team', 'delete_team', 'add_player', 
                    'delete_player', 'start_match', 'pause_match', 'reset_match', 
                    'add_event', 'save_match'];
    
    const actionSelect = document.getElementById('auditAction');
    
    // Limpiar opciones excepto la primera
    while (actionSelect.options.length > 1) {
        actionSelect.remove(1);
    }
    
    // Añadir acciones
    actions.forEach(action => {
        const option = document.createElement('option');
        option.value = action;
        option.textContent = action.replace('_', ' ');
        actionSelect.appendChild(option);
    });
}

function loadAuditLogs() {
    const userFilter = document.getElementById('auditUser').value;
    const actionFilter = document.getElementById('auditAction').value;
    const teamFilter = document.getElementById('auditTeam').value;
    const dateFrom = document.getElementById('auditDateFrom').value;
    const dateTo = document.getElementById('auditDateTo').value;
    
    const logs = JSON.parse(localStorage.getItem('auditLog')) || [];
    let filteredLogs = [...logs];
    
    // Aplicar filtros
    if (userFilter && userFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.username === userFilter);
    }
    
    if (actionFilter && actionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === actionFilter);
    }
    
    if (teamFilter && teamFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.team === teamFilter);
    }
    
    if (dateFrom) {
        filteredLogs = filteredLogs.filter(log => log.timestamp.split('T')[0] >= dateFrom);
    }
    
    if (dateTo) {
        filteredLogs = filteredLogs.filter(log => log.timestamp.split('T')[0] <= dateTo);
    }
    
    // Ordenar por fecha (más reciente primero)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Mostrar resultados
    renderAuditTable(filteredLogs);
}

function renderAuditTable(logs) {
    const tbody = document.querySelector('#auditTable tbody');
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const tr = document.createElement('tr');
        
        // Fecha/Hora
        const tdTimestamp = document.createElement('td');
        tdTimestamp.textContent = formatDateTime(log.timestamp);
        tr.appendChild(tdTimestamp);
        
        // Usuario
        const tdUser = document.createElement('td');
        tdUser.textContent = log.username;
        tr.appendChild(tdUser);
        
        // Acción
        const tdAction = document.createElement('td');
        tdAction.textContent = log.action.replace('_', ' ');
        tr.appendChild(tdAction);
        
        // Detalles
        const tdDetails = document.createElement('td');
        tdDetails.textContent = log.details;
        tr.appendChild(tdDetails);
        
        // Equipo
        const tdTeam = document.createElement('td');
        tdTeam.textContent = log.team || '-';
        tr.appendChild(tdTeam);
        
        tbody.appendChild(tr);
    });
}

function exportAuditLogs() {
    // Implementar exportación a Excel
    alert('Funcionalidad de exportación a Excel se implementará aquí');
}

function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
}