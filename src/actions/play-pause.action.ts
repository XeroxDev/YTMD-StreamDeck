import {DefaultAction} from "./default.action";
import {takeUntil} from "rxjs/operators";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";
import {TrackAndPlayerInterface} from "../interfaces/information.interface";
import {YtmdSocketHelper} from "../helper/ytmd-socket-helper";

export class PlayPauseAction extends DefaultAction {
	private playing = false;
	private currentTitle: string;
	private firstTimes = 10;

	onContextAppear(event: WillAppearEvent) {
		this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => this.handlePlayerData(event, data));
		this.socket.onError$.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.plugin.pluginContext = event.context;
				this.plugin.showAlert()
			});
		this.socket.onConnect$.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.plugin.pluginContext = event.context;
				this.plugin.showOk()
			});
	}

	handlePlayerData(event: WillAppearEvent, data: TrackAndPlayerInterface) {
		if (Object.keys(data).length === 0) {
			this.plugin.showAlert();
			return;
		}

		this.setContext(event.context);
		const title = data ? data.player.seekbarCurrentPositionHuman : '0:00';
		if (this.currentTitle !== title || this.firstTimes >= 1) {
			this.firstTimes--;
			this.currentTitle = title;
			this.plugin.setTitle(this.currentTitle);
		}

		if (this.playing !== data.player.isPaused) {
			this.playing = data.player.isPaused;
			this.plugin.setState(this.playing ? StateType.ON : StateType.OFF);
		}
	}

	onKeypressUp(event: KeyUpEvent) {
		this.socket.trackPlayPause();
	}
}
