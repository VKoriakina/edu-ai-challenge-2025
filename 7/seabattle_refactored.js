const readline = require('readline');

// Game Configuration
const CONFIG = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3,
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  },
  CPU_MODES: {
    HUNT: 'hunt',
    TARGET: 'target'
  }
};

// Ship class for better data encapsulation
class Ship {
  constructor(locations) {
    this.locations = new Set(locations);
    this.hits = new Set();
  }

  hit(location) {
    if (this.locations.has(location)) {
      this.hits.add(location);
      return true;
    }
    return false;
  }

  isSunk() {
    return this.hits.size === this.locations.size;
  }

  isLocationPartOfShip(location) {
    return this.locations.has(location);
  }

  isAlreadyHit(location) {
    return this.hits.has(location);
  }
}

// Board class for game state management
class Board {
  constructor() {
    this.grid = Array(CONFIG.BOARD_SIZE).fill(null)
      .map(() => Array(CONFIG.BOARD_SIZE).fill(CONFIG.SYMBOLS.WATER));
    this.ships = [];
    this.guesses = new Set();
  }

  placeShip(ship, showOnBoard = false) {
    for (const location of ship.locations) {
      const [row, col] = this.parseLocation(location);
      if (showOnBoard) {
        this.grid[row][col] = CONFIG.SYMBOLS.SHIP;
      }
    }
    this.ships.push(ship);
  }

  placeShipsRandomly(numberOfShips, showOnBoard = false) {
    let placedShips = 0;
    const maxAttempts = 1000; // Prevent infinite loop
    let attempts = 0;

    while (placedShips < numberOfShips && attempts < maxAttempts) {
      attempts++;
      const ship = this.generateRandomShip();
      
      if (ship && !this.hasCollision(ship)) {
        this.placeShip(ship, showOnBoard);
        placedShips++;
      }
    }

    if (placedShips < numberOfShips) {
      throw new Error(`Could not place all ships after ${maxAttempts} attempts`);
    }
    
    console.log(`${numberOfShips} ships placed randomly.`);
  }

  generateRandomShip() {
    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const maxStartRow = orientation === 'vertical' 
      ? CONFIG.BOARD_SIZE - CONFIG.SHIP_LENGTH 
      : CONFIG.BOARD_SIZE - 1;
    const maxStartCol = orientation === 'horizontal' 
      ? CONFIG.BOARD_SIZE - CONFIG.SHIP_LENGTH 
      : CONFIG.BOARD_SIZE - 1;

    const startRow = Math.floor(Math.random() * (maxStartRow + 1));
    const startCol = Math.floor(Math.random() * (maxStartCol + 1));

    const locations = [];
    for (let i = 0; i < CONFIG.SHIP_LENGTH; i++) {
      const row = orientation === 'vertical' ? startRow + i : startRow;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      locations.push(this.formatLocation(row, col));
    }

    return new Ship(locations);
  }

  hasCollision(newShip) {
    return this.ships.some(existingShip => 
      [...newShip.locations].some(location => 
        existingShip.isLocationPartOfShip(location)
      )
    );
  }

  processGuess(guess) {
    if (this.guesses.has(guess)) {
      return { result: 'already_guessed', message: 'You already guessed that location!' };
    }

    this.guesses.add(guess);
    const [row, col] = this.parseLocation(guess);

    for (const ship of this.ships) {
      if (ship.isLocationPartOfShip(guess)) {
        if (ship.isAlreadyHit(guess)) {
          return { result: 'already_hit', message: 'You already hit that spot!' };
        }
        
        ship.hit(guess);
        this.grid[row][col] = CONFIG.SYMBOLS.HIT;
        
        if (ship.isSunk()) {
          return { result: 'sunk', message: 'You sunk a battleship!', ship };
        }
        return { result: 'hit', message: 'HIT!' };
      }
    }

    this.grid[row][col] = CONFIG.SYMBOLS.MISS;
    return { result: 'miss', message: 'MISS.' };
  }

  getRemainingShips() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  formatLocation(row, col) {
    return `${row}${col}`;
  }

  parseLocation(location) {
    return [parseInt(location[0]), parseInt(location[1])];
  }

  print(title = 'BOARD') {
    console.log(`\n   --- ${title} ---`);
    
    // Header
    let header = '  ';
    for (let h = 0; h < CONFIG.BOARD_SIZE; h++) {
      header += h + ' ';
    }
    console.log(header);

    // Board rows
    for (let i = 0; i < CONFIG.BOARD_SIZE; i++) {
      let rowStr = i + ' ';
      for (let j = 0; j < CONFIG.BOARD_SIZE; j++) {
        rowStr += this.grid[i][j] + ' ';
      }
      console.log(rowStr);
    }
    console.log();
  }
}

// AI Player class for CPU logic
class AIPlayer {
  constructor() {
    this.mode = CONFIG.CPU_MODES.HUNT;
    this.targetQueue = [];
    this.guesses = new Set();
  }

  makeGuess() {
    let guess;

    if (this.mode === CONFIG.CPU_MODES.TARGET && this.targetQueue.length > 0) {
      guess = this.targetQueue.shift();
      console.log('CPU targets: ' + guess);
    } else {
      this.mode = CONFIG.CPU_MODES.HUNT;
      guess = this.generateRandomGuess();
    }

    this.guesses.add(guess);
    return guess;
  }

  generateRandomGuess() {
    let guess;
    do {
      const row = Math.floor(Math.random() * CONFIG.BOARD_SIZE);
      const col = Math.floor(Math.random() * CONFIG.BOARD_SIZE);
      guess = `${row}${col}`;
    } while (this.guesses.has(guess));
    
    return guess;
  }

