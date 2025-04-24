import { Scene } from 'phaser';

export abstract class Entity {
    protected scene: Scene;
    protected sprite: Phaser.Physics.Arcade.Sprite;
    protected health: number;
    protected maxHealth: number;
    protected speed: number;
    protected damage: number;

    constructor(scene: Scene, x: number, y: number, texture: string) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 100;
        this.damage = 10;
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public getHealth(): number {
        return this.health;
    }

    public takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) {
            this.die();
        }
    }

    public heal(amount: number): void {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    protected abstract die(): void;

    public update(): void {
        // Базовая логика обновления, может быть переопределена в дочерних классах
    }
} 