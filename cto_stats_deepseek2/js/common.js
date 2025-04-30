// common.js - Funciones compartidas entre los diferentes módulos

/**
 * Función para verificar los permisos del usuario actual
 * @param {string[]} requiredFunctions - Funciones requeridas
 * @param {string} [requiredTeam] - Equipo requerido (opcional)
 * @returns {boolean} - True si el usuario tiene permisos, false si no
 */
function checkPermissions(requiredFunctions = [], requiredTeam = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;

    // Si el usuario es admin, tiene todos los permisos
    if (currentUser.role === 'admin') return true;

    // Verificar funciones requeridas
    const hasFunctions = requiredFunctions.every(func => 
        currentUser.functions && currentUser.functions.includes(func)
    );

    // Verificar equipo requerido si se especifica
    const hasTeam = !requiredTeam || currentUser.team === requiredTeam;

    return hasFunctions && hasTeam;
}

/**
 * Función para formatear el tiempo (segundos a mm:ss)
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} - Tiempo formateado
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Función para formatear una fecha (YYYY-MM-DD a formato legible)
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
}

/**
 * Función para formatear fecha y hora (para auditoría)
 * @param {string} timestamp - Marca de tiempo ISO
 * @returns {string} - Fecha y hora formateada
 */
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
}

/**
 * Función para generar un ID único
 * @returns {string} - ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Función para registrar acciones en el log de auditoría
 * @param {string} action - Tipo de acción
 * @param {string} details - Detalles de la acción
 * @param {string|null} [team=null] - Equipo relacionado (opcional)
 */
function logAudit(action, details, team = null) {
    const auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    auditLog.push({
        timestamp: new Date().toISOString(),
        username: currentUser ? currentUser.username : 'system',
        action: action,
        details: details,
        team: team
    });
    
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

/**
 * Función para inicializar los datos de un nuevo partido
 * @returns {object} - Objeto con la estructura de partido inicializada
 */
function initMatchData() {
    return {
        id: generateId(),
        localTeam: '',
        rivalTeam: '',
        date: '',
        time: '',
        tournament: '',
        timerSeconds: 0,
        timerInterval: null,
        isRunning: false,
        localPlayers: [],
        rivalPlayers: [],
        events: [],
        summary: '',
        createdAt: new Date().toISOString()
    };
}

/**
 * Función para guardar el partido actual en el histórico
 */
function saveCurrentMatchToHistory() {
    const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
    if (!currentMatch) return;
    
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push(currentMatch);
    localStorage.setItem('matches', JSON.stringify(matches));
    
    logAudit('save_match', `Partido guardado: ${currentMatch.localTeam} vs ${currentMatch.rivalTeam}`, currentMatch.localTeam);
    
    // Resetear el partido actual
    localStorage.setItem('currentMatch', JSON.stringify(initMatchData()));
}

/**
 * Función para exportar datos a Excel (simulada)
 * @param {string} dataType - Tipo de datos a exportar
 * @param {object[]} data - Datos a exportar
 */
function exportToExcel(dataType, data) {
    // En una implementación real, aquí se usaría una librería como SheetJS
    console.log(`Exportando ${dataType} a Excel`, data);
    alert(`Funcionalidad de exportación a Excel para ${dataType} se implementará aquí`);
    
    // Registrar en auditoría
    logAudit('export_data', `Exportación de ${dataType} a Excel`);
}

/**
 * Función para cargar los equipos en un select
 * @param {HTMLSelectElement} selectElement - Elemento select a llenar
 * @param {boolean} [includeEmptyOption=true] - Incluir opción vacía
 * @param {string} [selectedValue=''] - Valor a seleccionar
 */
function loadTeamsIntoSelect(selectElement, includeEmptyOption = true, selectedValue = '') {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    
    // Limpiar select
    selectElement.innerHTML = '';
    
    // Opción vacía si se requiere
    if (includeEmptyOption) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Seleccione un equipo';
        selectElement.appendChild(emptyOption);
    }
    
    // Añadir equipos
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.name;
        option.textContent = team.name;
        option.selected = team.name === selectedValue;
        selectElement.appendChild(option);
    });
}

/**
 * Función para cargar los jugadores de un equipo en un select
 * @param {HTMLSelectElement} selectElement - Elemento select a llenar
 * @param {string} teamName - Nombre del equipo
 * @param {boolean} [includeEmptyOption=true] - Incluir opción vacía
 * @param {string} [selectedValue=''] - Valor a seleccionar
 */
function loadPlayersIntoSelect(selectElement, teamName, includeEmptyOption = true, selectedValue = '') {
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const team = teams.find(t => t.name === teamName);
    
    // Limpiar select
    selectElement.innerHTML = '';
    
    // Opción vacía si se requiere
    if (includeEmptyOption) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Seleccione un jugador';
        selectElement.appendChild(emptyOption);
    }
    
    // Añadir jugadores si se encontró el equipo
    if (team) {
        team.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            option.selected = player === selectedValue;
            selectElement.appendChild(option);
        });
    }
}

/**
 * Función para mostrar notificaciones al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} [duration=3000] - Duración en milisegundos
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Ocultar y eliminar después de la duración
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, duration);
}

// Añadir estilos para las notificaciones si no existen
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
            transition: opacity 0.5s ease;
            z-index: 1000;
            max-width: 300px;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #F44336;
        }
        .notification.warning {
            background-color: #FFC107;
            color: #333;
        }
        .notification.info {
            background-color: #2196F3;
        }
    `;
    document.head.appendChild(style);
}

// Exportar funciones para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkPermissions,
        formatTime,
        formatDate,
        formatDateTime,
        generateId,
        logAudit,
        initMatchData,
        saveCurrentMatchToHistory,
        exportToExcel,
        loadTeamsIntoSelect,
        loadPlayersIntoSelect,
        showNotification
    };
}