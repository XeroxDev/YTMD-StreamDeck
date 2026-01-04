import {YTMDPi} from '../../ytmd-pi';
import {PisAbstract} from '../pis.abstract';
import {DidReceiveSettingsEvent} from "streamdeck-typescript";
import {PlayPauseSettings} from "../../interfaces/context-settings.interface";

export class PlayPausePi extends PisAbstract {
    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        super(pi, context, sectionElement);
        this.pi.saveElement.onclick = () => this.saveSettings();
        pi.requestSettings();
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlayPauseSettings>): void {
        this.pi.actionElement.value = settings.action ?? "TOGGLE";
        this.pi.displayFormatElement.value = settings.displayFormat ?? "{current}";
    }

    private saveSettings() {
        const action = this.pi.actionElement.value,
            displayFormat = this.pi.displayFormatElement.value;

        this.settingsManager.setContextSettingsAttributes(this.context, {
            action: action ?? "TOGGLE",
            displayFormat: displayFormat ?? "{current}"
        });
    }
}
