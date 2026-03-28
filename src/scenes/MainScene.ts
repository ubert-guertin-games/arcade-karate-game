import Phaser from 'phaser';

type ActionType = 'attack' | 'shield' | 'none' | 'iddle';

export class MainScene extends Phaser.Scene {
  private impact!: Phaser.Sound.BaseSound;

  private idx = 0;
  private action: ActionType | '' = '';
  private actionUsed: ActionType[] = [];
  private startGame = false;
  private endGame = false;

  private playerHealth = 100;
  private enemyHealth = 100;
  private enemyActionUsed: ActionType[] = [];

  private iddlePlayer!: Phaser.Physics.Arcade.Sprite;
  private attackPlayer!: Phaser.Physics.Arcade.Sprite;
  private shieldPlayer!: Phaser.Physics.Arcade.Sprite;
  private iddleEnemy!: Phaser.Physics.Arcade.Sprite;
  private attackEnemy!: Phaser.Physics.Arcade.Sprite;
  private shieldEnemy!: Phaser.Physics.Arcade.Sprite;

  private btn1!: Phaser.Physics.Arcade.Sprite;
  private btn2!: Phaser.Physics.Arcade.Sprite;
  private btn3!: Phaser.Physics.Arcade.Sprite;
  private icon1!: Phaser.Physics.Arcade.Sprite;
  private icon2!: Phaser.Physics.Arcade.Sprite;
  private icon3!: Phaser.Physics.Arcade.Sprite;

  private textHealthPlayer!: Phaser.GameObjects.Text;
  private textHealthEnemy!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;

  constructor() {
    super('main');
  }

  private setCursor(type: string): void {
    (this.game.canvas.style as CSSStyleDeclaration).cursor = type;
  }

  private findAction(actionName: ActionType): void {
    if (!this.actionUsed.includes(actionName)) {
      this.action = actionName;
      this.actionUsed.push(actionName);
    }
  }

  private setActiveImage(type: ActionType, isPlayer: boolean): void {
    const sprites = isPlayer
      ? [this.iddlePlayer, this.attackPlayer, this.shieldPlayer]
      : [this.iddleEnemy, this.attackEnemy, this.shieldEnemy];

    sprites.forEach(s => s.setVisible(false));

    const map: Record<ActionType, Phaser.Physics.Arcade.Sprite> = isPlayer
      ? { iddle: this.iddlePlayer, attack: this.attackPlayer, shield: this.shieldPlayer, none: this.iddlePlayer }
      : { iddle: this.iddleEnemy, attack: this.attackEnemy, shield: this.shieldEnemy, none: this.iddleEnemy };

    const animKey = `${type === 'none' ? 'iddle' : type}${isPlayer ? 'Player' : 'Enemy'}`;
    map[type].setVisible(true).anims.play(animKey);
  }

