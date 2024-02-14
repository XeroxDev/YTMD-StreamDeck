import {
    DidReceiveSettingsEvent,
    KeyUpEvent,
    SDOnActionEvent,
    StateType,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {PlayPauseSettings} from "../interfaces/context-settings.interface";
import {SocketState, StateOutput, TrackState} from "ytmdesktop-ts-companion";

export class PlayPauseAction extends DefaultAction<PlayPauseAction> {
    private trackState: TrackState = TrackState.UNKNOWN;
    private currentTitle: string;
    private firstTimes = 10;
    private contextFormat: { [key: string]: string } = {};
    private events: {
        context: string,
        onTick: (state: StateOutput) => void,
        onError: (error: any) => void,
        onConChange: (state: SocketState) => void
    }[] = [];


    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
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

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent) {
        let found = this.events.find(e => e.context === event.context);
        if (found) {
            return;
        }

        found = {
            context: event.context,
            onTick: (state: StateOutput) => this.handlePlayerData(event, state),
            onConChange: (state: SocketState) => {
                switch (state) {
                    case SocketState.CONNECTED:
                        this.plugin.showOk(event.context);
                        break;
                    case SocketState.DISCONNECTED:
                    case SocketState.ERROR:
                        this.plugin.showAlert(event.context);
                        break;
                    default:
                        break;
                }
            },
            onError: () => this.plugin.showAlert(event.context)
        };

        this.events.push(found);

        this.socket.addStateListener(found.onTick);
        this.socket.addConnectionStateListener(found.onConChange);
        this.socket.addErrorListener(found.onError)
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        const found = this.events.find(e => e.context === event.context);
        if (!found) {
            return;
        }

        this.socket.removeStateListener(found.onTick);
        this.socket.removeConnectionStateListener(found.onConChange);
        this.socket.removeErrorListener(found.onError);
        this.events = this.events.filter(e => e.context !== event.context);
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp({context, payload: {settings}}: KeyUpEvent<PlayPauseSettings>) {
        if (!settings?.action) {
            this.rest.playPause().catch(reason => {
                console.error(reason);
                this.plugin.logMessage(`Error while playPause toggle. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                this.plugin.showAlert(context)
            })
            return;
        }
        switch (settings?.action.toUpperCase()) {
            case 'PLAY':
                this.rest.play().catch(reason => {
                    console.error(reason);
                    this.plugin.logMessage(`Error while play. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                    this.plugin.showAlert(context)
                });
                break;
            case 'PAUSE':
                this.rest.pause().catch(reason => {
                    console.error(reason);
                    this.plugin.logMessage(`Error while pause. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                    this.plugin.showAlert(context)
                });
                break;
            default:
                this.rest.playPause().catch(reason => {
                    console.error(reason);
                    this.plugin.logMessage(`Error while playPause toggle. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
                    this.plugin.showAlert(context)
                });
                break;
        }

        this.plugin.setState(this.trackState === TrackState.PLAYING ? StateType.ON : StateType.OFF, context);
    }

    handlePlayerData(
        {context, payload: {settings}}: WillAppearEvent<PlayPauseSettings>,
        data: StateOutput
    ) {
        if (Object.keys(data).length === 0) {
            this.plugin.showAlert(context);
            return;
        }
        let current = Math.floor(data.player.videoProgress);
        let duration = Math.floor(data.video?.durationSeconds ?? 0);
        let remaining = duration - current;

        const title = this.formatTitle(current, duration, remaining, context, settings);

        if (this.currentTitle !== title || this.firstTimes >= 1) {
            this.firstTimes--;
            this.currentTitle = title;
            this.plugin.setTitle(this.currentTitle, context);
        }

        if (this.trackState !== data.player.trackState) {
            this.trackState = data.player.trackState;
            this.plugin.setState(
                this.trackState === TrackState.PLAYING ? StateType.ON : StateType.OFF,
                context
            );
        }
    }

    private formatTitle(current: number, duration: number, remaining: number, context: string, settings: PlayPauseSettings): string {
        current = current ?? 0;
        duration = duration ?? 0;
        remaining = remaining ?? 0;
        const varMapping: { [key: string]: string } = {
            'current': PlayPauseAction.formatTime(current),
            'current:H': PlayPauseAction.formatTime(current),
            'current:S': current.toString(),
            'duration': PlayPauseAction.formatTime(duration),
            'duration:H': PlayPauseAction.formatTime(duration),
            'duration:S': duration.toString(),
            'remaining': PlayPauseAction.formatTime(remaining),
            'remaining:H': PlayPauseAction.formatTime(remaining),
            'remaining:S': remaining.toString()
        };

        let result = this.contextFormat[context] ?? settings.displayFormat ?? '{current}';

        for (let varMappingKey in varMapping) {
            const value = varMapping[varMappingKey];
            result = result.replace(new RegExp(`\{${varMappingKey}\}`, 'gi'), value);
        }

        return result;
    }

    @SDOnActionEvent('didReceiveSettings')
    private handleSettings(e: DidReceiveSettingsEvent<PlayPauseSettings>) {
        this.contextFormat[e.context] = e.payload.settings?.displayFormat ?? this.contextFormat[e.context];
    }
}
