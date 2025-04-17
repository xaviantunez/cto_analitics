document.addEventListener("DOMContentLoaded", function() {
    const playerList = document.getElementById("player-list");
    const eventLog = document.getElementById("event-log");
    const addEventButton = document.getElementById("add-event");
    const clearAllButton = document.getElementById("clear-all");

    // Lista de jugadores de ejemplo
    const players = [
        { name: "Jugador 1", position: "Delantero" },
        { name: "Jugador 2", position: "Portero" },
        { name: "Jugador 3", position: "Defensa" },
    ];

    // Mostrar los jugadores
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player.name} - ${player.position}`;
        playerList.appendChild(li);
    });

    // Función para agregar un evento
    addEventButton.addEventListener("click", function() {
        const eventDescription = prompt("Descripción del evento:");
        if (eventDescription) {
            const li = document.createElement("li");
            li.textContent = eventDescription;
            const timestamp = document.createElement("span");
            timestamp.textContent = ` - ${new Date().toLocaleTimeString()}`;
            li.appendChild(timestamp);
            eventLog.appendChild(li);
        }
    });

    // Función para borrar todos los datos
    clearAllButton.addEventListener("click", function() {
        if (confirm("¿Estás seguro de que deseas borrar todos los datos?")) {
            localStorage.clear();
            location.reload();
        }
    });
});
