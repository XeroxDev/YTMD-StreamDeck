import {DefaultAction} from "./default.action";
import {MuteAction} from "./mute.action";
import {YTMD} from "../ytmd";
import {KeyUpEvent} from "streamdeck-typescript";

export class VolChangeAction extends DefaultAction<VolChangeAction> {

	constructor(plugin: YTMD, action: string, private readonly type: string, private readonly amount: number = 10) {
		super(plugin, action);
	}


	onKeypressUp(event: KeyUpEvent) {
		let newVolume = MuteAction.currentVolume$.getValue();
		if (this.type === 'UP')
			newVolume += this.amount;
		else
			newVolume -= this.amount;

		MuteAction.lastVolume = newVolume
		MuteAction.currentVolume$.next(newVolume);
		this.socket.playerSetVolume(newVolume <= 0 ? -1 : newVolume >= 100 ? 100 : newVolume);
	}
}
