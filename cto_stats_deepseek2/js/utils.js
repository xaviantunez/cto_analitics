// utils.js - Funciones de utilidad para toda la aplicación
const Utils = {
    // Formatear fecha a formato legible
    formatDate: function(dateString, includeTime = false) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    // Formatear segundos a minutos:segundos
    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Generar un ID único
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    // Validar email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Descargar datos como archivo
    downloadFile: function(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Capitalizar texto
    capitalize: function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    
    // Filtrar objetos por propiedades
    filterByProperties: function(items, filters) {
        return items.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                return item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
            });
        });
    },
    
    // Ordenar array por propiedad
    sortByProperty: function(array, property, ascending = true) {
        return array.sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];
            
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    },
    
    // Calcular estadísticas básicas
    calculateStats: function(matches, teamId) {
        const stats = {
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            cleanSheets: 0
        };
        
        matches.forEach(match => {
            if (match.localTeam === teamId || match.rivalTeam === teamId) {
                stats.played++;
                
                const isHome = match.localTeam === teamId;
                const homeGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.localTeam
                ).length;
                
                const awayGoals = match.events.filter(e => 
                    e.type === 'Gol' && e.team === match.rivalTeam
                ).length;
                
                if (isHome) {
                    stats.goalsFor += homeGoals;
                    stats.goalsAgainst += awayGoals;
                } else {
                    stats.goalsFor += awayGoals;
                    stats.goalsAgainst += homeGoals;
                }
                
                if (homeGoals > awayGoals) {
                    if (isHome) stats.wins++;
                    else stats.losses++;
                } else if (homeGoals < awayGoals) {
                    if (isHome) stats.losses++;
                    else stats.wins++;
                } else {
                    stats.draws++;
                }
                
                if ((isHome && awayGoals === 0) || (!isHome && homeGoals === 0)) {
                    stats.cleanSheets++;
                }
            }
        });
        
        return stats;
    }
};

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}