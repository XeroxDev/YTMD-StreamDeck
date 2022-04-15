import {distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {
    DidReceiveSettingsEvent,
    KeyUpEvent,
    SDOnActionEvent,
    StateType,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import {TrackAndPlayerInterface} from '../interfaces/information.interface';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {PlayPauseSettings} from "../interfaces/context-settings.interface";

export class PlayPauseAction extends DefaultAction<PlayPauseAction> {
    private playing = false;
    private currentTitle: string;
    private firstTimes = 10;
    private format = '{current}';

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent) {
        this.format = event.payload.settings.displayFormat ?? '{current}';
        this.socket.onTick$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((data) => this.handlePlayerData(event, data));
        this.socket.onError$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe(() => {
                this.plugin.showAlert(event.context);
            });
        this.socket.onConnect$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe(() => {
                this.plugin.showOk(event.context);
            });
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp({context, payload: {settings}}: KeyUpEvent<PlayPauseSettings>) {
        if (!settings?.action) {
            this.socket.trackPlayPause();
            return;
        }
        switch (settings?.action.toUpperCase()) {
            case 'PLAY':
                this.socket.trackPlay();
                break;
            case 'PAUSE':
                this.socket.trackPause();
                break;
            default:
                this.socket.trackPlayPause();
                break;
        }

        this.plugin.setState(this.playing ? StateType.ON : StateType.OFF, context);
    }

    handlePlayerData(
        {context}: WillAppearEvent,
        data: TrackAndPlayerInterface
    ) {
        if (Object.keys(data).length === 0) {
            this.plugin.showAlert(context);
            return;
        }

        const title = this.formatTitle(data?.player?.seekbarCurrentPosition, data?.track?.duration, data?.track?.duration - data?.player?.seekbarCurrentPosition);

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

    private formatTitle(current: number, duration: number, remaining: number): string {
        current = current ?? 0;
        duration = duration ?? 0;
        remaining = remaining ?? 0;
        const varMapping: { [key: string]: string } = {
            'current': PlayPauseAction.formatTime(current),
            'current:S': current.toString(),
            'duration': PlayPauseAction.formatTime(duration),
            'duration:S': duration.toString(),
            'remaining': PlayPauseAction.formatTime(remaining),
            'remaining:S': remaining.toString()
        };

        let result = this.format;

        for (let varMappingKey in varMapping) {
            const value = varMapping[varMappingKey];
            result = result.replace(new RegExp(`\{${varMappingKey}\}`, 'g'), value);
        }

        return result;
    }

    private static formatTime(seconds: number) {
        /*
        Possible formats:
        00:30
        01:30
        1:00:30
         */

        const minutes = Math.floor(seconds / 60);
        const secondsLeft = seconds % 60;
        const hours = Math.floor(minutes / 60);
        const minutesLeft = minutes % 60;

        let result = '';

        if (hours > 0) {
            result += `${hours}:`;
        }

        if (minutesLeft < 10) {
            result += `0${minutesLeft}:`;
        } else {
            result += `${minutesLeft}:`;
        }

        if (secondsLeft < 10) {
            result += `0${secondsLeft}`;
        } else {
            result += `${secondsLeft}`;
        }

        return result;
    }

    @SDOnActionEvent('didReceiveSettings')
    private handleSettings(e: DidReceiveSettingsEvent<PlayPauseSettings>) {
        this.format = e?.payload?.settings?.displayFormat ?? this.format;
    }
}
