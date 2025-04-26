import { Entity } from './Entity';
import { Scene } from 'phaser';
import { Player } from './Player';
import { EnemyHealthBar } from '../components/EnemyHealthBar';
import { HealthPack } from './HealthPack';

export class Enemy extends Entity {
    protected speed: number;
    protected health: number;
    protected damage: number;
    private player: Player;
    private isDead: boolean = false;
    private healthBar: EnemyHealthBar;
    private dropChance: number = 0.3; // 30% шанс выпадения аптечки

    constructor(scene: Scene, x: number, y: number, texture: string, player: Player) {
        super(scene, x, y, texture);
        this.speed = 100;
        this.health = 100;
        this.damage = 10;
        this.player = player;
        
        // Set up physics
        scene.physics.world.enable(this.sprite);
        if (this.sprite.body) {
            this.sprite.setCollideWorldBounds(true);
        }

        // Создаем полоску здоровья
        this.healthBar = new EnemyHealthBar(scene, this);
    }

    update(): void {
        if (this.isDead) return;

        if (this.sprite.body) {
            // Calculate direction to player
            const angle = Phaser.Math.Angle.Between(
                this.sprite.x,
                this.sprite.y,
                this.player.getSprite().x,
                this.player.getSprite().y
            );
            
            // Set velocity towards player
            const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
            this.sprite.setVelocity(velocity.x, velocity.y);
        }   

        // Обновляем полоску здоровья
        this.healthBar.update();
    }

    takeDamage(amount: number): void {
        if (this.isDead) return;

        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    getDamage(): number {
        return this.isDead ? 0 : this.damage;
    }

    public isEnemyDead(): boolean {
        return this.isDead;
    }

    protected die(): void {
        if (this.isDead) return;

        this.isDead = true;
        
        // Отключаем физику
        if (this.sprite.body) {
            this.sprite.body.enable = false;
        }
        
        // Уничтожаем полоску здоровья
        this.healthBar.destroy();
        
        // Проверяем выпадение аптечки
        if (Math.random() < this.dropChance) {
            new HealthPack(this.scene, this.sprite.x, this.sprite.y, this.player);
        }
        
        // Уничтожаем спрайт
        this.sprite.destroy();
    }
} 