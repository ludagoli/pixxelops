import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { OfficeScene } from './scenes/OfficeScene';
import { ChallengesScene } from './scenes/ChallengesScene';
import { TerminalScene } from './scenes/TerminalScene';
import { gameConfig } from './config';

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: gameConfig.width,
  height: gameConfig.height,
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    OfficeScene,
    ChallengesScene,
    TerminalScene
  ]
};

// Initialize the game
window.game = new Phaser.Game(config);

// Global game state
window.gameState = {
  playerName: '',
  completedChallenges: [],
  score: 0,
  currentChallenge: null,
  settings: {
    musicVolume: 0.5,
    soundVolume: 0.7,
    language: 'es'
  },
  
  // Methods
  saveGame() {
    // Save game state to localStorage
    localStorage.setItem('pixxelopsData', JSON.stringify({
      playerName: this.playerName,
      completedChallenges: this.completedChallenges,
      score: this.score,
      settings: this.settings
    }));
  },
  
  loadGame() {
    // Load game state from localStorage
    const savedData = localStorage.getItem('pixxelopsData');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.playerName = data.playerName || '';
      this.completedChallenges = data.completedChallenges || [];
      this.score = data.score || 0;
      this.settings = data.settings || {
        musicVolume: 0.5,
        soundVolume: 0.7,
        language: 'es'
      };
      return true;
    }
    return false;
  }
};