import { Scene } from 'phaser';
import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { CollisionService } from '../services/CollisionService';
import { GameService } from '../services/GameService';
import { HealthUI } from '../components/HealthUI';
import { RangedEnemy } from '../models/RangedEnemy';
import { MerchantShip } from '../models/MerchantShip';

export class GameScene extends Scene {
    private player!: Player;
    private enemies: (Enemy | RangedEnemy)[] = [];
    private collisionService!: CollisionService;
    private gameService!: GameService;
    private healthUI!: HealthUI;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private merchantShip: MerchantShip | null = null;
    private shopThreshold: number = 1000; // Очки, необходимые для появления магазина
    private shopActive: boolean = false;
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
    private enterKey!: Phaser.Input.Keyboard.Key;
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
        this.load.image('merchantShip', 'assets/merchantShip.svg');
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
            this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            
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

        // Проверка появления магазина
        if (this.score >= this.shopThreshold && !this.shopActive) {
            this.spawnMerchantShip();
        }

        // Обработка ввода для магазина
        if (this.merchantShip) {
            if (this.cursors.W.isDown) {
                this.merchantShip.handleInput('W');
            }
            if (this.cursors.S.isDown) {
                this.merchantShip.handleInput('S');
            }
            if (this.enterKey.isDown) {
                this.merchantShip.handleInput('ENTER');
            }
        }
    }

    private spawnEnemy(): void {
        // Определяем, с какой стороны экрана появится враг (0: верх, 1: право, 2: низ, 3: лево)
        const side = Phaser.Math.Between(0, 3);
        let x = 0;
        let y = 0;

        switch (side) {
            case 0: // Верх
                x = Phaser.Math.Between(0, this.game.canvas.width);
                y = -50;
                break;
            case 1: // Право
                x = this.game.canvas.width + 50;
                y = Phaser.Math.Between(0, this.game.canvas.height);
                break;
            case 2: // Низ
                x = Phaser.Math.Between(0, this.game.canvas.width);
                y = this.game.canvas.height + 50;
                break;
            case 3: // Лево
                x = -50;
                y = Phaser.Math.Between(0, this.game.canvas.height);
                break;
        }
        
        // 20% шанс появления стреляющего врага
        if (Math.random() < 0.2) {
            const rangedEnemy = new RangedEnemy(this, x, y, this.player);
            this.enemies.push(rangedEnemy);
        } else {
            const enemy = new Enemy(this, x, y, 'enemy', this.player);
            this.enemies.push(enemy);
        }
    }

    private spawnMerchantShip(): void {
        this.shopActive = true;
        
        // Удаляем всех врагов
        this.enemies.forEach(enemy => {
            if (!enemy.isEnemyDead()) {
                enemy.getSprite().destroy();
            }
        });
        this.enemies = [];

        // Создаем торговый корабль за пределами экрана
        const side = Phaser.Math.Between(0, 3);
        let x = 0;
        let y = 0;
        let targetX = 0;
        let targetY = 0;

        switch (side) {
            case 0: // Верх
                x = Phaser.Math.Between(0, this.game.canvas.width);
                y = -200;
                targetX = x;
                targetY = 100;
                break;
            case 1: // Право
                x = this.game.canvas.width + 200;
                y = Phaser.Math.Between(0, this.game.canvas.height);
                targetX = this.game.canvas.width - 100;
                targetY = y;
                break;
            case 2: // Низ
                x = Phaser.Math.Between(0, this.game.canvas.width);
                y = this.game.canvas.height + 200;
                targetX = x;
                targetY = this.game.canvas.height - 100;
                break;
            case 3: // Лево
                x = -200;
                y = Phaser.Math.Between(0, this.game.canvas.height);
                targetX = 100;
                targetY = y;
                break;
        }

        // Создаем торговый корабль
        this.merchantShip = new MerchantShip(this, x, y, this.player);
        
        // Добавляем анимацию въезда
        this.tweens.add({
            targets: this.merchantShip.getSprite(),
            x: targetX,
            y: targetY,
            duration: 2000,
            ease: 'Power2'
        });
    }

    public addScore(amount: number): void {
        this.score += amount;
        this.scoreText.setText(`Очки: ${this.score}`);
    }

    public getScore(): number {
        return this.score;
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