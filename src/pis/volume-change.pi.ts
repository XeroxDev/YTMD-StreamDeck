import { DidReceiveSettingsEvent } from 'streamdeck-typescript';
import { VolumeSettings } from '../interfaces/context-settings.interface';
import { YTMDPi } from '../ytmd-pi';
import { PisAbstract } from './pis.abstract';

export class VolumeChangePi extends PisAbstract {
    private mainElement: HTMLElement;
    private readonly volumeSetting: HTMLInputElement;

    constructor(pi: YTMDPi, context: string, private direction: 'UP' | 'DOWN') {
        super(pi, context);
        this.mainElement = document.getElementById(
            'volumeSettings'
        ) as HTMLElement;
        this.mainElement.style.display = 'initial';
        this.volumeSetting = document.getElementById(
            'volumeInput'
        ) as HTMLInputElement;
        this.setSettingsToHtml();
        pi.requestSettings();

        this.volumeSetting.addEventListener('keyup', () => {
            const value =
                this.direction === 'UP'
                    ? this.volumeSetting.valueAsNumber
                    : this.volumeSetting.valueAsNumber >= 0
                    ? this.volumeSetting.valueAsNumber
                    : this.volumeSetting.valueAsNumber * -1;
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

        this.volumeSetting.value = String(value);
    }
}
