import React from 'react';

function PlayerList({ team }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Jugadores</h2>
      <ul>
        {team.players?.map((player, index) => (
          <li key={index}>
            {player.name} - {player.position} {player.isCaptain && '(Capitán)'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlayerList;
