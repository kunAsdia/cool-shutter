import { Entity } from './Entity';
import { Scene } from 'phaser';
import { Player } from './Player';

export class Enemy extends Entity {
    protected speed: number;
    protected health: number;
    protected damage: number;
    private player: Player;

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
    }

    update(): void {
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
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health <= 0) {
            this.sprite.destroy();
        }
    }

    getDamage(): number {
        return this.damage;
    }

    protected die(): void {
        this.sprite.destroy();
    }
} 