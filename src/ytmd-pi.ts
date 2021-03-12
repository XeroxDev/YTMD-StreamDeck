import {
    SDOnPiEvent,
    StreamDeckPropertyInspectorHandler,
} from 'streamdeck-typescript';
import { ActionTypes } from './interfaces/enums';
import { LocalizationInterface } from './interfaces/localization.interface';
import { PisAbstract } from './pis/pis.abstract';
import { PlayPausePi } from './pis/play-pause.pi';
import { VolumeChangePi } from './pis/volume-change.pi';

export class YTMDPi extends StreamDeckPropertyInspectorHandler {
    private action: PisAbstract = new PisAbstract(this, '');

    constructor() {
        super();
    }

    // Load the localizations
    public getLocalization(
        inLanguage: string,
        inCallback: (b: boolean, s: string | LocalizationInterface) => void
    ) {
        const url = '' + inLanguage + '.json';
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const localization = data['Localization'];
                    inCallback(true, localization);
                } catch (e) {
                    inCallback(false, 'Localizations is not a valid json.');
                }
            } else {
                inCallback(false, 'Could not load the localizations.');
            }
        };

        xhr.onerror = function () {
            inCallback(
                false,
                'An error occurred while loading the localizations.'
            );
        };

        xhr.ontimeout = function () {
            inCallback(false, 'Localization timed out.');
        };

        xhr.send();
    }

    @SDOnPiEvent('setupReady')
    private documentLoaded() {
        this.getLocalization(this.info.application.language, (b, s) =>
            this.setupLocalization(b, s as LocalizationInterface)
        );
        const _action: ActionTypes = this.actionInfo.action as ActionTypes;
        switch (_action) {
            case ActionTypes.PLAY_PAUSE:
                this.action = new PlayPausePi(this, this.actionInfo.context);
                break;
            case ActionTypes.VOLUME_UP:
                this.action = new VolumeChangePi(
                    this,
                    this.actionInfo.context,
                    'UP'
                );
                break;
            case ActionTypes.VOLUME_DOWN:
                this.action = new VolumeChangePi(
                    this,
                    this.actionInfo.context,
                    'DOWN'
                );
                break;
        }
    }

    private setupLocalization(succeed: boolean, status: LocalizationInterface) {
        if (!succeed) return;

        this.setLanguage('host-label', status.PI.HOST);
        this.setLanguage('port-label', status.PI.PORT);
        this.setLanguage('password-label', status.PI.PASSWORD);
        this.setLanguage('save-label', status.PI.SAVE);
        this.setLanguage('volume-steps-label', status.PI.VOLUME_STEPS);
        this.setLanguage('automatic-save-label', status.PI.AUTOMATIC_SAVE);
    }

    private setLanguage(clzz: string, text: string) {
        const element = document.getElementsByClassName(clzz);
        if (element)
            for (let i = 0; i < element.length; i++)
                (<HTMLElement>element.item(i)).innerText = text;
    }

    @SDOnPiEvent('didReceiveGlobalSettings')
    private receivedGlobalSettings() {
        this.action.newGlobalSettingsReceived();
    }

    @SDOnPiEvent('didReceiveSettings')
    private receivedSettings() {
        this.action.newSettingsReceived();
    }
}

new YTMDPi();
