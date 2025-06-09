import { useEffect, useState } from 'react';
import socket from './socket';

function App() {
  const [roomId, setRoomId] = useState('');
  const [joinRoomResult, setJoinRoomResult] = useState('');
  const [queueUpdate, setQueueUpdate] = useState('');
  const [patientCalled, setPatientCalled] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [joining, setJoining] = useState(false);

  const joinRoom = () => {
    if (roomId) {
      setJoining(true);
      setJoinRoomResult('');
      
      socket.emit('join-room', { roomId }, (response) => {
        setJoining(false);
        console.log('Join room response', response)
        if (response?.status === 'ok') {
          setJoinRoomResult('Successfully joined the room!');
          setQueueUpdate('');
          setPatientCalled('');
        } else {
          setJoinRoomResult(`Failed to join: ${response?.message || 'Unknown error'}`);
        }
      });
    }
  };

  useEffect(() => {
    // Connection events
    socket.on('connect', () => {
      console.log('connected');
      setConnectionStatus('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection failed:', error);
      setConnectionStatus('Connection failed');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected from server');
    });

    // Custom events
    socket.on('queue-updated', (data) => {
      setQueueUpdate(JSON.stringify(data, null, 2));
    });

    socket.on('patient-called', (data) => {
      setPatientCalled(JSON.stringify(data, null, 2));
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('queue_updated');
      socket.off('patient_called');
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>WebSocket Client</h1>
      <p>Status: <strong>{connectionStatus}</strong></p>

      <div style={{ marginBottom: 10 }}>
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          style={{ marginRight: 10 }}
        />
        <button onClick={joinRoom} disabled={joining}>
          {joining ? (
            <>
              <span className="spinner" /> Joining...
            </>
          ) : (
            'Join Room'
          )}
        </button>
      </div>

      <div>
        <h2>Join Room Result</h2>
        <p>{joinRoomResult}</p>
      </div>

      <div>
        <h2>Queue Updated</h2>
        <pre>{queueUpdate}</pre>
      </div>

      <div>
        <h2>Patient Called</h2>
        <pre>{patientCalled}</pre>
      </div>
    </div>
  );
}

export default App;
