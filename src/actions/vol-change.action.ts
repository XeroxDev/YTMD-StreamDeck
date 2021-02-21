import {DefaultAction} from "./default.action";
import {MuteAction} from "./mute.action";
import {KeyUpEvent, StreamDeckPlugin} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export class VolChangeAction extends DefaultAction {

	constructor(plugin: StreamDeckPlugin, ytmd: YTMD, private readonly type: string, private readonly amount: number = 10) {
		super(plugin, ytmd);
	}


	onKeypressUp(event: KeyUpEvent) {
		let newVolume = MuteAction.currentVolume$.getValue();
		if (this.type === 'UP')
			newVolume += this.amount;
		else
			newVolume -= this.amount;

		MuteAction.lastVolume = newVolume
		MuteAction.currentVolume$.next(newVolume);
		this.sendAction(
			'player-set-volume',
			newVolume <= 0 ? -1 : newVolume >= 100 ? 100 : newVolume)
			.catch(() => this.plugin.showAlert());
	}
}
