class MuteAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    static currentVolume$ = new rxjs.BehaviorSubject(50);
    static lastVolume = 50;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            if (!data || data === true) {
                return;
            }
            const vol = data.player.volumePercent;
            MuteAction.currentVolume$.next(vol);
        });

        MuteAction.currentVolume$.pipe().subscribe(
            vol =>this.context.setTitle(`${Math.round(!vol || vol <= 0 ? 0 : vol >= 100 ? 100 : vol)}%`)
        )
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        MuteAction.lastVolume = MuteAction.currentVolume$.getValue() === 0 ? MuteAction.lastVolume : MuteAction.currentVolume$.getValue();
        const value = MuteAction.currentVolume$.getValue() === 0 ? MuteAction.lastVolume : -1;
        this.sendAction('player-set-volume', value);
    }
}
