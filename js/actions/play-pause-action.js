class PlayPauseAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    playing = false;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            if (!data) {
                return;
            }
            this.context.setTitle(data ? data.player.seekbarCurrentPositionHuman : '0:00');

            if (this.playing !== data.player.isPaused) {
                this.playing = data.player.isPaused;
                this.context.setState(this.playing ? 0 : 1);
            }
        });
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        this.sendAction('track-play');
    }
}
