import {ErrorOutput, SocketState} from "ytmdesktop-ts-companion";
import {YTMDPi} from "../../ytmd-pi";
import {PluginData} from "../../shared/plugin-data";
import {GlobalSettingsInterface} from "../../interfaces/global-settings.interface";
import {getCompanionConnector} from "../services/companion-singleton";

export class GlobalSettingsPi {
    private authToken: string = '';
    private static socketListenersAttached = false;
    private static lastSettingsKey = '';

    constructor(private pi: YTMDPi) {
        this.pi.globalAuthButtonElement.onclick = () => this.startAuthorization();
        this.pi.globalSaveElement.onclick = () => this.saveSettings();
        this.pi.requestGlobalSettings();
    }

    public newGlobalSettingsReceived(): void {
        let settings = this.pi.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (Object.keys(settings).length < 2)
            settings = {host: '127.0.0.1', port: '9863', token: ''};

        const {
            host = '127.0.0.1',
            port = '9863',
            token = '',
        } = settings as GlobalSettingsInterface;

        this.pi.globalHostElement.value = host;
        this.pi.globalPortElement.value = port;
        this.authToken = token;

        this.setAuthStatusMessage(
            token ? this.pi.getLangString("AUTH_STATUS_CONNECTED") : this.pi.getLangString("AUTH_STATUS_NOT_CONNECTED"),
            token ? 'green' : 'red'
        );
        this.pi.globalSettingsDetailsElement.open = !token;
        this.ensureSocketClient(host, port, token);
        this.refreshConnectionStatus();
    }

    private async refreshConnectionStatus() {
        const settings = this.pi.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (!settings?.token) {
            this.setConnectionStatus(
                this.pi.getLangString("CONNECTION_STATUS_AUTH_REQUIRED"),
                'red'
            );
            return;
        }

        this.ensureSocketClient(settings.host, settings.port, settings.token);
    }

    private setAuthStatusMessage(text: string, color: string) {
        this.pi.globalAuthStatusElement.innerText = text;
        this.pi.globalAuthStatusElement.style.color = color;
    }

    private setConnectionStatus(text: string, color: string) {
        this.pi.globalConnectionStatusElement.innerText = text;
        this.pi.globalConnectionStatusElement.style.color = color;
    }

    private getRetrySeconds(message?: string) {
        if (!message) return 5;
        const match = message.match(/retry in (\\d+) seconds?/i);
        if (!match) return 5;
        const seconds = parseInt(match[1], 10);
        if (Number.isNaN(seconds)) return 5;
        return seconds;
    }

    private ensureSocketClient(host: string, port: string, token: string) {
        const normalizedHost = host === 'localhost' ? '127.0.0.1' : host;
        const settingsKey = `${normalizedHost}:${port}:${token ?? ''}`;
        const connector = getCompanionConnector();
        if (GlobalSettingsPi.lastSettingsKey !== settingsKey) {
            connector.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host: normalizedHost,
                port: parseInt(port),
                token
            };
        }
        GlobalSettingsPi.lastSettingsKey = settingsKey;

        if (!GlobalSettingsPi.socketListenersAttached) {
            GlobalSettingsPi.socketListenersAttached = true;
            connector.socketClient.addConnectionStateListener((state: SocketState) => {
                switch (state) {
                    case SocketState.CONNECTING:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_CHECKING"), 'gray');
                        break;
                    case SocketState.CONNECTED:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_CONNECTED"), 'green');
                        break;
                    case SocketState.DISCONNECTED:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
                        break;
                    case SocketState.ERROR:
                        this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
                        break;
                    default:
                        break;
                }
            });
            connector.socketClient.addErrorListener((error: any) => {
                this.pi.logMessage(`Connection status check failed: ${JSON.stringify(error)}`);
                if (error satisfies ErrorOutput && error.statusCode === 429) {
                    const seconds = this.getRetrySeconds(error.message);
                    this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_RATE_LIMIT", {seconds}), 'orange');
                    return;
                }
                this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
            });
        }

        if (token) {
            connector.socketClient.connect();
        } else {
            this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_AUTH_REQUIRED"), 'red');
        }
    }

    private async startAuthorization() {
        if (this.pi.globalAuthButtonElement.disabled) return;
        try {
            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTING"), 'yellow');

            let host = this.pi.globalHostElement.value;
            const port = this.pi.globalPortElement.value;
            if (host === 'localhost') host = '127.0.0.1';

            const connector = getCompanionConnector();
            connector.settings = {
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host,
                port: parseInt(port)
            };

            const authCode = await connector.restClient.getAuthCode();
            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_AUTHORIZING"), 'yellow');
            if (!authCode.code) {
                this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_ERROR"), 'red');
                return;
            }

            this.pi.globalAuthStatusElement.innerText = this.pi.getLangString("AUTH_CODE_STATUS", {
                code: authCode.code,
                compare: this.pi.getLangString("AUTH_CODE_COMPARE")
            });
            const authToken = await connector.restClient.getAuthToken(authCode.code);

            if (authToken.token) {
                this.authToken = authToken.token;
                this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTED"), 'green');
                this.saveSettings();
            } else {
                this.authErrorCatched(authToken);
            }
        } catch (e) {
            this.authErrorCatched(e);
        }
    }

    private authErrorCatched(err: any) {
        this.pi.logMessage(`Auth error: ${JSON.stringify(err)}`);
        let msg = "";
        if (err satisfies ErrorOutput) {
            msg = err.message;
        } else {
            msg = JSON.stringify(err);
        }
        if (!this.pi.globalAuthStatusElement) {
            alert(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`);
            return;
        }
        this.setAuthStatusMessage(`${this.pi.getLangString("AUTH_STATUS_ERROR")}\n${msg}`, 'red');
        this.pi.globalSettingsDetailsElement.open = true;
    }

    private saveSettings() {
        let host = this.pi.globalHostElement.value,
            port = this.pi.globalPortElement.value;

        if (host == 'localhost') host = '127.0.0.1';

        this.pi.settingsManager.setGlobalSettings({host, port, token: this.authToken});
        this.ensureSocketClient(host, port, this.authToken);
    }
}
