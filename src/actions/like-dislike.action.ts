import {KeyUpEvent, SDOnActionEvent, StateType, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {LikeStatus, StateOutput} from 'ytmdesktop-ts-companion';

export class LikeDislikeAction extends DefaultAction<LikeDislikeAction> {
    private events: { context: string, method: (state: StateOutput) => void }[] = [];

    constructor(
        private plugin: YTMD,
        actionName: string,
        private likeStatus: LikeStatus
    ) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {
        let found = this.events.find(e => e.context === event.context);
        if (found) {
            return;
        }

        found = {
            context: event.context,
            method: (state: StateOutput) => this.handleLikeDislike(event.context, state)
        };

        this.events.push(found);

        this.socket.addStateListener(found.method);
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        const found = this.events.find(e => e.context === event.context);
        if (!found) {
            return;
        }

        this.socket.removeStateListener(found.method);
        this.events = this.events.filter(e => e.context !== event.context);
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent): void {
        if (this.likeStatus === LikeStatus.LIKE) this.rest.toggleLike().catch(reason => {
            console.error(reason);
            this.plugin.showAlert(event.context)
        });
        else if (this.likeStatus === LikeStatus.DISLIKE) this.rest.toggleDislike().catch(reason => {
            console.error(reason);
            this.plugin.showAlert(event.context)
        });
    }

    handleLikeDislike(
        context: string,
        data: StateOutput
    ) {
        if (Object.keys(data).length === 0 || !data.video) {
            return;
        }

        const correctState: boolean = data.video.likeStatus === this.likeStatus;
        this.plugin.setState(correctState ? StateType.ON : StateType.OFF, context);
    }
}
