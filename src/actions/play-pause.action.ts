import { takeUntil } from 'rxjs/operators';
import {
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { StateType } from 'streamdeck-typescript/dist/src/interfaces/enums';
import { TrackAndPlayerInterface } from '../interfaces/information.interface';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class PlayPauseAction extends DefaultAction<PlayPauseAction> {
    private playing = false;
    private currentTitle: string;
    private firstTimes = 10;

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent) {
        this.socket.onTick$
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => this.handlePlayerData(event, data));
        this.socket.onError$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.plugin.showAlert(event.context);
        });
        this.socket.onConnect$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.plugin.showOk(event.context);
        });
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent) {
        this.socket.trackPlayPause();
    }

    handlePlayerData(
        { context }: WillAppearEvent,
        data: TrackAndPlayerInterface
    ) {
        if (Object.keys(data).length === 0) {
            this.plugin.showAlert(context);
            return;
        }

        const title = data ? data.player.seekbarCurrentPositionHuman : '0:00';
        if (this.currentTitle !== title || this.firstTimes >= 1) {
            this.firstTimes--;
            this.currentTitle = title;
            this.plugin.setTitle(this.currentTitle, context);
        }

        if (this.playing !== data.player.isPaused) {
            this.playing = data.player.isPaused;
            this.plugin.setState(
                this.playing ? StateType.ON : StateType.OFF,
                context
            );
        }
    }
}
