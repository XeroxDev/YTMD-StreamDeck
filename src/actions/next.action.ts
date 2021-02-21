import {DefaultAction} from "./default.action";
import {KeyUpEvent} from "streamdeck-typescript";

export class NextAction extends DefaultAction {
    onKeypressUp(event: KeyUpEvent) {
    	this.socket.trackNext();
    }
}
