import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {StateOutput} from "ytmdesktop-ts-companion";

export class MuteAction extends DefaultAction<MuteAction> {
    private events: { context: string, method: (state: StateOutput) => void }[] = [];
    private muted: boolean = false;

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear({context}: WillAppearEvent) {
        let found = this.events.find(e => e.context === context);
        if (found) {
            return;
        }

        found = {
            context: context,
            method: (state: StateOutput) => this.muted = state.player.volume === 0
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
    onKeypressUp(event: KeyUpEvent) {
        this.muted = !this.muted;
        this.muted ? this.rest.mute().catch(reason => {
            console.error(reason);
            this.plugin.showAlert(event.context)
        }) : this.rest.unmute().catch(reason => {
            console.error(reason);
            this.plugin.showAlert(event.context)
        });
    }
}
