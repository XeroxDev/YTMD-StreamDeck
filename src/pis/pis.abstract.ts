import { DidReceiveSettingsEvent, SettingsManager } from 'streamdeck-typescript';
import { YTMDPi } from '../ytmd-pi';

export class PisAbstract {
    protected pi: YTMDPi;
    protected uuid: string;
    protected settingsManager: SettingsManager;
    protected context: string;

    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        this.pi = pi;
        this.uuid = pi.uuid;
        this.settingsManager = pi.settingsManager;
        this.context = context;
        sectionElement.style.display = 'initial';
    }

    newGlobalSettingsReceived() {}

    newSettingsReceived(event: DidReceiveSettingsEvent) {}
}
