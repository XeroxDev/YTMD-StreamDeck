import {DefaultAction} from "./default.action";
import {KeyUpEvent} from "streamdeck-typescript";

export class PrevAction extends DefaultAction {

    onKeypressUp(event: KeyUpEvent) {
        this.sendAction('track-previous')
	        .catch(() => this.plugin.showAlert());
    }
}
