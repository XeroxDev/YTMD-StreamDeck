import {DefaultAction} from "./default.action";
import {BehaviorSubject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export class MuteAction extends DefaultAction<MuteAction> {
	static currentVolume$: BehaviorSubject<number> = new BehaviorSubject(50);
	static lastVolume = 50;

	constructor(private plugin: YTMD, actionName: string) {
		super(plugin, actionName);
	}

	onContextAppear({context}: WillAppearEvent) {
		this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => {
			if (Object.keys(data).length === 0) {
				return;
			}
			const vol = data.player.volumePercent;
			MuteAction.currentVolume$.next(vol);
		});

		MuteAction.currentVolume$.pipe().subscribe(
			vol => {
				this.plugin.setTitle(`${Math.round(!vol || vol <= 0 ? 0 : vol >= 100 ? 100 : vol)}%`, context);
			}
		)
	}

	onKeypressUp(event: KeyUpEvent) {
		const current = MuteAction.currentVolume$.getValue();
		const last = MuteAction.lastVolume;
		const value = current > 0 ? -1 : last;
		MuteAction.currentVolume$.next(value);
		this.socket.playerSetVolume(value);
	}
}
