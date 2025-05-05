// auth.js - Autenticación y gestión de usuarios
const Auth = {
    currentUser: null,

    init: function() {
        this.loadUsers();
        this.restoreSession();
    },

    loadUsers: function() {
        this.users = Storage.load('users') || [];
    },

    login: function(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            Storage.save('currentUser', user);
            this.logAction('login', `Inicio de sesión: ${username}`);
            return true;
        }
        return false;
    },

    logout: function() {
        if (this.currentUser) {
            this.logAction('logout', `Cierre de sesión: ${this.currentUser.username}`);
        }
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },

    restoreSession: function() {
        this.currentUser = Storage.load('currentUser');
    },

    checkAuth: function(requiredRoles = [], requiredFunctions = []) {
        if (!this.currentUser) return false;
        
        if (requiredRoles.length > 0 && !requiredRoles.some(r => this.currentUser.roles.includes(r))) {
            return false;
        }
        
        if (requiredFunctions.length > 0 && 
            !this.currentUser.functions.includes('all') && 
            !requiredFunctions.some(f => this.currentUser.functions.includes(f))) {
            return false;
        }
        
        return true;
    },

    hasRole: function(role) {
        return this.currentUser?.roles.includes(role) || false;
    },

    hasFunction: function(func) {
        return this.currentUser?.functions.includes('all') || 
               this.currentUser?.functions.includes(func) || 
               false;
    },

    logAction: function(action, details) {
        const logs = Storage.load('audit_log') || [];
        logs.push({
            timestamp: new Date().toISOString(),
            user: this.currentUser ? this.currentUser.username : 'system',
            action,
            details
        });
        Storage.save('audit_log', logs);
    }
};

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();

    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (Auth.login(username, password)) {
                window.location.href = 'stats.html';
            } else {
                document.getElementById('loginError').textContent = 'Usuario o contraseña incorrectos';
            }
        });
    }

    // Manejar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            Auth.logout();
            window.location.href = 'index.html';
        });
    }
});