async function login(username, password) {
  const response = await fetch('data/usuarios.json');
  const usuarios = await response.json();

  const usuario = usuarios.find(u => u.usuario === username && u.contrasena === password);

  if (usuario) {
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    window.location.href = 'menu.html';
  } else {
    document.getElementById('loginError').textContent = 'Usuario o contraseña incorrectos.';
  }
}

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  login(username, password);
});

function logout() {
  sessionStorage.removeItem('usuario');
  window.location.href = 'index.html';
}
