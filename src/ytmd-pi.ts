import {DidReceiveGlobalSettingsEvent, SDOnPiEvent, StreamDeckPropertyInspectorHandler} from "streamdeck-typescript";
import {ActionTypes} from "./interfaces/enums";

class YTMDPi extends StreamDeckPropertyInspectorHandler {
	private hostElement: HTMLInputElement;
	private portElement: HTMLInputElement;
	private passwordElement: HTMLInputElement;
	private saveElement: HTMLButtonElement;

	protected onReady() {
		if (this.actionInfo.action !== ActionTypes.PLAY_PAUSE) {
			document.getElementById('mainSettings')?.remove();
			return;
		}

		this.hostElement = document.getElementById('host') as HTMLInputElement;
		this.portElement = document.getElementById('port') as HTMLInputElement;
		this.passwordElement = document.getElementById('password') as HTMLInputElement;
		this.saveElement = document.getElementById('save') as HTMLButtonElement;

		this.saveElement.onclick = () => this.saveSettings();
		this.requestGlobalSettings();
	}

	@SDOnPiEvent('didReceiveGlobalSettings')
	private receivedGlobalSettings({payload: {settings}}: DidReceiveGlobalSettingsEvent) {
		const {host = 'localhost', port = '9863', password = ''} = settings;

		this.hostElement.value = host;
		this.portElement.value = port;
		this.passwordElement.value = password;
	}

	private saveSettings() {
		const host = this.hostElement.value,
			port = this.portElement.value,
			password = this.passwordElement.value;
		this.setGlobalSettings({host, port, password});
	}
}

new YTMDPi();
