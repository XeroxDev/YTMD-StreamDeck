import {DidReceiveSettingsEvent, SDOnPiEvent, StreamDeckPropertyInspectorHandler,} from 'streamdeck-typescript';
import {ActionTypes} from './interfaces/enums';
import {LocalizationInterface} from './interfaces/localization.interface';
import {PisAbstract} from './pis/pis.abstract';
import {PlayPausePi} from './pis/play-pause.pi';
import {VolumeChangePi} from './pis/volume-change.pi';

export class YTMDPi extends StreamDeckPropertyInspectorHandler {
    public localization: LocalizationInterface['PI'];
    // Play / Pause Settings
    public playPauseSettings: HTMLElement;
    public hostElement: HTMLInputElement;
    public portElement: HTMLInputElement;
    public actionElement: HTMLInputElement;
    public displayFormatElement: HTMLInputElement;
    public saveElement: HTMLButtonElement;
    public authSectionElement: HTMLElement;
    public authButtonElement: HTMLButtonElement;
    public authStatusElement: HTMLElement;
    // Volume Settings
    public volumeSettings: HTMLElement;
    public volumeInput: HTMLInputElement;
    // Error messages
    private errorsElement: HTMLElement;
    private errorTemplateElement: HTMLElement;

    private action: PisAbstract;

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

    public setInnerHtmlByClass(clzz: string, text: string) {
        const element = document.getElementsByClassName(clzz);
        if (element)
            for (let i = 0; i < element.length; i++)
                (<HTMLElement>element.item(i)).innerHTML = text;
    }

    public showError(id: string, title: string, message: string) {
        const error = this.errorTemplateElement.cloneNode(true) as HTMLElement;
        error.id = id;
        const titleElement = error.querySelector('.error-title');
        const messageElement = error.querySelector('.error-message');
        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        this.errorsElement.appendChild(error);
    }

    public removeError(id: string) {
        const error = document.getElementById(id);
        if (error) error.remove();
    }

    public clearErrors() {
        const errors = this.errorsElement.querySelectorAll('.error-item');
        errors.forEach((error) => {
            if (error.id !== 'error-template') error.remove();
        });
    }

    @SDOnPiEvent('setupReady')
    private documentLoaded() {
        this.getLocalization(this.info.application.language ?? 'en', (b, s) => {
                this.localization = (s as LocalizationInterface).PI;
                this.setupLocalization(b, this.localization);
            }
        );
        this.setupElements();
        const _action: ActionTypes = this.actionInfo.action as ActionTypes;
        switch (_action) {
            case ActionTypes.PLAY_PAUSE:
                this.action = new PlayPausePi(this, this.actionInfo.context, this.playPauseSettings);
                break;
            case ActionTypes.VOLUME_UP:
                this.action = new VolumeChangePi(
                    this,
                    this.actionInfo.context,
                    'UP',
                    this.volumeSettings
                );
                break;
            case ActionTypes.VOLUME_DOWN:
                this.action = new VolumeChangePi(
                    this,
                    this.actionInfo.context,
                    'DOWN',
                    this.volumeSettings
                );
                break;
        }
    }

    private setupLocalization(succeed: boolean, status: LocalizationInterface['PI']) {
        if (!succeed) return;

        this.setInnerHtmlByClass('host-label', status.HOST);
        this.setInnerHtmlByClass('port-label', status.PORT);
        this.setInnerHtmlByClass('display-label', status.DISPLAY_FORMAT);
        this.setInnerHtmlByClass('save-label', status.SAVE);
        this.setInnerHtmlByClass('volume-steps-label', status.VOLUME_STEPS);
        this.setInnerHtmlByClass('automatic-save-label', status.AUTOMATIC_SAVE);
        this.setInnerHtmlByClass('auth-button-label', status.AUTH_BUTTON);
        this.setInnerHtmlByClass('auth-label', status.AUTH_STATUS);
        this.setInnerHtmlByClass('auth-status-label', status.AUTH_STATUS_NOT_CONNECTED);
        this.setInnerHtmlByClass('support-feedback-title-label', status.SUPPORT_FEEDBACK_TITLE);
        this.setInnerHtmlByClass('support-feedback-text-label', status.SUPPORT_FEEDBACK_TEXT);
        this.setInnerHtmlByClass('var-usage-label', status.VAR_USAGE);
        this.setInnerHtmlByClass('action-label', status.ACTION);
        this.setInnerHtmlByClass('toggle-label', status.TOGGLE);
        this.setInnerHtmlByClass('pause-label', status.PAUSE);
        this.setInnerHtmlByClass('play-label', status.PLAY);
    }

    @SDOnPiEvent('didReceiveGlobalSettings')
    private receivedGlobalSettings() {
        this.action?.newGlobalSettingsReceived();
    }

    @SDOnPiEvent('didReceiveSettings')
    private receivedSettings(event: DidReceiveSettingsEvent) {
        this.action?.newSettingsReceived(event);
    }

    private setupElements() {
        this.playPauseSettings = document.getElementById('playPauseSettings') as HTMLElement;
        this.hostElement = document.getElementById('host') as HTMLInputElement;
        this.portElement = document.getElementById('port') as HTMLInputElement;
        this.actionElement = document.getElementById('action') as HTMLInputElement;
        this.displayFormatElement = document.getElementById('displayFormat') as HTMLInputElement;
        this.saveElement = document.getElementById('save') as HTMLButtonElement;
        this.authSectionElement = document.getElementById('authStatusSection') as HTMLElement;
        this.authButtonElement = document.getElementById('authButton') as HTMLButtonElement;
        this.authStatusElement = document.getElementById('authStatus') as HTMLElement;

        this.volumeSettings = document.getElementById('volumeSettings') as HTMLElement;
        this.volumeInput = document.getElementById('volumeInput') as HTMLInputElement;

        this.errorsElement = document.getElementById('errors') as HTMLElement;
        this.errorTemplateElement = document.getElementById('error-template') as HTMLElement;
    }
}

new YTMDPi();
