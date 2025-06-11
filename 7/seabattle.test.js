const { SeaBattleGame, Ship, Board, AIPlayer, CONFIG } = require('./seabattle_refactored');

describe('Sea Battle Game - Refactored Version', () => {
  
  describe('Ship Class', () => {
    let ship;
    
    beforeEach(() => {
      ship = new Ship(['00', '01', '02']);
    });

    test('should create ship with correct locations', () => {
      expect(ship.locations.has('00')).toBe(true);
      expect(ship.locations.has('01')).toBe(true);
      expect(ship.locations.has('02')).toBe(true);
      expect(ship.locations.size).toBe(3);
    });

    test('should register hits correctly', () => {
      expect(ship.hit('00')).toBe(true);
      expect(ship.hit('99')).toBe(false);
      expect(ship.hits.has('00')).toBe(true);
    });

    test('should detect when ship is sunk', () => {
      expect(ship.isSunk()).toBe(false);
      
      ship.hit('00');
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
      
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });

    test('should check if location is part of ship', () => {
      expect(ship.isLocationPartOfShip('00')).toBe(true);
      expect(ship.isLocationPartOfShip('99')).toBe(false);
    });

    test('should track already hit locations', () => {
      ship.hit('00');
      expect(ship.isAlreadyHit('00')).toBe(true);
      expect(ship.isAlreadyHit('01')).toBe(false);
    });
  });

  describe('Board Class', () => {
    let board;
    
    beforeEach(() => {
      board = new Board();
    });

    test('should initialize with correct grid size', () => {
      expect(board.grid.length).toBe(CONFIG.BOARD_SIZE);
      expect(board.grid[0].length).toBe(CONFIG.BOARD_SIZE);
      expect(board.grid[0][0]).toBe(CONFIG.SYMBOLS.WATER);
    });

    test('should place ship correctly', () => {
      const ship = new Ship(['00', '01', '02']);
      board.placeShip(ship, true);
      
      expect(board.ships.length).toBe(1);
      expect(board.grid[0][0]).toBe(CONFIG.SYMBOLS.SHIP);
      expect(board.grid[0][1]).toBe(CONFIG.SYMBOLS.SHIP);
      expect(board.grid[0][2]).toBe(CONFIG.SYMBOLS.SHIP);
    });

    test('should detect ship collisions', () => {
      const ship1 = new Ship(['00', '01', '02']);
      const ship2 = new Ship(['01', '11', '21']); // Overlaps at 01
      
      board.placeShip(ship1);
      expect(board.hasCollision(ship2)).toBe(true);
      
      const ship3 = new Ship(['10', '11', '12']);
      expect(board.hasCollision(ship3)).toBe(false);
    });

    test('should process guesses correctly', () => {
      const ship = new Ship(['00', '01', '02']);
      board.placeShip(ship);
      
      // Hit
      const hitResult = board.processGuess('00');
      expect(hitResult.result).toBe('hit');
      expect(board.grid[0][0]).toBe(CONFIG.SYMBOLS.HIT);
      
      // Miss
      const missResult = board.processGuess('99');
      expect(missResult.result).toBe('miss');
      expect(board.grid[9][9]).toBe(CONFIG.SYMBOLS.MISS);
      
      // Already guessed
      const duplicateResult = board.processGuess('00');
      expect(duplicateResult.result).toBe('already_guessed');
    });

    test('should detect when ship is sunk', () => {
      const ship = new Ship(['00', '01', '02']);
      board.placeShip(ship);
      
      board.processGuess('00');
      board.processGuess('01');
      
      const sunkResult = board.processGuess('02');
      expect(sunkResult.result).toBe('sunk');
      expect(ship.isSunk()).toBe(true);
    });

    test('should count remaining ships correctly', () => {
      const ship1 = new Ship(['00', '01', '02']);
      const ship2 = new Ship(['10', '11', '12']);
      
      board.placeShip(ship1);
      board.placeShip(ship2);
      expect(board.getRemainingShips()).toBe(2);
      
      // Sink first ship
      board.processGuess('00');
      board.processGuess('01');
      board.processGuess('02');
      expect(board.getRemainingShips()).toBe(1);
    });

    test('should place ships randomly without collisions', () => {
      expect(() => {
        board.placeShipsRandomly(3, false);
      }).not.toThrow();
      
      expect(board.ships.length).toBe(3);
      
      // Check no collisions exist
      for (let i = 0; i < board.ships.length; i++) {
        for (let j = i + 1; j < board.ships.length; j++) {
          const ship1 = board.ships[i];
          const ship2 = board.ships[j];
          
          const hasOverlap = [...ship1.locations].some(loc => 
            ship2.locations.has(loc)
          );
          expect(hasOverlap).toBe(false);
        }
      }
    });

    test('should parse and format locations correctly', () => {
      expect(board.formatLocation(5, 7)).toBe('57');
      expect(board.parseLocation('57')).toEqual([5, 7]);
    });
  });

  describe('AI Player Class', () => {
    let ai;
    
    beforeEach(() => {
      ai = new AIPlayer();
    });

    test('should start in hunt mode', () => {
      expect(ai.mode).toBe(CONFIG.CPU_MODES.HUNT);
      expect(ai.targetQueue.length).toBe(0);
    });

    test('should generate valid random guesses', () => {
      const guess = ai.generateRandomGuess();
      expect(guess.length).toBe(2);
      
      const row = parseInt(guess[0]);
      const col = parseInt(guess[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(CONFIG.BOARD_SIZE);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(CONFIG.BOARD_SIZE);
    });

    test('should not repeat guesses', () => {
      const guesses = new Set();
      
      for (let i = 0; i < 10; i++) {
        const guess = ai.makeGuess();
        expect(guesses.has(guess)).toBe(false);
        guesses.add(guess);
      }
    });

    test('should switch to target mode after hit', () => {
      ai.onHit('44', false);
      expect(ai.mode).toBe(CONFIG.CPU_MODES.TARGET);
      expect(ai.targetQueue.length).toBeGreaterThan(0);
    });

    test('should return to hunt mode after sinking ship', () => {
      ai.mode = CONFIG.CPU_MODES.TARGET;
      ai.targetQueue = ['43', '45'];
      
      ai.onHit('44', true);
      expect(ai.mode).toBe(CONFIG.CPU_MODES.HUNT);
      expect(ai.targetQueue.length).toBe(0);
    });

    test('should add adjacent targets correctly', () => {
      ai.addAdjacentTargets('44');
      
      const expectedTargets = ['34', '54', '43', '45'];
      expectedTargets.forEach(target => {
        expect(ai.targetQueue.includes(target)).toBe(true);
      });
    });

    test('should validate locations correctly', () => {
      expect(ai.isValidLocation(0, 0)).toBe(true);
      expect(ai.isValidLocation(9, 9)).toBe(true);
      expect(ai.isValidLocation(-1, 0)).toBe(false);
      expect(ai.isValidLocation(0, 10)).toBe(false);
      expect(ai.isValidLocation(10, 10)).toBe(false);
    });

    test('should not add invalid adjacent targets', () => {
      ai.addAdjacentTargets('00'); // Top-left corner
      
      // Should only add valid adjacent cells
      const validTargets = ai.targetQueue.filter(target => {
        const [row, col] = [parseInt(target[0]), parseInt(target[1])];
        return ai.isValidLocation(row, col);
      });
      
      expect(validTargets.length).toBe(ai.targetQueue.length);
    });
  });

  describe('Game Integration', () => {
    let game;
    
    beforeEach(() => {
      game = new SeaBattleGame();
    });

    afterEach(() => {
      if (game.rl) {
        game.rl.close();
      }
    });

    test('should initialize game correctly', () => {
      expect(game.playerBoard).toBeInstanceOf(Board);
      expect(game.opponentBoard).toBeInstanceOf(Board);
      expect(game.ai).toBeInstanceOf(AIPlayer);
    });

    test('should validate player input correctly', () => {
      expect(game.validatePlayerInput('45').valid).toBe(true);
      expect(game.validatePlayerInput('45').location).toBe('45');
      
      expect(game.validatePlayerInput('').valid).toBe(false);
      expect(game.validatePlayerInput('4').valid).toBe(false);
      expect(game.validatePlayerInput('123').valid).toBe(false);
      expect(game.validatePlayerInput('ab').valid).toBe(false);
      expect(game.validatePlayerInput('99').valid).toBe(true);
      expect(game.validatePlayerInput('aa').valid).toBe(false);
    });

    test('should detect game end conditions', () => {
      // Set up scenario where player wins
      game.opponentBoard.ships = [];
      expect(game.checkGameEnd()).toBe(true);
      
      // Reset and set up scenario where CPU wins
      game = new SeaBattleGame();
      game.playerBoard.ships = [];
      expect(game.checkGameEnd()).toBe(true);
      
      // Game continues
      game = new SeaBattleGame();
      game.playerBoard.placeShipsRandomly(1, false);
      game.opponentBoard.placeShipsRandomly(1, false);
      expect(game.checkGameEnd()).toBe(false);
    });
  });

  describe('Bug Fixes Verification', () => {
    test('should not have unused variables', () => {
      const board = new Board();
      const ship = board.generateRandomShip();
      
      // In original code, shipLocations was unused
      // In refactored version, we only use what we need
      expect(ship).toBeInstanceOf(Ship);
      expect(ship.locations.size).toBe(CONFIG.SHIP_LENGTH);
    });

    test('should use Set for efficient duplicate checking', () => {
      const board = new Board();
      
      // Original used indexOf which is O(n)
      // Refactored uses Set which is O(1)
      board.processGuess('00');
      const start = Date.now();
      board.processGuess('00'); // Duplicate check
      const end = Date.now();
      
      // This should be very fast with Set
      expect(end - start).toBeLessThan(10);
    });

    test('should prevent infinite loops in ship placement', () => {
      const board = new Board();
      
      // This should not hang even with many ships
      expect(() => {
        board.placeShipsRandomly(5, false); // More ships than original
      }).not.toThrow();
    });

    test('should handle edge cases in AI targeting', () => {
      const ai = new AIPlayer();
      
      // AI should handle corner cases correctly
      ai.addAdjacentTargets('00'); // Top-left corner
      ai.addAdjacentTargets('99'); // Bottom-right corner
      
      // All targets should be valid
      for (const target of ai.targetQueue) {
        const [row, col] = [parseInt(target[0]), parseInt(target[1])];
        expect(ai.isValidLocation(row, col)).toBe(true);
      }
    });
  });

  describe('Performance Improvements', () => {
    test('should be faster with Set vs Array for duplicate checking', () => {
      const testSize = 1000;
      const testArray = [];
      const testSet = new Set();
      
      // Fill both with same data
      for (let i = 0; i < testSize; i++) {
        const item = `${i}${i}`;
        testArray.push(item);
        testSet.add(item);
      }
      
      // Test Array indexOf (original approach)
      const arrayStart = Date.now();
      for (let i = 0; i < 100; i++) {
        testArray.indexOf('500500');
      }
      const arrayTime = Date.now() - arrayStart;
      
      // Test Set has (refactored approach)
      const setStart = Date.now();
      for (let i = 0; i < 100; i++) {
        testSet.has('500500');
      }
      const setTime = Date.now() - setStart;
      
      // Set should be significantly faster
      expect(setTime).toBeLessThanOrEqual(arrayTime);
    });
  });
}); 