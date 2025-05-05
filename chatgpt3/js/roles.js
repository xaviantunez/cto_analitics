// roles.js

// Función para cargar la lista de roles desde el archivo usuarios.json
async function cargarRoles() {
  try {
    const respuesta = await fetch('usuarios.json');
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el archivo de usuarios');
    }
    const usuarios = await respuesta.json();
    return usuarios;
  } catch (error) {
    console.error('Error al cargar los roles:', error);
    return [];
  }
}

// Función para asignar una función a un usuario
async function asignarFuncion(usuario, funcion) {
  const usuarios = await cargarRoles();
  
  // Buscar al usuario en el archivo
  const usuarioEncontrado = usuarios.find(u => u.usuario === usuario);
  if (usuarioEncontrado) {
    usuarioEncontrado.funcion = funcion;

    // Guardar la lista de usuarios actualizada
    await actualizarRoles(usuarios);

    alert(`Función "${funcion}" asignada a ${usuario}.`);
  } else {
    alert('Usuario no encontrado.');
  }
}

// Función para actualizar el archivo de usuarios con las funciones
async function actualizarRoles(usuarios) {
  try {
    const respuesta = await fetch('usuarios.json', {
      method: 'PUT', // Método HTTP para actualizar el archivo
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarios)
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo actualizar el archivo de roles');
    }
  } catch (error) {
    console.error('Error al actualizar los roles:', error);
  }
}

// Función para verificar si el usuario tiene permiso para acceder a una página
async function verificarPermiso(usuario, pagina) {
  const usuarios = await cargarRoles();

  const usuarioEncontrado = usuarios.find(u => u.usuario === usuario);

  if (usuarioEncontrado) {
    const permisos = usuarioEncontrado.permisos || [];
    return permisos.includes(pagina);
  } else {
    console.error('Usuario no encontrado.');
    return false;
  }
}

// Función para asignar permisos a un usuario (ejemplo: lectura, escritura)
async function asignarPermisos(usuario, permisos) {
  const usuarios = await cargarRoles();

  const usuarioEncontrado = usuarios.find(u => u.usuario === usuario);

  if (usuarioEncontrado) {
    usuarioEncontrado.permisos = permisos;

    // Guardar la lista de usuarios actualizada
    await actualizarRoles(usuarios);

    alert(`Permisos actualizados para ${usuario}.`);
  } else {
    alert('Usuario no encontrado.');
  }
}

// Función para obtener todos los roles y funciones de los usuarios
async function mostrarRoles() {
  const usuarios = await cargarRoles();
  
  const listaRoles = document.getElementById('listaRoles');
  listaRoles.innerHTML = ''; // Limpiar la lista antes de mostrarla

  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.innerHTML = `${usuario.usuario} - ${usuario.rol} - Función: ${usuario.funcion || 'No asignada'}
                    <button onclick="asignarFuncion('${usuario.usuario}', 'coordinador')">Asignar Coordinador</button>
                    <button onclick="asignarFuncion('${usuario.usuario}', 'delegado')">Asignar Delegado</button>
                    <button onclick="asignarFuncion('${usuario.usuario}', 'entrenador')">Asignar Entrenador</button>
                    <button onclick="asignarFuncion('${usuario.usuario}', 'usuario')">Asignar Usuario</button>`;
    listaRoles.appendChild(li);
  });
}

// Función que se ejecuta cuando se carga la página para mostrar los roles
document.addEventListener("DOMContentLoaded", mostrarRoles);

