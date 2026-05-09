import Phaser from 'phaser'
import { generatePuzzle, checkConflict, isComplete, SIZE } from './sudoku'
import { getTheme, type Theme } from './theme'

const GRID_SIZE = 450
const CELL_SIZE = GRID_SIZE / SIZE
const OFFSET = 40
const CANVAS_W = OFFSET * 2 + GRID_SIZE
const FONT = "'Hiragino Sans','Noto Sans JP','Segoe UI',system-ui,-apple-system,sans-serif"
const BTN_RADIUS = 8

function createRoundedButton(
  scene: Phaser.Scene, x: number, y: number, w: number, h: number,
  radius: number, fillColor: number, strokeColor: number, strokeWidth: number
) {
  const g = scene.add.graphics()
  g.fillStyle(fillColor)
  g.fillRoundedRect(x, y, w, h, radius)
  g.lineStyle(strokeWidth, strokeColor)
  g.strokeRoundedRect(x, y, w, h, radius)
  const overlay = scene.add.rectangle(x + w / 2, y + h / 2, w, h).setInteractive().setAlpha(0.001)
  return { g, overlay }
}

export class BoardScene extends Phaser.Scene {
  private board: number[][] = []
  private given: boolean[][] = []
  private memos: boolean[][][] = []
  private difficulty = 40
  private selectedRow = 0
  private selectedCol = 0
  private memoSelectedNum: number | null = null
  private cellTexts: (Phaser.GameObjects.Text | null)[][] = []
  private cellMemoTexts: (Phaser.GameObjects.Text[] | null)[][] = []
  private numButtons: { g: Phaser.GameObjects.Graphics; overlay: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = []
  private memoButtons: { g: Phaser.GameObjects.Graphics; overlay: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }[] = []
  private completedText!: Phaser.GameObjects.Text
  private highlightGraphics!: Phaser.GameObjects.Graphics
  private bgGraphics!: Phaser.GameObjects.Graphics
  private settings: { timer: boolean } = { timer: true }
  private timerStarted = false
  private startTime = 0
  private timerEvent: Phaser.Time.TimerEvent | null = null
  private timerText!: Phaser.GameObjects.Text
  private theme!: Theme

  constructor() {
    super({ key: 'BoardScene' })
  }

  init(data: { difficulty?: number }) {
    this.difficulty = data.difficulty ?? 40
  }

  create() {
    const saved = this.registry.get('settings')
    this.settings = saved || { timer: true }
    this.theme = getTheme(this.registry.get('theme'))

    this.memoSelectedNum = null
    this.numButtons = []
    this.memoButtons = []
    this.timerStarted = false
    this.startTime = 0
    if (this.timerEvent) {
      this.timerEvent.remove()
      this.timerEvent = null
    }

    const { puzzle } = generatePuzzle(this.difficulty)
    this.board = puzzle
    this.given = puzzle.map(row => row.map(v => v !== 0))
    this.memos = Array.from({ length: SIZE }, () =>
      Array.from({ length: SIZE }, () => Array(9).fill(false))
    )
    this.cellTexts = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
    this.cellMemoTexts = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))

    this.cameras.main.setBackgroundColor(this.theme.pageBg)
    document.body.style.backgroundColor = this.theme.pageBg
    this.drawCard()
    this.drawGrid()
    this.bgGraphics = this.drawBackground()
    this.drawCells()
    this.drawMemos()
    this.highlightGraphics = this.highlightSelection()

    this.completedText = this.add.text(
      OFFSET, OFFSET + GRID_SIZE + 12,
      '', { fontSize: '18px', color: this.theme.completedText, fontFamily: FONT }
    )

