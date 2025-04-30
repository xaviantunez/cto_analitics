document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  fetch("data/usuarios.json")
    .then(res => res.json())
    .then(users => {
      const user = users.find(u => u.usuario === username && u.contrasena === password);
      if (user) {
        localStorage.setItem("usuario", JSON.stringify(user));
        location.href = "menu.html";
      } else {
        message.textContent = "Usuario o contraseña incorrectos";
      }
    })
    .catch(() => {
      message.textContent = "Error al cargar datos de usuarios";
    });
});
