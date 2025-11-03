import React, { useState, useEffect } from 'react';
import { Play, Clock, Users, Wifi } from 'lucide-react';

const API_URL = 'http://35.141.83.120:3001';

const GAMES = [
  { id: 'roblox', name: 'Roblox', platform: 'Standalone', image: '🎮' },
  { id: 'beamng', name: 'BeamNG.drive', platform: 'Steam', image: '🚗' },
  { id: 'dbd', name: 'Dead by Daylight', platform: 'Steam', image: '🔦' },
  { id: 'goatsim', name: 'Goat Simulator', platform: 'Steam', image: '🐐' },
  { id: 'warzone', name: 'COD Warzone', platform: 'Steam', image: '🎯' }
];

const ACCESS_CODES = ['ALPHA001', 'BETA002', 'GAMMA003', 'DELTA004', 'ECHO005'];

export default function GameStreamingPlatform() {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [status, setStatus] = useState(null);
  const [userCode, setUserCode] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    if (isAuthenticated) {
      fetchStatus();
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleAccessCode = () => {
    if (ACCESS_CODES.includes(accessCode.toUpperCase())) {
      setIsAuthenticated(true);
      setUserCode(accessCode.toUpperCase());
      setAccessCode('');
    } else {
      alert('Invalid access code!');
    }
  };

  const handlePlayGame = async (game) => {
    try {
      const response = await fetch(`${API_URL}/api/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: game.id,
          player: userCode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
      } else {
        alert(data.message || 'Failed to start game');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to connect to server');
    }
  };

  const formatTime = (startTime, endTime) => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-purple-500">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Game Streaming</h1>
            <p className="text-gray-400">Enter your access code</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="ACCESS CODE"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAccessCode()}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none uppercase"
            />
            <button
              onClick={handleAccessCode}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition"
            >
              Enter
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Available Saturday & Sunday only
          </div>
        </div>
      </div>
    );
  }

  const isWeekend = status?.isWeekend || false;
  const currentSession = status?.currentSession;
  const queue = status?.queue || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-purple-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Game Library</h1>
              <p className="text-gray-400">Select a game to start playing</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Wifi className={isWeekend ? 'text-green-500' : 'text-red-500'} size={20} />
                <span className="text-white font-semibold">
                  {isWeekend ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {!isWeekend && (
                <div className="bg-red-900/50 px-4 py-2 rounded-lg">
                  <span className="text-red-300 font-semibold">Weekend Only</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentSession && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Now Playing: {currentSession.game.name}
                </h3>
                <p className="text-green-300">Player: {currentSession.player}</p>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-lg">
                <Clock className="text-green-400" size={24} />
                <span className="text-3xl font-bold text-white">
                  {formatTime(currentSession.startTime, currentSession.endTime)}
                </span>
              </div>
            </div>
          </div>
        )}

        {queue.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-yellow-400" size={24} />
              <h3 className="text-xl font-bold text-white">Queue ({queue.length})</h3>
            </div>
            <div className="space-y-2">
              {queue.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                  <span className="text-white">#{idx + 1} - {item.game.name}</span>
                  <span className="text-gray-400 text-sm">Player: {item.player}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map(game => (
            <div
              key={game.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition group"
            >
              <div className="aspect-video bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center text-8xl">
                {game.image}
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{game.platform}</p>
                
                <button
                  onClick={() => handlePlayGame(game)}
                  disabled={!isWeekend}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  {currentSession?.player === userCode && currentSession?.gameId === game.id
                    ? 'Playing Now'
                    : currentSession
                    ? 'Join Queue'
                    : 'Play Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>2 hour session limit • Available Saturday & Sunday only</p>
        </div>
      </div>
    </div>
  );
}