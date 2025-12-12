# 🔌 Logic Gate Simulator

An interactive web application for learning digital logic and Boolean algebra through hands-on circuit building.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-4.4.5-purple.svg)

## 🌟 Features

### Core Functionality
- **🎯 Drag-and-Drop Interface**: Intuitive circuit building with snap-to-grid functionality
- **⚡ Real-time Simulation**: Instant feedback with animated signal propagation
- **🔗 Smart Wire Connections**: Visual wire routing with automatic connection detection
- **💡 Interactive Components**: Switches, LEDs, and comprehensive logic gates (AND, OR, NOT, NAND, NOR, XOR)

### Advanced Components
- **🧮 Binary Calculator**: Built-in calculator for binary operations
- **📊 Truth Table Generator**: Automatic truth table generation for any circuit
- **🕐 Binary Clock**: Real-time binary clock component
- **🔢 Multi-bit Components**: Half adders, full adders, multiplexers, and displays

### Educational Tools
- **🎓 Teacher Dashboard**: Create and manage circuit challenges
- **📝 Challenge System**: Pre-built challenges with hints and difficulty levels
- **🌍 Real-World Examples**: See how logic gates are used in everyday technology
- **📚 Boolean Expression Display**: Visual representation of circuit logic

### Sharing & Collaboration
- **🔗 Circuit Sharing**: Export/import circuits and create shareable URLs
- **💾 Local Storage**: Auto-save your work locally
- **📤 Challenge Distribution**: Teachers can easily share challenges with students

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/logic-gate-simulator.git

# Navigate to project directory
cd logic-gate-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

### Building Your First Circuit
1. **Select Components**: Drag gates from the toolbar to the workspace
2. **Connect Wires**: Click and drag from output to input connections
3. **Add Inputs/Outputs**: Use switches for inputs and LEDs for outputs
4. **Test Circuit**: Toggle switches to see your circuit in action

### Advanced Features
- **Truth Tables**: View automatically generated truth tables in the side panel
- **Boolean Expressions**: See the mathematical representation of your circuit
- **Signal Animation**: Watch signals propagate through your circuit in real-time
- **Real-World Examples**: Learn about practical applications of your circuits

## 🎓 For Educators

### Teacher Dashboard
Access the teacher dashboard to create and manage educational content:

```bash
npm run teacher
```

### Creating Challenges
1. Build a circuit in the main workspace
2. Open the Teacher Dashboard
3. Fill in challenge details (name, description, difficulty)
4. Add hints and success criteria
5. Save and share with students

### Challenge Management
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Time Limits**: Set appropriate time constraints
- **Hints System**: Progressive hints to guide student learning
- **Success Criteria**: Clear objectives for completion

## 🌍 Real-World Applications

The simulator includes examples showing how logic gates are used in:
- **Computer Processors**: CPU arithmetic and control units
- **Memory Systems**: RAM and cache memory circuits
- **Digital Displays**: LED matrices and seven-segment displays
- **Automatic Systems**: Traffic lights, elevators, security systems
- **Communication**: Data encoding and error correction

## 🔧 Technical Details

### Tech Stack
- **Frontend**: React 18 + Vite
- **UI Library**: ReactFlow for circuit visualization
- **Styling**: CSS3 with modern flexbox/grid layouts
- **State Management**: React hooks and context
- **Animation**: CSS animations + custom animation manager

### Project Structure
```
src/
├── components/          # React components
│   ├── gates/          # Logic gate components
│   ├── layout/         # Layout and navigation
│   └── icons/          # Icon components
├── utils/              # Utility functions
│   ├── circuitEvaluator.js    # Circuit logic evaluation
│   ├── signalAnimationManager.js  # Animation system
│   └── expressionGenerator.js     # Boolean expression generation
└── styles/             # CSS stylesheets
```

### Key Files
- `src/App.jsx` - Main application component
- `src/utils/circuitEvaluator.js` - Core circuit simulation logic
- `src/components/TeacherDashboard.jsx` - Educational tools
- `src/components/RealWorldPopup.jsx` - Real-world examples

## 📚 Educational Standards Alignment

### STEM Concepts Covered
- **🔬 Science**: Understanding electrical circuits and digital systems
- **🔧 Technology**: Introduction to computer hardware and digital logic
- **⚙️ Engineering**: Circuit design and problem-solving methodology
- **🧮 Mathematics**: Boolean algebra, binary number systems, truth tables

### Learning Objectives
- Understand basic logic operations (AND, OR, NOT)
- Learn to read and create truth tables
- Explore binary number systems
- Gain insight into computer hardware fundamentals
- Develop logical thinking and problem-solving skills

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow React best practices
- Write clear, commented code
- Test new features thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **📧 Issues**: Report bugs or request features via GitHub Issues
- **📖 Documentation**: Check the wiki for detailed guides
- **💬 Discussions**: Join community discussions on GitHub

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile-responsive design improvements
- [ ] Advanced components (flip-flops, counters)
- [ ] Circuit simulation speed controls
- [ ] Collaborative real-time editing
- [ ] Integration with classroom management systems
- [ ] More extensive real-world examples

### Version History
- **v1.0.0**: Core logic gate simulation
- **v1.1.0**: Added teacher dashboard and challenges
- **v1.2.0**: Real-world examples and binary calculator
- **v1.3.0**: Enhanced animations and multi-bit components

---

**Made with ❤️ for STEM Education**