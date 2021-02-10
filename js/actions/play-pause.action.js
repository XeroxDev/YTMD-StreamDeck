class PlayPauseAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    playing = false;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            Main.PLAY_SETTINGS = this.context.settings;
            if (!data || data === true) {
                this.context.showAlert();
                return;
            }
            this.context.setTitle(data ? data.player.seekbarCurrentPositionHuman : '0:00');

            if (this.playing !== data.player.isPaused) {
                this.playing = data.player.isPaused;
                this.context.setState(this.playing ? Enums.STATE.ON : Enums.STATE.OFF);
            }
        });
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        this.sendAction(`track-${this.playing ? 'play' : 'pause'}`);
    }
}
