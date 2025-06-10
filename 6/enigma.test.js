const { Enigma, Rotor, plugboardSwap, ROTORS, REFLECTOR, alphabet } = require('./enigma.js');

// Test helper function to create an enigma with default settings
function createTestEnigma(rotorPositions = [0, 0, 0], ringSettings = [0, 0, 0], plugboardPairs = []) {
  return new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
}

describe('Enigma Machine Tests', () => {
  
  describe('Basic Functionality', () => {
    test('should encrypt and decrypt a message correctly (no plugboard)', () => {
      const enigma1 = createTestEnigma([0, 0, 0], [0, 0, 0], []);
      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], []);
      
      const message = 'HELLO';
      const encrypted = enigma1.process(message);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(message);
      expect(encrypted).not.toBe(message); // Should be different from original
    });

    test('should encrypt and decrypt with plugboard correctly', () => {
      const plugboard = [['A', 'B'], ['C', 'D']];
      const enigma1 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      
      const message = 'ABCD';
      const encrypted = enigma1.process(message);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(message);
    });

    test('should handle non-alphabetic characters unchanged', () => {
      const enigma = createTestEnigma();
      const message = 'HELLO 123!';
      const result = enigma.process(message);
      
      expect(result).toContain(' ');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
      expect(result).toContain('!');
    });

    test('should convert lowercase to uppercase', () => {
      const enigma = createTestEnigma();
      const result = enigma.process('hello');
      
      expect(result).not.toContain('h');
      expect(result).not.toContain('e');
      expect(result).not.toContain('l');
      expect(result).not.toContain('o');
    });
  });

  describe('Plugboard Functionality', () => {
    test('plugboardSwap should swap letters correctly', () => {
      const pairs = [['A', 'B'], ['C', 'D']];
      
      expect(plugboardSwap('A', pairs)).toBe('B');
      expect(plugboardSwap('B', pairs)).toBe('A');
      expect(plugboardSwap('C', pairs)).toBe('D');
      expect(plugboardSwap('D', pairs)).toBe('C');
      expect(plugboardSwap('E', pairs)).toBe('E'); // No swap
    });

    test('plugboard should work with empty pairs', () => {
      expect(plugboardSwap('A', [])).toBe('A');
      expect(plugboardSwap('Z', [])).toBe('Z');
    });

    test('complex plugboard configuration', () => {
      const plugboard = [['Q', 'W'], ['E', 'R'], ['T', 'Y']];
      const enigma1 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      
      const message = 'QWERTY';
      const encrypted = enigma1.process(message);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(message);
    });
  });

  describe('Rotor Functionality', () => {
    test('rotor should step correctly', () => {
      const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
      expect(rotor.position).toBe(0);
      
      rotor.step();
      expect(rotor.position).toBe(1);
      
      rotor.step();
      expect(rotor.position).toBe(2);
    });

    test('rotor should wrap around at 26', () => {
      const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 25);
      rotor.step();
      expect(rotor.position).toBe(0);
    });

    test('rotor should detect notch correctly', () => {
      const rotor = new Rotor(ROTORS[0].wiring, 'Q', 0, 16); // Q is at position 16
      expect(rotor.atNotch()).toBe(true);
      
      rotor.step();
      expect(rotor.atNotch()).toBe(false);
    });

    test('rotor forward and backward should be inverse operations', () => {
      const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 5);
      const original = 'A';
      const forward = rotor.forward(original);
      const backward = rotor.backward(forward);
      
      expect(backward).toBe(original);
    });
  });

  describe('Rotor Stepping Logic', () => {
    test('right rotor should always step', () => {
      const enigma = createTestEnigma([0, 0, 0]);
      
      enigma.encryptChar('A');
      expect(enigma.rotors[2].position).toBe(1);
      
      enigma.encryptChar('A');
      expect(enigma.rotors[2].position).toBe(2);
    });

    test('middle rotor should step when right rotor is at notch', () => {
      // Set right rotor just before its notch position
      const enigma = createTestEnigma([0, 0, 21]); // Right rotor at V-1 (V is notch for rotor III)
      
      enigma.encryptChar('A'); // This should trigger middle rotor step
      expect(enigma.rotors[1].position).toBe(1);
    });

    test('double stepping should work correctly', () => {
      // Set middle rotor at its notch position (E is at index 4)
      const enigma = createTestEnigma([0, 4, 0]); // Middle rotor at E (notch for rotor II)
      
      const leftPosBefore = enigma.rotors[0].position;
      const middlePosBefore = enigma.rotors[1].position;
      
      enigma.encryptChar('A');
      
      // The left rotor should step because middle rotor was at notch
      expect(enigma.rotors[0].position).toBe(leftPosBefore + 1);
      // The middle rotor should also step (double stepping) but only if it was actually at the notch
      expect(enigma.rotors[1].position).toBe(middlePosBefore + 1);
    });
  });

  describe('Ring Settings', () => {
    test('should encrypt differently with different ring settings', () => {
      const enigma1 = createTestEnigma([0, 0, 0], [0, 0, 0], []);
      const enigma2 = createTestEnigma([0, 0, 0], [1, 2, 3], []);
      
      const message = 'TEST';
      const result1 = enigma1.process(message);
      const result2 = enigma2.process(message);
      
      expect(result1).not.toBe(result2);
    });
  });

  describe('Reflector', () => {
    test('reflector should map to valid alphabet characters', () => {
      for (let i = 0; i < alphabet.length; i++) {
        const reflected = REFLECTOR[i];
        expect(alphabet.includes(reflected)).toBe(true);
      }
    });

    test('reflector should be reciprocal', () => {
      // Test that if A maps to B, then B maps to A
      for (let i = 0; i < alphabet.length; i++) {
        const char = alphabet[i];
        const reflected = REFLECTOR[i];
        const reflectedIndex = alphabet.indexOf(reflected);
        const doubleReflected = REFLECTOR[reflectedIndex];
        
        expect(doubleReflected).toBe(char);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const enigma = createTestEnigma();
      expect(enigma.process('')).toBe('');
    });

    test('should handle single character', () => {
      const enigma1 = createTestEnigma();
      const enigma2 = createTestEnigma();
      
      const encrypted = enigma1.process('A');
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe('A');
    });

    test('should handle long message', () => {
      const longMessage = 'A'.repeat(100);
      const enigma1 = createTestEnigma();
      const enigma2 = createTestEnigma();
      
      const encrypted = enigma1.process(longMessage);
      const decrypted = enigma2.process(encrypted);
      
      expect(decrypted).toBe(longMessage);
    });
  });

  describe('Bug Fix Verification', () => {
    test('should demonstrate the plugboard bug fix', () => {
      // This test demonstrates that plugboard is applied twice
      const plugboard = [['A', 'Z']];
      const enigma = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      
      // Encrypt 'A' which should become 'Z' via plugboard, 
      // get encrypted through machine, then become something else via plugboard again
      const result = enigma.encryptChar('A');
      
      // The result should not be the direct output without the second plugboard pass
      // This verifies the bug fix is working
      expect(result).not.toBe('A'); // Should be encrypted
      
      // Test round-trip
      const enigma2 = createTestEnigma([0, 0, 0], [0, 0, 0], plugboard);
      const decrypted = enigma2.encryptChar(result);
      expect(decrypted).toBe('A');
    });
  });
}); 