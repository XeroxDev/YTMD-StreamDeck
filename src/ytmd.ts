import {PlayPauseAction} from "./actions/play-pause.action";
import {VolChangeAction} from "./actions/vol-change.action";
import {MuteAction} from "./actions/mute.action";
import {DidReceiveGlobalSettingsEvent, SDOnActionEvent, StreamDeckPluginHandler} from "streamdeck-typescript";
import {LikeDislikeAction} from "./actions/like-dislike.action";
import {NextPrevAction} from "./actions/next-prev-action";
import {SettingsInterface} from "./interfaces/settings.interface";
import {YtmdSocketHelper} from "./helper/ytmd-socket.helper";
import {ActionTypes} from "./interfaces/enums";

export class YTMD extends StreamDeckPluginHandler {
	constructor() {
		super();
		new PlayPauseAction(this, ActionTypes.PLAY_PAUSE);
		new NextPrevAction(this, ActionTypes.NEXT_TRACK, 'NEXT');
		new NextPrevAction(this, ActionTypes.PREV_TRACK, 'PREV');
		new VolChangeAction(this, ActionTypes.VOLUME_DOWN, 'DOWN', 10);
		new VolChangeAction(this, ActionTypes.VOLUME_UP, 'UP', 10);
		new MuteAction(this, ActionTypes.VOLUME_MUTE);
		new LikeDislikeAction(this, ActionTypes.LIKE_TRACK, 'LIKE');
		new LikeDislikeAction(this, ActionTypes.DISLIKE_TRACK, 'DISLIKE');
	}

	@SDOnActionEvent('didReceiveGlobalSettings')
	globalSettingsReceived({payload: {settings}}: DidReceiveGlobalSettingsEvent<SettingsInterface>) {
		if (settings && Object.keys(settings).length >= 1) {
			YtmdSocketHelper.getInstance().setConnection(settings);
		} else {
			YtmdSocketHelper.getInstance().setConnection();
		}
	}

	protected onReady() {
		this.requestGlobalSettings();
	}
}

new YTMD();