  private generateEnemyActions(): ActionType[] {
    const pool: ActionType[] = ['iddle', 'attack', 'shield'];
    const result: ActionType[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(idx, 1)[0]);
    }
    return result;
  }

  preload(): void {
    this.load.audio('audio:music', 'music/play-again-classic-arcade-game-116820.mp3');
    this.load.audio('audio:impact', 'music/vibrating-thud-39536.mp3');

    this.load.spritesheet('spritesheet:iddle', 'assets/Iddle-170x300.png', { frameWidth: 170, frameHeight: 300 });
    this.load.spritesheet('spritesheet:attack', 'assets/attack-340x300.png', { frameWidth: 340, frameHeight: 300 });
    this.load.spritesheet('spritesheet:shield', 'assets/protection-340x300.png', { frameWidth: 170, frameHeight: 300 });
    this.load.spritesheet('spritesheet:icon', 'assets/icon.png', { frameWidth: 90, frameHeight: 90 });
    this.load.spritesheet('spritesheet:btn', 'assets/btn.png', { frameWidth: 130, frameHeight: 130 });
    this.load.spritesheet('spritesheet:background', 'assets/background-700x1560.png', { frameWidth: 700, frameHeight: 1560 });
  }

  create(): void {
    this.sound.add('audio:music', { volume: 0.5, loop: true }).play();
    this.impact = this.sound.add('audio:impact', { volume: 1, loop: false });

    this.enemyActionUsed = this.generateEnemyActions();

    // Sprites
    const bg = this.physics.add.sprite(0, 0, 'spritesheet:background', 0).setOrigin(0, 0);

    this.iddlePlayer = this.physics.add.sprite(200, 900, 'spritesheet:iddle', 0);
    this.attackPlayer = this.physics.add.sprite(300, 900, 'spritesheet:attack', 0).setVisible(false);
    this.shieldPlayer = this.physics.add.sprite(200, 900, 'spritesheet:shield', 0).setVisible(false);

    this.iddleEnemy = this.physics.add.sprite(500, 900, 'spritesheet:iddle', 2);
    this.attackEnemy = this.physics.add.sprite(400, 900, 'spritesheet:attack', 0).setVisible(false);
    this.shieldEnemy = this.physics.add.sprite(500, 900, 'spritesheet:shield', 0).setVisible(false);

    this.iddleEnemy.flipX = true;
    this.shieldEnemy.flipX = true;

    // Buttons & icons
    this.btn1 = this.physics.add.sprite(60, 1200, 'spritesheet:btn', 0).setOrigin(0, 0);
    this.btn2 = this.physics.add.sprite(285, 1200, 'spritesheet:btn', 1).setOrigin(0, 0);
    this.btn3 = this.physics.add.sprite(510, 1200, 'spritesheet:btn', 2).setOrigin(0, 0);

    this.icon1 = this.physics.add.sprite(-100, -100, 'spritesheet:icon', 0);
    this.icon2 = this.physics.add.sprite(-100, -100, 'spritesheet:icon', 1);
    this.icon3 = this.physics.add.sprite(-100, -100, 'spritesheet:icon', 2);

    // Text
    const textStyle = { fontSize: 80, fontFamily: 'pixelMoney' };
    this.textHealthPlayer = this.add.text(100, 70, '100', textStyle).setTint(0xcc3495);
    this.textHealthEnemy = this.add.text(400, 70, '100', textStyle).setTint(0x6b1fb1);
    this.winText = this.add.text(50, 600, '', textStyle);

    // Animations
    const anims: Array<{ key: string; sheet: string; start: number; end: number; rate: number; repeat: number }> = [
      { key: 'iddleBackground', sheet: 'spritesheet:background', start: 0, end: 1, rate: 1, repeat: -1 },
      { key: 'iddlePlayer',     sheet: 'spritesheet:iddle',      start: 0, end: 1, rate: 3, repeat: -1 },
      { key: 'attackPlayer',    sheet: 'spritesheet:attack',     start: 0, end: 3, rate: 7, repeat: 0  },
      { key: 'shieldPlayer',    sheet: 'spritesheet:shield',     start: 0, end: 2, rate: 5, repeat: 0  },
      { key: 'iddleEnemy',      sheet: 'spritesheet:iddle',      start: 2, end: 3, rate: 3, repeat: -1 },
      { key: 'attackEnemy',     sheet: 'spritesheet:attack',     start: 4, end: 7, rate: 7, repeat: 0  },
      { key: 'shieldEnemy',     sheet: 'spritesheet:shield',     start: 3, end: 5, rate: 5, repeat: 0  },
    ];

    anims.forEach(({ key, sheet, start, end, rate, repeat }) =>
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet, { start, end }), frameRate: rate, repeat })
    );

    bg.anims.play('iddleBackground');
    this.iddlePlayer.anims.play('iddlePlayer');
    this.iddleEnemy.anims.play('iddleEnemy');

    // Button events
    [this.btn1, this.btn2, this.btn3].forEach(btn => {
      btn.setInteractive()
        .on('pointerover', () => { this.setCursor('pointer'); btn.setTint(0xffff00); })
        .on('pointerout',  () => { this.setCursor('default'); btn.setTint(0xffffff); });
    });

    this.btn1.on('pointerdown', () => this.findAction('attack'));
    this.btn2.on('pointerdown', () => this.findAction('shield'));
    this.btn3.on('pointerdown', () => this.findAction('none'));
  }

  update(): void {
    if (this.action !== '') {
      const iconMap: Record<string, Phaser.Physics.Arcade.Sprite> = {
        attack: this.icon1,
        shield: this.icon2,
        none:   this.icon3,
      };
      iconMap[this.action]?.setPosition(this.idx * 170 + 200, 1430);
      this.action = '';
      this.idx++;
    }

    if (this.actionUsed.length === 3 && !this.startGame) {
      this.startGame = true;
      setTimeout(() => this.resolveRound(), 1000);
    }
  }

  private resolveRound(): void {
    for (let i = 0; i < 3; i++) {
      const playerAct = this.actionUsed[i];
      const enemyAct  = this.enemyActionUsed[i];

      // Player turn
      setTimeout(() => {
        const iconMap: Record<string, Phaser.Physics.Arcade.Sprite> = {
          attack: this.icon1, shield: this.icon2, none: this.icon3,
        };
        iconMap[playerAct]?.setPosition(-100, -100);

        if (playerAct === 'attack' || playerAct === 'shield') {
          this.setActiveImage(playerAct, true);
          setTimeout(() => {
            if (playerAct === 'attack' && enemyAct !== 'shield') {
              this.impact.play();
              this.enemyHealth = Math.max(0, this.enemyHealth - 20);
              this.textHealthEnemy.text = this.enemyHealth.toString();
              if (this.enemyHealth === 0) { this.endGame = true; this.winText.text = 'You won!'; }
            }
            this.setActiveImage('iddle', true);
          }, 1000);
        } else {
          this.setActiveImage('iddle', true);
        }
      }, i * 2000);

      // Enemy turn
      setTimeout(() => {
        if (enemyAct === 'attack' || enemyAct === 'shield') {
          this.setActiveImage(enemyAct, false);
          setTimeout(() => {
            if (enemyAct === 'attack' && playerAct !== 'shield') {
              this.impact.play();
              this.playerHealth = Math.max(0, this.playerHealth - 20);
              this.textHealthPlayer.text = this.playerHealth.toString();
              if (this.playerHealth === 0) { this.endGame = true; this.winText.text = 'Game over'; }
            }
            this.setActiveImage('iddle', false);
          }, 1000);
        } else {
          this.setActiveImage('iddle', false);
        }
      }, i * 2000);
    }

    setTimeout(() => {
      if (!this.endGame) {
        this.actionUsed = [];
        this.enemyActionUsed = this.generateEnemyActions();
        this.idx = 0;
        this.startGame = false;
      }
    }, 7000);
  }
}
