// js/initialSetup.js
async function initializeDataFiles() {
    try {
        // Usuarios
        let users = await getUsers();
        if (users.length === 0) {
            users = [{
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                team: null,
                functions: ['administrador']
            }];
            await saveUsers(users);
        }

        // Funciones
        let functions = await getFunctions();
        if (functions.length === 0) {
            functions = ['coordinador', 'entrenador', 'delegado'];
            await saveFunctions(functions);
        }

        // Equipos
        let teams = await getTeams();
        if (!Array.isArray(teams)) {
            teams = [];
            await saveTeams(teams);
        }

        // Partidos
        let matches = await getMatches();
        if (!Array.isArray(matches)) {
            matches = [];
            await saveMatches(matches);
        }

        // Eventos
        let events = await getEvents();
        if (events.length === 0) {
            events = ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Tiro a puerta', 'Corner'];
            await saveEvents(events);
        }

        // Auditoría
        let auditLog = await getAuditLog();
        if (!Array.isArray(auditLog)) {
            auditLog = [];
            await saveAuditLog(auditLog);
        }

        // Partido actual
        let currentMatch = await getCurrentMatch();
        if (!currentMatch?.id) {
            currentMatch = {
                id: generateId(),
                localTeam: '',
                rivalTeam: '',
                date: '',
                time: '',
                tournament: '',
                timerSeconds: 0,
                isRunning: false,
                localPlayers: [],
                rivalPlayers: [],
                events: [],
                summary: '',
                createdAt: new Date().toISOString()
            };
            await saveCurrentMatch(currentMatch);
        }
        
        await logAudit('system_init', 'Sistema inicializado');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error al inicializar datos', 'error');
    }
}

document.addEventListener('DOMContentLoaded', initializeDataFiles);