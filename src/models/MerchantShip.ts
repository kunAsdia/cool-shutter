import { Entity } from './Entity';
import { Scene } from 'phaser';
import { Player } from './Player';

export class MerchantShip extends Entity {
    private player: Player;
    private isActive: boolean = false;
    private dialogueBox!: Phaser.GameObjects.Container;
    private dialogueText!: Phaser.GameObjects.Text;
    private dialogueOptions: string[] = [
        "Купить улучшение здоровья (500 очков)",
        "Купить улучшение урона (500 очков)",
        "Уйти"
    ];
    private currentOption: number = 0;

    constructor(scene: Scene, x: number, y: number, player: Player) {
        super(scene, x, y, 'merchantShip');
        this.player = player;
        
        // Set up physics
        scene.physics.world.enable(this.sprite);
        if (this.sprite.body) {
            this.sprite.setCollideWorldBounds(true);
        }

        // Create dialogue box
        this.createDialogueBox();
    }

    private createDialogueBox(): void {
        this.dialogueBox = this.scene.add.container(0, 0);
        this.dialogueBox.setVisible(false);

        const background = this.scene.add.rectangle(
            this.scene.game.canvas.width / 2,
            this.scene.game.canvas.height - 100,
            400,
            150,
            0x000000,
            0.8
        );

        this.dialogueText = this.scene.add.text(
            this.scene.game.canvas.width / 2 - 180,
            this.scene.game.canvas.height - 120,
            'Добро пожаловать в мой магазин!',
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        );

        this.dialogueBox.add([background, this.dialogueText]);
    }

    public update(): void {
        if (!this.isActive) return;

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            this.player.getSprite().x,
            this.player.getSprite().y
        );

        if (distance < 100) {
            this.startDialogue();
        } else {
            this.endDialogue();
        }
    }

    private startDialogue(): void {
        if (!this.isActive) {
            this.isActive = true;
            this.dialogueBox.setVisible(true);
            this.updateDialogueText();
        }
    }

    private endDialogue(): void {
        if (this.isActive) {
            this.isActive = false;
            this.dialogueBox.setVisible(false);
        }
    }

    private updateDialogueText(): void {
        let text = 'Добро пожаловать в мой магазин!\n\n';
        this.dialogueOptions.forEach((option, index) => {
            if (index === this.currentOption) {
                text += `> ${option}\n`;
            } else {
                text += `  ${option}\n`;
            }
        });
        this.dialogueText.setText(text);
    }

    public handleInput(key: string): void {
        if (!this.isActive) return;

        switch (key) {
            case 'W':
                this.currentOption = Math.max(0, this.currentOption - 1);
                this.updateDialogueText();
                break;
            case 'S':
                this.currentOption = Math.min(this.dialogueOptions.length - 1, this.currentOption + 1);
                this.updateDialogueText();
                break;
            case 'ENTER':
                this.processSelection();
                break;
        }
    }

    private processSelection(): void {
        const gameScene = this.scene as any;
        const score = gameScene.getScore ? gameScene.getScore() : 0;

        switch (this.currentOption) {
            case 0: // Health upgrade
                if (score >= 500) {
                    this.player.increaseMaxHealth(50);
                    gameScene.addScore(-500);
                    this.dialogueText.setText('Здоровье улучшено!');
                } else {
                    this.dialogueText.setText('Недостаточно очков!');
                }
                break;
            case 1: // Damage upgrade
                if (score >= 500) {
                    this.player.increaseDamage(10);
                    gameScene.addScore(-500);
                    this.dialogueText.setText('Урон улучшен!');
                } else {
                    this.dialogueText.setText('Недостаточно очков!');
                }
                break;
            case 2: // Leave
                this.endDialogue();
                break;
        }
    }
} 