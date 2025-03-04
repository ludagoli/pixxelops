import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Office Scene - Main gameplay area with grid-based movement
 */
export class OfficeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OfficeScene' });
    
    // Initialize properties
    this.player = null;
    this.cursors = null;
    this.grid = [];
    this.interactiveObjects = [];
    this.notificationText = null;
    this.notificationTimer = null;
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor(gameConfig.colors.dark);
    
    // Create the office background
    this.createOfficeEnvironment();
    
    // Set up interactive objects
    this.createInteractiveAreas();
    
    // Create the player character
    this.createPlayer();
    
    // Set up input controls
    this.setupControls();
    
    // Set up notification system
    this.createNotificationSystem();
    
    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    
    // Show welcome notification
    this.showNotification('🔍 Explora la oficina y encuentra la terminal principal', 4000);
    
    // Add keyboard support for interactions
    this.input.keyboard.on('keydown-E', this.handleInteraction, this);
    
    // Setup physics
    this.physics.world.setBounds(
      0, 0, 
      gameConfig.grid.width * gameConfig.grid.tileSize, 
      gameConfig.grid.height * gameConfig.grid.tileSize
    );
    
    // Add entry animation
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }
  
  createOfficeEnvironment() {
    // Create the background image
    this.add.image(0, 0, 'office-bg')
      .setOrigin(0, 0)
      .setDisplaySize(
        gameConfig.grid.width * gameConfig.grid.tileSize,
        gameConfig.grid.height * gameConfig.grid.tileSize
      );
    
    // Create grid for pathfinding and collision
    this.grid = [];
    for (let y = 0; y < gameConfig.grid.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < gameConfig.grid.width; x++) {
        // Define walkable areas (1 = walkable, 0 = obstacle)
        if (y < 3 || x < 1 || x >= gameConfig.grid.width - 1) {
          // Walls and borders
          this.grid[y][x] = 0;
        } else {
          // Default - walkable floor
          this.grid[y][x] = 1;
        }
      }
    }
    
    // Add objects to grid that block movement
    const obstacles = [
      // Meeting table
      {x: 9, y: 7, width: 6, height: 4},
      // Desks
      {x: 2, y: 4, width: 4, height: 2},
      {x: 2, y: 7, width: 4, height: 2},
      {x: 15, y: 4, width: 4, height: 2},
      {x: 15, y: 7, width: 4, height: 2}
    ];
    
    // Mark obstacles in grid
    obstacles.forEach(obstacle => {
      for (let y = obstacle.y; y < obstacle.y + obstacle.height; y++) {
        for (let x = obstacle.x; x < obstacle.x + obstacle.width; x++) {
          if (y < gameConfig.grid.height && x < gameConfig.grid.width) {
            this.grid[y][x] = 0;
          }
        }
      }
    });
    
    // (Optional) Create debug visualization of grid
    if (false) { // Set to true to see the grid
      for (let y = 0; y < gameConfig.grid.height; y++) {
        for (let x = 0; x < gameConfig.grid.width; x++) {
          const cell = this.add.rectangle(
            x * gameConfig.grid.tileSize + gameConfig.grid.tileSize / 2,
            y * gameConfig.grid.tileSize + gameConfig.grid.tileSize / 2,
            gameConfig.grid.tileSize - 2,
            gameConfig.grid.tileSize - 2,
            this.grid[y][x] === 1 ? 0x00ff00 : 0xff0000
          ).setAlpha(0.3);
        }
      }
    }
  }
  
  createInteractiveAreas() {
    // Create interactive areas from config
    Object.entries(gameConfig.interactiveAreas).forEach(([key, area]) => {
      // Create an interactive zone
      const zone = this.add.zone(
        (area.x + area.width / 2) * gameConfig.grid.tileSize,
        (area.y + area.height / 2) * gameConfig.grid.tileSize,
        area.width * gameConfig.grid.tileSize,
        area.height * gameConfig.grid.tileSize
      );
      
      // Make zone interactive
      zone.setInteractive();
      zone.on('pointerdown', () => {
        this.handleAreaInteraction(key, area);
      });
      
      // Store reference with type and data
      this.interactiveObjects.push({
        id: key,
        object: zone,
        data: area,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height
      });
      
      // Create visual indicator (only for debugging)
      if (false) { // Set to true to see interaction zones
        const rect = this.add.rectangle(
          (area.x + area.width / 2) * gameConfig.grid.tileSize,
          (area.y + area.height / 2) * gameConfig.grid.tileSize,
          area.width * gameConfig.grid.tileSize,
          area.height * gameConfig.grid.tileSize,
          0xffaa00
        ).setAlpha(0.3);
      }
      
      // Add special styling for terminal objects
      if (key.includes('terminal')) {
        const color = key === 'mainTerminal' ? 0x33de5e : 0x555555;
        const alpha = key === 'mainTerminal' ? 0.6 : 0.3;
        
        // Add a subtle glow effect
        const glow = this.add.circle(
          (area.x + area.width / 2) * gameConfig.grid.tileSize,
          (area.y + area.height / 2) * gameConfig.grid.tileSize,
          gameConfig.grid.tileSize * 0.7,
          color
        ).setAlpha(alpha);
        
        // Pulse animation for main terminal
        if (key === 'mainTerminal') {
          this.tweens.add({
            targets: glow,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            duration: 1000
          });
        }
      }
    });
  }
  
  createPlayer() {
    // Create player sprite
    this.player = this.physics.add.sprite(
      gameConfig.player.startX * gameConfig.grid.tileSize,
      gameConfig.player.startY * gameConfig.grid.tileSize,
      'player'
    );
    
    // Set player properties
    this.player.setOrigin(0.5, 0.5);
    this.player.setDisplaySize(gameConfig.grid.tileSize * 1.2, gameConfig.grid.tileSize * 1.2);
    this.player.setCollideWorldBounds(true);
    
    // Add a drop shadow effect
    this.player.preFX.addShadow(0, 5, 0.08, 0.5, 0x000000, 10);
    
    // Current grid position
    this.player.currentGridX = gameConfig.player.startX;
    this.player.currentGridY = gameConfig.player.startY;
    
    // Movement state
    this.player.isMoving = false;
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
  }
  
  setupControls() {
    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Add WASD keys
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // Add click to move
    this.input.on('pointerdown', (pointer) => {
      if (this.player.isMoving) return;
      
      // Convert click position to grid coordinates
      const gridX = Math.floor(pointer.worldX / gameConfig.grid.tileSize);
      const gridY = Math.floor(pointer.worldY / gameConfig.grid.tileSize);
      
      // Check if clicked cell is walkable
      if (gridX >= 0 && gridX < gameConfig.grid.width &&
          gridY >= 0 && gridY < gameConfig.grid.height &&
          this.grid[gridY][gridX] === 1) {
        this.movePlayerToGridPosition(gridX, gridY);
      }
    });
    
    // Mobile controls
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.createMobileControls();
    }
  }
  
  createMobileControls() {
    // Create a joystick for mobile
    // In a real implementation, you would add a virtual joystick here
    console.log('Mobile controls would be created here');
  }
  
  createNotificationSystem() {
    // Create notification text
    this.notificationText = this.add.text(
      this.cameras.main.width / 2,
      50,
      '',
      {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: '#000000',
        backgroundColor: gameConfig.colors.primary,
        padding: {
          left: 15,
          right: 15,
          top: 8,
          bottom: 8
        }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(1000)
    .setAlpha(0);
    
    // Add a drop shadow
    this.notificationText.preFX.addShadow(0, 3, 0.1, 0.5, 0x000000, 4);
  }
  
  showNotification(message, duration = 3000) {
    // Clear any existing timer
    if (this.notificationTimer) {
      this.notificationTimer.remove();
    }
    
    // Update message and show
    this.notificationText.setText(message);
    
    // Fade in
    this.tweens.add({
      targets: this.notificationText,
      alpha: 1,
      y: 60,
      duration: 300,
      ease: 'Power2'
    });
    
    // Set timer to fade out
    this.notificationTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({
        targets: this.notificationText,
        alpha: 0,
        y: 50,
        duration: 300,
        ease: 'Power2'
      });
    });
  }
  
  movePlayerToGridPosition(gridX, gridY) {
    // Set the player's movement target
    this.player.targetX = gridX * gameConfig.grid.tileSize;
    this.player.targetY = gridY * gameConfig.grid.tileSize;
    
    // Update grid position
    this.player.currentGridX = gridX;
    this.player.currentGridY = gridY;
    
    // Start movement
    this.player.isMoving = true;
    
    // Check for nearby interactive objects
    this.checkForNearbyObjects();
  }
  
  handleInteraction() {
    // Find the nearest interactive object
    let nearestObject = null;
    let minDistance = gameConfig.player.interactionRadius * gameConfig.grid.tileSize;
    
    this.interactiveObjects.forEach(obj => {
      const objCenterX = (obj.x + obj.width / 2) * gameConfig.grid.tileSize;
      const objCenterY = (obj.y + obj.height / 2) * gameConfig.grid.tileSize;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        objCenterX, objCenterY
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestObject = obj;
      }
    });
    
    // Interact with the nearest object if found
    if (nearestObject) {
      this.handleAreaInteraction(nearestObject.id, nearestObject.data);
    }
  }
  
  handleAreaInteraction(areaId, areaData) {
    // Get player's current grid position
    const playerGridX = Math.floor(this.player.x / gameConfig.grid.tileSize);
    const playerGridY = Math.floor(this.player.y / gameConfig.grid.tileSize);
    
    // Calculate distance to the interactive area
    const areaGridX = areaData.x + areaData.width / 2;
    const areaGridY = areaData.y + areaData.height / 2;
    const gridDistance = Phaser.Math.Distance.Between(
      playerGridX, playerGridY,
      areaGridX, areaGridY
    );
    
    // Check if player is close enough
    if (gridDistance <= gameConfig.player.interactionRadius) {
      // Handle different types of interactions
      if (areaId === 'mainTerminal') {
        // Main terminal - Open challenges menu
        this.sound.play('click', { volume: 0.7 });
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start('ChallengesScene');
        });
      } else if (areaId.includes('terminal')) {
        // Other terminals - Show "coming soon" message
        this.showNotification('⚠️ Terminal no disponible todavía');
      } else if (areaData.message) {
        // Generic interactive object with a message
        this.showNotification(areaData.message);
      }
    } else {
      // Player is too far
      this.showNotification('Acércate para interactuar');
    }
  }
  
  checkForNearbyObjects() {
    // Check if the player is near any interactive objects
    this.interactiveObjects.forEach(obj => {
      const objCenterX = (obj.x + obj.width / 2) * gameConfig.grid.tileSize;
      const objCenterY = (obj.y + obj.height / 2) * gameConfig.grid.tileSize;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        objCenterX, objCenterY
      );
      
      if (distance < gameConfig.player.interactionRadius * gameConfig.grid.tileSize) {
        // Player is near this object
        if (obj.id === 'mainTerminal') {
          this.showNotification('🖥️ Presiona E o haz clic para acceder a los retos');
        }
      }
    });
  }
  
  update() {
    // Handle keyboard movement
    this.handleKeyboardMovement();
    
    // Handle player movement towards target
    if (this.player.isMoving) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.player.targetX, this.player.targetY
      );
      
      if (distance < 5) {
        // Arrived at destination
        this.player.isMoving = false;
        this.player.setVelocity(0);
        this.player.x = this.player.targetX;
        this.player.y = this.player.targetY;
        
        // Check for nearby objects when stopping
        this.checkForNearbyObjects();
      } else {
        // Keep moving towards target
        this.physics.moveTo(
          this.player,
          this.player.targetX,
          this.player.targetY,
          gameConfig.player.speed
        );
      }
    }
  }
  
  handleKeyboardMovement() {
    if (this.player.isMoving) return;
    
    let dx = 0;
    let dy = 0;
    
    // Determine direction from keyboard input
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      dy = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      dy = 1;
    } else if (this.cursors.left.isDown || this.wasd.left.isDown) {
      dx = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      dx = 1;
    }
    
    // Apply movement if a direction is pressed
    if (dx !== 0 || dy !== 0) {
      const newX = this.player.currentGridX + dx;
      const newY = this.player.currentGridY + dy;
      
      // Check if the new position is walkable
      if (newX >= 0 && newX < gameConfig.grid.width &&
          newY >= 0 && newY < gameConfig.grid.height &&
          this.grid[newY][newX] === 1) {
        this.movePlayerToGridPosition(newX, newY);
      }
    }
  }
}