    this.drawNumberButtons()
    this.drawMemoButtons()
    this.drawBackLink()
    this.drawTimer()

    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKey(event)
    })
    this.events.once('shutdown', () => {
      this.input.keyboard?.removeAllListeners('keydown')
      if (this.timerEvent) {
        this.timerEvent.remove()
        this.timerEvent = null
      }
    })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const col = Math.floor((pointer.x - OFFSET) / CELL_SIZE)
      const row = Math.floor((pointer.y - OFFSET) / CELL_SIZE)
      if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
        if (this.memoSelectedNum !== null && this.board[row][col] === 0) {
          const idx = this.memoSelectedNum - 1
          this.memos[row][col][idx] = !this.memos[row][col][idx]
          this.selectedRow = row
          this.selectedCol = col
          this.refresh()
        } else {
          this.selectedRow = row
          this.selectedCol = col
          this.refresh()
        }
      }
    })
  }

  private drawCard() {
    const g = this.add.graphics()
    g.fillStyle(0x000000, 0.06)
    g.fillRoundedRect(OFFSET + 3, OFFSET + 3, GRID_SIZE, GRID_SIZE, 6)
    g.fillStyle(this.theme.cardBg, 1)
    g.fillRoundedRect(OFFSET, OFFSET, GRID_SIZE, GRID_SIZE, 6)
    g.lineStyle(1, this.theme.cardBorder)
    g.strokeRoundedRect(OFFSET, OFFSET, GRID_SIZE, GRID_SIZE, 6)
  }

  private drawGrid() {
    const g = this.add.graphics()
    for (let i = 0; i <= SIZE; i++) {
      const pos = OFFSET + i * CELL_SIZE
      const bold = i % 3 === 0
      g.lineStyle(bold ? 3 : 1.5, bold ? this.theme.gridThick : this.theme.gridThin)
      g.lineBetween(pos, OFFSET, pos, OFFSET + GRID_SIZE)
      g.lineBetween(OFFSET, pos, OFFSET + GRID_SIZE, pos)
    }
  }

  private drawCells() {
    const highlightNum = this.board[this.selectedRow][this.selectedCol]
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = this.board[r][c]
        const x = OFFSET + c * CELL_SIZE + CELL_SIZE / 2
        const y = OFFSET + r * CELL_SIZE + CELL_SIZE / 2
        const isGiven = this.given[r][c]
        const conflict = !isGiven && val !== 0 && checkConflict(this.board, r, c)
        const isHighlighted = highlightNum !== 0 && val === highlightNum && (r !== this.selectedRow || c !== this.selectedCol)
        const color = conflict
          ? '#ef4444'
          : isHighlighted
            ? this.theme.primaryHex
            : isGiven
              ? this.theme.cellGiven
              : this.theme.cellUser
        const text = this.add.text(x, y, val !== 0 ? String(val) : '', {
          fontSize: `${CELL_SIZE * 0.5}px`,
          color,
          fontFamily: FONT,
        }).setOrigin(0.5)
        this.cellTexts[r][c] = text
      }
    }
  }

  private drawMemos() {
    const fontSize = Math.floor(CELL_SIZE / 5)
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (this.board[r][c] !== 0) continue
        const hasMemo = this.memos[r][c].some(v => v)
        if (!hasMemo) continue
        const texts: Phaser.GameObjects.Text[] = []
        const baseX = OFFSET + c * CELL_SIZE
        const baseY = OFFSET + r * CELL_SIZE
        for (let n = 1; n <= 9; n++) {
          if (!this.memos[r][c][n - 1]) continue
          const col = (n - 1) % 3
          const row = Math.floor((n - 1) / 3)
          const tx = baseX + col * (CELL_SIZE / 3) + CELL_SIZE / 6
          const ty = baseY + row * (CELL_SIZE / 3) + CELL_SIZE / 6
          const t = this.add.text(tx, ty, String(n), {
            fontSize: `${fontSize}px`,
            color: this.theme.memoText,
            fontFamily: FONT,
          }).setOrigin(0.5)
          texts.push(t)
        }
        this.cellMemoTexts[r][c] = texts
      }
    }
  }

  private drawBackground(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics()
    const num = this.board[this.selectedRow][this.selectedCol]
    const sr = this.selectedRow
    const sc = this.selectedCol
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (r === sr && c === sc) continue
        let alpha = 0
        if (num !== 0 && this.board[r][c] === num) {
          alpha = 0.30
        } else if (r === sr || c === sc) {
          alpha = 0.18
        }
        if (alpha > 0) {
          g.fillStyle(this.theme.primary, alpha)
          g.fillRect(OFFSET + c * CELL_SIZE, OFFSET + r * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      }
    }
    return g
  }

  private highlightSelection(): Phaser.GameObjects.Graphics {
    const g = this.add.graphics()
    g.fillStyle(this.theme.primary, 0.22)
    g.fillRect(
      OFFSET + this.selectedCol * CELL_SIZE,
      OFFSET + this.selectedRow * CELL_SIZE,
      CELL_SIZE, CELL_SIZE
    )
    g.lineStyle(3, this.theme.primary, 1)
    g.strokeRect(
      OFFSET + this.selectedCol * CELL_SIZE,
      OFFSET + this.selectedRow * CELL_SIZE,
      CELL_SIZE, CELL_SIZE
    )
    return g
  }

  private drawBackLink() {
    const text = this.add.text(10, 10, '← Back', {
      fontSize: '15px', color: this.theme.backLink, fontFamily: FONT,
    }).setInteractive({ useHandCursor: true })
    text.on('pointerdown', () => this.scene.start('MenuScene'))
    text.on('pointerover', () => text.setAlpha(0.7))
    text.on('pointerout', () => text.setAlpha(1))
  }

  private drawTimer() {
    if (!this.settings.timer) return
    this.timerText = this.add.text(CANVAS_W - 10, 12, '00:00', {
      fontSize: '15px', color: this.theme.timerText, fontFamily: FONT,
    }).setOrigin(1, 0)
  }

  private updateTimer() {
    if (!this.timerStarted) return
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const min = String(Math.floor(elapsed / 60)).padStart(2, '0')
    const sec = String(elapsed % 60).padStart(2, '0')
    this.timerText.setText(`${min}:${sec}`)
  }

  private drawNumberButtons() {
    const btnSize = CELL_SIZE - 4
    const gap = 4
    const totalW = 10 * btnSize + 9 * gap
    const startX = (CANVAS_W - totalW) / 2
    const y = OFFSET + GRID_SIZE + 50

    for (let i = 1; i <= 9; i++) {
      const x = startX + (i - 1) * (btnSize + gap)
      const idx = i
      const full = this.isNumberFull(idx)
      const { g, overlay } = createRoundedButton(
        this, x, y, btnSize, btnSize, BTN_RADIUS,
        full ? this.theme.numBtnFullBg : this.theme.numBtnBg,
        full ? this.theme.numBtnFullBorder : this.theme.numBtnBorder, 1.5
      )
      overlay.on('pointerdown', () => {
        if (this.isNumberFull(idx)) return
        this.placeNumber(idx)
      })
      overlay.on('pointerover', () => {
        if (!this.isNumberFull(idx)) overlay.setAlpha(0.08).setFillStyle(this.theme.primary)
      })
      overlay.on('pointerout', () => {
        overlay.setAlpha(0.001)
      })
      const label = this.add.text(x + btnSize / 2, y + btnSize / 2, String(i), {
        fontSize: `${btnSize * 0.55}px`,
        color: full ? this.theme.numBtnFullText : this.theme.numBtnText,
        fontFamily: FONT,
      }).setOrigin(0.5)
      this.numButtons.push({ g, overlay, label })
    }

    const xClose = startX + 9 * (btnSize + gap)
    createRoundedButton(this, xClose, y, btnSize, btnSize, BTN_RADIUS, this.theme.closeBtnBg, this.theme.closeBtnBorder, 1.5)
    const closeOverlay = this.add.rectangle(xClose + btnSize / 2, y + btnSize / 2, btnSize, btnSize)
      .setInteractive().setAlpha(0.001)
    closeOverlay.on('pointerdown', () => this.placeNumber(0))
    closeOverlay.on('pointerover', () => closeOverlay.setAlpha(0.15).setFillStyle(0xef4444))
    closeOverlay.on('pointerout', () => closeOverlay.setAlpha(0.001))
    this.add.text(xClose + btnSize / 2, y + btnSize / 2, '✕', {
      fontSize: `${btnSize * 0.55}px`,
      color: this.theme.closeBtnText, fontFamily: FONT,
    }).setOrigin(0.5)
  }

  private isNumberFull(n: number): boolean {
    let count = 0
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (this.board[r][c] === n) count++
        if (count >= 9) return true
      }
    }
    return false
  }

  private syncNumberButtons() {
    const btnSize = CELL_SIZE - 4
    const gap = 4
    const totalW = 10 * btnSize + 9 * gap
    const startX = (CANVAS_W - totalW) / 2
    const y = OFFSET + GRID_SIZE + 50

    for (let i = 0; i < 9; i++) {
      const full = this.isNumberFull(i + 1)
      const x = startX + i * (btnSize + gap)
      const btn = this.numButtons[i]
      btn.g.clear()
      btn.g.fillStyle(full ? this.theme.numBtnFullBg : this.theme.numBtnBg)
      btn.g.fillRoundedRect(x, y, btnSize, btnSize, BTN_RADIUS)
      btn.g.lineStyle(1.5, full ? this.theme.numBtnFullBorder : this.theme.numBtnBorder)
      btn.g.strokeRoundedRect(x, y, btnSize, btnSize, BTN_RADIUS)
      btn.label.setColor(full ? this.theme.numBtnFullText : this.theme.numBtnText)
    }
  }

  private drawMemoButtons() {
    const btnSize = CELL_SIZE - 4
    const gap = 4
    const totalW = 10 * btnSize + 9 * gap
    const startX = (CANVAS_W - totalW) / 2
    const y = OFFSET + GRID_SIZE + 105

    for (let i = 1; i <= 9; i++) {
      const x = startX + (i - 1) * (btnSize + gap)
      const idx = i
      const { g, overlay } = createRoundedButton(
        this, x, y, btnSize, btnSize, BTN_RADIUS, this.theme.memoBtnBg, this.theme.memoBtnBorder, 1.5
      )
      overlay.on('pointerdown', () => {
        this.memoSelectedNum = this.memoSelectedNum === idx ? null : idx
        this.updateMemoButtonHighlights()
      })
      overlay.on('pointerover', () => {
        overlay.setAlpha(0.12).setFillStyle(0x22c55e)
      })
      overlay.on('pointerout', () => {
        overlay.setAlpha(0.001)
      })
      const label = this.add.text(x + btnSize / 2, y + btnSize / 2, String(i), {
        fontSize: `${btnSize * 0.55}px`,
        color: this.theme.memoBtnText,
        fontFamily: FONT,
      }).setOrigin(0.5)
      this.memoButtons.push({ g, overlay, label })
    }

    const xClose = startX + 9 * (btnSize + gap)
    createRoundedButton(this, xClose, y, btnSize, btnSize, BTN_RADIUS, this.theme.closeBtnBg, this.theme.closeBtnBorder, 1.5)
    const closeOverlay = this.add.rectangle(xClose + btnSize / 2, y + btnSize / 2, btnSize, btnSize)
      .setInteractive().setAlpha(0.001)
    closeOverlay.on('pointerdown', () => {
      const r = this.selectedRow
      const c = this.selectedCol
      if (this.board[r][c] === 0) {
        this.memos[r][c] = Array(9).fill(false)
        this.refresh()
      }
    })
    closeOverlay.on('pointerover', () => closeOverlay.setAlpha(0.15).setFillStyle(0xef4444))
    closeOverlay.on('pointerout', () => closeOverlay.setAlpha(0.001))
    this.add.text(xClose + btnSize / 2, y + btnSize / 2, '✕', {
      fontSize: `${btnSize * 0.55}px`,
      color: this.theme.closeBtnText, fontFamily: FONT,
    }).setOrigin(0.5)
  }

  private updateMemoButtonHighlights() {
    const btnSize = CELL_SIZE - 4
    const gap = 4
    const totalW = 10 * btnSize + 9 * gap
    const startX = (CANVAS_W - totalW) / 2
    const y = OFFSET + GRID_SIZE + 105

    for (let i = 0; i < 9; i++) {
      const selected = this.memoSelectedNum === i + 1
      const x = startX + i * (btnSize + gap)
      const btn = this.memoButtons[i]
      btn.g.clear()
      btn.g.fillStyle(selected ? this.theme.memoBtnSelectedBg : this.theme.memoBtnBg)
      btn.g.fillRoundedRect(x, y, btnSize, btnSize, BTN_RADIUS)
      btn.g.lineStyle(2, selected ? this.theme.memoBtnSelectedBorder : this.theme.memoBtnBorder)
      btn.g.strokeRoundedRect(x, y, btnSize, btnSize, BTN_RADIUS)
    }
  }

  private handleKey(event: KeyboardEvent) {
    const key = event.key
    if (key >= '1' && key <= '9') {
      if (!this.isNumberFull(parseInt(key))) {
        this.placeNumber(parseInt(key))
      }
      return
    }
    if (key === 'Backspace' || key === 'Delete') {
      this.placeNumber(0)
      return
    }
    switch (key) {
      case 'ArrowUp': this.moveSelection(0, -1); break
      case 'ArrowDown': this.moveSelection(0, 1); break
      case 'ArrowLeft': this.moveSelection(-1, 0); break
      case 'ArrowRight': this.moveSelection(1, 0); break
    }
  }

  private moveSelection(dc: number, dr: number) {
    this.selectedCol = Phaser.Math.Clamp(this.selectedCol + dc, 0, SIZE - 1)
    this.selectedRow = Phaser.Math.Clamp(this.selectedRow + dr, 0, SIZE - 1)
    this.refresh()
  }

  private placeNumber(num: number) {
    const r = this.selectedRow
    const c = this.selectedCol
    if (this.given[r][c]) return
    this.board[r][c] = num
    this.memos[r][c] = Array(9).fill(false)
    if (!this.timerStarted && num !== 0 && this.settings.timer) {
      this.timerStarted = true
      this.startTime = Date.now()
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true,
      })
    }
    this.refresh()
    if (num !== 0 && isComplete(this.board)) {
      this.completedText.setText('完成！')
    }
  }

  private refresh() {
    this.cellTexts.forEach(row => row.forEach(t => t?.destroy()))
    this.cellTexts = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
    this.cellMemoTexts.forEach(row => row.forEach(ts => ts?.forEach(t => t.destroy())))
    this.cellMemoTexts = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
    this.bgGraphics.destroy()
    this.highlightGraphics.destroy()
    this.bgGraphics = this.drawBackground()
    this.drawCells()
    this.drawMemos()
    this.highlightGraphics = this.highlightSelection()
    this.syncNumberButtons()
  }
}
