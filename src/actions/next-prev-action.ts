import {
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class NextPrevAction extends DefaultAction<NextPrevAction> {
    constructor(
        plugin: YTMD,
        actionName: string,
        private nextOrPrev: 'NEXT' | 'PREV'
    ) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {}

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent) {
        if (this.nextOrPrev === 'NEXT') this.socket.trackNext();
        else this.socket.trackPrevious();
    }
}
