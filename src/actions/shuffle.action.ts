import { WillAppearEvent, KeyUpEvent, WillDisappearEvent, SDOnActionEvent } from 'streamdeck-typescript';
import { ActionTypes } from '../interfaces/enums';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class ShuffleAction extends DefaultAction<ShuffleAction> {
    constructor(plugin: YTMD, actionName: ActionTypes) {
        super(plugin, actionName)
    }
    
    onContextAppear(event: WillAppearEvent<any>): void {
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent<any>): void {
        this.socket.playerShuffle();
        this.plugin.showOk(event.context);
    }
    
    onContextDisappear(event: WillDisappearEvent<any>): void {
    }

}