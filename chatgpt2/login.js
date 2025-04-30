document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const response = await fetch("data/usuarios.json");
  const users = await response.json();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    sessionStorage.setItem("user", JSON.stringify(user));
    window.location.href = "estadisticas.html";
  } else {
    document.getElementById("errorMessage").textContent = "Credenciales inválidas";
  }
});
