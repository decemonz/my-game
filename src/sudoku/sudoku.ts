const SIZE = 9
const BOX_SIZE = 3

export function createEmptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === num) return false
    if (board[i][col] === num) return false
  }
  const br = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const bc = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = br; r < br + BOX_SIZE; r++) {
    for (let c = bc; c < bc + BOX_SIZE; c++) {
      if (board[r][c] === num) return false
    }
  }
  return true
}

function solve(board: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const n of nums) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n
            if (solve(board)) return true
            board[r][c] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

export function generatePuzzle(difficulty: number = 40): { puzzle: number[][]; solution: number[][] } {
  const solution = createEmptyBoard()
  solve(solution)
  const puzzle = solution.map(row => [...row])
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => [Math.floor(i / SIZE), i % SIZE] as [number, number])
  )
  for (let i = 0; i < difficulty; i++) {
    const [r, c] = positions[i]
    puzzle[r][c] = 0
  }
  return { puzzle, solution }
}

export function checkConflict(board: number[][], row: number, col: number): boolean {
  const num = board[row][col]
  if (num === 0) return false
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === num) return true
    if (i !== row && board[i][col] === num) return true
  }
  const br = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const bc = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = br; r < br + BOX_SIZE; r++) {
    for (let c = bc; c < bc + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return true
    }
  }
  return false
}

export function isComplete(board: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false
      if (checkConflict(board, r, c)) return false
    }
  }
  return true
}

export { SIZE, BOX_SIZE }
