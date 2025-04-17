import React from 'react';

function Header({ team, gameSummary, setGameSummary }) {
  return (
    <header className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-2xl font-bold">{team.name || 'Equipo'}</h1>
        <p>{team.tournament || 'Torneo'}</p>
        <p>{team.coach || 'Entrenador'} - {team.delegate || 'Delegado'}</p>
      </div>
      <input
        type="text"
        placeholder="Resumen del partido"
        value={gameSummary}
        onChange={(e) => setGameSummary(e.target.value)}
        className="border p-2 rounded"
      />
    </header>
  );
}

export default Header;
