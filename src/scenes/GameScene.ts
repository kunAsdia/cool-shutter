import { Scene } from 'phaser';
import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { CollisionService } from '../services/CollisionService';
import { GameService } from '../services/GameService';
import { HealthUI } from '../components/HealthUI';

export class GameScene extends Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private collisionService!: CollisionService;
    private gameService!: GameService;
    private healthUI!: HealthUI;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
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
    private shiftKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Загрузка текстур
        this.load.image('player', 'assets/player.svg');
        this.load.image('enemy', 'assets/enemy.svg');
        this.load.image('projectile', 'assets/projectile.svg');
        this.load.image('healthPack', 'assets/healthPack.svg');
        this.load.image('heart', 'assets/heart.svg');
        
    }

    create(): void {

        // Создание игрока
        this.player = new Player(this, 400, 300);
        
        // Создание UI здоровья
        this.healthUI = new HealthUI(this, this.player);
        
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
        }

        // Настройка мыши
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.player) {
                this.player.shoot(pointer.x, pointer.y);
            }
        });
    }

    update(): void {
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

    private spawnEnemy(): void {
        const x = Phaser.Math.Between(0, this.game.canvas.width);
        const y = Phaser.Math.Between(0, this.game.canvas.height);
        const enemy = new Enemy(this, x, y, 'enemy', this.player);
        this.enemies.push(enemy);
    }
} 