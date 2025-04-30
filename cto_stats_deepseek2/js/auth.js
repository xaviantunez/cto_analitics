// auth.js - Sistema de autenticación y gestión de usuarios
const Auth = {
    currentUser: null,
    users: [],
    roles: ['admin', 'user'],
    functions: ['coordinador', 'entrenador', 'delegado'],

    init: function() {
        this.loadUsers();
        this.restoreSession();
    },

    loadUsers: function() {
        const savedUsers = localStorage.getItem('users');
        this.users = savedUsers ? JSON.parse(savedUsers) : [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrador',
                roles: ['admin'],
                functions: ['all'],
                team: null
            }
        ];
    },

    saveUsers: function() {
        localStorage.setItem('users', JSON.stringify(this.users));
    },

    login: function(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
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
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },

    checkAuth: function(requiredRoles = [], requiredFunctions = []) {
        if (!this.currentUser) return false;
        
        // Verificar roles
        if (requiredRoles.length > 0 && 
            !requiredRoles.some(r => this.currentUser.roles.includes(r))) {
            return false;
        }
        
        // Verificar funciones (permisos)
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
        const logs = JSON.parse(localStorage.getItem('audit_log')) || [];
        logs.push({
            timestamp: new Date().toISOString(),
            user: this.currentUser ? this.currentUser.username : 'system',
            action,
            details
        });
        localStorage.setItem('audit_log', JSON.stringify(logs));
    },

    // Métodos para el administrador
    addUser: function(userData) {
        if (!this.hasRole('admin')) return false;

        const newUser = {
            id: Math.max(...this.users.map(u => u.id), 0) + 1,
            ...userData
        };

        this.users.push(newUser);
        this.saveUsers();
        this.logAction('add_user', `Nuevo usuario: ${userData.username}`);
        return true;
    },

    updateUser: function(userId, userData) {
        if (!this.hasRole('admin')) return false;

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;

        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.saveUsers();
        this.logAction('update_user', `Usuario actualizado: ${userData.username}`);
        return true;
    },

    deleteUser: function(userId) {
        if (!this.hasRole('admin')) return false;

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return false;

        const deletedUser = this.users.splice(userIndex, 1)[0];
        this.saveUsers();
        this.logAction('delete_user', `Usuario eliminado: ${deletedUser.username}`);
        return true;
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