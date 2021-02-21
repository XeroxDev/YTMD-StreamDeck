import {
	DidReceiveGlobalSettingsEvent,
	SDInit,
	SDOnEvent,
	SDPropertyInspector,
	SDReady,
	StreamDeckPlugin
} from "streamdeck-typescript";

@SDPropertyInspector
class YTMDPi {
	private plugin: StreamDeckPlugin;
	private host: HTMLInputElement;
	private port: HTMLInputElement;
	private password: HTMLInputElement;
	private save: HTMLButtonElement;

	@SDInit()
	private init(plugin: StreamDeckPlugin) {
		this.plugin = plugin;
	}

	@SDReady()
	private ready() {
		if (this.plugin.initEventData?.actionInfo?.action !== 'fun.shiro.ytmdc.play-pause') {
			document.getElementById('mainSettings')?.remove();
			return;
		}

		this.host = document.getElementById('host') as HTMLInputElement;
		this.port = document.getElementById('port') as HTMLInputElement;
		this.password = document.getElementById('password') as HTMLInputElement;
		this.save = document.getElementById('save') as HTMLButtonElement;

		this.save.onclick = () => this.saveSettings();
		this.plugin.requestGlobalSettings();
	}

	@SDOnEvent('didReceiveGlobalSettings')
	private settingsReceived(settings: DidReceiveGlobalSettingsEvent) {
		const {host = 'localhost', port = '9863', password = ''} = settings.payload.settings;

		this.host.value = host;
		this.port.value = port;
		this.password.value = password;
	}

	private saveSettings() {
		const host = this.host.value,
			port = this.port.value,
			password = this.password.value;
		this.plugin.setGlobalSettings({host, port, password});
	}
}

new YTMDPi();
