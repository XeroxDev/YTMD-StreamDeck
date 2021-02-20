import {KeyUpEvent, StreamDeckPlugin, WillAppearEvent, WillDisappearEvent} from "streamdeck-typescript";
import {YTMD} from "../ytmd";
import {Subject} from "rxjs";

export class DefaultAction {
	destroy$: Subject<any> = new Subject<any>();

	constructor(public plugin: StreamDeckPlugin, public ytmd: YTMD) {
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

	async sendAction(command: any, value?: any): Promise<void> {
		return value !== undefined
			? this.ytmd.sendRequest('POST', {command, value})
			: this.ytmd.sendRequest('POST', {command});
	}
}
