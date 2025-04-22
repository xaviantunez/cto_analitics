
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const contrasena = document.getElementById("contrasena").value;

  if (usuario === "admin" && contrasena === "admin") {
    window.location.href = "html/mantenimiento_usuarios.html";
  } else {
    alert("Credenciales inválidas");
  }
});
