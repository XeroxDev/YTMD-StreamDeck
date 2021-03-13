import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class MuteAction extends DefaultAction<MuteAction> {
    static currentVolume$: BehaviorSubject<number> = new BehaviorSubject(50);
    static lastVolume = 50;

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear({ context }: WillAppearEvent) {
        this.socket.onTick$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((data) => {
                if (Object.keys(data).length === 0) {
                    return;
                }
                const vol = data.player.volumePercent;
                MuteAction.currentVolume$.next(vol);
            });

        MuteAction.currentVolume$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((vol) => {
                MuteAction.lastVolume = vol <= 0 ? MuteAction.lastVolume : vol;
                this.plugin.setTitle(
                    `${Math.round(
                        !vol || vol <= 0 ? 0 : vol >= 100 ? 100 : vol
                    )}%`,
                    context
                );
            });
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent) {
        const current = MuteAction.currentVolume$.getValue();
        const last = MuteAction.lastVolume;
        const value = current > 0 ? -1 : last;
        MuteAction.currentVolume$.next(value);
        this.socket.playerSetVolume(value);
    }
}
