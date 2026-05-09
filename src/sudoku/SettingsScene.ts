import Phaser from 'phaser'
import { getTheme, type Theme } from './theme'

const FONT = "'Hiragino Sans','Noto Sans JP','Segoe UI',system-ui,-apple-system,sans-serif"

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' })
  }

  create() {
    const theme: Theme = getTheme(this.registry.get('theme'))
    this.cameras.main.setBackgroundColor(theme.pageBg)
    document.body.style.backgroundColor = theme.pageBg
    const cx = Number(this.sys.game.config.width) / 2

    const back = this.add.text(10, 10, '← Back', {
      fontSize: '15px', color: theme.backLink, fontFamily: FONT,
    }).setInteractive({ useHandCursor: true })
    back.on('pointerdown', () => this.scene.start('MenuScene'))
    back.on('pointerover', () => back.setAlpha(0.7))
    back.on('pointerout', () => back.setAlpha(1))

    this.add.text(cx, 80, 'Settings', {
      fontSize: '32px', color: theme.textDark, fontFamily: FONT,
    }).setOrigin(0.5)

    this.drawSettingCard(cx, 160, 'Timer', 'timer', theme)
    this.drawThemeSelector(cx, 260, theme)
  }

  private drawSettingCard(cx: number, y: number, label: string, key: string, theme: Theme) {
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
    bg.lineStyle(1.5, theme.primary, 0.5)
    bg.strokeRoundedRect(x, y, w, h, radius)

    const bar = this.add.graphics()
    bar.fillStyle(theme.primary, 1)
    bar.fillRoundedRect(x, y + 8, 4, h - 16, 2)

    this.add.text(cx, y + h / 2, label, {
      fontSize: '20px', color: theme.textDark, fontFamily: FONT,
    }).setOrigin(0.5)

    const valueText = this.add.text(cx + 65, y + h / 2, '', {
      fontSize: '16px', fontFamily: FONT,
    }).setOrigin(0.5)

    const updateValue = () => {
      const s = this.registry.get('settings') || { timer: true }
      const on = s[key]
      valueText.setText(on ? 'ON' : 'OFF')
      valueText.setColor(on ? theme.primaryHex : theme.textMuted)
    }
    updateValue()

    const overlay = this.add.rectangle(cx, y + h / 2, w, h)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001)
    overlay.on('pointerdown', () => {
      const s = this.registry.get('settings') || { timer: true }
      s[key] = !s[key]
      this.registry.set('settings', s)
      updateValue()
    })
    overlay.on('pointerover', () => {
      overlay.setAlpha(0.05).setFillStyle(theme.primary)
    })
    overlay.on('pointerout', () => {
      overlay.setAlpha(0.001)
    })
  }

  private drawThemeSelector(cx: number, y: number, theme: Theme) {
    this.add.text(cx, y, 'Theme', {
      fontSize: '14px', color: theme.textMuted, fontFamily: FONT,
    }).setOrigin(0.5)

    const names = ['Light', 'Dark']
    const keys = ['light', 'dark']
    const w = 100
    const h = 44
    const gap = 12
    const totalW = 2 * w + gap
    const startX = cx - totalW / 2
    const radius = 10
    const current = this.registry.get('theme') || 'light'

    for (let i = 0; i < 2; i++) {
      const xx = startX + i * (w + gap)
      const yy = y + 20
      const selected = keys[i] === current
      const accent = selected ? theme.primary : 0x94a3b8

      const shadow = this.add.graphics()
      shadow.fillStyle(0x000000, 0.06)
      shadow.fillRoundedRect(xx + 2, yy + 2, w, h, radius)

      const bg = this.add.graphics()
      bg.fillStyle(theme.cardBg, 1)
      bg.fillRoundedRect(xx, yy, w, h, radius)
      bg.lineStyle(selected ? 2 : 1, accent, selected ? 0.8 : 0.3)
      bg.strokeRoundedRect(xx, yy, w, h, radius)

      const overlay = this.add.rectangle(xx + w / 2, yy + h / 2, w, h)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001)
      const k = keys[i]
      overlay.on('pointerdown', () => {
        this.registry.set('theme', k)
        this.scene.restart()
      })
      overlay.on('pointerover', () => {
        overlay.setAlpha(0.05).setFillStyle(theme.primary)
      })
      overlay.on('pointerout', () => {
        overlay.setAlpha(0.001)
      })

      this.add.text(xx + w / 2, yy + h / 2, names[i], {
        fontSize: '16px', color: theme.textDark, fontFamily: FONT,
      }).setOrigin(0.5)
    }
  }
}
