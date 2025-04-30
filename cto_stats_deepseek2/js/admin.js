// admin.js - Gestión de usuarios, roles y funciones
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos
    loadUsers();
    loadFunctions();

    // Event listeners
    document.getElementById('addUserBtn').addEventListener('click', addUser);
    document.getElementById('addFunctionBtn').addEventListener('click', addFunction);
    //document.getElementById('removeEventType').addEventListener('click', removeFunction);
});

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users'));
    const teams = JSON.parse(localStorage.getItem('teams')) || [];
    const functions = JSON.parse(localStorage.getItem('functions'));
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';

    if(users=="" || users==null) return;
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        // Usuario
        const tdUser = document.createElement('td');
        tdUser.textContent = user.username;
        tr.appendChild(tdUser);
        
        // Rol
        const tdRole = document.createElement('td');
        tdRole.textContent = user.role === 'admin' ? 'Administrador' : 'Usuario';
        tr.appendChild(tdRole);
        
        // Equipo
        const tdTeam = document.createElement('td');
        const teamSelect = document.createElement('select');
        teamSelect.className = 'team-select';
        teamSelect.dataset.username = user.username;
        
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Ninguno';
        teamSelect.appendChild(emptyOption);
        
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team.name;
            option.textContent = team.name;
            option.selected = user.team === team.name;
            teamSelect.appendChild(option);
        });
        
        teamSelect.addEventListener('change', updateUserTeam);
        tdTeam.appendChild(teamSelect);
        tr.appendChild(tdTeam);
        
        // Funciones
        const tdFunctions = document.createElement('td');
        const functionsDiv = document.createElement('div');
        functionsDiv.className = 'user-functions';
        
        functions.forEach(func => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = func;
            checkbox.dataset.username = user.username;
            checkbox.checked = user.functions && user.functions.includes(func);
            checkbox.addEventListener('change', updateUserFunctions);
            
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(func));
            functionsDiv.appendChild(label);
        });
        
        tdFunctions.appendChild(functionsDiv);
        tr.appendChild(tdFunctions);
        
        // Acciones
        const tdActions = document.createElement('td');
        if (user.role !== 'admin') {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.username = user.username;
            deleteBtn.addEventListener('click', deleteUser);
            tdActions.appendChild(deleteBtn);
        }
        tr.appendChild(tdActions);
        
        tbody.appendChild(tr);
    });
}

function loadFunctions() {
    const functions = JSON.parse(localStorage.getItem('functions'));
    const ul = document.getElementById('functionsList');
    ul.innerHTML = '';
    if(functions=="" || functions==null) return;
    functions.forEach(func => {
        const li = document.createElement('li');
        li.textContent = func;
        ul.appendChild(li);
    });
}

function addUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('userRole').value;
    
    if (!username || !password) {
        alert('Por favor, complete todos los campos');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users'));
    if(users!="" && users!=null){        
        if (users.some(u => u.username === username)) {
            alert('El usuario ya existe');
            return;
        }
    }
    
    const newUser = {
        username,
        password,
        role,
        team: null,
        functions: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    logAudit('add_user', `Nuevo usuario creado: ${username}`);
    
    // Limpiar campos
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    
    // Recargar lista
    loadUsers();
}

function deleteUser(e) {
    const username = e.target.dataset.username;
    if (confirm(`¿Está seguro de eliminar al usuario ${username}?`)) {
        const users = JSON.parse(localStorage.getItem('users'));
        const updatedUsers = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        logAudit('delete_user', `Usuario eliminado: ${username}`);
        loadUsers();
    }
}

function updateUserTeam(e) {
    const username = e.target.dataset.username;
    const team = e.target.value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    if (user) {
        user.team = team;
        localStorage.setItem('users', JSON.stringify(users));
        logAudit('update_user_team', `Equipo actualizado para ${username}: ${team || 'Ninguno'}`, team);
    }
}

function updateUserFunctions(e) {
    const username = e.target.dataset.username;
    const func = e.target.value;
    const isChecked = e.target.checked;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username);
    if (user) {
        if (!user.functions) user.functions = [];
        
        if (isChecked && !user.functions.includes(func)) {
            user.functions.push(func);
        } else if (!isChecked) {
            user.functions = user.functions.filter(f => f !== func);
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        logAudit('update_user_functions', `Funciones actualizadas para ${username}: ${user.functions.join(', ')}`, user.team);
    }
}

function addFunction() {
    const newFunc = document.getElementById('newFunction').value.trim();
    if (!newFunc) {
        alert('Por favor, ingrese un nombre para la nueva función');
        return;
    }

    
    const functions = JSON.parse(localStorage.getItem('functions'));
    if(functions!="" && functions!=null){
        if (functions.includes(newFunc)) {
            alert('Esta función ya existe');
            return;
        }
    }
    
    functions.push(newFunc);
    localStorage.setItem('functions', JSON.stringify(functions));
    logAudit('add_function', `Nueva función creada: ${newFunc}`);
    
    // Limpiar campo
    document.getElementById('newFunction').value = '';
    
    // Recargar listas
    loadFunctions();
    loadUsers();
}

function removeFunction() {
    const funcToRemove = document.getElementById('newFunction').value.trim();
    if (!funcToRemove) {
        alert('Por favor, ingrese el nombre de la función a eliminar');
        return;
    }
    
    const functions = JSON.parse(localStorage.getItem('functions'));
    if (!functions.includes(funcToRemove)) {
        alert('Esta función no existe');
        return;
    }
    
    if (confirm(`¿Está seguro de eliminar la función "${funcToRemove}"? Esto afectará a los usuarios que la tengan asignada.`)) {
        const updatedFunctions = functions.filter(f => f !== funcToRemove);
        localStorage.setItem('functions', JSON.stringify(updatedFunctions));
        
        // Actualizar usuarios que tenían esta función
        const users = JSON.parse(localStorage.getItem('users'));
        users.forEach(user => {
            if (user.functions && user.functions.includes(funcToRemove)) {
                user.functions = user.functions.filter(f => f !== funcToRemove);
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
        
        logAudit('remove_function', `Función eliminada: ${funcToRemove}`);
        
        // Limpiar campo
        document.getElementById('newFunction').value = '';
        
        // Recargar listas
        loadFunctions();
        loadUsers();
    }
}