  onHit(location, wasSunk) {
    if (wasSunk) {
      this.mode = CONFIG.CPU_MODES.HUNT;
      this.targetQueue = [];
    } else {
      this.mode = CONFIG.CPU_MODES.TARGET;
      this.addAdjacentTargets(location);
    }
  }

  onMiss() {
    if (this.mode === CONFIG.CPU_MODES.TARGET && this.targetQueue.length === 0) {
      this.mode = CONFIG.CPU_MODES.HUNT;
    }
  }

  addAdjacentTargets(location) {
    const [row, col] = [parseInt(location[0]), parseInt(location[1])];
    const adjacentCells = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];

    for (const [adjRow, adjCol] of adjacentCells) {
      if (this.isValidLocation(adjRow, adjCol)) {
        const adjLocation = `${adjRow}${adjCol}`;
        if (!this.guesses.has(adjLocation) && !this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    }
  }

  isValidLocation(row, col) {
    return row >= 0 && row < CONFIG.BOARD_SIZE && 
           col >= 0 && col < CONFIG.BOARD_SIZE;
  }
}

// Main Game class
class SeaBattleGame {
  constructor() {
    this.playerBoard = new Board();
    this.opponentBoard = new Board();
    this.ai = new AIPlayer();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async initialize() {
    console.log('Initializing Sea Battle Game...');
    
    try {
      this.playerBoard.placeShipsRandomly(CONFIG.NUM_SHIPS, true);
      this.opponentBoard.placeShipsRandomly(CONFIG.NUM_SHIPS, false);
      
      console.log("\nLet's play Sea Battle!");
      console.log(`Try to sink the ${CONFIG.NUM_SHIPS} enemy ships.`);
      
      this.gameLoop();
    } catch (error) {
      console.error('Error initializing game:', error.message);
      this.rl.close();
    }
  }

  printBoards() {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Headers
    let header = '  ';
    for (let h = 0; h < CONFIG.BOARD_SIZE; h++) {
      header += h + ' ';
    }
    console.log(header + '     ' + header);

    // Board rows side by side
    for (let i = 0; i < CONFIG.BOARD_SIZE; i++) {
      let rowStr = i + ' ';
      
      // Opponent board row
      for (let j = 0; j < CONFIG.BOARD_SIZE; j++) {
        rowStr += this.opponentBoard.grid[i][j] + ' ';
      }
      
      rowStr += '    ' + i + ' ';
      
      // Player board row
      for (let j = 0; j < CONFIG.BOARD_SIZE; j++) {
        rowStr += this.playerBoard.grid[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log();
  }

  validatePlayerInput(input) {
    if (!input || input.length !== 2) {
      return { valid: false, message: 'Input must be exactly two digits (e.g., 00, 34, 98).' };
    }

    const row = parseInt(input[0]);
    const col = parseInt(input[1]);

    if (isNaN(row) || isNaN(col) || 
        row < 0 || row >= CONFIG.BOARD_SIZE || 
        col < 0 || col >= CONFIG.BOARD_SIZE) {
      return { 
        valid: false, 
        message: `Please enter valid row and column numbers between 0 and ${CONFIG.BOARD_SIZE - 1}.` 
      };
    }

    return { valid: true, location: input };
  }

  async playerTurn() {
    return new Promise((resolve) => {
      this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
        const validation = this.validatePlayerInput(answer);
        
        if (!validation.valid) {
          console.log('Oops, ' + validation.message);
          resolve(false);
          return;
        }

        const result = this.opponentBoard.processGuess(validation.location);
        console.log('PLAYER ' + result.message);

        if (result.result === 'sunk') {
          console.log('You sunk an enemy battleship!');
        }

        resolve(result.result !== 'already_guessed' && result.result !== 'already_hit');
      });
    });
  }

  cpuTurn() {
    console.log("\n--- CPU's Turn ---");
    const guess = this.ai.makeGuess();
    const result = this.playerBoard.processGuess(guess);

    console.log(`CPU ${result.message} at ${guess}`);

    if (result.result === 'hit' || result.result === 'sunk') {
      this.ai.onHit(guess, result.result === 'sunk');
      if (result.result === 'sunk') {
        console.log('CPU sunk your battleship!');
      }
    } else {
      this.ai.onMiss();
    }
  }

  checkGameEnd() {
    const playerShipsRemaining = this.playerBoard.getRemainingShips();
    const opponentShipsRemaining = this.opponentBoard.getRemainingShips();

    if (opponentShipsRemaining === 0) {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
      this.printBoards();
      this.rl.close();
      return true;
    }

    if (playerShipsRemaining === 0) {
      console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
      this.printBoards();
      this.rl.close();
      return true;
    }

    return false;
  }

  async gameLoop() {
    if (this.checkGameEnd()) return;

    this.printBoards();
    
    const playerMadeValidMove = await this.playerTurn();
    
    if (playerMadeValidMove) {
      if (this.checkGameEnd()) return;
      
      this.cpuTurn();
      
      if (this.checkGameEnd()) return;
    }

    // Continue game loop
    setImmediate(() => this.gameLoop());
  }
}

// Error handling and game initialization
function startGame() {
  const game = new SeaBattleGame();
  
  process.on('SIGINT', () => {
    console.log('\n\nGame interrupted. Thanks for playing!');
    game.rl.close();
    process.exit(0);
  });

  game.initialize().catch(error => {
    console.error('Fatal game error:', error);
    process.exit(1);
  });
}

// Export for testing (if needed)
if (require.main === module) {
  startGame();
} else {
  module.exports = { SeaBattleGame, Ship, Board, AIPlayer, CONFIG };
} 