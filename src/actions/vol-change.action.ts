import {KeyDownEvent, KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {StateOutput} from "ytmdesktop-ts-companion";

export class VolChangeAction extends DefaultAction<VolChangeAction> {
    private keyDown: boolean = false;
    private currentVolume: number = 50;
    private events: { context: string, method: (state: StateOutput) => void }[] = [];


    constructor(
        private plugin: YTMD,
        action: string,
        private readonly type: string
    ) {
        super(plugin, action);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {
        let found = this.events.find(e => e.context === event.context);
        if (found) {
            return;
        }

        found = {
            context: event.context,
            method: (state: StateOutput) => this.currentVolume = state.player.volume
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
    onKeypressUp({context, payload: {settings}}: KeyUpEvent) {
        this.keyDown = false;
    }

    @SDOnActionEvent('keyDown')
    async onKeypressDown({context, payload: {settings}}: KeyDownEvent) {
        this.keyDown = true;

        while (this.keyDown) {
            let newVolume = this.currentVolume;
            if (this.type === 'UP') newVolume += settings?.steps ?? 10;
            else newVolume -= settings?.steps ?? 10;

            this.currentVolume = newVolume;
            this.rest.setVolume(newVolume <= 0 ? 0 : newVolume >= 100 ? 100 : newVolume).catch(reason => {
                console.error(reason);
                this.plugin.logMessage(`Error while setting volume. volume: ${newVolume}, context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                this.plugin.showAlert(context)
            });
            await this.wait(500);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    }
}
