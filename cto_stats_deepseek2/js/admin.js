// admin.js - Panel de administración de usuarios y configuración
const Admin = {
    init: function() {
        if (!Auth.checkAuth(['admin'])) {
            window.location.href = 'index.html';
            return;
        }

        this.loadData();
        this.setupEventListeners();
        this.renderUserList();
        this.renderRoleManagement();
    },

    loadData: function() {
        this.users = JSON.parse(JSON.stringify(Auth.users));
        this.teams = JSON.parse(localStorage.getItem('teams')) || [];
        this.rolesConfig = JSON.parse(localStorage.getItem('roles_config')) || {
            roles: ['admin', 'user'],
            functions: ['coordinador', 'entrenador', 'delegado']
        };
    },

    setupEventListeners: function() {
        document.getElementById('addUserForm').addEventListener('submit', this.handleAddUser.bind(this));
        document.getElementById('saveRolesBtn').addEventListener('click', this.saveRoles.bind(this));
        document.getElementById('addFunctionBtn').addEventListener('click', this.addFunction.bind(this));
    },

    renderUserList: function() {
        const tableBody = document.getElementById('usersTable').querySelector('tbody');
        tableBody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>
                    <select class="user-roles" multiple>
                        ${this.rolesConfig.roles.map(role => `
                            <option value="${role}" ${user.roles.includes(role) ? 'selected' : ''}>${role}</option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <select class="user-functions" multiple>
                        ${this.rolesConfig.functions.map(func => `
                            <option value="${func}" ${user.functions.includes(func) ? 'selected' : ''}>${func}</option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <select class="user-team">
                        <option value="">Ninguno</option>
                        ${this.teams.map(team => `
                            <option value="${team.name}" ${user.team === team.name ? 'selected' : ''}>${team.name}</option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn save-user" data-userid="${user.id}">Guardar</button>
                    <button class="btn danger delete-user" data-userid="${user.id}">Eliminar</button>
                </td>
            `;

            // Event listeners para los selects
            row.querySelector('.user-roles').addEventListener('change', (e) => {
                user.roles = Array.from(e.target.selectedOptions).map(opt => opt.value);
            });

            row.querySelector('.user-functions').addEventListener('change', (e) => {
                user.functions = Array.from(e.target.selectedOptions).map(opt => opt.value);
            });

            row.querySelector('.user-team').addEventListener('change', (e) => {
                user.team = e.target.value;
            });

            // Botones de acción
            row.querySelector('.save-user').addEventListener('click', () => this.saveUser(user.id));
            row.querySelector('.delete-user').addEventListener('click', () => this.deleteUser(user.id));

            tableBody.appendChild(row);
        });
    },

    renderRoleManagement: function() {
        const rolesList = document.getElementById('rolesList');
        const functionsList = document.getElementById('functionsList');

        rolesList.innerHTML = this.rolesConfig.roles.map(role => `
            <div class="role-item">
                <span>${role}</span>
                ${role !== 'admin' && role !== 'user' ? 
                    `<button class="btn danger delete-role" data-role="${role}">Eliminar</button>` : ''}
            </div>
        `).join('');

        functionsList.innerHTML = this.rolesConfig.functions.map(func => `
            <div class="function-item">
                <span>${func}</span>
                <button class="btn danger delete-function" data-function="${func}">Eliminar</button>
            </div>
        `).join('');

        // Event listeners para eliminar roles y funciones
        document.querySelectorAll('.delete-role').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteRole(e.target.dataset.role));
        });

        document.querySelectorAll('.delete-function').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteFunction(e.target.dataset.function));
        });
    },

    handleAddUser: function(e) {
        e.preventDefault();
        
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const name = document.getElementById('newName').value;

        if (!username || !password || !name) {
            alert('Todos los campos son obligatorios');
            return;
        }

        if (this.users.some(u => u.username === username)) {
            alert('El nombre de usuario ya existe');
            return;
        }

        const newUser = {
            username,
            password,
            name,
            roles: [],
            functions: [],
            team: null
        };

        if (Auth.addUser(newUser)) {
            this.loadData();
            this.renderUserList();
            e.target.reset();
        } else {
            alert('No tienes permisos para realizar esta acción');
        }
    },

    saveUser: function(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (Auth.updateUser(userId, user)) {
            alert('Usuario actualizado correctamente');
        } else {
            alert('Error al actualizar el usuario');
        }
    },

    deleteUser: function(userId) {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            if (Auth.deleteUser(userId)) {
                this.loadData();
                this.renderUserList();
            } else {
                alert('No tienes permisos para realizar esta acción');
            }
        }
    },

    saveRoles: function() {
        const newRole = document.getElementById('newRole').value.trim();
        if (newRole && !this.rolesConfig.roles.includes(newRole)) {
            this.rolesConfig.roles.push(newRole);
            document.getElementById('newRole').value = '';
            this.renderRoleManagement();
            localStorage.setItem('roles_config', JSON.stringify(this.rolesConfig));
            Auth.logAction('update_roles', 'Roles actualizados');
        }
    },

    addFunction: function() {
        const newFunction = document.getElementById('newFunction').value.trim();
        if (newFunction && !this.rolesConfig.functions.includes(newFunction)) {
            this.rolesConfig.functions.push(newFunction);
            document.getElementById('newFunction').value = '';
            this.renderRoleManagement();
            localStorage.setItem('roles_config', JSON.stringify(this.rolesConfig));
            Auth.logAction('update_functions', 'Funciones actualizadas');
        }
    },

    deleteRole: function(role) {
        if (confirm(`¿Eliminar el rol "${role}"?`)) {
            this.rolesConfig.roles = this.rolesConfig.roles.filter(r => r !== role);
            this.renderRoleManagement();
            localStorage.setItem('roles_config', JSON.stringify(this.rolesConfig));
            Auth.logAction('delete_role', `Rol eliminado: ${role}`);
        }
    },

    deleteFunction: function(func) {
        if (confirm(`¿Eliminar la función "${func}"?`)) {
            this.rolesConfig.functions = this.rolesConfig.functions.filter(f => f !== func);
            this.renderRoleManagement();
            localStorage.setItem('roles_config', JSON.stringify(this.rolesConfig));
            Auth.logAction('delete_function', `Función eliminada: ${func}`);
        }
    }
};

// Inicializar la página de admin
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('usersTable')) {
        Admin.init();
    }
});