// Datos de usuarios simulados para la autenticación
const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'administrador'
    },
    {
        username: 'user1',
        password: 'password1',
        role: 'usuario'
    },
    {
        username: 'entrenador1',
        password: 'entrenador123',
        role: 'entrenador'
    },
    {
        username: 'delegado1',
        password: 'delegado123',
        role: 'delegado'
    }
];

// Función que maneja el login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Obtenemos los valores del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Comprobamos si el usuario y la contraseña coinciden
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        // Si el usuario es válido, almacenamos su información en el almacenamiento local
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Redirigimos a la página principal del sistema (por ejemplo, la página de estadísticas)
        window.location.href = 'estadisticas.html';
    } else {
        // Si no se encuentra al usuario, mostramos un mensaje de error
        errorMessage.textContent = 'Usuario o contraseña incorrectos. Intenta nuevamente.';
    }
});
