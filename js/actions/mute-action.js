class MuteAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    lastVolume = 50;
    currentVolume = 50;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            if (!data) {
                return;
            }
            const vol = data.player.volumePercent;
            this.context.setTitle((data ? vol : 0) + '%');

            this.currentVolume = vol;
        });
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        this.lastVolume = this.currentVolume === 0 ? this.lastVolume : this.currentVolume;
        const value = this.currentVolume === 0 ? this.lastVolume : 0;
        console.log(value)
        this.sendAction('player-set-volume').then(console.log);
    }
}
