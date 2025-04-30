// storage.js - Funciones compartidas para el almacenamiento

// Función para inicializar los datos de un nuevo partido
function resetMatchData() {
    const currentMatch = {
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
    
    localStorage.setItem('currentMatch', JSON.stringify(currentMatch));
    return currentMatch;
}

// Función para guardar el partido actual en el histórico
function saveCurrentMatchToHistory() {
    const currentMatch = JSON.parse(localStorage.getItem('currentMatch'));
    if (!currentMatch) return;
    
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push(currentMatch);
    localStorage.setItem('matches', JSON.stringify(matches));
    
    logAudit('save_match', `Partido guardado: ${currentMatch.localTeam} vs ${currentMatch.rivalTeam}`, currentMatch.localTeam);
    
    // Resetear el partido actual
    resetMatchData();
}

// Función para generar un ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para formatear el tiempo (mm:ss)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Función para formatear fecha
function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('es-ES', options);
}

// Función para formatear fecha y hora
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES');
}

// Exportar para usar en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        resetMatchData,
        saveCurrentMatchToHistory,
        generateId,
        formatTime,
        formatDate,
        formatDateTime
    };
}