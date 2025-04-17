import React from 'react';

function EventLog({ eventLog, setEventLog }) {
  const addEvent = (description) => {
    const newEvent = {
      description,
      timestamp: new Date().toLocaleTimeString(),
    };
    setEventLog([...eventLog, newEvent]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Registro de Eventos</h2>
      <button onClick={() => addEvent('Gol de jugador 1')} className="bg-green-500 text-white p-2 rounded mb-2">Gol</button>
      <ul>
        {eventLog.map((event, index) => (
          <li key={index}>
            <strong>{event.timestamp}</strong>: {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventLog;
