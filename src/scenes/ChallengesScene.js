import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Challenges Scene - Menu for selecting challenges
 */
export class ChallengesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChallengesScene' });
  }
  
  create() {
    // Set background
    this.cameras.main.setBackgroundColor(gameConfig.colors.background);
    
    // Create title
    const title = this.add.text(
      this.cameras.main.width / 2,
      60,
      'Retos de PixxelOps',
      {
        fontFamily: 'PixelFont',
        fontSize: '42px',
        fill: gameConfig.colors.secondary,
        stroke: '#000',
        strokeThickness: 4
      }
    );
    title.setOrigin(0.5);
    
    // Create card container
    const cardsContainer = this.add.container(0, 0);
    
    // Calculate grid layout based on number of challenges
    const challenges = gameConfig.challenges;
    const cardWidth = 220;
    const cardHeight = 300;
    const padding = 20;
    const startX = (this.cameras.main.width - (cardWidth * 2 + padding)) / 2;
    const startY = 150;
    
    // Create challenge cards
    challenges.forEach((challenge, index) => {
      // Calculate position in grid (2 columns)
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      
      // Create card background
      const card = this.add.rectangle(
        x + cardWidth / 2,
        y + cardHeight / 2,
        cardWidth,
        cardHeight,
        0x1a1a2e
      );
      card.setStrokeStyle(4, challenge.available ? 0x33de5e : 0x666666);
      
      // Card container for all elements
      const cardGroup = this.add.container(x, y);
      cardsContainer.add(cardGroup);
      
      // Challenge icon
      const iconText = this.add.text(
        cardWidth / 2,
        30,
        challenge.icon,
        {
          fontFamily: 'Arial',
          fontSize: '36px'
        }
      );
      iconText.setOrigin(0.5);
      cardGroup.add(iconText);
      
      // Challenge title
      const titleText = this.add.text(
        cardWidth / 2,
        70,
        challenge.title,
        {
          fontFamily: 'PixelFont',
          fontSize: '24px',
          fill: gameConfig.colors.secondary,
          align: 'center'
        }
      );
      titleText.setOrigin(0.5);
      cardGroup.add(titleText);
      
      // Difficulty indicator
      const difficultyContainer = this.add.container(cardWidth / 2, 100);
      cardGroup.add(difficultyContainer);
      
      for (let i = 0; i < 3; i++) {
        const dot = this.add.circle(
          (i - 1) * 20,
          0,
          6,
          i < challenge.difficulty ? 0x33de5e : 0x333333
        );
        difficultyContainer.add(dot);
      }
      
      // Challenge description
      const descText = this.add.text(
        cardWidth / 2,
        140,
        challenge.description,
        {
          fontFamily: 'PixelFont',
          fontSize: '16px',
          fill: '#ffffff',
          align: 'center',
          wordWrap: { width: cardWidth - 20 }
        }
      );
      descText.setOrigin(0.5, 0);
      cardGroup.add(descText);
      
      // Status indicator (available or locked)
      let statusText;
      if (!challenge.available) {
        // Add "Próximamente" label for locked challenges
        statusText = this.add.text(
          cardWidth / 2,
          220,
          'PRÓXIMAMENTE',
          {
            fontFamily: 'PixelFont',
            fontSize: '18px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: {
              left: 10,
              right: 10,
              top: 5,
              bottom: 5
            }
          }
        );
        statusText.setOrigin(0.5);
        statusText.setRotation(Math.PI / 12); // Slightly rotated
        cardGroup.add(statusText);
        
        // Add semi-transparent overlay
        const overlay = this.add.rectangle(
          cardWidth / 2,
          cardHeight / 2,
          cardWidth,
          cardHeight,
          0x000000,
          0.4
        );
        cardGroup.add(overlay);
      } else {
        // Add reward for available challenges
        const rewardText = this.add.text(
          cardWidth / 2,
          230,
          `Recompensa: ${challenge.reward} pts`,
          {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            fill: gameConfig.colors.primary
          }
        );
        rewardText.setOrigin(0.5);
        cardGroup.add(rewardText);
        
        // Add play button for available challenges
        const playButton = this.add.text(
          cardWidth / 2,
          270,
          'JUGAR',
          {
            fontFamily: 'PixelFont',
            fontSize: '20px',
            fill: '#000000',
            backgroundColor: gameConfig.colors.primary,
            padding: {
              left: 15,
              right: 15,
              top: 8,
              bottom: 8
            }
          }
        );
        playButton.setOrigin(0.5);
        cardGroup.add(playButton);
        
        // Make card interactive
        card.setInteractive();
        card.on('pointerover', () => {
          card.setStrokeStyle(4, 0x4aea78);
          playButton.setBackgroundColor('#4aea78');
          this.sound.play('click', { volume: 0.5 });
        });
        
        card.on('pointerout', () => {
          card.setStrokeStyle(4, gameConfig.colors.primary);
          playButton.setBackgroundColor(gameConfig.colors.primary);
        });
        
        card.on('pointerdown', () => {
          card.setStrokeStyle(4, 0x2bb34e);
          playButton.setBackgroundColor('#2bb34e');
        });
        
        card.on('pointerup', () => {
          this.startChallenge(challenge.id);
        });
        
        // Make button interactive too
        playButton.setInteractive();
        playButton.on('pointerover', () => {
          card.setStrokeStyle(4, 0x4aea78);
          playButton.setBackgroundColor('#4aea78');
          this.sound.play('click', { volume: 0.5 });
        });
        
        playButton.on('pointerout', () => {
          card.setStrokeStyle(4, gameConfig.colors.primary);
          playButton.setBackgroundColor(gameConfig.colors.primary);
        });
        
        playButton.on('pointerdown', () => {
          playButton.setBackgroundColor('#2bb34e');
        });
        
        playButton.on('pointerup', () => {
          this.startChallenge(challenge.id);
        });
      }
    });
    
    // Add back button
    const backButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      'Volver a la Oficina',
      {
        fontFamily: 'PixelFont',
        fontSize: '20px',
        fill: '#000000',
        backgroundColor: gameConfig.colors.secondary,
        padding: {
          left: 15,
          right: 15,
          top: 8,
          bottom: 8
        }
      }
    );
    backButton.setOrigin(0.5);
    backButton.setInteractive({ useHandCursor: true });
    
    backButton.on('pointerover', () => {
      backButton.setBackgroundColor('#ffad5c');
      this.sound.play('click', { volume: 0.5 });
    });
    
    backButton.on('pointerout', () => {
      backButton.setBackgroundColor(gameConfig.colors.secondary);
    });
    
    backButton.on('pointerdown', () => {
      backButton.setBackgroundColor('#cc7a26');
    });
    
    backButton.on('pointerup', () => {
      this.sound.play('click', { volume: 0.7 });
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('OfficeScene');
      });
    });
    
    // Add entry animation
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Add escape key to go back
    this.input.keyboard.on('keydown-ESC', () => {
      this.sound.play('click', { volume: 0.7 });
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('OfficeScene');
      });
    });
  }
  
  startChallenge(challengeId) {
    this.sound.play('click', { volume: 0.7 });
    
    // Store the current challenge in the game state
    window.gameState.currentChallenge = challengeId;
    
    // Transition to terminal scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('TerminalScene');
    });
  }
}