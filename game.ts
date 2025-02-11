

export type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
type Cell = 'x' | 'o' | ''
type Player = 'x' | 'o'
type Result = 'x' | 'o' | 'tie' | 'ongoing'
type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
type WinningPattern = [Position, Position, Position]
export type GameState = {
    cells: Board
    currentPlayer: Player
    result: Result
}

export const initialGameState: GameState = {
    cells: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'x',
    result: 'ongoing'
}

const winningPatterns: WinningPattern[] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

function calculateWin(game: GameState): Result {

    for (const pattern of winningPatterns) {
        const [a, b, c] = pattern
        if (game.cells[a] && game.cells[a] === game.cells[b] && game.cells[a] === game.cells[c]) {
            return game.cells[a] as Result
        }
    }

    if (game.cells.every(cell => cell !== '')) {
        return 'tie'
    }

    return 'ongoing'

}

function nextPlayer(currentPlayer: Player): Player {
    if (currentPlayer === 'x') return 'o'
    return 'x'
}

// take a position and the current game state, calculate the next gamestate
function move(position: Position, prevGame: GameState): GameState {
    const game = structuredClone(prevGame)

    // if it is an invalid move, do nothing at all. Just don't let it happen!
    if (game.cells[position] !== '') return game

    // update the value at cells[position] with game.currentPlayer
    const newCells: Board = [...game.cells]
    newCells[position] = game.currentPlayer
    game.cells = newCells

    // did someone win? if they did:
    const result = calculateWin(game)
    if (result !== 'ongoing') return { ...game, result }


    // if not, return a new game with player as nextPlayer and updated board
    game.currentPlayer = nextPlayer(game.currentPlayer)
    return game
}

export { move }