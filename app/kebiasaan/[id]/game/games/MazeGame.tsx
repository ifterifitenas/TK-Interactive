'use client';

import { useState, useEffect, useCallback } from 'react';
import { sfx } from '@/lib/sfx';

interface MazeGameProps {
  onComplete: () => void;
}

// 0=jalan, 1=dinding, 2=power-up, 3=rintangan, 9-12=tujuan agama
const INITIAL_MAZE: number[][] = [
  [0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 2, 1, 0, 12],
  [0, 1, 1, 0, 0, 1, 0],
  [10, 2, 0, 0, 1, 3, 0],
  [1, 0, 1, 0, 0, 0, 1],
  [0, 0, 9, 3, 1, 0, 0],
];

const ROWS = 7;
const COLS = 7;

type Position = { row: number; col: number };

type Religion = {
  id: 'islam' | 'kristen' | 'hindu';
  label: string;
  character: string;
  destination: string;
  destinationLabel: string;
  color: string;
};

type Player = {
  religion: Religion;
  position: Position;
  history: Position[];
  finished: boolean;
};

const RELIGIONS: Religion[] = [
  { id: 'islam', label: 'Islam', character: '🧕', destination: '🕌', destinationLabel: 'masjid', color: '#a07850' },
  { id: 'kristen', label: 'Kristen', character: '👨', destination: '⛪', destinationLabel: 'gereja', color: '#5579b8' },
  { id: 'hindu', label: 'Hindu', character: '🧒', destination: '🛕', destinationLabel: 'pura', color: '#b45d75' },
];

const START_POSITIONS: Position[] = [
  { row: 0, col: 0 },
  { row: 0, col: 3 },
  { row: 6, col: 0 },
];

function createPlayers(): Player[] {
  return RELIGIONS.map((religion, index) => ({
    religion,
    position: START_POSITIONS[index],
    history: [START_POSITIONS[index]],
    finished: false,
  }));
}

function clampPos(pos: Position): Position {
  return {
    row: Math.max(0, Math.min(ROWS - 1, pos.row)),
    col: Math.max(0, Math.min(COLS - 1, pos.col)),
  };
}

