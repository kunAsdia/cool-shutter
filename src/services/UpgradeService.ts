import { Scene } from 'phaser';
import { Player } from '../models/Player';

export class UpgradeService {
    private scene: Scene;
    private player: Player;

    constructor(scene: Scene) {
        this.scene = scene;
        // Получаем игрока из основной сцены
        const gameScene = scene.scene.get('GameScene');
        this.player = (gameScene as any).player;
    }

    public upgradeDamage(): void {
        if (!this.player) return;
        // Увеличиваем урон на 20%
        const currentDamage = this.player.getDamage();
        this.player.setDamage(currentDamage * 1.2);
    }

    public upgradeHealth(): void {
        if (!this.player) return;
        // Увеличиваем максимальное здоровье на 25%
        const currentHealth = this.player.getMaxHealth();
        this.player.setMaxHealth(currentHealth * 1.25);
        // Восстанавливаем здоровье до максимума
        this.player.heal(currentHealth * 1.25);
    }

    public upgradeDash(): void {
        if (!this.player) return;
        // Увеличиваем длительность рывка на 30%
        const currentDashDuration = this.player.getDashDuration();
        this.player.setDashDuration(currentDashDuration * 1.3);
    }
} 