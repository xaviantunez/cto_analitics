// storage.js - Manejo de almacenamiento con localStorage
const Storage = {
    // Cargar datos
    load: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Guardar datos
    save: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Inicializar datos por defecto
    initDefaultData: function() {
        if (!this.load('users')) {
            const defaultUsers = [
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
            this.save('users', defaultUsers);
        }

        if (!this.load('teams')) {
            const defaultTeams = [
                {
                    id: 1,
                    name: 'Equipo Verde',
                    players: [
                        {id: 1, name: 'Jugador 1', number: 10},
                        {id: 2, name: 'Jugador 2', number: 5}
                    ]
                }
            ];
            this.save('teams', defaultTeams);
        }

        if (!this.load('roles_config')) {
            this.save('roles_config', {
                roles: ['admin', 'user'],
                functions: ['coordinador', 'entrenador', 'delegado']
            });
        }

        if (!this.load('event_types')) {
            this.save('event_types', ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Cambio', 'Lesión']);
        }

        if (!this.load('matches')) {
            this.save('matches', []);
        }

        if (!this.load('audit_log')) {
            this.save('audit_log', []);
        }
    },

    // Exportar todos los datos
    exportAllData: function() {
        const data = {
            users: this.load('users'),
            teams: this.load('teams'),
            matches: this.load('matches'),
            event_types: this.load('event_types'),
            roles_config: this.load('roles_config'),
            audit_log: this.load('audit_log')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'futbol_stats_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Importar datos
    importData: function(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.users) this.save('users', data.users);
                if (data.teams) this.save('teams', data.teams);
                if (data.matches) this.save('matches', data.matches);
                if (data.event_types) this.save('event_types', data.event_types);
                if (data.roles_config) this.save('roles_config', data.roles_config);
                if (data.audit_log) this.save('audit_log', data.audit_log);
                
                callback(true);
            } catch (error) {
                console.error('Error importing data:', error);
                callback(false, error);
            }
        };
        
        reader.readAsText(file);
    }
};

// Inicializar datos al cargar
document.addEventListener('DOMContentLoaded', function() {
    Storage.initDefaultData();
});