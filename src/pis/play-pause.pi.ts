import {GlobalSettingsInterface} from '../interfaces/global-settings.interface';
import {YTMDPi} from '../ytmd-pi';
import {PisAbstract} from './pis.abstract';
import {DidReceiveSettingsEvent} from "streamdeck-typescript";
import {PlayPauseSettings} from "../interfaces/context-settings.interface";
import {CompanionConnector, ErrorOutput} from "ytmdesktop-ts-companion";
import {PluginData} from "../shared/plugin-data";

export class PlayPausePi extends PisAbstract {
    private authToken: string = '';

    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        super(pi, context, sectionElement);
        this.pi.saveElement.onclick = () => this.saveSettings();
        this.pi.authButtonElement.onclick = () => {
            if (this.pi.authButtonElement.disabled) return;
            try {
                this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTING"), 'yellow', true);

                const host = this.pi.hostElement.value,
                    port = this.pi.portElement.value;

                const connector = new CompanionConnector({
                    appId: PluginData.APP_ID,
                    appName: PluginData.APP_NAME,
                    appVersion: PluginData.APP_VERSION,
                    host: host,
                    port: parseInt(port)
                });

                connector.restClient.getAuthCode().then((res) => {
                    this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_AUTHORIZING"), 'yellow', true);
                    if (!res.code) {
                        this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_ERROR"), 'red', false);
                        return;
                    }

                    this.pi.authStatusElement.innerText = `AUTH CODE: ${res.code}\n\n${this.pi.getLangString("AUTH_CODE_COMPARE")}`;

                    connector.restClient.getAuthToken(res.code).then((res) => {
                        if (res.token) {
                            this.authToken = res.token;
                            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTED"), 'green', false);
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
        pi.requestGlobalSettings();
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

        this.pi.hostElement.value = host;
        this.pi.portElement.value = port;
        this.authToken = token;
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlayPauseSettings>): void {
        this.pi.actionElement.value = settings.action ?? "TOGGLE";
        this.pi.displayFormatElement.value = settings.displayFormat ?? "{current}";
    }

    private setAuthStatusMessage(text: string, color: string, buttonDisabled: boolean) {
        this.pi.authSectionElement.style.visibility = 'visible';
        this.pi.authSectionElement.style.height = 'auto';
        this.pi.authStatusElement.innerText = text;
        this.pi.authStatusElement.style.color = color;
        this.pi.authButtonElement.disabled = buttonDisabled;
    }

    private authErrorCatched(err: any) {
        this.pi.logMessage(`Auth error: ${JSON.stringify(err)}`);
        let msg = "";
        if (err satisfies ErrorOutput) {
            msg = err.message;
        } else {
            msg = JSON.stringify(err);
        }
        if (!this.pi.authStatusElement) {
            alert(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`);
            return;
        }
        this.setAuthStatusMessage(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`, 'red', false);
    }

    private saveSettings() {
        let host = this.pi.hostElement.value,
            port = this.pi.portElement.value,
            action = this.pi.actionElement.value,
            displayFormat = this.pi.displayFormatElement.value;

        if (host == 'localhost') host = '127.0.0.1';

        this.settingsManager.setGlobalSettings({host, port, token: this.authToken, action});
        this.settingsManager.setContextSettingsAttributes(this.context, {
            action: action ?? "TOGGLE",
            displayFormat: displayFormat ?? "{current}"
        });
    }
}
