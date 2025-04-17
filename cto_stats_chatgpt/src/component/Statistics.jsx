import React from 'react';

function Statistics({ team }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Estadísticas del Equipo</h2>
      <ul>
        {team.players?.map((player, index) => (
          <li key={index}>
            {player.name} - Minutos jugados: {player.minutesPlayed || 0}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Statistics;
