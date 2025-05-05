// admin.js - Lógica del panel de administración
document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.checkAuth(['admin'])) {
        window.location.href = 'index.html';
        return;
    }

    const Admin = {
        users: [],
        teams: [],
        rolesConfig: {},

        init: function() {
            this.loadData();
            this.setupEventListeners();
            this.renderUserList();
            this.renderRoleManagement();
        },

        loadData: function() {
            this.users = Storage.load('users') || [];
            this.teams = Storage.load('teams') || [];
            this.rolesConfig = Storage.load('roles_config') || {
                roles: ['admin', 'user'],
                functions: ['coordinador', 'entrenador', 'delegado']
            };
        },

        setupEventListeners: function() {
            // Formulario de usuario
            document.getElementById('addUserForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });

            // Gestión de roles
            document.getElementById('saveRolesBtn').addEventListener('click', () => {
                this.addRole();
            });

            // Gestión de funciones
            document.getElementById('addFunctionBtn').addEventListener('click', () => {
                this.addFunction();
            });

            // Exportar/importar datos
            document.getElementById('exportDataBtn').addEventListener('click', () => {
                Storage.exportAllData();
            });

            document.getElementById('importDataBtn').addEventListener('click', () => {
                document.getElementById('importDataFile').click();
            });

            document.getElementById('importDataFile').addEventListener('change', (e) => {
                if (confirm('¿Importar datos? Esto sobrescribirá la información actual.')) {
                    Storage.importData(e.target.files[0], (success, error) => {
                        if (success) {
                            alert('Datos importados correctamente');
                            window.location.reload();
                        } else {
                            alert('Error al importar datos: ' + error.message);
                        }
                    });
                }
            });
        },

        renderUserList: function() {
            const tableBody = document.querySelector('#usersTable tbody');
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
                        ${user.roles.includes('admin') ? '' : `<button class="btn danger delete-user" data-userid="${user.id}">Eliminar</button>`}
                    </td>
                `;

                // Event listeners
                row.querySelector('.user-roles').addEventListener('change', (e) => {
                    user.roles = Array.from(e.target.selectedOptions).map(opt => opt.value);
                });

                row.querySelector('.user-functions').addEventListener('change', (e) => {
                    user.functions = Array.from(e.target.selectedOptions).map(opt => opt.value);
                });

                row.querySelector('.user-team').addEventListener('change', (e) => {
                    user.team = e.target.value;
                });

                row.querySelector('.save-user').addEventListener('click', () => {
                    this.saveUser(user.id);
                });

                const deleteBtn = row.querySelector('.delete-user');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        this.deleteUser(user.id);
                    });
                }

                tableBody.appendChild(row);
            });
        },

        renderRoleManagement: function() {
            const rolesList = document.getElementById('rolesList');
            const functionsList = document.getElementById('functionsList');

            rolesList.innerHTML = this.rolesConfig.roles.map(role => `
                <div class="list-item">
                    <span>${role}</span>
                    ${!['admin', 'user'].includes(role) ? 
                        `<button class="btn danger delete-role" data-role="${role}">Eliminar</button>` : ''}
                </div>
            `).join('');

            functionsList.innerHTML = this.rolesConfig.functions.map(func => `
                <div class="list-item">
                    <span>${func}</span>
                    <button class="btn danger delete-function" data-function="${func}">Eliminar</button>
                </div>
            `).join('');

            // Event listeners para eliminar
            document.querySelectorAll('.delete-role').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteRole(e.target.dataset.role);
                });
            });

            document.querySelectorAll('.delete-function').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.deleteFunction(e.target.dataset.function);
                });
            });
        },

        addUser: function() {
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const name = document.getElementById('newName').value.trim();

            if (!username || !password || !name) {
                alert('Todos los campos son obligatorios');
                return;
            }

            if (this.users.some(u => u.username === username)) {
                alert('El usuario ya existe');
                return;
            }

            const newUser = {
                id: Date.now(),
                username,
                password,
                name,
                roles: ['user'],
                functions: [],
                team: null
            };

            this.users.push(newUser);
            Storage.save('users', this.users);
            Auth.logAction('add_user', `Usuario creado: ${username}`);
            
            document.getElementById('addUserForm').reset();
            this.renderUserList();
        },

        saveUser: function(userId) {
            const user = this.users.find(u => u.id === userId);
            if (!user) return;

            Storage.save('users', this.users);
            Auth.logAction('update_user', `Usuario actualizado: ${user.username}`);
            alert('Cambios guardados');
        },

        deleteUser: function(userId) {
            if (!confirm('¿Eliminar este usuario?')) return;

            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex === -1) return;

            const deletedUser = this.users.splice(userIndex, 1)[0];
            Storage.save('users', this.users);
            Auth.logAction('delete_user', `Usuario eliminado: ${deletedUser.username}`);
            this.renderUserList();
        },

        addRole: function() {
            const newRole = document.getElementById('newRole').value.trim();
            if (!newRole) return;

            if (this.rolesConfig.roles.includes(newRole)) {
                alert('Este rol ya existe');
                return;
            }

            this.rolesConfig.roles.push(newRole);
            Storage.save('roles_config', this.rolesConfig);
            Auth.logAction('add_role', `Rol añadido: ${newRole}`);
            
            document.getElementById('newRole').value = '';
            this.renderRoleManagement();
            this.renderUserList();
        },

        addFunction: function() {
            const newFunction = document.getElementById('newFunction').value.trim();
            if (!newFunction) return;

            if (this.rolesConfig.functions.includes(newFunction)) {
                alert('Esta función ya existe');
                return;
            }

            this.rolesConfig.functions.push(newFunction);
            Storage.save('roles_config', this.rolesConfig);
            Auth.logAction('add_function', `Función añadida: ${newFunction}`);
            
            document.getElementById('newFunction').value = '';
            this.renderRoleManagement();
            this.renderUserList();
        },

        deleteRole: function(role) {
            if (!confirm(`¿Eliminar el rol "${role}"?`)) return;

            this.rolesConfig.roles = this.rolesConfig.roles.filter(r => r !== role);
            
            // Actualizar usuarios que tenían este rol
            this.users.forEach(user => {
                user.roles = user.roles.filter(r => r !== role);
            });

            Storage.save('users', this.users);
            Storage.save('roles_config', this.rolesConfig);
            Auth.logAction('delete_role', `Rol eliminado: ${role}`);
            
            this.renderRoleManagement();
            this.renderUserList();
        },

        deleteFunction: function(func) {
            if (!confirm(`¿Eliminar la función "${func}"?`)) return;

            this.rolesConfig.functions = this.rolesConfig.functions.filter(f => f !== func);
            
            // Actualizar usuarios que tenían esta función
            this.users.forEach(user => {
                user.functions = user.functions.filter(f => f !== func);
            });

            Storage.save('users', this.users);
            Storage.save('roles_config', this.rolesConfig);
            Auth.logAction('delete_function', `Función eliminada: ${func}`);
            
            this.renderRoleManagement();
            this.renderUserList();
        }
    };

    Admin.init();
});