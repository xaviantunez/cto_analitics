function exportToExcel() {
    const logTable = document.getElementById('log-table');
    const ws = XLSX.utils.table_to_sheet(logTable);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RegistroPartido");
    
    const matchTitle = document.getElementById('match-title').textContent;
    const fileName = matchTitle.replace(/ /g, '_') + '.xlsx';
    
    XLSX.writeFile(wb, fileName);
}