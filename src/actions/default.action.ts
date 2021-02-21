import {KeyUpEvent, StreamDeckPlugin, WillAppearEvent, WillDisappearEvent} from "streamdeck-typescript";
import {YTMD} from "../ytmd";
import {Subject} from "rxjs";
import {YtmdSocketHelper} from "../helper/ytmd-socket-helper";

export class DefaultAction {
	destroy$: Subject<any> = new Subject<any>();
	socket: YtmdSocketHelper;

	constructor(public plugin: StreamDeckPlugin) {
		this.socket = YtmdSocketHelper.getInstance();
	}

	onContextAppear(event: WillAppearEvent): void {
	}

	onContextDisappear(event: WillDisappearEvent): void {
		this.destroy$.next();
	}

	onKeypressUp(event: KeyUpEvent): void {
	}

	setContext(context: string) {
		this.plugin.pluginContext = context;
	}
}
