document.addEventListener('DOMContentLoaded', function() {
    // Cargar partidos desde localStorage
    let matches = JSON.parse(localStorage.getItem('matches')) || [];

    // Función para mostrar los partidos
    function loadMatches() {
        const matchList = document.getElementById('match-list');
        matchList.innerHTML = '';  // Limpiar lista

        matches.forEach(match => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match-item');
            matchDiv.innerHTML = `
                <p><strong>${match.teamLocal} vs ${match.teamRival}</strong></p>
                <p><strong>Fecha:</strong> ${match.date}</p>
                <button class="view-match-btn" data-id="${match.id}">Ver Partidos</button>
            `;
            matchList.appendChild(matchDiv);

            matchDiv.querySelector('.view-match-btn').addEventListener('click', function() {
                window.location.href = `pages/stats.html?id=${match.id}`;  // Redirigir a la página de estadísticas
            });
        });
    }

    loadMatches();
});
