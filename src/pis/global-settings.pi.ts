import {CompanionConnector, ErrorOutput} from "ytmdesktop-ts-companion";
import {YTMDPi} from "../ytmd-pi";
import {PluginData} from "../shared/plugin-data";
import {GlobalSettingsInterface} from "../interfaces/global-settings.interface";

export class GlobalSettingsPi {
    private authToken: string = '';
    private refreshIntervalId?: number;

    constructor(private pi: YTMDPi) {
        this.pi.globalAuthButtonElement.onclick = () => this.startAuthorization();
        this.pi.globalSaveElement.onclick = () => this.saveSettings();
        this.pi.globalRefreshElement.onclick = () => this.refreshConnectionStatus();
        this.pi.requestGlobalSettings();
        this.startRefreshTimer();
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
        this.refreshConnectionStatus();
    }

    private startRefreshTimer() {
        if (this.refreshIntervalId) return;
        this.refreshIntervalId = window.setInterval(() => this.refreshConnectionStatus(), 30000);
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

        let host = settings.host;
        const port = parseInt(settings.port);
        if (host === 'localhost') host = '127.0.0.1';

        try {
            const connector = new CompanionConnector({
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host,
                port,
                token: settings.token
            });
            await connector.restClient.getState();
            this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_CONNECTED"), 'green');
        } catch (e) {
            this.pi.logMessage(`Connection status check failed: ${JSON.stringify(e)}`);
            this.setConnectionStatus(this.pi.getLangString("CONNECTION_STATUS_DISCONNECTED"), 'red');
        }
    }

    private setAuthStatusMessage(text: string, color: string) {
        this.pi.globalAuthStatusElement.innerText = text;
        this.pi.globalAuthStatusElement.style.color = color;
    }

    private setConnectionStatus(text: string, color: string) {
        this.pi.globalConnectionStatusElement.innerText = text;
        this.pi.globalConnectionStatusElement.style.color = color;
    }

    private async startAuthorization() {
        if (this.pi.globalAuthButtonElement.disabled) return;
        try {
            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_CONNECTING"), 'yellow');

            let host = this.pi.globalHostElement.value;
            const port = this.pi.globalPortElement.value;
            if (host === 'localhost') host = '127.0.0.1';

            const connector = new CompanionConnector({
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host,
                port: parseInt(port)
            });

            const authCode = await connector.restClient.getAuthCode();
            this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_AUTHORIZING"), 'yellow');
            if (!authCode.code) {
                this.setAuthStatusMessage(this.pi.getLangString("AUTH_STATUS_ERROR"), 'red');
                return;
            }

            this.pi.globalAuthStatusElement.innerText = `AUTH CODE: ${authCode.code}\n\n${this.pi.getLangString("AUTH_CODE_COMPARE")}`;
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
        this.refreshConnectionStatus();
    }
}
