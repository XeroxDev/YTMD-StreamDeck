import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';

export class NextPrevAction extends DefaultAction<NextPrevAction> {
    constructor(
        private plugin: YTMD,
        actionName: string,
        private nextOrPrev: 'NEXT' | 'PREV'
    ) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent) {
        if (this.nextOrPrev === 'NEXT') this.rest.next().catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while next. event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(event.context)
        });
        else this.rest.previous().catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while previous. event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(event.context)
        })
    }
}
