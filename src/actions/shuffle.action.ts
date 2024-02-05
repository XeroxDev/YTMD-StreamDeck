import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {ActionTypes} from '../interfaces/enums';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';

export class ShuffleAction extends DefaultAction<ShuffleAction> {
    constructor(private plugin: YTMD, actionName: ActionTypes) {
        super(plugin, actionName)
    }

    onContextAppear(event: WillAppearEvent<any>): void {
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent<any>): void {
        this.rest.shuffle()
            .then(() => this.plugin.showOk(event.context))
            .catch(reason => {
                console.error(reason);
                this.plugin.showAlert(event.context)
            });
    }

    onContextDisappear(event: WillDisappearEvent<any>): void {
    }

}