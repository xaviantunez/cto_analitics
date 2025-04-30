// storage.js - Manejo de almacenamiento con archivos JSON simulados
const DB = {
    // Cargar datos de un archivo JSON
    load: function(file) {
        try {
            const data = localStorage.getItem(`db_${file}`);
            if (data) {
                return JSON.parse(data);
            }
            
            // Datos iniciales si el archivo no existe
            switch(file) {
                case 'users.json':
                    return [{
                        id: 1,
                        username: 'admin',
                        password: 'admin123',
                        name: 'Administrador',
                        roles: ['admin'],
                        functions: ['all'],
                        team: null
                    }];
                case 'teams.json':
                    return [{
                        id: 1,
                        name: 'Equipo Verde',
                        players: [
                            {id: 1, name: 'Jugador 1', number: 10},
                            {id: 2, name: 'Jugador 2', number: 5}
                        ]
                    }];
                case 'matches.json':
                    return [];
                case 'events.json':
                    return ['Gol', 'Tarjeta amarilla', 'Tarjeta roja', 'Falta', 'Cambio', 'Lesión'];
                case 'roles.json':
                    return {
                        roles: ['admin', 'user'],
                        functions: ['coordinador', 'entrenador', 'delegado']
                    };
                case 'audit_log.json':
                    return [];
                default:
                    return [];
            }
        } catch (e) {
            console.error(`Error loading ${file}:`, e);
            return [];
        }
    },
    
    // Guardar datos en un archivo JSON
    save: function(file, data) {
        try {
            localStorage.setItem(`db_${file}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving ${file}:`, e);
            return false;
        }
    },
    
    // Exportar todos los datos a un archivo JSON
    exportAllData: function() {
        const data = {
            users: this.load('users.json'),
            teams: this.load('teams.json'),
            matches: this.load('matches.json'),
            events: this.load('events.json'),
            roles: this.load('roles.json'),
            audit_log: this.load('audit_log.json')
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'football_stats_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Importar datos desde un archivo JSON
    importData: function(file, callback) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.users) this.save('users.json', data.users);
                if (data.teams) this.save('teams.json', data.teams);
                if (data.matches) this.save('matches.json', data.matches);
                if (data.events) this.save('events.json', data.events);
                if (data.roles) this.save('roles.json', data.roles);
                if (data.audit_log) this.save('audit_log.json', data.audit_log);
                
                callback(true);
            } catch (error) {
                console.error('Error importing data:', error);
                callback(false, error);
            }
        };
        
        reader.readAsText(file);
    }
};

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DB;
}