document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const userList = document.getElementById("userList");
  const equipoSelect = document.getElementById("equipo");

  // Cargar equipos desde localStorage
  const equipos = JSON.parse(localStorage.getItem("equipos")) || [];
  equipos.forEach(eq => {
    const opt = document.createElement("option");
    opt.value = eq.nombre;
    opt.textContent = eq.nombre;
    equipoSelect.appendChild(opt);
  });

  // Cargar usuarios
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  function guardarUsuarios() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  function mostrarUsuarios() {
    userList.innerHTML = "";
    usuarios.forEach((usuario, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${usuario.username}</strong> (${usuario.rol}) - ${usuario.funcion} - Equipo: ${usuario.equipo}
        <button onclick="eliminarUsuario(${index})">Eliminar</button>
      `;
      userList.appendChild(li);
    });
  }

  window.eliminarUsuario = function (index) {
    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      usuarios.splice(index, 1);
      guardarUsuarios();
      mostrarUsuarios();
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevoUsuario = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      equipo: document.getElementById("equipo").value,
      funcion: document.getElementById("funcion").value,
      rol: document.getElementById("rol").value
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios();
    form.reset();
    mostrarUsuarios();
  });

  mostrarUsuarios();
});
