import {DefaultAction} from "./default.action";
import {KeyUpEvent} from "streamdeck-typescript";

export class NextAction extends DefaultAction {
    onKeypressUp(event: KeyUpEvent) {
        this.sendAction('track-next')
	        .catch(() => this.plugin.showAlert());
    }
}
