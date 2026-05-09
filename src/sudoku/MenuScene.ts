import Phaser from 'phaser'
import { getTheme, type Theme } from './theme'

const FONT = "'Hiragino Sans','Noto Sans JP','Segoe UI',system-ui,-apple-system,sans-serif"

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const theme: Theme = getTheme(this.registry.get('theme'))
    this.cameras.main.setBackgroundColor(theme.pageBg)
    document.body.style.backgroundColor = theme.pageBg
    const cx = Number(this.sys.game.config.width) / 2

    this.add.text(cx, 80, '数独', {
      fontSize: '56px',
      color: theme.textDark,
      fontFamily: FONT,
    }).setOrigin(0.5)

    this.add.text(cx, 135, 'Select Difficulty', {
      fontSize: '16px',
      color: theme.textMuted,
      fontFamily: FONT,
    }).setOrigin(0.5)

    const levels: { label: string; difficulty: number; accent: number }[] = [
      { label: 'Easy', difficulty: 30, accent: 0x10b981 },
      { label: 'Normal', difficulty: 40, accent: 0x6366f1 },
      { label: 'Hard', difficulty: 50, accent: 0xef4444 },
    ]

    for (let i = 0; i < levels.length; i++) {
      const { label, difficulty, accent } = levels[i]
      const y = 210 + i * 80
      const w = 220
      const h = 56
      const x = cx - w / 2
      const radius = 10

      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.06)
      shadow.fillRoundedRect(x + 2, y + 2, w, h, radius)

      const bg = this.add.graphics()
      bg.fillStyle(theme.cardBg, 1)
      bg.fillRoundedRect(x, y, w, h, radius)
      bg.lineStyle(1.5, accent, 0.5)
      bg.strokeRoundedRect(x, y, w, h, radius)

      const bar = this.add.graphics()
      bar.fillStyle(accent, 1)
      bar.fillRoundedRect(x, y + 8, 4, h - 16, 2)

      const overlay = this.add.rectangle(x + w / 2, y + h / 2, w, h)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001)
      const d = difficulty
      overlay.on('pointerdown', () => {
        this.scene.start('BoardScene', { difficulty: d })
      })
      overlay.on('pointerover', () => {
        overlay.setAlpha(0.05).setFillStyle(accent)
      })
      overlay.on('pointerout', () => {
        overlay.setAlpha(0.001)
      })

      this.add.text(cx, y + h / 2, label, {
        fontSize: '20px',
        color: theme.textDark,
        fontFamily: FONT,
      }).setOrigin(0.5)
    }

    const y = 210 + 3 * 80
    const w = 220
    const h = 56
    const x = cx - w / 2
    const radius = 10
    const accent = theme.primary

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.06)
    shadow.fillRoundedRect(x + 2, y + 2, w, h, radius)

    const bg = this.add.graphics()
    bg.fillStyle(theme.cardBg, 1)
    bg.fillRoundedRect(x, y, w, h, radius)
    bg.lineStyle(1.5, accent, 0.4)
    bg.strokeRoundedRect(x, y, w, h, radius)

    const bar = this.add.graphics()
    bar.fillStyle(accent, 1)
    bar.fillRoundedRect(x, y + 8, 4, h - 16, 2)

    const overlay = this.add.rectangle(cx, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
    overlay.on('pointerdown', () => this.scene.start('SettingsScene'))
    overlay.on('pointerover', () => overlay.setAlpha(0.05).setFillStyle(accent))
    overlay.on('pointerout', () => overlay.setAlpha(0.001))

    this.add.text(cx, y + h / 2, 'Settings', {
      fontSize: '20px', color: theme.textDark, fontFamily: FONT,
    }).setOrigin(0.5)
  }
}
