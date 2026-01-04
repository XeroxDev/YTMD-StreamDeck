import { DidReceiveSettingsEvent } from 'streamdeck-typescript';
import { VolumeSettings } from '../../interfaces/context-settings.interface';
import { YTMDPi } from '../../ytmd-pi';
import { PisAbstract } from '../pis.abstract';

export class VolumeChangePi extends PisAbstract {

    constructor(pi: YTMDPi, context: string, private direction: 'UP' | 'DOWN', sectionElement: HTMLElement) {
        super(pi, context, sectionElement);

        this.setSettingsToHtml();
        pi.requestSettings();

        this.pi.volumeInput.addEventListener('keyup', () => {
            const value =
                this.direction === 'UP'
                    ? this.pi.volumeInput.valueAsNumber
                    : this.pi.volumeInput.valueAsNumber >= 0
                    ? this.pi.volumeInput.valueAsNumber
                    : this.pi.volumeInput.valueAsNumber * -1;
            this.settingsManager.setContextSettingsAttributes(
                this.context,
                { steps: value ?? 10 },
                500
            );
        });
    }

    public newSettingsReceived({
        payload: { settings },
    }: DidReceiveSettingsEvent): void {
        let value = settings.steps ?? 10;
        this.setSettingsToHtml(value);
    }

    private setSettingsToHtml(value: number = 10) {
        if (this.direction === 'DOWN') {
            if (value > 0) value = value * -1;
        }

        this.pi.volumeInput.value = String(value);
    }
}