export default function MazeGame({ onComplete }: MazeGameProps) {
  const [players, setPlayers] = useState<Player[]>(createPlayers);
  const [selectedReligionId, setSelectedReligionId] = useState<Religion['id']>('islam');
  const [started, setStarted] = useState(false);
  const [maze, setMaze] = useState<number[][]>(() => INITIAL_MAZE.map((row) => [...row]));
  const [points, setPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(false);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [notification, setNotification] = useState('');

  const selectedIndex = RELIGIONS.findIndex((religion) => religion.id === selectedReligionId);
  const selectedPlayer = players[selectedIndex];

  const getGoalCell = (religionId: Religion['id']) => {
    if (religionId === 'islam') return 9;
    if (religionId === 'kristen') return 10;
    return 12;
  };

  const loseLife = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setLives((current) => {
      const next = Math.max(0, current - 1);
      if (next === 0) setGameOver(true);
      return next;
    });
  }, []);

  const showWrongGoalNotification = useCallback((goalLabel: string) => {
    setNotification(`Ini bukan tempat ibadah ${goalLabel}. Pilih tujuan yang sesuai.`);
  }, []);

  const move = useCallback(
    (dr: number, dc: number) => {
      if (!started || finished || gameOver || !selectedPlayer || selectedPlayer.finished) return;

      const current = selectedPlayer.position;
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
        loseLife();
        return;
      }

      const cell = maze[nr][nc];
      if (cell === 1) {
        loseLife();
        return;
      }

      const nextPosition: Position = { row: nr, col: nc };
      let updatedPlayer = selectedPlayer;

      if (cell === 3) {
        loseLife();
        const steps = [...selectedPlayer.history];
        const back = steps.length >= 3 ? steps[steps.length - 3] : steps[0];
        const backedPosition = clampPos(back);
        updatedPlayer = {
          ...selectedPlayer,
          position: backedPosition,
          history: [...steps.slice(-10), backedPosition],
        };
      } else {
        const reachedOwnGoal = cell === getGoalCell(selectedPlayer.religion.id);
        const isAnyGoal = cell >= 9 && cell <= 12;
        if (isAnyGoal && !reachedOwnGoal) {
          showWrongGoalNotification(selectedPlayer.religion.destinationLabel);
          return;
        }
        updatedPlayer = {
          ...selectedPlayer,
          position: nextPosition,
          history: [...selectedPlayer.history.slice(-10), nextPosition],
          finished: reachedOwnGoal || selectedPlayer.finished,
        };

        if (cell === 2) {
          setPoints((value) => value + 20);
          setMaze((currentMaze) => {
            const copy = currentMaze.map((row) => [...row]);
            copy[nr][nc] = 0;
            return copy;
          });
        }
        if (reachedOwnGoal) setPoints((value) => value + 50);
      }

      const nextPlayers = players.map((player, index) =>
        index === selectedIndex ? updatedPlayer : player
      );
      setPlayers(nextPlayers);
      if (nextPlayers.every((player) => player.finished)) setFinished(true);
    },
    [finished, gameOver, loseLife, maze, players, selectedIndex, selectedPlayer, showWrongGoalNotification, started]
  );

  const handleMazeCellClick = (row: number, col: number) => {
    if (!started || finished || gameOver || !selectedPlayer || selectedPlayer.finished) return;

    const target = { row, col };
    const cell = maze[row][col];
    const distance =
      Math.abs(selectedPlayer.position.row - row) +
      Math.abs(selectedPlayer.position.col - col);

    if (distance === 0) return;
    if (distance !== 1) {
      return;
    }

    if (cell === 1) {
      loseLife();
      return;
    }
    if (cell === 3) {
      loseLife();
      return;
    }
    if (cell >= 9 && cell <= 12) {
      if (cell !== getGoalCell(selectedPlayer.religion.id)) {
        showWrongGoalNotification(selectedPlayer.religion.destinationLabel);
        return;
      }
    } else if (cell === 11) {
      loseLife();
      return;
    }

    const reachedOwnGoal = cell === getGoalCell(selectedPlayer.religion.id);
    const updatedPlayer: Player = {
      ...selectedPlayer,
      position: target,
      history: [...selectedPlayer.history.slice(-10), target],
      finished: reachedOwnGoal,
    };

    if (cell === 2) {
      setPoints((value) => value + 20);
      setMaze((currentMaze) => {
        const copy = currentMaze.map((item) => [...item]);
        copy[row][col] = 0;
        return copy;
      });
    }
    if (reachedOwnGoal) setPoints((value) => value + 50);

    const nextPlayers = players.map((player, index) =>
      index === selectedIndex ? updatedPlayer : player
    );
    setPlayers(nextPlayers);
    if (nextPlayers.every((player) => player.finished)) setFinished(true);
  };

  const resetGame = () => {
    setPlayers(createPlayers());
    setSelectedReligionId('islam');
    setStarted(false);
    setMaze(INITIAL_MAZE.map((row) => [...row]));
    setPoints(0);
    setFinished(false);
    setGameOver(false);
    setLives(3);
    setShake(false);
    setNotification('');
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') move(-1, 0);
      else if (event.key === 'ArrowDown') move(1, 0);
      else if (event.key === 'ArrowLeft') move(0, -1);
      else if (event.key === 'ArrowRight') move(0, 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  useEffect(() => {
    if (!notification) return;
    const timeout = setTimeout(() => setNotification(''), 2600);
    return () => clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
    if (gameOver) sfx.failure();
  }, [gameOver]);

  useEffect(() => {
    if (finished) sfx.completion();
  }, [finished]);

  const renderCell = (cell: number, row: number, col: number) => {
    const player = players.find((item) => item.position.row === row && item.position.col === col);
    let content = '';
    let bg = '#f5edd6';
    let border = '1px solid #c8a870';
    const goalReligion =
      cell === 9
        ? RELIGIONS.find((religion) => religion.id === 'islam')
        : cell === 10
          ? RELIGIONS.find((religion) => religion.id === 'kristen')
          : cell === 12
            ? RELIGIONS.find((religion) => religion.id === 'hindu')
            : undefined;

    if (cell === 1) {
      bg = '#a07850';
      border = '1px solid #7a5a34';
    } else if (cell === 2 && !player) {
      content = '✨';
    } else if (cell === 3 && !player) {
      content = '🚧';
    } else if (goalReligion && !player) {
      content = goalReligion.destination;
      border = `2px solid ${goalReligion.color}`;
    }

    if (player) {
      content = player.finished ? '✅' : player.religion.character;
      bg = player.religion.id === selectedReligionId ? '#fce9b0' : '#fff8ec';
      border = `2px solid ${player.religion.color}`;
    }

    return (
      <div
        key={`${row}-${col}`}
        onClick={() => handleMazeCellClick(row, col)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleMazeCellClick(row, col);
          }
        }}
        aria-label={`Kotak baris ${row + 1}, kolom ${col + 1}`}
        style={{
          width: 56,
          height: 56,
          background: bg,
          border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          borderRadius: cell === 1 ? 4 : 6,
          boxSizing: 'border-box',
          cursor: started && !finished && !gameOver ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}
      >
        {content}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5edd6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '16px 8px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, background: '#fff8ec', borderRadius: 16, padding: 14, marginBottom: 14, boxSizing: 'border-box', boxShadow: '0 3px 10px rgba(160,120,80,0.18)' }}>
        <div style={{ color: '#7a5a34', fontSize: 14, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
          Tuntun tiga agama ke tempat ibadahnya
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {players.map((player) => (
            <button
              key={player.religion.id}
              onClick={() => setSelectedReligionId(player.religion.id)}
              style={{
                border: selectedReligionId === player.religion.id ? `3px solid ${player.religion.color}` : '2px solid #e4d7c3',
                background: player.finished ? '#eaf7ed' : selectedReligionId === player.religion.id ? '#fff1d2' : '#fff',
                borderRadius: 12,
                padding: '8px 4px',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#6d5336',
              }}
              aria-pressed={selectedReligionId === player.religion.id}
            >
              <span style={{ display: 'block', fontSize: 25 }}>
                {player.religion.character} → {player.religion.destination}
              </span>
              <span style={{ fontSize: 12 }}>{player.religion.label}{player.finished ? ' ✓' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {!started && (
        <div style={{ width: '100%', maxWidth: 440, background: '#fff8ec', borderRadius: 16, padding: '14px 20px', marginBottom: 16, textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 34 }}>🧕 👨 🧒</div>
          <p style={{ color: '#7a5a34', fontSize: 14, margin: '8px 0 12px' }}>
            Pilih karakter lalu klik kotak maze atau gunakan tombol arah untuk menuju tempat ibadahnya.
          </p>
          <button
            onClick={() => setStarted(true)}
            style={{ background: '#a07850', color: '#fff', border: 'none', borderRadius: 12, padding: '11px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Mulai Maze
          </button>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 440, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#a07850', borderRadius: 14, padding: '10px 20px', marginBottom: 20, color: '#fff', boxShadow: '0 3px 10px rgba(160,120,80,0.4)', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {selectedPlayer?.religion.character} ke {selectedPlayer?.religion.destinationLabel}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700 }}>
          ❤️ {lives} &nbsp; ⭐ {points}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 56px)`,
          gridTemplateRows: `repeat(${ROWS}, 56px)`,
          gap: 2,
          background: '#c8a870',
          borderRadius: 12,
          padding: 6,
          boxShadow: '0 4px 16px rgba(160,120,80,0.35)',
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        {maze.map((row, rowIndex) => row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex)))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 440, marginTop: 14, fontSize: 12, color: '#7a5a34' }}>
        {RELIGIONS.map((religion) => (
          <span key={religion.id}>{religion.character} → {religion.destination}</span>
        ))}
        <span>✨ +20</span>
        <span>🚧 mundur 2</span>
      </div>

      {notification && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            width: 'calc(100% - 32px)',
            maxWidth: 420,
            background: '#fff4c4',
            color: '#795a28',
            border: '2px solid #d6b45a',
            borderRadius: 12,
            padding: '12px 16px',
            textAlign: 'center',
            fontWeight: 700,
            boxShadow: '0 6px 20px rgba(108,76,38,0.25)',
            boxSizing: 'border-box',
          }}
        >
          {notification}
        </div>
      )}

      {gameOver && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(160,120,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff8ec', borderRadius: 20, padding: '36px 48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 48 }}>💔</div>
            <h2 style={{ fontSize: 28, color: '#a07850', margin: '12px 0 6px', fontWeight: 800 }}>Nyawa Habis</h2>
            <p style={{ color: '#7a5a34', fontSize: 16, marginBottom: 20 }}>
              Coba lagi dan pilih jalan yang benar.
            </p>
            <button
              onClick={resetGame}
              style={{ background: '#a07850', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 36px', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
            >
              Ulangi
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(160,120,80,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff8ec', borderRadius: 20, padding: '36px 48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 48 }}>🕌 ⛪ 🛕</div>
            <h2 style={{ fontSize: 28, color: '#a07850', margin: '12px 0 6px', fontWeight: 800 }}>Berhasil!</h2>
            <p style={{ color: '#7a5a34', fontSize: 16, marginBottom: 20 }}>
              Semua karakter sudah sampai ke tempat ibadahnya masing-masing!<br />
              Poin kamu: <strong>{points}</strong>
            </p>
            <button
              onClick={onComplete}
              style={{ background: '#a07850', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 36px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(160,120,80,0.4)' }}
            >
              Lanjut
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
