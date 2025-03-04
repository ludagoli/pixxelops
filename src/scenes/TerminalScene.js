import Phaser from 'phaser';
import { gameConfig } from '../config';

/**
 * Terminal Scene - Command-line interface for challenges
 */
export class TerminalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TerminalScene' });
    
    // Terminal state
    this.terminalHistory = [];
    this.commandLine = '';
    this.cursorPosition = 0;
    this.cursorBlinkVisible = true;
    this.historyIndex = 0;
    this.commandHistory = [];
    
    // References to display objects
    this.historyText = null;
    this.inputText = null;
    this.cursorGraphics = null;
    
    // Current directory/path and challenge
    this.currentDirectory = '/home/admin';
    this.activeChallenge = null;
    this.challengeCompleted = false;
    
    // Simulated file system structure
    this.fileSystem = {
      '/': {
        'home': {
          'admin': {
            'documentos': {
              'readme.txt': 'Bienvenido a PixxelOps! Este es tu espacio de trabajo.'
            },
            'proyectos': {
              'docker-challenge': {
                'instrucciones.md': 'Configura un contenedor Docker con Nginx.'
              }
            }
          }
        },
        'etc': {
          'config.conf': 'Configuración del sistema'
        },
        'var': {
          'log': {
            'syslog': 'Historial de eventos del sistema'
          }
        }
      }
    };
    
    // Available terminal commands
    this.commands = {
      'help': this.cmdHelp.bind(this),
      'ls': this.cmdLs.bind(this),
      'cd': this.cmdCd.bind(this),
      'pwd': this.cmdPwd.bind(this),
      'cat': this.cmdCat.bind(this),
      'clear': this.cmdClear.bind(this),
      'docker': this.cmdDocker.bind(this),
      'challenge': this.cmdChallenge.bind(this),
      'exit': this.cmdExit.bind(this)
    };
  }
  
  create() {
    // Set background
    this.cameras.main.setBackgroundColor('#0a0a12');
    
    // Create terminal background
    this.createTerminalBackground();
    
    // Set up terminal output and input
    this.setupTerminal();
    
    // Start blinking cursor
    this.createCursor();
    
    // Set up keyboard input
    this.setupKeyboardInput();
    
    // Load challenge if one is selected
    this.loadChallenge();
    
    // Welcome message
    this.addToTerminal('<span style="color: #ff9933; font-size: 1.2em;">Terminal de PixxelOps v1.0.0</span>');
    this.addToTerminal('==================================');
    this.addToTerminal('Escribe <span style="color: #ff9933;">help</span> para ver los comandos disponibles');
    this.addToTerminal('Escribe <span style="color: #ff9933;">challenge</span> para ver las instrucciones del desafío actual');
    this.addToTerminal('<span style="color: #3366FF;">NOTA: Asegúrate de tener Docker instalado para completar los desafíos</span>');
    this.addToTerminal('');
    
    // Show challenge instructions after a brief delay
    if (window.gameState.currentChallenge) {
      this.time.delayedCall(1000, () => {
        this.showChallengeInstructions();
      });
    }
    
    // Add exit button
    this.addExitButton();
  }
  
  createTerminalBackground() {
    // Create a gradient background
    const terminalBg = this.add.graphics();
    terminalBg.fillGradientStyle(
      0x0a0a12, 0x0a0a12, 
      0x1a1a2e, 0x1a1a2e,
      1, 1, 0.8, 0.8
    );
    terminalBg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // Add border
    const border = this.add.graphics();
    border.lineStyle(4, 0x33de5e, 1);
    border.strokeRect(10, 10, this.cameras.main.width - 20, this.cameras.main.height - 20);
    
    // Add terminal header with pixel look
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x33de5e, 1);
    headerBg.fillRect(10, 10, this.cameras.main.width - 20, 30);
    
    // Add title text
    this.add.text(
      20, 
      25,
      'Terminal - PixxelOps v1.0.0',
      {
        fontFamily: 'PixelFont',
        fontSize: '16px',
        fill: '#0a0a12'
      }
    ).setOrigin(0, 0.5);
    
    // Scan line effect (subtle horizontal lines)
    const scanLines = this.add.graphics();
    scanLines.lineStyle(1, 0x33de5e, 0.07);
    for (let y = 50; y < this.cameras.main.height; y += 2) {
      scanLines.lineBetween(10, y, this.cameras.main.width - 10, y);
    }
  }
  
  setupTerminal() {
    // Terminal history text area (for command outputs)
    this.historyText = this.add.text(
      20, 
      50, 
      '',
      {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: gameConfig.colors.primary,
        wordWrap: { 
          width: this.cameras.main.width - 40
        }
      }
    );
    
    // Command prompt label
    this.promptText = this.add.text(
      20, 
      this.cameras.main.height - 50, 
      '$',
      {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: gameConfig.colors.secondary
      }
    );
    
    // Text input area
    this.inputText = this.add.text(
      40, 
      this.cameras.main.height - 50, 
      '',
      {
        fontFamily: 'PixelFont',
        fontSize: '18px',
        fill: gameConfig.colors.primary
      }
    );
  }
  
  createCursor() {
    // Create cursor graphics
    this.cursorGraphics = this.add.graphics();
    this.cursorGraphics.fillStyle(gameConfig.colors.primary, 1);
    this.updateCursorPosition();
    
    // Create blink animation
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorBlinkVisible = !this.cursorBlinkVisible;
        this.updateCursorPosition();
      }
    });
  }
  
  updateCursorPosition() {
    // Calculate cursor width based on font metrics
    const cursorWidth = 10;
    const cursorHeight = 18;
    
    // Calculate cursor position
    const textWidth = this.getTextWidth(this.commandLine.substring(0, this.cursorPosition));
    
    // Clear and redraw cursor
    this.cursorGraphics.clear();
    if (this.cursorBlinkVisible) {
      this.cursorGraphics.fillRect(
        40 + textWidth, 
        this.cameras.main.height - 50,
        cursorWidth,
        cursorHeight
      );
    }
  }
  
  getTextWidth(text) {
    // Simple approximation - a more accurate method would measure actual text
    return text.length * 10; // Assuming monospace font, 10px per character
  }
  
  setupKeyboardInput() {
    // Track keyboard events
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }
  
  handleKeyDown(event) {
    // Handle special keys
    if (event.keyCode === 8) { // Backspace
      this.handleBackspace();
    } else if (event.keyCode === 13) { // Enter
      this.handleEnter();
    } else if (event.keyCode === 38) { // Up arrow
      this.navigateHistory(-1);
    } else if (event.keyCode === 40) { // Down arrow
      this.navigateHistory(1);
    } else if (event.keyCode === 37) { // Left arrow
      this.moveCursor(-1);
    } else if (event.keyCode === 39) { // Right arrow
      this.moveCursor(1);
    } else if (event.key.length === 1) { // Regular character
      this.insertCharacter(event.key);
    }
    
    // Update input display and cursor
    this.inputText.setText(this.commandLine);
    this.updateCursorPosition();
    
    // Sound effect for key press
    if (event.keyCode !== 8 && event.keyCode !== 13) {
      //this.sound.play('type', { volume: 0.1 }); // Uncomment when asset is available
    }
  }
  
  handleBackspace() {
    if (this.cursorPosition > 0) {
      // Remove character at cursor position
      this.commandLine = 
        this.commandLine.substring(0, this.cursorPosition - 1) + 
        this.commandLine.substring(this.cursorPosition);
      this.cursorPosition--;
    }
  }
  
  handleEnter() {
    // Add command to history
    this.addToTerminal(`<span style="color: #ff9933;">$</span> ${this.commandLine}`);
    
    // Process command
    this.processCommand(this.commandLine);
    
    // Add to command history
    if (this.commandLine.trim()) {
      this.commandHistory.push(this.commandLine);
    }
    this.historyIndex = this.commandHistory.length;
    
    // Clear current command
    this.commandLine = '';
    this.cursorPosition = 0;
  }
  
  navigateHistory(direction) {
    const newIndex = this.historyIndex + direction;
    if (newIndex >= 0 && newIndex <= this.commandHistory.length) {
      this.historyIndex = newIndex;
      
      if (newIndex === this.commandHistory.length) {
        this.commandLine = '';
      } else {
        this.commandLine = this.commandHistory[newIndex];
      }
      
      this.cursorPosition = this.commandLine.length;
    }
  }
  
  moveCursor(direction) {
    const newPosition = this.cursorPosition + direction;
    if (newPosition >= 0 && newPosition <= this.commandLine.length) {
      this.cursorPosition = newPosition;
    }
  }
  
  insertCharacter(char) {
    // Insert character at cursor position
    this.commandLine = 
      this.commandLine.substring(0, this.cursorPosition) + 
      char + 
      this.commandLine.substring(this.cursorPosition);
    this.cursorPosition++;
  }
  
  addToTerminal(text) {
    // Add text to terminal history
    this.terminalHistory.push(text);
    
    // Update display
    this.historyText.setText(this.terminalHistory.join('<br>'));
    
    // Scroll to bottom
    // In a real implementation, we would need to handle scrolling for long outputs
    // For this prototype, we'll just limit the history length
    if (this.terminalHistory.length > 20) {
      this.terminalHistory.shift();
      this.historyText.setText(this.terminalHistory.join('<br>'));
    }
  }
  
  processCommand(command) {
    if (!command.trim()) {
      this.addToTerminal('');
      return;
    }
    
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (this.commands[cmd]) {
      const output = this.commands[cmd](args);
      if (output) {
        this.addToTerminal(output);
      }
    } else {
      this.addToTerminal(`${cmd}: comando no encontrado`);
    }
    
    this.addToTerminal('');
  }
  
  loadChallenge() {
    const challengeId = window.gameState.currentChallenge;
    if (challengeId) {
      // Find challenge in config
      this.activeChallenge = gameConfig.challenges.find(c => c.id === challengeId);
      
      if (!this.activeChallenge) {
        console.error('Challenge not found:', challengeId);
      }
    }
  }
  
  showChallengeInstructions() {
    if (this.activeChallenge) {
      // Create a modal dialog for challenge instructions
      const modal = this.add.container(0, 0);
      modal.setDepth(1000);
      
      // Add background overlay
      const overlay = this.add.rectangle(
        0, 0, 
        this.cameras.main.width, 
        this.cameras.main.height,
        0x000000, 0.7
      );
      overlay.setOrigin(0, 0);
      modal.add(overlay);
      
      // Add modal panel
      const panel = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        600, 400,
        0x1a1a2e
      );
      panel.setStrokeStyle(4, gameConfig.colors.primary);
      modal.add(panel);
      
      // Add challenge content
      // Title
      const title = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 160,
        this.activeChallenge.title,
        {
          fontFamily: 'PixelFont',
          fontSize: '28px',
          fill: gameConfig.colors.secondary,
          align: 'center'
        }
      );
      title.setOrigin(0.5);
      modal.add(title);
      
      // Instructions
      const instructions = this.activeChallenge.instructions;
      
      // Parse HTML-like formatting to create multiple text objects
      // This is simplified - a real implementation would need proper HTML parsing
      const instrText = this.add.text(
        this.cameras.main.width / 2 - 270,
        this.cameras.main.height / 2 - 120,
        instructions.replace(/<[^>]*>/g, ''), // Strip HTML for simplicity
        {
          fontFamily: 'PixelFont',
          fontSize: '16px',
          fill: '#ffffff',
          wordWrap: { width: 540 }
        }
      );
      modal.add(instrText);
      
      // Add close button
      const closeButton = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 160,
        'Entendido',
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
      closeButton.setOrigin(0.5);
      closeButton.setInteractive({ useHandCursor: true });
      
      closeButton.on('pointerover', () => {
        closeButton.setBackgroundColor('#4aea78');
      });
      
      closeButton.on('pointerout', () => {
        closeButton.setBackgroundColor(gameConfig.colors.primary);
      });
      
      closeButton.on('pointerdown', () => {
        closeButton.setBackgroundColor('#2bb34e');
      });
      
      closeButton.on('pointerup', () => {
        modal.destroy();
        this.addToTerminal('<span style="color: #ff9933;">Puedes ver las instrucciones en cualquier momento escribiendo "challenge"</span>');
        this.addToTerminal('');
      });
      
      modal.add(closeButton);
    }
  }
  
  addExitButton() {
    // Add exit button for terminal
    const exitButton = this.add.text(
      this.cameras.main.width - 70,
      25,
      'Salir',
      {
        fontFamily: 'PixelFont',
        fontSize: '16px',
        fill: '#000000',
        backgroundColor: gameConfig.colors.secondary,
        padding: {
          left: 10,
          right: 10,
          top: 4,
          bottom: 4
        }
      }
    ).setOrigin(0, 0.5);
    
    exitButton.setInteractive({ useHandCursor: true });
    
    exitButton.on('pointerover', () => {
      exitButton.setBackgroundColor('#ffad5c');
    });
    
    exitButton.on('pointerout', () => {
      exitButton.setBackgroundColor(gameConfig.colors.secondary);
    });
    
    exitButton.on('pointerdown', () => {
      exitButton.setBackgroundColor('#cc7a26');
    });
    
    exitButton.on('pointerup', () => {
      this.cmdExit();
    });
    
    // Add escape key to exit
    this.input.keyboard.on('keydown-ESC', () => {
      this.cmdExit();
    });
  }
  
  update() {
    // Any ongoing animations or updates
  }
  
  // Terminal commands implementation
  cmdHelp() {
    return `Comandos disponibles:
- <span style="color: #ff9933;">help</span>: Muestra esta ayuda
- <span style="color: #ff9933;">ls [directorio]</span>: Lista archivos en el directorio actual o especificado
- <span style="color: #ff9933;">cd [directorio]</span>: Cambia el directorio actual
- <span style="color: #ff9933;">pwd</span>: Muestra la ruta del directorio actual
- <span style="color: #ff9933;">cat [archivo]</span>: Muestra el contenido de un archivo
- <span style="color: #ff9933;">clear</span>: Limpia la terminal
- <span style="color: #ff9933;">docker [comandos]</span>: Gestiona contenedores Docker
- <span style="color: #ff9933;">challenge</span>: Muestra las instrucciones del desafío actual
- <span style="color: #ff9933;">exit</span>: Volver a la oficina`;
  }
  
  cmdLs(args) {
    const path = args[0] || this.currentDirectory;
    const items = this.getItemsInPath(path);
    
    if (!items) {
      return `ls: no se puede acceder a '${path}': No existe el fichero o el directorio`;
    }
    
    let result = '';
    
    // Show directories
    Object.keys(items).forEach(name => {
      if (typeof items[name] === 'object') {
        result += `<span style="color: #33de5e;">${name}/</span>  `;
      }
    });
    
    // Show files
    Object.keys(items).forEach(name => {
      if (typeof items[name] === 'string') {
        result += `<span style="color: #cccccc;">${name}</span>  `;
      }
    });
    
    return result || 'No hay archivos en este directorio';
  }
  
  cmdCd(args) {
    if (!args[0]) {
      this.currentDirectory = '/home/admin';
      return '';
    }
    
    const newPath = this.resolvePath(args[0]);
    const items = this.getItemsInPath(newPath);
    
    if (!items) {
      return `cd: ${args[0]}: No existe el fichero o el directorio`;
    }
    
    if (typeof items !== 'object') {
      return `cd: ${args[0]}: No es un directorio`;
    }
    
    this.currentDirectory = newPath;
    return '';
  }
  
  cmdPwd() {
    return this.currentDirectory;
  }
  
  cmdCat(args) {
    if (!args[0]) {
      return 'cat: falta el nombre del archivo';
    }
    
    const path = this.resolvePath(args[0]);
    const content = this.getFileContent(path);
    
    if (content === null) {
      return `cat: ${args[0]}: No existe el fichero o el directorio`;
    }
    
    if (typeof content === 'object') {
      return `cat: ${args[0]}: Es un directorio`;
    }
    
    return content;
  }
  
  cmdClear() {
    this.terminalHistory = [];
    this.historyText.setText('');
    return '';
  }
  
  cmdDocker(args) {
    if (!args[0]) {
      return `
Usage:  docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Common Commands:
  run         Create and run a new container from an image
  exec        Execute a command in a running container
  ps          List containers
  build       Build an image from a Dockerfile
  pull        Download an image from a registry
  images      List images

Run 'docker COMMAND --help' for more information on a command.
      `;
    }
    
    switch(args[0]) {
      case 'pull':
        if (!args[1]) {
          return 'docker: "pull" requiere al menos 1 argumento.';
        }
        return `Descargando imagen '${args[1]}'...\nLa imagen ha sido descargada con éxito.`;
        
      case 'images':
        return `REPOSITORY    TAG       IMAGE ID       CREATED         SIZE
nginx         latest    a6bd71f48f68   2 weeks ago    187MB
ubuntu        latest    3b418d7b466a   4 weeks ago    77.8MB
hello-world   latest    9c7a54a9a43c   5 months ago   13.3kB`;
        
      case 'run':
        if (args.includes('-p') && args.includes('80:80') && args.includes('nginx')) {
          // Check if this completes the current challenge
          if (this.activeChallenge && this.activeChallenge.id === 'docker-basic') {
            this.challengeCompleted = true;
            
            // Add a slight delay before showing success message
            this.time.delayedCall(1000, () => {
              this.addToTerminal('<span style="color: #33de5e; font-weight: bold;">¡Felicidades! Has completado el desafío de configuración de Docker correctamente.</span>');
              
              // Add reward to game state
              if (this.activeChallenge.reward) {
                window.gameState.score += this.activeChallenge.reward;
                this.addToTerminal(`<span style="color: #ff9933;">+${this.activeChallenge.reward} puntos</span>`);
                
                // Add to completed challenges
                if (!window.gameState.completedChallenges.includes(this.activeChallenge.id)) {
                  window.gameState.completedChallenges.push(this.activeChallenge.id);
                  window.gameState.saveGame();
                }
              }
            });
          }
          
          return `Creando contenedor a partir de la imagen 'nginx'...
contenedor inicializado con ID abc123def456
El servidor web Nginx está funcionando en http://localhost:80`;
        }
        
        if (args.includes('nginx')) {
          return `Creando contenedor a partir de la imagen 'nginx'...
contenedor inicializado con ID xyz789
NOTA: No has mapeado los puertos. El servidor web no será accesible desde el host.`;
        }
        
        return `docker: el comando "run" requiere al menos 1 argumento.
Consulta 'docker run --help'.`;
        
      case 'ps':
        if (this.challengeCompleted) {
          return `CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                NAMES
abc123def456   nginx     "/docker-entrypoint.…"   2 minutes ago    Up 2 minutes    0.0.0.0:80->80/tcp   eager_beaver`;
        }
        return 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES';
        
      default:
        return `docker: '${args[0]}' no es un comando docker.`;
    }
  }
  
  cmdChallenge() {
    // Show challenge instructions
    if (this.activeChallenge) {
      this.showChallengeInstructions();
      return 'Mostrando instrucciones del desafío...';
    } else {
      return 'No hay ningún desafío activo actualmente.';
    }
  }
  
  cmdExit() {
    // Play sound
    this.sound.play('click', { volume: 0.7 });
    
    // Add fade out transition
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    // Return to challenges scene
    this.time.delayedCall(500, () => {
      if (this.challengeCompleted) {
        // Go back to challenges scene to show completion
        this.scene.start('ChallengesScene');
      } else {
        // Go back to office directly
        this.scene.start('OfficeScene');
      }
    });
  }
  
  // Helper functions for file system navigation
  getItemsInPath(path) {
    const parts = path.split('/').filter(p => p !== '');
    let current = this.fileSystem['/'];
    
    if (path === '/') return current;
    
    for (const part of parts) {
      if (!current[part]) return null;
      current = current[part];
    }
    
    return current;
  }
  
  getFileContent(path) {
    const parts = path.split('/').filter(p => p !== '');
    let current = this.fileSystem['/'];
    
    if (parts.length === 0) return current;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) return null;
      current = current[parts[i]];
    }
    
    const fileName = parts[parts.length - 1];
    if (!current[fileName]) return null;
    
    return current[fileName];
  }
  
  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    }
    
    // Handle relative paths with ..
    const currentParts = this.currentDirectory.split('/').filter(p => p !== '');
    const pathParts = path.split('/').filter(p => p !== '');
    
    for (const part of pathParts) {
      if (part === '..') {
        if (currentParts.length > 0) {
          currentParts.pop();
        }
      } else if (part !== '.') {
        currentParts.push(part);
      }
    }
    
    return '/' + currentParts.join('/');
  }
}