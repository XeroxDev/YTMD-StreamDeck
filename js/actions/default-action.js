class DefaultAction {
    _context;

    onContextAppear(event) {
    }

    onContextDisappear(event) {
    }

    onKeypressUp(event) {
    }

    onKeypressDown(event) {
    }

    async sendAction(command, value) {
        return value ? return Main.sendRequest('POST', {command, value}) : Main.sendRequest('POST', {command});
    }


    get context() {
        return this._context;
    }

    set context(value) {
        this._context = value;
    }
}
