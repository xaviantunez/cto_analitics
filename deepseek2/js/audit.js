// audit.js - Registro y visualización de acciones de auditoría
const Audit = {
    currentPage: 1,
    itemsPerPage: 20,
    filters: {
        user: '',
        action: '',
        team: '',
        dateFrom: '',
        dateTo: ''
    },

    init: function() {
        if (!Auth.checkAuth(['admin'])) {
            window.location.href = 'index.html';
            return;
        }

        this.loadData();
        this.setupEventListeners();
        this.renderAuditLog();
    },

    loadData: function() {
        this.auditLog = DB.load('audit_log.json');
        this.teams = DB.load('teams.json');
        this.users = DB.load('users.json');
    },

    setupEventListeners: function() {
        document.getElementById('filterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderAuditLog();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.getFilteredLog().length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderAuditLog();
            }
        });

        document.getElementById('exportAuditBtn').addEventListener('click', () => {
            this.exportAuditLog();
        });
    },

    applyFilters: function() {
        this.filters = {
            user: document.getElementById('filterUser').value,
            action: document.getElementById('filterAction').value,
            team: document.getElementById('filterTeam').value,
            dateFrom: document.getElementById('filterDateFrom').value,
            dateTo: document.getElementById('filterDateTo').value
        };

        this.currentPage = 1;
        this.renderAuditLog();
    },

    resetFilters: function() {
        document.getElementById('filterUser').value = '';
        document.getElementById('filterAction').value = '';
        document.getElementById('filterTeam').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';

        this.filters = {
            user: '',
            action: '',
            team: '',
            dateFrom: '',
            dateTo: ''
        };

        this.currentPage = 1;
        this.renderAuditLog();
    },

    getFilteredLog: function() {
        return this.auditLog.filter(entry => {
            // Filtrar por usuario
            if (this.filters.user && !entry.user.toLowerCase().includes(this.filters.user.toLowerCase())) {
                return false;
            }

            // Filtrar por acción
            if (this.filters.action && !entry.action.toLowerCase().includes(this.filters.action.toLowerCase())) {
                return false;
            }

            // Filtrar por equipo (si los detalles contienen el nombre del equipo)
            if (this.filters.team) {
                const team = this.teams.find(t => t.id === this.filters.team);
                if (team && !entry.details.toLowerCase().includes(team.name.toLowerCase())) {
                    return false;
                }
            }

            // Filtrar por fecha
            if (this.filters.dateFrom) {
                const entryDate = new Date(entry.timestamp);
                const filterDate = new Date(this.filters.dateFrom);
                if (entryDate < filterDate) {
                    return false;
                }
            }

            if (this.filters.dateTo) {
                const entryDate = new Date(entry.timestamp);
                const filterDate = new Date(this.filters.dateTo);
                if (entryDate > filterDate) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    renderAuditLog: function() {
        const filteredLog = this.getFilteredLog();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedLog = filteredLog.slice(startIndex, startIndex + this.itemsPerPage);

        // Renderizar entradas
        const logContainer = document.getElementById('auditLogContainer');
        logContainer.innerHTML = paginatedLog.map(entry => this.renderAuditEntry(entry)).join('');

        // Actualizar controles de paginación
        this.updatePaginationControls(filteredLog.length);

        // Actualizar contador de resultados
        document.getElementById('resultsCount').textContent = `Mostrando ${startIndex + 1}-${Math.min(startIndex + this.itemsPerPage, filteredLog.length)} de ${filteredLog.length} registros`;
    },

    renderAuditEntry: function(entry) {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="audit-entry">
                <div class="audit-header">
                    <span class="audit-timestamp">${formattedDate}</span>
                    <span class="audit-user">${entry.user}</span>
                    <span class="audit-action">${this.formatAction(entry.action)}</span>
                </div>
                <div class="audit-details">${entry.details}</div>
            </div>
        `;
    },

    formatAction: function(action) {
        const actionsMap = {
            'login': 'Inicio de sesión',
            'logout': 'Cierre de sesión',
            'create_user': 'Creación de usuario',
            'update_user': 'Actualización de usuario',
            'delete_user': 'Eliminación de usuario',
            'add_team': 'Creación de equipo',
            'delete_team': 'Eliminación de equipo',
            'rename_team': 'Renombrado de equipo',
            'add_player': 'Añadir jugador',
            'delete_player': 'Eliminar jugador',
            'rename_player': 'Renombrar jugador',
            'change_player_number': 'Cambiar número de jugador',
            'save_match': 'Guardar partido',
            'export_data': 'Exportar datos',
            'add_event_type': 'Añadir tipo de evento',
            'update_roles': 'Actualizar roles',
            'update_functions': 'Actualizar funciones'
        };

        return actionsMap[action] || action;
    },

    updatePaginationControls: function(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = totalPages;

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    },

    exportAuditLog: function() {
        const filteredLog = this.getFilteredLog();
        let csvContent = "Fecha,Usuario,Acción,Detalles\n";

        filteredLog.forEach(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            csvContent += `"${formattedDate}","${entry.user}","${this.formatAction(entry.action)}","${entry.details.replace(/"/g, '""')}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('auditLogContainer')) {
        Audit.init();
    }
});