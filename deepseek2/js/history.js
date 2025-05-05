// history.js - Gestión del histórico de partidos
const MatchHistory = {
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
        team: '',
        dateFrom: '',
        dateTo: '',
        tournament: ''
    },

    init: function() {
        if (!Auth.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }

        this.loadData();
        this.setupEventListeners();
        this.renderTeamFilter();
        this.renderMatches();
    },

    loadData: function() {
        this.matches = DB.load('matches.json');
        this.teams = DB.load('teams.json');
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
                this.renderMatches();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.getFilteredMatches().length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderMatches();
            }
        });
    },

    renderTeamFilter: function() {
        const teamSelect = document.getElementById('filterTeam');
        
        // Opción para todos los equipos
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'Todos los equipos';
        teamSelect.appendChild(allOption);

        // Opción para el equipo del usuario (si tiene uno)
        if (Auth.currentUser.team) {
            const userTeamOption = document.createElement('option');
            userTeamOption.value = Auth.currentUser.team;
            userTeamOption.textContent = `Mi equipo (${Auth.currentUser.team})`;
            teamSelect.appendChild(userTeamOption);
        }

        // Resto de equipos
        this.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            teamSelect.appendChild(option);
        });
    },

    applyFilters: function() {
        this.filters = {
            team: document.getElementById('filterTeam').value,
            dateFrom: document.getElementById('filterDateFrom').value,
            dateTo: document.getElementById('filterDateTo').value,
            tournament: document.getElementById('filterTournament').value
        };

        this.currentPage = 1;
        this.renderMatches();
    },

    resetFilters: function() {
        document.getElementById('filterTeam').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterTournament').value = '';

        this.filters = {
            team: '',
            dateFrom: '',
            dateTo: '',
            tournament: ''
        };

        this.currentPage = 1;
        this.renderMatches();
    },

    getFilteredMatches: function() {
        return this.matches.filter(match => {
            // Filtrar por equipo
            if (this.filters.team) {
                if (match.localTeam !== this.filters.team && match.rivalTeam !== this.filters.team) {
                    return false;
                }
            }

            // Filtrar por torneo
            if (this.filters.tournament && !match.tournament.toLowerCase().includes(this.filters.tournament.toLowerCase())) {
                return false;
            }

            // Filtrar por fecha
            const matchDate = new Date(match.date);
            
            if (this.filters.dateFrom) {
                const filterDate = new Date(this.filters.dateFrom);
                if (matchDate < filterDate) {
                    return false;
                }
            }

            if (this.filters.dateTo) {
                const filterDate = new Date(this.filters.dateTo);
                if (matchDate > filterDate) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    renderMatches: function() {
        const filteredMatches = this.getFilteredMatches();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedMatches = filteredMatches.slice(startIndex, startIndex + this.itemsPerPage);

        // Renderizar partidos
        const matchesContainer = document.getElementById('matchesContainer');
        matchesContainer.innerHTML = paginatedMatches.map(match => this.renderMatchCard(match)).join('');

        // Actualizar controles de paginación
        this.updatePaginationControls(filteredMatches.length);

        // Actualizar contador de resultados
        document.getElementById('resultsCount').textContent = `Mostrando ${startIndex + 1}-${Math.min(startIndex + this.itemsPerPage, filteredMatches.length)} de ${filteredMatches.length} partidos`;
    },

    renderMatchCard: function(match) {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calcular goles
        const homeGoals = match.events.filter(e => e.type === 'Gol' && e.team === match.localTeam).length;
        const awayGoals = match.events.filter(e => e.type === 'Gol' && e.team === match.rivalTeam).length;

        // Verificar permisos para editar
        const canEdit = Auth.hasRole('admin') || 
                       Auth.hasFunction('coordinador') || 
                       (Auth.hasFunction('entrenador') && Auth.currentUser.team === match.localTeam) || 
                       (Auth.hasFunction('delegado') && Auth.currentUser.team === match.localTeam);

        return `
            <div class="match-card">
                <div class="match-header">
                    <h3>${match.tournament}</h3>
                    <span class="match-date">${formattedDate}</span>
                </div>
                <div class="match-teams">
                    <div class="team ${Auth.currentUser.team === match.localTeam ? 'user-team' : ''}">
                        <span class="team-name">${match.localTeam}</span>
                        <span class="team-score">${homeGoals}</span>
                    </div>
                    <div class="vs">vs</div>
                    <div class="team ${Auth.currentUser.team === match.rivalTeam ? 'user-team' : ''}">
                        <span class="team-score">${awayGoals}</span>
                        <span class="team-name">${match.rivalTeam}</span>
                    </div>
                </div>
                <div class="match-summary">
                    ${match.summary || 'Sin resumen disponible'}
                </div>
                <div class="match-actions">
                    <button class="btn view-match" data-matchid="${match.id}">Ver detalles</button>
                    ${canEdit ? `<button class="btn edit-match" data-matchid="${match.id}">Editar</button>` : ''}
                </div>
            </div>
        `;
    },

    updatePaginationControls: function(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = totalPages;

        document.getElementById('prevPage').disabled = this.currentPage <= 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('matchesContainer')) {
        MatchHistory.init();
    }

    // Delegación de eventos para los botones dinámicos
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-match')) {
            const matchId = e.target.dataset.matchid;
            window.location.href = `stats.html?match=${matchId}`;
        }

        if (e.target.classList.contains('edit-match')) {
            const matchId = e.target.dataset.matchid;
            window.location.href = `stats.html?edit=${matchId}`;
        }
    });
});