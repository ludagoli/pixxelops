import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Boot Scene - First scene that loads basic assets and setups the game
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load minimal assets needed for the loading screen
    this.load.image('logo', 'assets/img/logo.png');
    this.load.image('loading-bar', 'assets/img/loading-bar.png');
    this.load.image('loading-bar-bg', 'assets/img/loading-bar-bg.png');
    
    // Set up loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Cargando...',
      {
        fontFamily: 'PixelFont',
        fontSize: '32px',
        fill: gameConfig.colors.primary
      }
    );
    loadingText.setOrigin(0.5);
    
    // Create loading indicator
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      this.cameras.main.width / 2 - 160,
      this.cameras.main.height / 2,
      320,
      50
    );
    
    // Loading progress handler
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x33de5e, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 10,
        300 * value,
        30
      );
    });
    
    // Loading complete handler
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      
      // Check for saved game data
      if (window.gameState.loadGame()) {
        console.log('Game data loaded successfully');
      } else {
        console.log('No saved game data found');
      }
    });
  }

  create() {
    // Check if we should show the mobile compatibility notice
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const mobileNotice = document.getElementById('pc-compatibility-notice');
      if (mobileNotice) {
        mobileNotice.style.display = 'block';
      }
    }
    
    // Apply game settings
    if (window.gameState.settings) {
      this.sound.volume = window.gameState.settings.soundVolume;
      // Apply other settings as needed
    }
    
    // Proceed to preload scene
    this.scene.start('PreloadScene');
  }
}