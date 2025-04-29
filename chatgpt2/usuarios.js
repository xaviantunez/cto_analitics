document.addEventListener('DOMContentLoaded', () => {
  const createUserForm = document.getElementById('createUserForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rolesSelect = document.getElementById('roles');
  const functionsInput = document.getElementById('functions');
  const usersList = document.getElementById('usersList');

  // Cargar usuarios desde el archivo JSON
  function loadUsers() {
    fetch('data/usuarios.json')
      .then(response => response.json())
      .then(usuarios => {
        usersList.innerHTML = '';
        usuarios.forEach(usuario => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `
            <strong>${usuario.username}</strong> (${usuario.roles.join(', ')})
            <ul>
              <li>Funciones: ${usuario.functions.join(', ')}</li>
            </ul>
            <button onclick="editUser('${usuario.username}')">Editar</button>
            <button onclick="deleteUser('${usuario.username}')">Eliminar</button>
          `;
          usersList.appendChild(listItem);
        });
      });
  }

  // Crear un nuevo usuario
  createUserForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newUsername = usernameInput.value.trim();
    const newPassword = passwordInput.value.trim();
    const newRoles = Array.from(rolesSelect.selectedOptions).map(option => option.value);
    const newFunctions = functionsInput.value.trim().split(',').map(func => func.trim());

    if (newUsername && newPassword && newRoles.length > 0 && newFunctions.length > 0) {
      fetch('data/usuarios.json')
        .then(response => response.json())
        .then(usuarios => {
          usuarios.push({
            username: newUsername,
            password: newPassword,
            roles: newRoles,
            functions: newFunctions
          });
          saveUsers(usuarios);
        });
    }
  });

  // Guardar los usuarios actualizados en el archivo JSON
  function saveUsers(usuarios) {
    fetch('data/usuarios.json', {
      method: 'PUT',
      body: JSON.stringify(usuarios),
    }).then(() => {
      loadUsers();
    });
  }

  // Función para eliminar un usuario
  function deleteUser(username) {
    fetch('data/usuarios.json')
      .then(response => response.json())
      .then(usuarios => {
        const updatedUsers = usuarios.filter(usuario => usuario.username !== username);
        saveUsers(updatedUsers);
      });
  }

  // Cargar los usuarios al iniciar la página
  loadUsers();
});
