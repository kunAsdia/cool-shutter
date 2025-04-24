import { Scene } from 'phaser';
import { Player } from '../models/Player';
import { Enemy } from '../models/Enemy';
import { CollisionService } from '../services/CollisionService';
import { GameService } from '../services/GameService';

export class GameScene extends Scene {
    private player!: Player;
    private enemies: Enemy[] = [];
    private collisionService!: CollisionService;
    private gameService!: GameService;
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
        // Загрузка ресурсов
        this.load.svg('player', './assets/images/player.svg');
        this.load.svg('enemy', './assets/images/enemy.svg');
        this.load.svg('projectile', './assets/images/projectile.svg');
    }

    create(): void {
        // Создание игрока
        this.player = new Player(this, 400, 300);
        
        // Инициализация врагов
        this.enemies = [];
        
        // Создание сервисов
        this.collisionService = new CollisionService(
            this.player,
            this.enemies,
            this.player.getProjectiles()
        );
        
        this.gameService = new GameService(this);

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

        // Спавн новых врагов
        if (this.gameService.shouldSpawnEnemy()) {
            this.spawnEnemy();
        }
    }

    private spawnEnemy(): void {
        const x = Phaser.Math.Between(0, this.game.canvas.width);
        const y = Phaser.Math.Between(0, this.game.canvas.height);
        const enemy = new Enemy(this, x, y, 'enemy');
        this.enemies.push(enemy);
    }
} 