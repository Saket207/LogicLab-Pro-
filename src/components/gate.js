class Gate {
    constructor(type) {
        this.type = type;
        this.inputs = [];
        this.output = 0;
    }

    addInput(input) {
        this.inputs.push(input);
    }

    evaluate() {
        switch (this.type) {
            case 'AND':
                this.output = this.inputs.every(input => input === 1) ? 1 : 0;
                break;
            case 'OR':
                this.output = this.inputs.some(input => input === 1) ? 1 : 0;
                break;
            case 'NOT':
                this.output = this.inputs[0] === 1 ? 0 : 1;
                break;
            case 'NAND':
                this.output = this.inputs.every(input => input === 1) ? 0 : 1;
                break;
            case 'NOR':
                this.output = this.inputs.some(input => input === 1) ? 0 : 1;
                break;
            case 'XOR':
                this.output = this.inputs.reduce((acc, input) => acc ^ input, 0);
                break;
            default:
                this.output = 0;
                break;
        }
    }

    getOutput() {
        return this.output;
    }
}