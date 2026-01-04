import {
    DialUpEvent,
    DialRotateEvent,
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
    private contextTitleFormat: { [key: string]: string } = {};
    private events: {
        context: string,
        onTick: (state: StateOutput) => void,
        onError: (error: any) => void,
        onConChange: (state: SocketState) => void
    }[] = [];
    private currentThumbnail: string;
    private thumbnail: string;
    private ticks = 0;
    private lastcheck = 0;

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
            onTick: (state: StateOutput) => {
                this.handlePlayerData(event, state);
                if (this.lastcheck === 0 && this.ticks !== 0)
                    {
                    if (this.ticks > 0) this.rest.next().catch(reason => {
                        console.error(reason);
                        this.plugin.logMessage(`Error while next. event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
                        this.plugin.showAlert(event.context)
                    })
                    else this.rest.previous().catch(reason => {
                        console.error(reason);
                        this.plugin.logMessage(`Error while previous. event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
                        this.plugin.showAlert(event.context)
                    })
                    this.ticks = 0;
                    this.lastcheck = 3;
                }
                if (this.lastcheck > 0)
                {
                    this.lastcheck -= 1;
                }
            },
            onConChange: (state: SocketState) => {
                switch (state) {
                    case SocketState.CONNECTED:
                        this.plugin.showOk(event.context);
                        this.plugin.setTitle("", event.context);
                        this.plugin.setFeedback(event.context, {"icon": this.thumbnail, "value": "00:00", "indicator": { "enabled": true}});
                        break;
                    case SocketState.DISCONNECTED:
                    case SocketState.ERROR:
                        this.plugin.setTitle("⚠", event.context);
                        this.plugin.setFeedback(event.context, {"icon": this.thumbnail, "value": "⚠", "indicator": { "enabled": false}});
                        break;
                    default:
                        break;
                }
            },
            onError: (error: any) => {
                if (error.toString() !== "Error: websocket error")
                {
                    this.plugin.showAlert(event.context);
                }
            }
        };

        this.events.push(found);

        this.socket.addStateListener(found.onTick);
        this.socket.addConnectionStateListener(found.onConChange);
        this.socket.addErrorListener(found.onError)

        let clayout = event.payload.settings.customLayout;
        this.plugin.setFeedbackLayout(event.context, clayout == '' ? '$B1' : clayout);
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
    onKeypressUp({context, payload: {settings}}: KeyUpEvent) {
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
        {action, context, payload: {settings}}: WillAppearEvent<PlayPauseSettings>,
        data: StateOutput
    ) {
        if (Object.keys(data).length === 0) {
            this.plugin.showAlert(context);
            return;
        }
        let current = Math.floor(data.player.videoProgress);
        let duration = Math.floor(data.video?.durationSeconds ?? 0);
        let remaining = duration - current;

        const time = this.formatTime(current, duration, remaining, context, settings);
        const {title, album, author, cover} = this.getSongData(data);
        const formattitle = this.formatTitle(title, album, author, context, settings);

        if (this.currentTitle !== time || this.firstTimes >= 1) {
            this.firstTimes--;
            this.currentTitle = time;
            this.plugin.setTitle(this.currentTitle, context);
            this.plugin.setFeedback(context, {"icon": this.thumbnail, "value": this.currentTitle, "indicator": { "value": current / duration * 100, "enabled": true}});
            if (formattitle != "")
            {
                this.plugin.setFeedback(context, {"title": formattitle});
            }
            // these 3 below are for custom layout support with more text fields
            if (title != "")
            {
                this.plugin.setFeedback(context, {"song": title});
            }
            if (author != "")
            {
                this.plugin.setFeedback(context, {"author": author});
            }
            if (album != "")
            {
                this.plugin.setFeedback(context, {"album": album});
            }
            if (this.currentThumbnail !== cover)
            {
                this.currentThumbnail = cover;
                let image = new Image();
                image.crossOrigin = "anonymous";

                image.onload = () => {
                    let canvas = document.createElement('canvas');
                    canvas.width = 100;
                    canvas.height = 100;

                    let ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return;
                    }

                    ctx.drawImage(image, 0, 0, 100, 100);

                    image.onload = null;
                    (image as any) = null;

                    this.thumbnail = canvas.toDataURL('image/png');
                };
                image.src = cover;
            }
        }

        if (this.trackState !== data.player.trackState) {
            this.trackState = data.player.trackState;
            this.plugin.setState(
                this.trackState === TrackState.PLAYING ? StateType.ON : StateType.OFF,
                context
            );
        }
    }

    private getSongData(data: StateOutput): {
        title: string,
        album: string,
        author: string,
        cover: string
    } {
        let title = '';
        let album = '';
        let author = '';
        let cover = '';

        if (!data.player || !data.video) return {title, album, author, cover};

        const trackState = data.player.trackState;

        title = data.video.title ?? title;
        album = data.video.album ?? album;
        author = data.video.author ?? author;
        cover = data.video.thumbnails[data.video.thumbnails.length - 1].url ?? cover;

        return {title, album, author, cover};
    }

    private formatTitle(title: string, album: string, author: string, context: string, settings: PlayPauseSettings): string {
        const varMapping: { [key: string]: string } = {
            'title': title,
            'album': album,
            'author': author,
        };

        let result = this.contextTitleFormat[context] ?? settings.displayTitleFormat ?? '{title}';

        for (let varMappingKey in varMapping) {
            const value = varMapping[varMappingKey];
            result = result.replace(new RegExp(`\{${varMappingKey}\}`, 'gi'), value);
        }

        return result;
    }

    private formatTime(current: number, duration: number, remaining: number, context: string, settings: PlayPauseSettings): string {
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
        this.contextTitleFormat[e.context] = e.payload.settings?.displayTitleFormat ?? this.contextTitleFormat[e.context];
        let clayout = e.payload.settings?.customLayout;
        this.plugin.setFeedbackLayout(e.context, clayout == '' ? '$B1' : clayout);
    }

    @SDOnActionEvent('dialUp')
    onDialUp({context, payload: {settings}}: DialUpEvent<PlayPauseSettings>) {
        this.rest.playPause().catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while playPause toggle. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(context)
        });
        this.plugin.setState(this.trackState === TrackState.PLAYING ? StateType.ON : StateType.OFF, context);
    }

    @SDOnActionEvent('dialRotate')
    onDialRotate({context, payload: {settings, ticks}}: DialRotateEvent) {
        this.ticks += ticks;
    }
}
