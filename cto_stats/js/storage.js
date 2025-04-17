// Manejo del almacenamiento local
class FootballStorage {
    constructor() {
        this.teamsKey = 'footballStats_teams';
        this.matchesKey = 'footballStats_matches';
        this.currentMatchKey = 'footballStats_currentMatch';
    }
    
    // Equipos
    saveTeam(teamName, players) {
        const teams = this.getTeams();
        teams[teamName] = players;
        localStorage.setItem(this.teamsKey, JSON.stringify(teams));
    }
    
    getTeams() {
        const teamsJson = localStorage.getItem(this.teamsKey);
        return teamsJson ? JSON.parse(teamsJson) : {};
    }
    
    deleteTeam(teamName) {
        const teams = this.getTeams();
        delete teams[teamName];
        localStorage.setItem(this.teamsKey, JSON.stringify(teams));
    }
    
    // Partidos
    saveMatch(matchData) {
        const matches = this.getMatches();
        const matchId = matchData.localTeam + '_' + matchData.rivalTeam + '_' + Date.now();
        matches[matchId] = matchData;
        localStorage.setItem(this.matchesKey, JSON.stringify(matches));
        return matchId;
    }
    
    getMatches() {
        const matchesJson = localStorage.getItem(this.matchesKey);
        return matchesJson ? JSON.parse(matchesJson) : {};
    }
    
    getMatch(matchId) {
        const matches = this.getMatches();
        return matches[matchId];
    }
    
    deleteMatch(matchId) {
        const matches = this.getMatches();
        delete matches[matchId];
        localStorage.setItem(this.matchesKey, JSON.stringify(matches));
    }
    
    // Partido actual
    saveCurrentMatch(matchData) {
        localStorage.setItem(this.currentMatchKey, JSON.stringify(matchData));
    }
    
    getCurrentMatch() {
        const matchJson = localStorage.getItem(this.currentMatchKey);
        return matchJson ? JSON.parse(matchJson) : null;
    }
    
    clearCurrentMatch() {
        localStorage.removeItem(this.currentMatchKey);
    }
}

const storage = new FootballStorage();