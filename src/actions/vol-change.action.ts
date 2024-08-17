import {KeyDownEvent, KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent, DialRotateEvent, DialUpEvent} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {StateOutput} from "ytmdesktop-ts-companion";

export class VolChangeAction extends DefaultAction<VolChangeAction> {
    private keyDown: boolean = false;
    private currentVolume: number = 50;
    private events: { context: string, method: (state: StateOutput) => void }[] = [];
    private lastVolume = 0;
    private ticks = 0;
    private lastcheck = 0;
    private iconpath: string;

    constructor(
        private plugin: YTMD,
        action: string,
        private readonly type: string
    ) {
        super(plugin, action);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear({context, payload: {settings}}: WillAppearEvent): void {
        let found = this.events.find(e => e.context === context);
        if (found) {
            return;
        }

        found = {
            context: context,
            method: (state: StateOutput) => { 
                this.currentVolume = state.player.volume;
                this.updateIcon();
                this.plugin.setFeedback(context, {"icon": this.iconpath, "title": "Volume", "value": this.currentVolume + "%", "indicator": { "value": this.currentVolume, "enabled": true}});
                if (this.lastcheck === 0 && this.ticks !== 0)
                {
                    let newVolume = this.currentVolume + this.lastVolume;
                    this.lastVolume = 0;
                    newVolume += (settings?.steps ?? 2) * this.ticks;
            
                    this.rest.setVolume(newVolume < 0 ? 0 : newVolume > 100 ? 100 : newVolume).catch(reason => {
                        newVolume = this.currentVolume;
                        console.error(reason);
                        this.plugin.logMessage(`Error while setting volume. volume: ${newVolume}, context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                        this.plugin.showAlert(context)
                    }).finally(() => {
                        this.currentVolume = newVolume;
                    });
                    this.ticks = 0
                    this.lastcheck = 3;
                }
                if (this.lastcheck > 0)
                {
                    this.lastcheck -= 1;
                }
            }
        };

        this.events.push(found);

        this.socket.addStateListener(found.method);
    }

    private updateIcon(): void {
        if (this.currentVolume >= 66) {
            this.iconpath = "icons/volume-up";
        }
        else if (this.currentVolume >= 33) {
            this.iconpath = "icons/volume-on";
        }
        else if (this.currentVolume <= 0) {
            this.iconpath = "icons/volume-mute";
        }
        else {
            this.iconpath = "icons/volume-down";
        }
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

    @SDOnActionEvent('dialUp')
    onDialUp({context, payload: {settings}}: DialUpEvent) {
        if (this.currentVolume <= 0) {
            this.currentVolume = this.lastVolume;
            this.lastVolume = 0;
        } else {
            this.lastVolume = this.currentVolume;
            this.currentVolume = 0;
        }
        this.rest.setVolume(this.currentVolume).catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while setting volume. volume: ${this.currentVolume}, context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(context)
        });
    }

    @SDOnActionEvent('dialRotate')
    onDialRotate({context, payload: {settings, ticks}}: DialRotateEvent) {
        this.ticks += ticks;
    }

    private wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    }
}
