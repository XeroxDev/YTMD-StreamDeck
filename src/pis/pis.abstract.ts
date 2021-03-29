import { DidReceiveSettingsEvent, SettingsManager } from 'streamdeck-typescript';
import { YTMDPi } from '../ytmd-pi';

export class PisAbstract {
    protected pi: YTMDPi;
    protected uuid: string;
    protected settingsManager: SettingsManager;
    protected context: string;

    constructor(pi: YTMDPi, context: string) {
        this.pi = pi;
        this.uuid = pi.uuid;
        this.settingsManager = pi.settingsManager;
        this.context = context;
    }

    newGlobalSettingsReceived() {}

    newSettingsReceived(event: DidReceiveSettingsEvent) {}
}
