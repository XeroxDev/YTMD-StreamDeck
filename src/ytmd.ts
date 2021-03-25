import {
    DidReceiveGlobalSettingsEvent,
    SDOnActionEvent,
    StreamDeckPluginHandler,
} from 'streamdeck-typescript';
import { LikeDislikeAction } from './actions/like-dislike.action';
import { MuteAction } from './actions/mute.action';
import { NextPrevAction } from './actions/next-prev-action';
import { PlayPauseAction } from './actions/play-pause.action';
import { RepeatAction } from './actions/repeat.action';
import { ShuffleAction } from './actions/shuffle.action';
import { SongInfoAction } from './actions/song-info.action';
import { VolChangeAction } from './actions/vol-change.action';
import { YtmdSocketHelper } from './helper/ytmd-socket.helper';
import { ActionTypes } from './interfaces/enums';
import { GlobalSettingsInterface } from './interfaces/global-settings.interface';

export class YTMD extends StreamDeckPluginHandler {
    constructor() {
        super();
        new PlayPauseAction(this, ActionTypes.PLAY_PAUSE);
        new NextPrevAction(this, ActionTypes.NEXT_TRACK, 'NEXT');
        new NextPrevAction(this, ActionTypes.PREV_TRACK, 'PREV');
        new VolChangeAction(this, ActionTypes.VOLUME_DOWN, 'DOWN');
        new VolChangeAction(this, ActionTypes.VOLUME_UP, 'UP');
        new MuteAction(this, ActionTypes.VOLUME_MUTE);
        new LikeDislikeAction(this, ActionTypes.LIKE_TRACK, 'LIKE');
        new LikeDislikeAction(this, ActionTypes.DISLIKE_TRACK, 'DISLIKE');
        new SongInfoAction(this, ActionTypes.SONG_INFO);
        new ShuffleAction(this, ActionTypes.SHUFFLE);
        new RepeatAction(this, ActionTypes.REPEAT);
    }

    @SDOnActionEvent('didReceiveGlobalSettings')
    globalSettingsReceived({
        payload: { settings },
    }: DidReceiveGlobalSettingsEvent<GlobalSettingsInterface>) {
        if (settings && Object.keys(settings).length >= 1) {
            YtmdSocketHelper.getInstance().setConnection(settings);
        } else {
            YtmdSocketHelper.getInstance().setConnection();
        }
    }
}

new YTMD();
