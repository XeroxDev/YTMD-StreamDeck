import {DefaultAction} from "./default.action";
import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export class NextPrevAction extends DefaultAction<NextPrevAction> {
	constructor(plugin: YTMD, actionName: string, private nextOrPrev: 'NEXT' | 'PREV') {
		super(plugin, actionName);
	}

	@SDOnActionEvent('willAppear')
	onContextAppear(event: WillAppearEvent): void {
	}

	@SDOnActionEvent('keyUp')
	onKeypressUp(event: KeyUpEvent) {
		console.log(event)
		if (this.nextOrPrev === 'NEXT')
			this.socket.trackNext();
		else
			this.socket.trackPrevious();
	}

	@SDOnActionEvent('willDisappear')
	onContextDisappear(event: WillDisappearEvent): void {
		this.destroy$.next();
	}
}
