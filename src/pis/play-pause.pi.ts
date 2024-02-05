import {GlobalSettingsInterface} from '../interfaces/global-settings.interface';
import {YTMDPi} from '../ytmd-pi';
import {PisAbstract} from './pis.abstract';
import {DidReceiveSettingsEvent} from "streamdeck-typescript";
import {PlayPauseSettings} from "../interfaces/context-settings.interface";
import {CompanionConnector, ErrorOutput} from "ytmdesktop-ts-companion/dist";
import {PluginData} from "../shared/plugin-data";

export class PlayPausePi extends PisAbstract {
    private mainElement: HTMLElement;
    private hostElement: HTMLInputElement;
    private portElement: HTMLInputElement;
    private actionElement: HTMLInputElement;
    private displayFormatElement: HTMLInputElement;
    private saveElement: HTMLButtonElement;
    private authSectionElement: HTMLElement;
    private authButtonElement: HTMLButtonElement;
    private authStatusElement: HTMLElement;
    private authToken: string = '';

    constructor(pi: YTMDPi, context: string) {
        super(pi, context);
        this.mainElement = document.getElementById(
            'mainSettings'
        ) as HTMLElement;
        this.mainElement.style.display = 'initial';

        this.hostElement = document.getElementById('host') as HTMLInputElement;
        this.portElement = document.getElementById('port') as HTMLInputElement;
        this.actionElement = document.getElementById('action') as HTMLInputElement;
        this.displayFormatElement = document.getElementById('displayFormat') as HTMLInputElement;
        this.saveElement = document.getElementById('save') as HTMLButtonElement;
        this.authSectionElement = document.getElementById('authStatusSection') as HTMLElement;
        this.authButtonElement = document.getElementById('authButton') as HTMLButtonElement;
        this.authStatusElement = document.getElementById('authStatus') as HTMLElement;

        this.saveElement.onclick = () => this.saveSettings();
        this.authButtonElement.onclick = () => {
            if (this.authButtonElement.disabled) return;
            try {
                this.authSectionElement.style.visibility = 'visible';
                this.authSectionElement.style.height = 'auto';
                this.authStatusElement.innerText = 'Connecting...';
                this.authStatusElement.style.color = 'yellow';
                this.authButtonElement.disabled = true;

                const host = this.hostElement.value,
                    port = this.portElement.value;

                const connector = new CompanionConnector({
                    appId: PluginData.APP_ID,
                    appName: PluginData.APP_NAME,
                    appVersion: PluginData.APP_VERSION,
                    host: host,
                    port: parseInt(port)
                });

                connector.restClient.requestCode().then((res) => {
                    this.authStatusElement.innerText = 'Authorizing...';
                    this.authStatusElement.style.color = 'yellow';
                    if (!res.code) {
                        this.authStatusElement.innerText = 'Authentication failed';
                        this.authStatusElement.style.color = 'red';
                        this.authButtonElement.disabled = true;
                        return;
                    }

                    this.authStatusElement.innerText = 'AUTH CODE: ' + res.code + '\n\nPlease compare the code with the one on the YTMDesktop app and confirm the authorization.';

                    connector.restClient.request(res.code).then((res) => {
                        if (res.token) {
                            this.authToken = res.token;
                            this.authStatusElement.innerText = 'Authenticated';
                            this.authStatusElement.style.color = 'green';
                            this.authButtonElement.disabled = false;
                            this.saveSettings();
                        } else {
                            this.authErrorCatched(res);
                        }
                    }).catch(err => this.authErrorCatched(err));

                }).catch(err => this.authErrorCatched(err));
            } catch (e) {
                this.authErrorCatched(e);
            }
        }
        pi.requestSettings();
    }

    public newGlobalSettingsReceived(): void {
        let settings = this.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (Object.keys(settings).length < 3)
            settings = {host: '127.0.0.1', port: '9863'};

        const {
            host = '127.0.0.1',
            port = '9863',
            token = '',
        } = settings as GlobalSettingsInterface;

        this.hostElement.value = host;
        this.portElement.value = port;
        this.authToken = token;
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlayPauseSettings>): void {
        this.actionElement.value = settings.action ?? "TOGGLE";
        this.displayFormatElement.value = settings.displayFormat ?? "{current}";
    }

    private authErrorCatched(err: any) {
        let msg = "";
        if (err satisfies ErrorOutput) {
            msg = err.message;
        } else {
            msg = JSON.stringify(err);
        }
        if (!this.authStatusElement) {
            alert('Authentication failed\n' + msg);
            return;
        }
        this.authStatusElement.innerText = 'Authentication failed\n' + msg;
        this.authStatusElement.style.color = 'red';
        this.authButtonElement.disabled = false;
    }

    private saveSettings() {
        let host = this.hostElement.value,
            port = this.portElement.value,
            action = this.actionElement.value,
            displayFormat = this.displayFormatElement.value;

        if (host == 'localhost') host = '127.0.0.1';

        this.settingsManager.setGlobalSettings({host, port, token: this.authToken, action});
        this.settingsManager.setContextSettingsAttributes(this.context, {
            action: action ?? "TOGGLE",
            displayFormat: displayFormat ?? "{current}"
        });
    }
}
