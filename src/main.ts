import Phaser from 'phaser'
import { MenuScene } from './sudoku/MenuScene'
import { BoardScene } from './sudoku/BoardScene'
import { SettingsScene } from './sudoku/SettingsScene'

const GRID_SIZE = 450
const OFFSET = 40

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: OFFSET * 2 + GRID_SIZE,
  height: OFFSET * 2 + GRID_SIZE + 200,
  parent: 'app',
  backgroundColor: '#fafaf9',
  scene: [],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

const game = new Phaser.Game(config)
document.body.style.backgroundColor = '#fafaf9'
game.registry.set('settings', { timer: true })
game.registry.set('theme', 'light')
game.scene.add('MenuScene', MenuScene, true)
game.scene.add('BoardScene', BoardScene, false)
game.scene.add('SettingsScene', SettingsScene, false)
