// Simulación de base de datos de usuarios
const users = JSON.parse(localStorage.getItem('users')) || [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        team: 'all',
        functions: ['administrador']
    }
];

// Roles y funciones disponibles
const roles = ['admin', 'user'];
let functionsList = JSON.parse(localStorage.getItem('functions')) || ['coordinador', 'entrenador', 'delegado'];

// Usuario actual
let currentUser = null;

// Iniciar sesión
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Registrar acción de auditoría
        logAuditAction('login', `Inicio de sesión del usuario ${username}`);
        
        // Redirigir según rol
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'stats.html';
        }
    } else {
        document.getElementById('loginError').textContent = 'Usuario o contraseña incorrectos';
    }
});

// Cerrar sesión
document.getElementById('logout')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Registrar acción de auditoría
    if (currentUser) {
        logAuditAction('logout', `Cierre de sesión del usuario ${currentUser.username}`);
    }
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Verificar autenticación en cada página
function checkAuth() {
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        
        // Verificar permisos para páginas específicas
        if (window.location.pathname.endsWith('admin.html') && currentUser.role !== 'admin') {
            window.location.href = 'stats.html';
        }
    }
}

// Función para registrar acciones de auditoría
function logAuditAction(action, details, team = null) {
    const auditLog = JSON.parse(localStorage.getItem('audit')) || [];
    
    auditLog.push({
        timestamp: new Date().toISOString(),
        username: currentUser?.username || 'system',
        team: team || currentUser?.team || 'system',
        action: action,
        details: details
    });
    
    localStorage.setItem('audit', JSON.stringify(auditLog));
}

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth);