class LED {
    constructor(id) {
        this.id = id;
        this.state = false; // LED is initially off
        this.element = document.getElementById(id);
    }

    update(state) {
        this.state = state;
        this.render();
    }

    render() {
        if (this.state) {
            this.element.classList.add('on');
            this.element.classList.remove('off');
        } else {
            this.element.classList.add('off');
            this.element.classList.remove('on');
        }
    }
}