class Wire {
    constructor(startGate, endGate) {
        this.startGate = startGate;
        this.endGate = endGate;
        this.path = [];
    }

    draw(context) {
        if (this.startGate && this.endGate) {
            context.beginPath();
            context.moveTo(this.startGate.x, this.startGate.y);
            context.lineTo(this.endGate.x, this.endGate.y);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            context.stroke();
        }
    }

    updateConnection(newStartGate, newEndGate) {
        this.startGate = newStartGate;
        this.endGate = newEndGate;
    }

    getOutput() {
        if (this.startGate) {
            return this.startGate.getOutput();
        }
        return 0; // Default output if no start gate
    }
}