document.addEventListener('DOMContentLoaded', function() {
    // Cargar usuarios desde localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Función para mostrar los usuarios
    function loadUsers() {
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';  // Limpiar lista

        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-item');
            userDiv.innerHTML = `
                <p><strong>Usuario:</strong> ${user.username}</p>
                <p><strong>Roles:</strong> ${user.roles.join(', ')}</p>
                <button class="delete-user-btn" data-username="${user.username}">Eliminar</button>
            `;
            userList.appendChild(userDiv);
        });

        // Agregar evento para eliminar usuario
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const usernameToDelete = btn.getAttribute('data-username');
                users = users.filter(user => user.username !== usernameToDelete);
                localStorage.setItem('users', JSON.stringify(users));
                loadUsers();  // Recargar lista de usuarios
            });
        });
    }

    loadUsers();

    // Evento para agregar usuario
    document.getElementById('add-user-btn').addEventListener('click', function() {
        const username = prompt('Nombre de usuario:');
        const password = prompt('Contraseña:');
        const roles = prompt('Roles (separados por coma):').split(',').map(role => role.trim());

        const newUser = {
            username,
            password,
            roles
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();  // Recargar lista de usuarios
    });
});
