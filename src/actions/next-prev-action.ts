import {DefaultAction} from "./default.action";
import {KeyUpEvent} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export class NextPrevAction extends DefaultAction<NextPrevAction> {
	constructor(plugin: YTMD, actionName: string, private nextOrPrev: 'NEXT' | 'PREV') {
		super(plugin, actionName);
	}

	onKeypressUp(event: KeyUpEvent) {
		if (this.nextOrPrev === 'NEXT')
			this.socket.trackNext();
		else
			this.socket.trackPrevious();
	}
}
