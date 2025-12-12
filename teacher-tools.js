/**
 * Teacher Tools - Helper functions for creating circuit challenges
 * 
 * This file contains utility functions to help teachers create,
 * save, and share logic circuit challenges with students.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a new challenge directory if it doesn't exist
const challengesDir = path.join(__dirname, 'challenges');
if (!fs.existsSync(challengesDir)) {
  fs.mkdirSync(challengesDir);
}

/**
 * Save a circuit challenge file
 * @param {string} name - Challenge name
 * @param {object} circuit - Circuit data
 * @param {object} metadata - Challenge metadata
 */
function saveChallenge(name, circuit, metadata) {
  const filename = path.join(challengesDir, `${name.toLowerCase().replace(/\s+/g, '-')}.challenge.json`);
  
  const challengeData = {
    name,
    circuit,
    metadata,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(filename, JSON.stringify(challengeData, null, 2));
  console.log(`✅ Challenge saved to ${filename}`);
}

/**
 * Convert an example circuit into a challenge
 */
function convertExampleToChallenge() {
  console.log('🔄 Converting example circuit to challenge...');
  
  // List available examples
  const examplesDir = path.join(__dirname, 'examples');
  
  if (!fs.existsSync(examplesDir)) {
    console.log('❌ Examples directory not found. Please create some example circuits first.');
    showMenu();
    return;
  }
  
  const examples = fs.readdirSync(examplesDir).filter(file => file.endsWith('.circuit'));
  
  if (examples.length === 0) {
    console.log('❌ No example circuits found in the examples directory.');
    showMenu();
    return;
  }
  
  console.log('\n📋 Available example circuits:');
  examples.forEach((example, index) => {
    console.log(`${index + 1}. ${example}`);
  });
  
  // Prompt for example selection
  rl.question('\n🎯 Select example number: ', (exampleIndex) => {
    const selectedExample = examples[parseInt(exampleIndex) - 1];
    
    if (!selectedExample) {
      console.log('❌ Invalid selection. Please try again.');
      convertExampleToChallenge();
      return;
    }
    
    // Read the example circuit
    const circuitPath = path.join(examplesDir, selectedExample);
    let circuit;
    
    try {
      circuit = JSON.parse(fs.readFileSync(circuitPath, 'utf8'));
    } catch (error) {
      console.log(`❌ Error reading circuit file: ${error.message}`);
      showMenu();
      return;
    }
    
    // Gather challenge metadata
    console.log(`\n✏️  Creating challenge from: ${selectedExample}`);
    
    rl.question('📝 Challenge name: ', (name) => {
      rl.question('📄 Description: ', (description) => {
        rl.question('⚡ Difficulty (easy/intermediate/hard): ', (difficulty) => {
          rl.question('⏱️  Time limit (minutes): ', (timeLimit) => {
            rl.question('🎯 Success criteria: ', (successCriteria) => {
              rl.question('💡 Hints (separate with semicolons): ', (hintsInput) => {
                
                const hints = hintsInput.split(';').map(hint => hint.trim()).filter(hint => hint);
                
                const metadata = {
                  description,
                  difficulty: difficulty || 'intermediate',
                  timeLimit: parseInt(timeLimit) || 15,
                  successCriteria,
                  hints
                };
                
                saveChallenge(name, circuit, metadata);
                
                console.log('\n✅ Challenge created successfully!');
                console.log('🔗 You can now share this challenge with students.');
                
                showMenu();
              });
            });
          });
        });
      });
    });
  });
}

/**
 * Main menu
 */
function showMenu() {
  console.log('\n🎓 === Teacher Tools for Logic Gate Simulator ===');
  console.log('1️⃣  Convert an example circuit to a challenge');
  console.log('2️⃣  List saved challenges');
  console.log('3️⃣  Generate shareable URL for a challenge');
  console.log('4️⃣  Create a new challenge from scratch');
  console.log('5️⃣  Exit');
  
  rl.question('\n🎯 Select an option (1-5): ', (option) => {
    switch (option.trim()) {
      case '1':
        convertExampleToChallenge();
        break;
      case '2':
        listChallenges();
        break;
      case '3':
        generateShareableUrl();
        break;
      case '4':
        createNewChallenge();
        break;
      case '5':
        console.log('👋 Goodbye! Happy teaching!');
        rl.close();
        break;
      default:
        console.log('❌ Invalid option. Please try again.');
        showMenu();
        break;
    }
  });
}

/**
 * List saved challenges
 */
function listChallenges() {
  const challenges = fs.readdirSync(challengesDir).filter(file => file.endsWith('.challenge.json'));
  
  if (challenges.length === 0) {
    console.log('📭 No challenges found. Create one first!');
    showMenu();
    return;
  }
  
  console.log('\n📚 Saved challenges:');
  challenges.forEach((challenge, index) => {
    const challengePath = path.join(challengesDir, challenge);
    try {
      const data = JSON.parse(fs.readFileSync(challengePath, 'utf8'));
      console.log(`${index + 1}. ${data.name} (${data.metadata.difficulty}) - ${data.metadata.description.substring(0, 50)}...`);
    } catch (error) {
      console.log(`${index + 1}. ${challenge} (Error reading file)`);
    }
  });
  
  rl.question('\n⏎ Press Enter to continue...', () => {
    showMenu();
  });
}

/**
 * Generate shareable URL for a challenge
 */
function generateShareableUrl() {
  const challenges = fs.readdirSync(challengesDir).filter(file => file.endsWith('.challenge.json'));
  
  if (challenges.length === 0) {
    console.log('📭 No challenges found. Create one first!');
    showMenu();
    return;
  }
  
  console.log('\n🔗 Select a challenge to generate a shareable URL:');
  challenges.forEach((challenge, index) => {
    console.log(`${index + 1}. ${challenge}`);
  });
  
  rl.question('\n🎯 Select challenge number: ', (challengeIndex) => {
    const selectedChallenge = challenges[parseInt(challengeIndex) - 1];
    
    if (!selectedChallenge) {
      console.log('❌ Invalid selection.');
      generateShareableUrl();
      return;
    }
    
    try {
      const challengePath = path.join(challengesDir, selectedChallenge);
      const challengeData = JSON.parse(fs.readFileSync(challengePath, 'utf8'));
      
      // Compress and encode the challenge data for URL
      const compressed = JSON.stringify(challengeData);
      const encoded = Buffer.from(compressed).toString('base64');
      
      // Generate the URL (assuming your app will be deployed)
      const baseUrl = 'https://phantasm0009.github.io/logic-gate-simulator/';
      const shareableUrl = `${baseUrl}?challenge=${encoded}`;
      
      console.log('\n✅ Shareable URL generated:');
      console.log('🔗', shareableUrl);
      console.log('\n📋 Copy this URL and share it with your students!');
      
    } catch (error) {
      console.log(`❌ Error processing challenge: ${error.message}`);
    }
    
    showMenu();
  });
}

/**
 * Create a new challenge from scratch
 */
function createNewChallenge() {
  console.log('\n✨ Creating a new challenge from scratch...');
  
  rl.question('📝 Challenge name: ', (name) => {
    rl.question('📄 Description: ', (description) => {
      rl.question('⚡ Difficulty (easy/intermediate/hard): ', (difficulty) => {
        rl.question('⏱️  Time limit (minutes): ', (timeLimit) => {
          rl.question('🎯 Success criteria: ', (successCriteria) => {
            rl.question('💡 Hints (separate with semicolons): ', (hintsInput) => {
              
              const hints = hintsInput.split(';').map(hint => hint.trim()).filter(hint => hint);
              
              // Create a minimal circuit structure
              const circuit = {
                nodes: [
                  {
                    id: 'switch-1',
                    type: 'switch',
                    position: { x: 100, y: 100 },
                    data: { label: 'Input A', state: false }
                  },
                  {
                    id: 'switch-2',
                    type: 'switch',
                    position: { x: 100, y: 200 },
                    data: { label: 'Input B', state: false }
                  },
                  {
                    id: 'led-1',
                    type: 'led',
                    position: { x: 500, y: 150 },
                    data: { label: 'Output', state: false }
                  }
                ],
                edges: []
              };
              
              const metadata = {
                description,
                difficulty: difficulty || 'intermediate',
                timeLimit: parseInt(timeLimit) || 15,
                successCriteria,
                hints
              };
              
              saveChallenge(name, circuit, metadata);
              
              console.log('\n✅ New challenge created successfully!');
              console.log('📝 Note: This is a basic template. You can modify the circuit file directly for more complex challenges.');
              
              showMenu();
            });
          });
        });
      });
    });
  });
}

// Start the application
console.log('🎓 Welcome to the Logic Gate Simulator Teacher Tools');
console.log('📚 This tool helps you create and manage circuit challenges for students.\n');

showMenu();
