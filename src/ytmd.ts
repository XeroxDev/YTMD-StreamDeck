import {DidReceiveGlobalSettingsEvent, SDOnActionEvent, StreamDeckPluginHandler,} from 'streamdeck-typescript';
import {LikeDislikeAction} from './actions/like-dislike.action';
import {MuteAction} from './actions/mute.action';
import {NextPrevAction} from './actions/next-prev-action';
import {PlayPauseAction} from './actions/play-pause.action';
import {PlayPlaylistAction} from './actions/play-playlist.action';
import {RepeatAction} from './actions/repeat.action';
import {ShuffleAction} from './actions/shuffle.action';
import {SongInfoAction} from './actions/song-info.action';
import {VolChangeAction} from './actions/vol-change.action';
import {ActionTypes} from './interfaces/enums';
import {GlobalSettingsInterface} from './interfaces/global-settings.interface';
import VERSION from "./version";
import {CompanionConnector, LikeStatus, Settings} from "ytmdesktop-ts-companion";
import {PluginData} from "./shared/plugin-data";

export class YTMD extends StreamDeckPluginHandler {
    private static readonly _DEFAULT_SETTINGS: Settings = {
        appId: PluginData.APP_ID,
        appName: PluginData.APP_NAME,
        appVersion: PluginData.APP_VERSION,
        host: "127.0.0.1",
        port: 9863
    }

    constructor() {
        super();
        try {
            YTMD._COMPANION = new CompanionConnector(YTMD._DEFAULT_SETTINGS);
            YTMD._COMPANION.socketClient.connect();
        } catch (e) {
            console.error(e);
            this.logMessage(`Error while connecting. error: ${JSON.stringify(e)}`);
        }
        new PlayPauseAction(this, ActionTypes.PLAY_PAUSE);
        new NextPrevAction(this, ActionTypes.NEXT_TRACK, 'NEXT');
        new NextPrevAction(this, ActionTypes.PREV_TRACK, 'PREV');
        new VolChangeAction(this, ActionTypes.VOLUME_DOWN, 'DOWN');
        new VolChangeAction(this, ActionTypes.VOLUME_UP, 'UP');
        new MuteAction(this, ActionTypes.VOLUME_MUTE);
        new LikeDislikeAction(this, ActionTypes.LIKE_TRACK, LikeStatus.LIKE);
        new LikeDislikeAction(this, ActionTypes.DISLIKE_TRACK, LikeStatus.DISLIKE);
        new SongInfoAction(this, ActionTypes.SONG_INFO);
        new ShuffleAction(this, ActionTypes.SHUFFLE);
        new RepeatAction(this, ActionTypes.REPEAT);
        new PlayPlaylistAction(this, ActionTypes.PLAY_PLAYLIST);
    }

    private static _COMPANION: CompanionConnector;

    public static get COMPANION(): CompanionConnector {
        return this._COMPANION;
    }

    @SDOnActionEvent('didReceiveGlobalSettings')
    globalSettingsReceived({payload: {settings},}: DidReceiveGlobalSettingsEvent<GlobalSettingsInterface>) {
        if (settings && Object.keys(settings).length >= 1) {
            YTMD.COMPANION.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: VERSION,
                host: settings.host,
                port: parseInt(settings.port),
                token: settings.token
            };
        } else {
            // If no settings are provided, use the default settings
            YTMD.COMPANION.settings = YTMD._DEFAULT_SETTINGS;
        }
    }
}

new YTMD();
