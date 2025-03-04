import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Preload Scene - Loads all game assets
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Display a logo
    this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      'logo'
    ).setOrigin(0.5);
    
    // Load images
    this.load.image('office-bg', 'assets/img/office.svg');
    this.load.image('player', 'assets/img/player.svg');
    this.load.image('terminal', 'assets/img/terminal.svg');
    this.load.image('pixel-button', 'assets/img/pixel-button.png');
    this.load.image('terminal-bg', 'assets/img/terminal-bg.png');
    
    // Load spritesheets for animations
    this.load.spritesheet('player-walk', 'assets/img/player-walk.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
    
    // Load UI elements
    this.load.image('panel', 'assets/img/panel.png');
    this.load.image('card', 'assets/img/card.png');
    this.load.image('checkbox', 'assets/img/checkbox.png');
    this.load.image('checkbox-checked', 'assets/img/checkbox-checked.png');
    this.load.image('slider', 'assets/img/slider.png');
    this.load.image('slider-handle', 'assets/img/slider-handle.png');
    
    // Load audio files
    this.load.audio('click', 'assets/audio/click.mp3');
    this.load.audio('type', 'assets/audio/type.mp3');
    this.load.audio('success', 'assets/audio/success.mp3');
    this.load.audio('error', 'assets/audio/error.mp3');
    this.load.audio('background-music', 'assets/audio/background-music.mp3');
    
    // Load json files for challenges, dialog, etc.
    this.load.json('challenges', 'assets/data/challenges.json');
    this.load.json('dialogs', 'assets/data/dialogs.json');
    
    // Define animations
    this.createAnimations();
  }

  createAnimations() {
    // Player animations will be defined here
    // These will be created after loading the spritesheets
  }

  create() {
    // Play background music
    const music = this.sound.add('background-music', {
      volume: window.gameState.settings.musicVolume,
      loop: true
    });
    //music.play();  // Uncomment when music asset is available
    
    // Load game data from config
    // Any data from config or JSON files would be processed here
    
    // Add a small intro animation
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Start with the menu scene after a short delay
    this.time.delayedCall(1000, () => {
      this.scene.start('MenuScene');
    });
  }
}