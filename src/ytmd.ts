import {
	DidReceiveGlobalSettingsEvent, KeyUpEvent, SDDebug,
	SDInit,
	SDOnEvent,
	SDPlugin, SDReady,
	StreamDeckPlugin,
	WillAppearEvent, WillDisappearEvent
} from "streamdeck-typescript";
import {Settings} from "./interfaces/settings";
import {PlayPauseAction} from "./actions/play-pause.action";
import {NextAction} from "./actions/next.action";
import {PrevAction} from "./actions/prev.action";
import {VolChangeAction} from "./actions/vol-change.action";
import {MuteAction} from "./actions/mute.action";
import {LikeAction} from "./actions/like.action";
import {DislikeAction} from "./actions/dislike.action";
import {BehaviorSubject} from "rxjs";

@SDPlugin
export class YTMD {
	private static _instance: YTMD;

	public static getInstance(): YTMD {
		if (!this._instance)
			this._instance = new YTMD();
		return this._instance;
	}

	private plugin: StreamDeckPlugin;
	private settings: Settings;
	private actions: { name: string, clazz: any }[]
	public musicData: BehaviorSubject<any>;

	@SDInit()
	private init(plugin: StreamDeckPlugin): void {
		this.plugin = plugin;
		this.musicData = new BehaviorSubject<any>(undefined);
		this.settings = {host: 'localhost', port: '9863', password: ''}
		const playPause = new PlayPauseAction(plugin, this);
		const next = new NextAction(plugin, this);
		const prev = new PrevAction(plugin, this);
		const volumeDown = new VolChangeAction(plugin, this, 'DOWN', 10);
		const volumeUp = new VolChangeAction(plugin, this, 'UP', 10);
		const mute = new MuteAction(plugin, this);
		const like = new LikeAction(plugin, this);
		const dislike = new DislikeAction(plugin, this);

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

		setInterval(() => {
			this.sendRequest('GET').then(value => {
				this.musicData.next(value);
			});
		}, 500);
	}

	@SDReady()
	private ready() {
		this.plugin.requestGlobalSettings();
	}

	@SDOnEvent('didReceiveGlobalSettings')
	private onGlobalSettings(ev: DidReceiveGlobalSettingsEvent): void {
		if (ev.payload.settings && Object.keys(ev.payload.settings).length >= 1)
			this.settings = ev.payload.settings;
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


	public async sendRequest(method: string, body: any = ''): Promise<void> {
		if (!this.settings)
			return;
		const {host, port, password} = this.settings;

		let data: any = {
			method,
			headers: {
				'Content-Type': 'application/json',
				'pragma': 'no-cache',
				'cache-control': 'no-cache',
				'Authorization': `Bearer ${password}`
			}
		}

		if (body)
			data.body = JSON.stringify(body);

		return fetch(`http://${host}:${port}/query`, data)
			.then(response => response.json()).catch((err) => console.log(err));
	}
}

YTMD.getInstance();
