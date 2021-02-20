import {DefaultAction} from "./default.action";
import {takeUntil} from "rxjs/operators";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";

export class PlayPauseAction extends DefaultAction {
	playing = false;
	private currentTitle: string;
	private firstTimes = 10;

	onContextAppear(event: WillAppearEvent) {
		this.ytmd.musicData.pipe(takeUntil(this.destroy$)).subscribe(data => {
			if (!data || data === true) {
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
		});
	}

	onKeypressUp(event: KeyUpEvent) {
		this.sendAction(`track-${this.playing ? 'play' : 'pause'}`)
			.catch(() => this.plugin.showAlert());
	}
}
