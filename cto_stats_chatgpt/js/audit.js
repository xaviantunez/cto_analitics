document.addEventListener('DOMContentLoaded', function() {
    // Cargar el log de auditoría desde localStorage
    let auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];

    // Función para mostrar el log de auditoría
    function loadAuditLog() {
        const auditLogDiv = document.getElementById('audit-log');
        auditLogDiv.innerHTML = '';  // Limpiar log

        auditLog.forEach(action => {
            const actionDiv = document.createElement('div');
            actionDiv.classList.add('audit-item');
            actionDiv.innerHTML = `
                <p><strong>${action.timestamp}</strong></p>
                <p>${action.action}</p>
            `;
            auditLogDiv.appendChild(actionDiv);
        });
    }

    loadAuditLog();
});
