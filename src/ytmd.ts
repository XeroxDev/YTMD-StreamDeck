import {
	DidReceiveGlobalSettingsEvent, KeyUpEvent,
	SDInit,
	SDOnEvent,
	SDPlugin, SDReady,
	StreamDeckPlugin,
	WillAppearEvent, WillDisappearEvent
} from "streamdeck-typescript";
import {SettingsInterface} from "./interfaces/settings.interface";
import {PlayPauseAction} from "./actions/play-pause.action";
import {NextAction} from "./actions/next.action";
import {PrevAction} from "./actions/prev.action";
import {VolChangeAction} from "./actions/vol-change.action";
import {MuteAction} from "./actions/mute.action";
import {LikeAction} from "./actions/like.action";
import {DislikeAction} from "./actions/dislike.action";
import {BehaviorSubject, Subject} from "rxjs";
import {YtmdSocketHelper} from "./helper/ytmd-socket-helper";
import {takeUntil} from "rxjs/operators";

@SDPlugin
export class YTMD {
	private static _instance: YTMD;

	public static getInstance(): YTMD {
		if (!this._instance)
			this._instance = new YTMD();
		return this._instance;
	}

	private plugin: StreamDeckPlugin;
	private settings: SettingsInterface;
	private actions: { name: string, clazz: any }[]

	@SDInit()
	private init(plugin: StreamDeckPlugin): void {
		this.plugin = plugin;
		this.settings = {host: 'localhost', port: '9863', password: ''}
		const playPause = new PlayPauseAction(plugin);
		const next = new NextAction(plugin);
		const prev = new PrevAction(plugin);
		const volumeDown = new VolChangeAction(plugin, 'DOWN', 10);
		const volumeUp = new VolChangeAction(plugin, 'UP', 10);
		const mute = new MuteAction(plugin);
		const like = new LikeAction(plugin);
		const dislike = new DislikeAction(plugin);

		this.actions = [
			{
				name: 'play-pause',
				clazz: playPause
			},
			{
				name: 'next',
				clazz: next
			},
			{
				name: 'prev',
				clazz: prev
			},
			{
				name: 'volume-down',
				clazz: volumeDown
			},
			{
				name: 'volume-up',
				clazz: volumeUp
			},
			{
				name: 'mute',
				clazz: mute
			},
			{
				name: 'like',
				clazz: like
			},
			{
				name: 'dislike',
				clazz: dislike
			}
		];
	}

	@SDReady()
	private ready() {
		this.plugin.requestGlobalSettings();
	}

	@SDOnEvent('didReceiveGlobalSettings')
	private onGlobalSettings(ev: DidReceiveGlobalSettingsEvent): void {
		if (ev.payload.settings && Object.keys(ev.payload.settings).length >= 1) {
			this.settings = ev.payload.settings;
			YtmdSocketHelper.getInstance().setConnection(this.settings);
		} else {
			YtmdSocketHelper.getInstance().setConnection();
		}
	}

	@SDOnEvent('willAppear')
	private onAppear(ev: WillAppearEvent): void {
		for (let action of this.actions) {
			if (ev.action === `fun.shiro.ytmdc.${action.name}`) {
				action.clazz.context = this;
				action.clazz.onContextAppear(ev);
				break;
			}
		}
	}

	@SDOnEvent('willDisappear')
	private onDisappear(ev: WillDisappearEvent): void {
		for (let action of this.actions) {
			if (ev.action === `fun.shiro.ytmdc.${action.name}`) {
				action.clazz.context = this;
				action.clazz.onContextDisappear(ev);
				break;
			}
		}
	}

	@SDOnEvent('keyUp')
	private onKeyUp(ev: KeyUpEvent): void {
		for (let action of this.actions) {
			if (ev.action === `fun.shiro.ytmdc.${action.name}`) {
				action.clazz.context = this;
				action.clazz.onKeypressUp(ev);
				break;
			}
		}
	}
}

YTMD.getInstance();
