import {KeyUpEvent, SDOnActionEvent, StateType, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {StateOutput} from "ytmdesktop-ts-companion";

export class MuteAction extends DefaultAction<MuteAction> {
    private events: { context: string, method: (state: StateOutput) => void }[] = [];
    private initialized = false;
    private volume = 0;
    private lastVolume = 0;

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
            method: (state: StateOutput) => {
                if (!this.initialized) {
                    this.initialized = true;
                    this.volume = state.player.volume;
                    this.lastVolume = this.volume;
                }
                this.volume = state.player.volume;
                if (this.volume > 0) {
                    this.lastVolume = this.volume;
                }

                this.plugin.setState(this.volume > 0 ? StateType.ON : StateType.OFF, context);
            }
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
        if (this.volume <= 0) {
            this.volume = this.lastVolume;

            this.rest.setVolume(this.volume).catch(reason => {
                console.error(reason);
                this.plugin.logMessage(`Error while setting volume. volume: ${this.volume}, event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
                this.plugin.showAlert(event.context)
            });

            return;
        }

        this.lastVolume = this.volume;
        this.volume = 0;

        this.rest.setVolume(this.volume).catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while setting volume. volume: ${this.volume}, event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(event.context)
        });
    }
}
