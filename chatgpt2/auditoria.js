document.addEventListener('DOMContentLoaded', () => {
  const userFilter = document.getElementById('userFilter');
  const dateFilter = document.getElementById('dateFilter');
  const teamFilter = document.getElementById('teamFilter');
  const auditList = document.getElementById('auditList');

  // Cargar los usuarios para el filtro
  fetch('data/usuarios.json')
    .then(response => response.json())
    .then(usuarios => {
      usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.username;
        option.textContent = usuario.username;
        userFilter.appendChild(option);
      });
    });

  // Cargar los equipos para el filtro
  fetch('data/equipos.json')
    .then(response => response.json())
    .then(equipos => {
      equipos.forEach(equipo => {
        const option = document.createElement('option');
        option.value = equipo.nombre;
        option.textContent = equipo.nombre;
        teamFilter.appendChild(option);
      });
    });

  // Función para cargar las acciones de auditoría
  function loadAuditActions(userFilterValue = 'all', dateFilterValue = '', teamFilterValue = 'all') {
    fetch('data/auditoria.json')
      .then(response => response.json())
      .then(auditoria => {
        auditList.innerHTML = '';
        const filteredAudit = auditoria.filter(action => {
          const matchUser = userFilterValue === 'all' || action.usuario === userFilterValue;
          const matchDate = !dateFilterValue || action.fecha === dateFilterValue;
          const matchTeam = teamFilterValue === 'all' || action.equipo === teamFilterValue;

          return matchUser && matchDate && matchTeam;
        });

        filteredAudit.forEach(action => {
          const actionItem = document.createElement('div');
          actionItem.classList.add('audit-item');
          actionItem.innerHTML = `
            <p>${action.fecha} - ${action.usuario} - ${action.accion}</p>
            <p>Equipo: ${action.equipo} | Página: ${action.pagina}</p>
          `;
          auditList.appendChild(actionItem);
        });
      });
  }

  // Cargar auditoría inicial
  loadAuditActions();

  // Filtrar auditoría
  document.getElementById('filterForm').addEventListener('submit', (event) => {
    event.preventDefault();
    loadAuditActions(userFilter.value, dateFilter.value, teamFilter.value);
  });
});
