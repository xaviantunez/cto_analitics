// initialSetup.js - Rutina de inicialización del almacenamiento local

/**
 * Función para inicializar todas las variables necesarias en localStorage
 */
function initializeLocalStorage() {
    // Verificar y crear usuarios si no existen
    if (!localStorage.getItem('users')) {
        const initialUsers = [
            {
                username: 'admin',
                password: 'admin123', // En una aplicación real, esto debería estar hasheado
                role: 'admin',
                team: null,
                functions: ['administrador']
            }
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
        console.log('Usuarios iniciales creados');
    }

    // Verificar y crear funciones básicas si no existen
    if (!localStorage.getItem('functions')) {
        const initialFunctions = ['coordinador', 'entrenador', 'delegado'];
        localStorage.setItem('functions', JSON.stringify(initialFunctions));
        console.log('Funciones iniciales creadas');
    }

    // Verificar y crear equipos si no existen
    if (!localStorage.getItem('teams')) {
        localStorage.setItem('teams', JSON.stringify([]));
        console.log('Estructura de equipos creada');
    }

    // Verificar y crear partidos si no existen
    if (!localStorage.getItem('matches')) {
        localStorage.setItem('matches', JSON.stringify([]));
        console.log('Estructura de partidos creada');
    }

    // Verificar y crear eventos de partido si no existen
    if (!localStorage.getItem('events')) {
        const initialEvents = ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Tiro a puerta', 'Corner'];
        localStorage.setItem('events', JSON.stringify(initialEvents));
        console.log('Eventos iniciales creados');
    }

    // Verificar y crear registro de auditoría si no existe
    if (!localStorage.getItem('auditLog')) {
        localStorage.setItem('auditLog', JSON.stringify([]));
        console.log('Registro de auditoría creado');
    }

    // Verificar y crear partido actual si no existe
    if (!localStorage.getItem('currentMatch')) {
        const initialMatch = {
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
        localStorage.setItem('currentMatch', JSON.stringify(initialMatch));
        console.log('Partido actual inicializado');
    }
}

// Función para generar un ID único (usada en la inicialización)
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Ejecutar la inicialización cuando se carga el script
document.addEventListener('DOMContentLoaded', function() {
    initializeLocalStorage();
    
    // Registrar en el log de auditoría
    const auditLog = JSON.parse(localStorage.getItem('auditLog'));
    auditLog.push({
        timestamp: new Date().toISOString(),
        username: 'system',
        action: 'system_init',
        details: 'Inicialización del sistema completada',
        team: null
    });
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
});

// Exportar para pruebas si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeLocalStorage,
        generateId
    };
}