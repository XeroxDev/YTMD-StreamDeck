class DislikeAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    disliked = false;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            if (!data || data === true) {
                return;
            }
            const _disliked = data.player.likeStatus === 'DISLIKE';
            if (this.disliked !== _disliked) {
                this.disliked = _disliked;
                this.context.setState(this.disliked ? Enums.STATE.ON : Enums.STATE.OFF);
            }
        });
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        this.sendAction('track-thumbs-down')
    }
}
