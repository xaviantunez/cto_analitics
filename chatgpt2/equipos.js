document.addEventListener('DOMContentLoaded', () => {
  const createTeamForm = document.getElementById('createTeamForm');
  const teamNameInput = document.getElementById('teamName');
  const teamsList = document.getElementById('teamsList');
  
  // Cargar equipos desde el archivo JSON
  function loadTeams() {
    fetch('data/equipos.json')
      .then(response => response.json())
      .then(equipos => {
        teamsList.innerHTML = '';
        equipos.forEach(equipo => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
            <strong>${equipo.nombre}</strong>
            <button onclick="editTeam('${equipo.nombre}')">Editar</button>
            <button onclick="deleteTeam('${equipo.nombre}')">Eliminar</button>
            <ul>
              ${equipo.jugadores.map(jugador => `<li>${jugador}</li>`).join('')}
            </ul>
            <button onclick="addPlayer('${equipo.nombre}')">Añadir Jugador</button>
            <button onclick="removePlayer('${equipo.nombre}')">Eliminar Jugador</button>
          `;
          teamsList.appendChild(listItem);
        });
      });
  }

  // Función para crear un nuevo equipo
  createTeamForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTeamName = teamNameInput.value.trim();
    if (newTeamName) {
      fetch('data/equipos.json')
        .then(response => response.json())
        .then(equipos => {
          equipos.push({ nombre: newTeamName, jugadores: [] });
          saveTeams(equipos);
        });
    }
  });

  // Guardar los equipos actualizados en el archivo JSON
  function saveTeams(equipos) {
    fetch('data/equipos.json', {
      method: 'PUT',
      body: JSON.stringify(equipos),
    }).then(() => {
      loadTeams();
    });
  }

  // Función para eliminar un equipo
  function deleteTeam(teamName) {
    fetch('data/equipos.json')
      .then(response => response.json())
      .then(equipos => {
        const updatedTeams = equipos.filter(equipo => equipo.nombre !== teamName);
        saveTeams(updatedTeams);
      });
  }

  // Función para añadir un jugador a un equipo
  function addPlayer(teamName) {
    const playerName = prompt("Introduce el nombre del jugador a añadir:");
    if (playerName) {
      fetch('data/equipos.json')
        .then(response => response.json())
        .then(equipos => {
          const equipo = equipos.find(e => e.nombre === teamName);
          if (equipo) {
            equipo.jugadores.push(playerName);
            saveTeams(equipos);
          }
        });
    }
  }

  // Función para eliminar un jugador de un equipo
  function removePlayer(teamName) {
    const playerName = prompt("Introduce el nombre del jugador a eliminar:");
    if (playerName) {
      fetch('data/equipos.json')
        .then(response => response.json())
        .then(equipos => {
          const equipo = equipos.find(e => e.nombre === teamName);
          if (equipo) {
            equipo.jugadores = equipo.jugadores.filter(jugador => jugador !== playerName);
            saveTeams(equipos);
          }
        });
    }
  }

  // Cargar los equipos al iniciar la página
  loadTeams();
});
