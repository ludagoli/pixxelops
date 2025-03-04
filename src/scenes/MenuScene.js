import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Menu Scene - Main menu for the game
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
    
    // Create title
    const title = this.add.text(
      this.cameras.main.width / 2,
      120,
      'PixxelOps: SysAdmin Quest',
      {
        fontFamily: 'PixelFont',
        fontSize: '48px',
        fill: gameConfig.colors.secondary,
        stroke: '#000',
        strokeThickness: 6
      }
    );
    title.setOrigin(0.5);
    
    // Add a pixel effect to title with shader
    title.setPipeline('Light2D');
    
    // Create introduction text
    const introText = this.add.text(
      this.cameras.main.width / 2,
      200,
      'Bienvenido a PixxelOps, donde tu misión es convertirte en\nel mejor administrador de sistemas del mundo digital.',
      {
        fontFamily: 'PixelFont',
        fontSize: '20px',
        fill: gameConfig.colors.primary,
        align: 'center'
      }
    );
    introText.setOrigin(0.5);
    
    const missionText = this.add.text(
      this.cameras.main.width / 2,
      260,
      'Como un heroico SysAdmin, te enfrentarás a desafíos de DevOps usando la\nlínea de comandos para resolver problemas técnicos y garantizar que\ntodos los sistemas sigan funcionando sin problemas.',
      {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: '#ffffff',
        align: 'center'
      }
    );
    missionText.setOrigin(0.5);
    
    // Add start button
    const startButton = this.add.text(
      this.cameras.main.width / 2,
      380,
      'Comenzar Aventura',
      {
        fontFamily: 'PixelFont',
        fontSize: '32px',
        fill: '#000000',
        padding: {
          left: 24,
          right: 24,
          top: 12,
          bottom: 12
        },
        backgroundColor: gameConfig.colors.primary
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      startButton.setBackgroundColor('#4aea78');
      startButton.setScale(1.05);
      this.sound.play('click', { volume: 0.5 });
    })
    .on('pointerout', () => {
      startButton.setBackgroundColor(gameConfig.colors.primary);
      startButton.setScale(1);
    })
    .on('pointerdown', () => {
      startButton.setBackgroundColor('#2bb34e');
      startButton.setScale(0.95);
    })
    .on('pointerup', () => {
      this.sound.play('click', { volume: 0.7 });
      
      // Transition to office scene
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('OfficeScene');
      });
    });
    
    // Add settings button
    const settingsButton = this.add.text(
      this.cameras.main.width / 2,
      450,
      'Configuración',
      {
        fontFamily: 'PixelFont',
        fontSize: '24px',
        fill: '#ffffff',
        padding: {
          left: 18,
          right: 18,
          top: 8,
          bottom: 8
        },
        backgroundColor: '#3a3a5a'
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      settingsButton.setBackgroundColor('#494975');
      this.sound.play('click', { volume: 0.5 });
    })
    .on('pointerout', () => {
      settingsButton.setBackgroundColor('#3a3a5a');
    })
    .on('pointerdown', () => {
      settingsButton.setBackgroundColor('#2a2a45');
    })
    .on('pointerup', () => {
      this.sound.play('click', { volume: 0.7 });
      // Open settings (to be implemented)
      console.log('Settings clicked');
    });
    
    // Add version text
    const versionText = this.add.text(
      10,
      this.cameras.main.height - 30,
      'v1.0.0',
      {
        fontFamily: 'PixelFont',
        fontSize: '16px',
        fill: '#666666'
      }
    );
    
    // Create a pulsing effect for the start button
    this.tweens.add({
      targets: startButton,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      duration: 800
    });
    
    // Add entry animation
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Add keyboard support
    this.input.keyboard.on('keydown-SPACE', () => {
      this.sound.play('click', { volume: 0.7 });
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('OfficeScene');
      });
    });
    
    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.play('click', { volume: 0.7 });
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('OfficeScene');
      });
    });
  }
  
  update() {
    // Any ongoing animations or updates
  }
}