import { useEffect, useState } from 'react'

function generateRoomCode() {
  return 'HYDRA-' + Math.floor(100 + Math.random() * 900)
}

function calculatePenalty(cards, bet) {
  let multiplier = 1

  if (cards >= 13) {
    multiplier = 3
  } else if (cards >= 7) {
    multiplier = 2
  }

  return cards * bet * multiplier
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [roomCode, setRoomCode] = useState(generateRoomCode())
  const [bet, setBet] = useState(10)
  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState([])
  const [winner, setWinner] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('hydra-data')

    if (saved) {
      const data = JSON.parse(saved)
      setHistory(data.history || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'hydra-data',
      JSON.stringify({ history })
    )
  }, [history])

  function addPlayer() {
    if (!playerName.trim()) return

    setPlayers([
      ...players,
      {
        id: Date.now(),
        name: playerName,
        cards: 0,
        total: 0
      }
    ])

    setPlayerName('')
  }

  function updateCards(id, value) {
    setPlayers(
      players.map((p) =>
        p.id === id
          ? { ...p, cards: Number(value) }
          : p
      )
    )
  }

  function calculateRound() {
    const roundResults = []
    let winnerGain = 0

    players.forEach((player) => {
      if (player.name !== winner) {
        const loss = calculatePenalty(player.cards, bet)
        winnerGain += loss

        roundResults.push({
          name: player.name,
          amount: -loss
        })
      }
    })

    roundResults.push({
      name: winner,
      amount: winnerGain
    })

    setResults(roundResults)

    setHistory([
      {
        id: Date.now(),
        winner,
        players,
        results: roundResults
      },
      ...history
    ])

    setScreen('results')
  }

  return (
    <div className="app">
      {screen === 'home' && (
        <>
          <div className="card">
            <div className="title">PROJECT HYDRA</div>
            <div className="subtitle">
              Big 2 Session Tracker
            </div>

            <div className="small">Base Bet Per Card</div>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
            />

            <button
              className="primary"
              onClick={() => setScreen('lobby')}
            >
              CREATE ROOM
            </button>

            <button
              className="secondary"
              onClick={() => setScreen('history')}
            >
              VIEW HISTORY
            </button>
          </div>
        </>
      )}

      {screen === 'lobby' && (
        <>
          <div className="card">
            <div className="title">{roomCode}</div>
            <div className="subtitle">
              Add up to 4 players
            </div>

            <input
              placeholder="Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />

            <button
              className="primary"
              onClick={addPlayer}
            >
              ADD PLAYER
            </button>

            {players.map((player) => (
              <div
                key={player.id}
                className="player-row"
              >
                <div>{player.name}</div>
              </div>
            ))}

            {players.length >= 2 && (
              <button
                className="primary"
                onClick={() => setScreen('game')}
              >
                START SESSION
              </button>
            )}
          </div>
        </>
      )}

      {screen === 'game' && (
        <>
          <div className="card">
            <div className="title">ROUND ENTRY</div>
            <div className="subtitle">
              Enter remaining cards
            </div>

            <div className="small">Winner</div>

            <select
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                marginTop: '10px',
                background: '#1f2937',
                color: 'white',
                border: 'none'
              }}
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
            >
              <option value="">Select Winner</option>

              {players.map((player) => (
                <option
                  key={player.id}
                  value={player.name}
                >
                  {player.name}
                </option>
              ))}
            </select>

            <hr />

            {players.map((player) => (
              <div
                key={player.id}
                className="player-row"
              >
                <div>
                  <div>{player.name}</div>
                  <div className="small">
                    Remaining Cards
                  </div>
                </div>

                <input
                  type="number"
                  min="0"
                  max="13"
                  style={{ width: '80px' }}
                  value={player.cards}
                  onChange={(e) =>
                    updateCards(player.id, e.target.value)
                  }
                />
              </div>
            ))}

            <button
              className="primary"
              onClick={calculateRound}
            >
              CALCULATE ROUND
            </button>
          </div>
        </>
      )}

      {screen === 'results' && (
        <>
          <div className="card">
            <div className="title">ROUND RESULTS</div>

            {results.map((result, index) => (
              <div
                key={index}
                className="player-row"
              >
                <div>{result.name}</div>

                <div
                  className={
                    result.amount > 0
                      ? 'score green'
                      : 'score red'
                  }
                >
                  {result.amount > 0 ? '+' : ''}$
                  {result.amount}
                </div>
              </div>
            ))}

            <button
              className="primary"
              onClick={() => setScreen('game')}
            >
              NEXT ROUND
            </button>

            <button
              className="secondary"
              onClick={() => setScreen('history')}
            >
              VIEW HISTORY
            </button>
          </div>
        </>
      )}

      {screen === 'history' && (
        <>
          <div className="card">
            <div className="title">SESSION HISTORY</div>

            {history.length === 0 && (
              <div className="small">
                No rounds saved yet.
              </div>
            )}

            {history.map((game) => (
              <div
                key={game.id}
                className="player-row"
                style={{
                  display: 'block'
                }}
              >
                <div>
                  <strong>Winner:</strong> {game.winner}
                </div>

                <div className="small">
                  {game.results.map((r) => (
                    <div key={r.name}>
                      {r.name}: {r.amount > 0 ? '+' : ''}$
                      {r.amount}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="primary"
              onClick={() => setScreen('home')}
            >
              BACK HOME
            </button>
          </div>
        </>
      )}
    </div>
  )
}