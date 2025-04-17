import React, { useState } from 'react';
import Header from './components/Header';
import PlayerList from './components/PlayerList';
import EventLog from './components/EventLog';
import TeamHistory from './components/TeamHistory';
import Statistics from './components/Statistics';

function App() {
  const [team, setTeam] = useState({});
  const [eventLog, setEventLog] = useState([]);
  const [gameSummary, setGameSummary] = useState('');

  return (
    <div className="p-4">
      <Header team={team} gameSummary={gameSummary} setGameSummary={setGameSummary} />
      <PlayerList team={team} />
      <EventLog eventLog={eventLog} setEventLog={setEventLog} />
      <Statistics team={team} />
      <TeamHistory />
    </div>
  );
}

export default App;
