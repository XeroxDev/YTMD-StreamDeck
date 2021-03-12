import { GlobalSettingsInterface } from '../interfaces/global-settings.interface';
import { YTMDPi } from '../ytmd-pi';
import { PisAbstract } from './pis.abstract';

export class PlayPausePi extends PisAbstract {
    private mainElement: HTMLElement;
    private hostElement: HTMLInputElement;
    private portElement: HTMLInputElement;
    private passwordElement: HTMLInputElement;
    private saveElement: HTMLButtonElement;

    constructor(pi: YTMDPi, context: string) {
        super(pi, context);
        this.mainElement = document.getElementById(
            'mainSettings'
        ) as HTMLElement;
        this.mainElement.style.display = 'initial';

        this.hostElement = document.getElementById('host') as HTMLInputElement;
        this.portElement = document.getElementById('port') as HTMLInputElement;
        this.passwordElement = document.getElementById(
            'password'
        ) as HTMLInputElement;
        this.saveElement = document.getElementById('save') as HTMLButtonElement;

        this.saveElement.onclick = () => this.saveSettings();
    }

    public newGlobalSettingsReceived(): void {
        let settings = this.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (Object.keys(settings).length < 3)
            settings = { host: 'localhost', port: '9863', password: '' };

        const {
            host = 'localhost',
            port = '9863',
            password = '',
        } = settings as GlobalSettingsInterface;

        this.hostElement.value = host;
        this.portElement.value = port;
        this.passwordElement.value = password;
    }

    private saveSettings() {
        const host = this.hostElement.value,
            port = this.portElement.value,
            password = this.passwordElement.value;
        this.settingsManager.setGlobalSettings({ host, port, password });
    }
}
