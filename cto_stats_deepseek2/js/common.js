// js/common.js
/**
 * Realiza llamadas a la API para manejar los archivos JSON
 * @param {string} entity - Entidad a manipular (users, teams, etc.)
 * @param {string} action - Acción (get, save)
 * @param {object} [data] - Datos a guardar
 * @returns {Promise} Promesa con la respuesta
 */
async function apiCall(entity, action, data = null) {
    const formData = new FormData();
    formData.append('entity', entity);
    formData.append('action', action);
    if (data) formData.append('data', JSON.stringify(data));

    try {
        const response = await fetch('api/dataHandler.php', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('Error de conexión con el servidor', 'error');
        return { success: false, message: error.message };
    }
}

// Funciones específicas para cada entidad
async function getUsers() {
    const response = await apiCall('users', 'get');
    return response.success ? response.data : [];
}

async function saveUsers(users) {
    return await apiCall('users', 'save', users);
}

async function getFunctions() {
    const response = await apiCall('functions', 'get');
    return response.success ? response.data : [];
}

async function saveFunctions(functions) {
    return await apiCall('functions', 'save', functions);
}

async function getTeams() {
    const response = await apiCall('teams', 'get');
    return response.success ? response.data : [];
}

async function saveTeams(teams) {
    return await apiCall('teams', 'save', teams);
}

async function getMatches() {
    const response = await apiCall('matches', 'get');
    return response.success ? response.data : [];
}

async function saveMatches(matches) {
    return await apiCall('matches', 'save', matches);
}

async function getEvents() {
    const response = await apiCall('events', 'get');
    return response.success ? response.data : [];
}

async function saveEvents(events) {
    return await apiCall('events', 'save', events);
}

async function getAuditLog() {
    const response = await apiCall('auditLog', 'get');
    return response.success ? response.data : [];
}

async function saveAuditLog(auditLog) {
    return await apiCall('auditLog', 'save', auditLog);
}

async function getCurrentMatch() {
    const response = await apiCall('currentMatch', 'get');
    return response.success ? response.data : null;
}

async function saveCurrentMatch(match) {
    return await apiCall('currentMatch', 'save', match);
}

// Funciones auxiliares
function checkPermissions(requiredFunctions = [], requiredTeam = null) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;

    const hasFunctions = requiredFunctions.every(func => 
        currentUser.functions?.includes(func)
    );
    const hasTeam = !requiredTeam || currentUser.team === requiredTeam;
    return hasFunctions && hasTeam;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatDateTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-ES');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function logAudit(action, details, team = null) {
    const auditLog = await getAuditLog();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    auditLog.push({
        timestamp: new Date().toISOString(),
        username: currentUser?.username || 'system',
        action,
        details,
        team
    });
    
    await saveAuditLog(auditLog);
}

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, duration);
}

// Estilos para notificaciones
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            opacity: 0;
            transition: opacity 0.5s;
            z-index: 1000;
            max-width: 300px;
        }
        .notification.success { background-color: #4CAF50; }
        .notification.error { background-color: #F44336; }
        .notification.warning { background-color: #FFC107; color: #333; }
        .notification.info { background-color: #2196F3; }
    `;
    document.head.appendChild(style);
}