import {
    KeyDownEvent,
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';
import { MuteAction } from './mute.action';

export class VolChangeAction extends DefaultAction<VolChangeAction> {
    private keyDown: boolean = false;

    constructor(
        plugin: YTMD,
        action: string,
        private readonly type: string
    ) {
        super(plugin, action);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {}

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp({ context, payload: { settings } }: KeyUpEvent) {
        this.keyDown = false;
    }

    @SDOnActionEvent('keyDown')
    async onKeypressDown({ context, payload: { settings } }: KeyDownEvent) {
        this.keyDown = true;

        while (this.keyDown) {
            let newVolume = MuteAction.currentVolume$.getValue();
            if (this.type === 'UP') newVolume += settings?.steps ?? 10;
            else newVolume -= settings?.steps ?? 10;

            MuteAction.lastVolume = newVolume;
            MuteAction.currentVolume$.next(newVolume);
            this.socket.playerSetVolume(
                newVolume <= 0 ? -1 : newVolume >= 100 ? 100 : newVolume
            );
            await this.wait(500);
        }
    }

    private wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    }
}
