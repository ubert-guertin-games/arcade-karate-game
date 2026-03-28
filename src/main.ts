import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 700,
  height: 1560,
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: false },
  },
};

const game = new Phaser.Game(config);

function resize(): void {
  const canvas = game.canvas;
  const { innerWidth: w, innerHeight: h } = window;
  const ratio = canvas.width / canvas.height;
  const wratio = w / h;
  canvas.style.width  = wratio < ratio ? `${w}px`         : `${h * ratio}px`;
  canvas.style.height = wratio < ratio ? `${w / ratio}px` : `${h}px`;
}

resize();
window.addEventListener('resize', resize);
