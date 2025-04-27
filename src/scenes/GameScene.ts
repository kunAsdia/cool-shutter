import { Scene } from 'phaser';
import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { CollisionService } from '../services/CollisionService';
import { GameService } from '../services/GameService';
import { HealthUI } from '../components/HealthUI';
import { RangedEnemy } from '../models/RangedEnemy';

export class GameScene extends Scene {
    private player!: Player;
    private enemies: (Enemy | RangedEnemy)[] = [];
    private collisionService!: CollisionService;
    private gameService!: GameService;
    private healthUI!: HealthUI;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private cursors: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    } = {
        W: {} as Phaser.Input.Keyboard.Key,
        A: {} as Phaser.Input.Keyboard.Key,
        S: {} as Phaser.Input.Keyboard.Key,
        D: {} as Phaser.Input.Keyboard.Key
    };
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private escKey!: Phaser.Input.Keyboard.Key;
    private isPaused: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Загрузка текстур
        this.load.image('player', 'assets/player.svg');
        this.load.image('enemy', 'assets/enemy.svg');
        this.load.image('rangedEnemy', 'assets/rangedEnemy.svg');
        this.load.image('projectile', 'assets/projectile.svg');
        this.load.image('enemyProjectile', 'assets/enemyProjectile.svg');
        this.load.image('healthPack', 'assets/healthPack.svg');
        this.load.image('heart', 'assets/heart.svg');
        
    }

    create(): void {
        // Создание игрока
        this.player = new Player(this, 400, 300);
        
        // Создание UI здоровья
        this.healthUI = new HealthUI(this, this.player);
        
        // Создание текста счета
        this.scoreText = this.add.text(this.game.canvas.width - 16, 16, 'Очки: 0', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setOrigin(1, 0);
        
        // Инициализация врагов
        this.enemies = [];
        
        // Создание сервисов
        this.collisionService = new CollisionService(
            this.player,
            this.enemies,
            this.player.getProjectiles()
        );
        
        this.gameService = new GameService(this);

        // Настройка коллизий
        this.physics.add.collider(this.player.getSprite(), this.walls);
        this.physics.add.collider(this.enemies.map(e => e.getSprite()), this.walls);
        
        // Настройка коллизий для снарядов
        this.physics.add.collider(
            this.player.getProjectiles().map(p => p.getSprite()),
            this.walls,
            (projectileSprite) => {
                const projectile = this.player.getProjectiles().find(p => p.getSprite() === projectileSprite);
                if (projectile) {
                    projectile.destroy();
                }
            }
        );

        // Настройка управления
        if (this.input.keyboard) {
            this.cursors = {
                W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            };
            
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            
            // Добавляем обработчик для клавиши ESC
            this.escKey.on('down', () => {
                if (!this.isPaused) {
                    this.isPaused = true;
                    this.addPauseOverlay();
                    this.physics.pause();
                } else {
                    this.isPaused = false;
                    this.removePauseOverlay();
                    this.physics.resume();
                }
            });
        }

        // Настройка мыши
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.player) {
                this.player.shoot(pointer.x, pointer.y);
            }
        });
    }

    update(): void {
        if (this.isPaused) return;

        // Обновление игрока
        this.player.move(this.cursors);
        
        if (this.spaceKey.isDown) {
            const pointer = this.input.activePointer;
            this.player.dash(pointer.worldX, pointer.worldY, this.cursors);
        }

        // Обновление врагов
        this.enemies.forEach(enemy => enemy.update());

        // Обновление сервисов
        this.collisionService.update();
        this.gameService.update();
        
        // Обновление UI здоровья
        this.healthUI.update();

        // Спавн новых врагов
        if (this.gameService.shouldSpawnEnemy()) {
            this.spawnEnemy();
        }
    }

    public addScore(points: number): void {
        this.score += points;
        this.scoreText.setText(`Очки: ${this.score}`);
    }

    private spawnEnemy(): void {
        const x = Phaser.Math.Between(0, this.game.canvas.width);
        const y = Phaser.Math.Between(0, this.game.canvas.height);
        
        // 20% шанс появления стреляющего врага
        if (Math.random() < 0.2) {
            const rangedEnemy = new RangedEnemy(this, x, y, this.player);
            this.enemies.push(rangedEnemy);
        } else {
            const enemy = new Enemy(this, x, y, 'enemy', this.player);
            this.enemies.push(enemy);
        }
    }

    private addPauseOverlay(): void {
        const overlay = this.add.rectangle(0, 0, this.game.canvas.width, this.game.canvas.height, 0x000000, 0.5);
        overlay.setOrigin(0);
        overlay.setScrollFactor(0);
        
        const pauseText = this.add.text(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            'ПАУЗА',
            {
                fontSize: '64px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        );
        pauseText.setOrigin(0.5);
        pauseText.setScrollFactor(0);
        
        overlay.setData('pauseText', pauseText);
        this.add.existing(overlay);
    }

    private removePauseOverlay(): void {
        const overlays = this.children.list.filter(child => 
            child instanceof Phaser.GameObjects.Rectangle && 
            child.getData('pauseText')
        );
        
        overlays.forEach(overlay => {
            const pauseText = overlay.getData('pauseText');
            pauseText.destroy();
            overlay.destroy();
        });
    }
} 