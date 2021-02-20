import {DefaultAction} from "./default.action";
import {BehaviorSubject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";

export class MuteAction extends DefaultAction {
	static currentVolume$: BehaviorSubject<number> = new BehaviorSubject(50);
	static lastVolume = 50;

	onContextAppear(event: WillAppearEvent) {
		super.onContextAppear(event);
		this.ytmd.musicData.pipe(takeUntil(this.destroy$)).subscribe(data => {
			if (!data || data === true) {
				return;
			}
			const vol = data.player.volumePercent;
			MuteAction.currentVolume$.next(vol);
		});

		MuteAction.currentVolume$.pipe().subscribe(
			vol => {
				this.setContext(event.context);
				this.plugin.setTitle(`${Math.round(!vol || vol <= 0 ? 0 : vol >= 100 ? 100 : vol)}%`);
			}
		)
	}

	onKeypressUp(event: KeyUpEvent) {
		super.onKeypressUp(event);
		MuteAction.lastVolume = MuteAction.currentVolume$.getValue() === 0 ? MuteAction.lastVolume : MuteAction.currentVolume$.getValue();
		const value = MuteAction.currentVolume$.getValue() === 0 ? MuteAction.lastVolume : -1;
		this.sendAction('player-set-volume', value)
			.catch(() => this.plugin.showAlert());
	}
}
