class VolChangeAction extends DefaultAction {
    _type;
    _amount = 10;

    constructor(type, amount) {
        super();
        this._type = type;
        this._amount = amount;
    }


    onKeypressUp(event) {
        let newVolume = MuteAction.currentVolume$.getValue();
        if (this._type === 'UP')
            newVolume += this._amount;
        else
            newVolume -= this._amount;

        MuteAction.lastVolume = newVolume
        MuteAction.currentVolume$.next(newVolume);
        this.sendAction('player-set-volume', newVolume <= 0 ? -1 : newVolume >= 100 ? 100 : newVolume);
    }
}
