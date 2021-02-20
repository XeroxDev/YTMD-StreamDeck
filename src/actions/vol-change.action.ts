import {DefaultAction} from "./default.action";
import {MuteAction} from "./mute.action";
import {KeyUpEvent, StreamDeckPlugin} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export class VolChangeAction extends DefaultAction {
	_type;
	_amount = 10;

	constructor(plugin: StreamDeckPlugin, ytmd: YTMD, type: string, amount: number) {
		super(plugin, ytmd);
		this._type = type;
		this._amount = amount;
	}


	onKeypressUp(event: KeyUpEvent) {
		let newVolume = MuteAction.currentVolume$.getValue();
		if (this._type === 'UP')
			newVolume += this._amount;
		else
			newVolume -= this._amount;

		MuteAction.lastVolume = newVolume
		MuteAction.currentVolume$.next(newVolume);
		this.sendAction(
			'player-set-volume',
			newVolume <= 0 ? -1 : newVolume >= 100 ? 100 : newVolume)
			.catch(() => this.plugin.showAlert());
	}
}
