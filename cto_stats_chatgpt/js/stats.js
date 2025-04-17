// Cargar información del partido
const matchInfo = JSON.parse(localStorage.getItem('matchInfo')) || {};
document.getElementById('team-local').textContent = matchInfo.local || '';
document.getElementById('team-rival').textContent = matchInfo.rival || '';
document.getElementById('match-date').textContent = matchInfo.date || '';
document.getElementById('tournament-name').textContent = matchInfo.tournament || '';

// Lógica del temporizador
let timer = 0;
let timerInterval;
document.getElementById('start-stop-timer').addEventListener('click', function() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    } else {
        timerInterval = setInterval(() => {
            timer++;
            console.log(timer);
        }, 1000);
    }
});

document.getElementById('reset-timer').addEventListener('click', function() {
    clearInterval(timerInterval);
    timerInterval = null;
    timer = 0;
    console.log('Timer Reset');
});

// Guardar el partido en el historial
document.getElementById('save-match').addEventListener('click', function() {
    // Lógica para guardar el partido en localStorage o en el archivo JSON de partidos
});
