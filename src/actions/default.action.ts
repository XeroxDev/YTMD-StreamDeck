import {Subject} from "rxjs";
import {YtmdSocketHelper} from "../helper/ytmd-socket.helper";
import {
	KeyUpEvent,
	SDOnActionEvent,
	StreamDeckAction,
	WillAppearEvent,
	WillDisappearEvent
} from "streamdeck-typescript";
import {YTMD} from "../ytmd";

export abstract class DefaultAction<Instance> extends StreamDeckAction<YTMD, Instance> {
	destroy$: Subject<any> = new Subject<any>();
	socket: YtmdSocketHelper;

	constructor(plugin: YTMD, actionName: string) {
		super(plugin, actionName);
		this.socket = YtmdSocketHelper.getInstance();
	}

	@SDOnActionEvent('willAppear')
	onContextAppear(event: WillAppearEvent): void {
	}

	@SDOnActionEvent('willDisappear')
	onContextDisappear(event: WillDisappearEvent): void {
		this.destroy$.next();
	}

	@SDOnActionEvent('keyUp')
	onKeypressUp(event: KeyUpEvent): void {
	}
}
