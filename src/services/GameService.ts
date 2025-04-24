import { Scene } from 'phaser';

export class GameService {
    private scene: Scene;
    private level: number;
    private kills: number;
    private killsRequired: number;
    private lastEnemySpawnTime: number;
    private enemySpawnInterval: number;

    constructor(scene: Scene) {
        this.scene = scene;
        this.level = 1;
        this.kills = 0;
        this.killsRequired = 10;
        this.lastEnemySpawnTime = 0;
        this.enemySpawnInterval = 2000; // 2 секунды
    }

    public update(): void {
        // Обновление UI
        this.updateUI();
    }

    public shouldSpawnEnemy(): boolean {
        const now = this.scene.time.now;
        if (now - this.lastEnemySpawnTime >= this.enemySpawnInterval) {
            this.lastEnemySpawnTime = now;
            return true;
        }
        return false;
    }

    public addKill(): void {
        this.kills++;
        if (this.kills >= this.killsRequired) {
            this.levelUp();
        }
    }

    private levelUp(): void {
        this.level++;
        this.kills = 0;
        this.killsRequired = Math.floor(this.killsRequired * 1.5);
        this.enemySpawnInterval = Math.max(500, this.enemySpawnInterval - 100);
        
        // Переход на сцену улучшений
        this.scene.scene.pause();
        this.scene.scene.launch('UpgradeScene');
    }

    private updateUI(): void {
        const levelText = document.getElementById('level-text');
        const killsText = document.getElementById('kills-text');

        if (levelText) {
            levelText.textContent = `Уровень: ${this.level}`;
        }

        if (killsText) {
            killsText.textContent = `Убито: ${this.kills} / ${this.killsRequired}`;
        }
    }

    public getLevel(): number {
        return this.level;
    }

    public getKills(): number {
        return this.kills;
    }

    public getKillsRequired(): number {
        return this.killsRequired;
    }
} 