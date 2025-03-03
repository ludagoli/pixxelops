# PixxelOps Project Guidelines

## Running the Game
- **Launch Game**: Open `index.html` in a browser
- **No Build Required**: Pure HTML/CSS/JS game with no dependencies
- **Testing**: Test by playing through the game scenarios

## Code Style Guidelines
- **HTML**: Use semantic tags with descriptive classes
- **CSS**: 
  - Primary colors: #0a0a12 (dark background), #33de5e (green terminal), #ff9933 (orange accent)
  - PixelFont family (VT323) for all text
  - 32px grid for game elements
- **JavaScript**: 
  - Use camelCase for variables and functions
  - Prefer const/let over var
  - Group related functions by game systems (terminal, office, file system)
  - Terminal commands follow Linux convention
- **Assets**:
  - SVG files maintain the pixel art aesthetic
  - Use assets from assets/img/ directory
  - Player, office and terminal all have dedicated SVGs
- **Error Handling**: Use try/catch blocks for error-prone operations
- **Formatting**: 2-space indentation, single quotes for strings

## Game Components
- Terminal simulator with Docker challenge
- Office navigation with grid-based movement
- File system navigation with basic Unix commands