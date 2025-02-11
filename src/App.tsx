import { useEffect, useMemo, useRef, useState } from 'react'
import { GameState, initialGameState, move, Position } from '../game'
import './App.css'
import { treaty } from '@elysiajs/eden';
import { AppType } from '../server'
import { v4 as uuidv4 } from 'uuid'
import { EdenWS } from '@elysiajs/eden/treaty';

const api = treaty<AppType>("localhost:3000");
const clientId = uuidv4()

type MyWS = EdenWS<{ body: { position: number; }; params: {}; query: unknown; headers: unknown; response: unknown; }>


function App() {
  const [game, setGame] = useState<GameState>(initialGameState)
  const gameServerRef = useRef<MyWS | null>(null);
  // memoized gameServer connection

  useEffect(() => {
    const gameServer = api.game.subscribe({ query: { gameId: '2' } });
    gameServerRef.current = gameServer;

    // subscribe to the gameServer for updates:
    gameServer.subscribe((message) => {
      console.log("setGame to:", message);
      if (message.data.error === "Not your turn") {
        alert("Not your turn")
      } else {
        if (message.data.game) {
          setGame(message.data.game);
        }
      }
    });

    // the return of a useEffect is its "cleanup function"
    return () => {
      gameServer.close()
      gameServerRef.current = null;
    };
  }, []);


  if (game.result !== "ongoing") {
    return (
      <div>{game.result} Won!</div>
    )
  }


  return (
    <>
      <div className="grid">
        {game.cells.map((cell, index) => (
          <div key={index} className="cell" onClick={() => { gameServerRef.current?.send({ position: index }) }}>{cell}</div>
        ))}
      </div>
    </>
  )
}

export default App;
