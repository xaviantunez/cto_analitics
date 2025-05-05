// usuarios.js

// Función para cargar la lista de usuarios desde el archivo usuarios.json
async function cargarUsuarios() {
  try {
    const respuesta = await fetch('usuarios.json'); // Obtener el archivo usuarios.json
    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el archivo de usuarios');
    }
    const usuarios = await respuesta.json();
    return usuarios;
  } catch (error) {
    console.error('Error al cargar los usuarios:', error);
    return [];
  }
}

// Función para agregar un nuevo usuario
async function agregarUsuario() {
  const usuario = document.getElementById('nuevoUsuario').value;
  const contraseña = document.getElementById('nuevaContraseña').value;
  const rol = document.getElementById('nuevoRol').value;

  // Validar que los campos no estén vacíos
  if (!usuario || !contraseña || !rol) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  const nuevoUsuario = {
    "usuario": usuario,
    "contraseña": contraseña,
    "rol": rol
  };

  // Obtener los usuarios existentes
  const usuarios = await cargarUsuarios();
  usuarios.push(nuevoUsuario);

  // Guardar el usuario actualizado en el archivo JSON (esto es solo para demostración)
  // En un entorno real, deberías enviar esta información a un servidor para guardarla en una base de datos
  actualizarUsuarios(usuarios);

  alert('Usuario agregado con éxito!');
  mostrarUsuarios();
}

// Función para eliminar un usuario
async function eliminarUsuario(usuario) {
  // Obtener la lista de usuarios
  const usuarios = await cargarUsuarios();

  // Filtrar el usuario a eliminar
  const usuariosRestantes = usuarios.filter(u => u.usuario !== usuario);

  // Actualizar el archivo JSON con los usuarios restantes
  actualizarUsuarios(usuariosRestantes);

  alert(`Usuario ${usuario} eliminado.`);
  mostrarUsuarios();
}

// Función para actualizar el archivo usuarios.json (esto se hace en un servidor real, no directamente en el navegador)
async function actualizarUsuarios(usuarios) {
  try {
    const respuesta = await fetch('usuarios.json', {
      method: 'PUT', // Método HTTP para actualizar el archivo
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarios)
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo actualizar el archivo de usuarios');
    }
  } catch (error) {
    console.error('Error al actualizar los usuarios:', error);
  }
}

// Función para mostrar la lista de usuarios
async function mostrarUsuarios() {
  const usuarios = await cargarUsuarios();

  const listaUsuarios = document.getElementById('listaUsuarios');
  listaUsuarios.innerHTML = ''; // Limpiar la lista antes de volver a mostrarla

  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.innerHTML = `${usuario.usuario} - ${usuario.rol}
                    <button onclick="eliminarUsuario('${usuario.usuario}')">Eliminar</button>`;
    listaUsuarios.appendChild(li);
  });
}

// Función que se ejecuta cuando se carga la página para mostrar los usuarios
document.addEventListener("DOMContentLoaded", mostrarUsuarios);

