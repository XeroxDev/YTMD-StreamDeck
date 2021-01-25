class LikeAction extends DefaultAction {
    destroy$ = new rxjs.Subject();
    liked = false;

    onContextAppear(event) {
        Main.MUSICDATA.pipe(takeUntil(this.destroy$)).subscribe(data => {
            if (!data) {
                return;
            }
            const _liked = data.player.likeStatus === 'LIKE';

            if (this.liked !== _liked) {
                this.liked = _liked;
                this.context.setState(this.liked ? 0 : 1);
            }
        });
    }

    onContextDisappear(event) {
        this.destroy$.next();
    }

    onKeypressUp(event) {
        this.sendAction('track-thumbs-up')
    }
}
