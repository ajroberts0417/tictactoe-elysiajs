import { Elysia, t } from 'elysia'
import { initialGameState, move, Position } from './game'
import { createOrJoinGame, games, getCurrentPlayer, getGame, getGameState, leaveGame } from './games'
import { ElysiaWS } from 'elysia/ws'




// this is a key-value store. so just swap to redis.
const gameIndex = {
    1: initialGameState,
    2: initialGameState,
    3: initialGameState
}

const websockets = new Map<string, ElysiaWS>()

const app = new Elysia()
    .get('/', 'Hello Elysia')
    .get('/user/:id', ({ params: { id } }) => id)
    .post('/form', ({ body }) => body)
    .ws('/game', {
        body: t.Object({
            position: t.Number()
        }),
        query: t.Object({
            gameId: t.String()
        }),
        open(ws) {
            // console.log("open", ws.id)
            // console.log(ws.data)
            websockets.set(ws.id, ws) // open the websocket
            const gameId = ws.data.query.gameId
            const result = createOrJoinGame(gameId, ws.id)

            ws.send({
                role: result.role,
                game: result.game.gameState,
                time: Date.now()
            })
        },
        close(ws) {
            leaveGame(ws.id)
            websockets.delete(ws.id)
        },
        message(ws, { message }) {
            // get the next gameState
            const game = getGame(ws.id)
            console.log(game)
            console.log(message)
            console.log(ws.body)

            if (!game) {
                ws.send({ error: 'Game not found' })
                return
            }

            const player = getCurrentPlayer(game, ws.id)
            if (!player) {
                ws.send({ error: 'Not a player in this game' })
                return
            }

            if (game.gameState.currentPlayer !== player.toLowerCase()) {
                ws.send({ error: 'Not your turn' })
                return
            }

            game.gameState = move(ws.body.position as Position, game.gameState)

            // Broadcast the new state to all connected clients
            game.connectionIds.forEach(connectionId => {
                const client = websockets.get(connectionId)
                if (client) {
                    client.send({
                        game: game.gameState,
                        time: Date.now()
                    })
                }
            })
        }
    })
    .listen(3000)


export type AppType = typeof app

console.log("server running on http://localhost:3000")