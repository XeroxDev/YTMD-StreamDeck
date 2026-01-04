import {DidReceiveSettingsEvent, SDOnPiEvent, StreamDeckPropertyInspectorHandler,} from 'streamdeck-typescript';
import {ActionTypes} from './interfaces/enums';
import {LocalizationInterface} from './interfaces/localization.interface';
import {PisAbstract} from './pis/pis.abstract';
import {GlobalSettingsPi} from './pis/features/global-settings.pi';
import {PlayPausePi} from './pis/features/play-pause.pi';
import {PlayPlaylistPi} from './pis/features/play-playlist.pi';
import {VolumeChangePi} from './pis/features/volume-change.pi';
import {PiI18n} from './pis/services/pi-i18n';

export class YTMDPi extends StreamDeckPropertyInspectorHandler {
    // Play / Pause Settings
    public playPauseSettings: HTMLElement;
    public actionElement: HTMLInputElement;
    public displayFormatElement: HTMLInputElement;
    public saveElement: HTMLButtonElement;
    // Global Settings
    public globalSettings: HTMLElement;
    public globalHostElement: HTMLInputElement;
    public globalPortElement: HTMLInputElement;
    public globalAuthButtonElement: HTMLButtonElement;
    public globalAuthStatusElement: HTMLElement;
    public globalConnectionStatusElement: HTMLElement;
    public globalSaveElement: HTMLButtonElement;
    public globalSettingsDetailsElement: HTMLDetailsElement;
    // Playlist Settings
    public playlistSettings: HTMLElement;
    public playlistSelectElement: HTMLSelectElement;
    public playlistUrlElement: HTMLInputElement;
    public playlistUrlStatusElement: HTMLElement;
    public playlistSaveElement: HTMLButtonElement;
    public playlistRefreshButtonElement: HTMLButtonElement;
    // Volume Settings
    public volumeSettings: HTMLElement;
    public volumeInput: HTMLInputElement;
    private localization: LocalizationInterface['PI'];
    // Error messages
    private errorsElement: HTMLElement;
    private errorTemplateElement: HTMLElement;
    private i18n: PiI18n;

    private action: PisAbstract;
    private globalSettingsPi: GlobalSettingsPi;

    constructor() {
        super();
        this.i18n = new PiI18n();
    }

    // Load the localizations
    public fetchLocalizationFile(
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
        this.setupLocalization();
        this.setupElements();
        this.globalSettingsPi = new GlobalSettingsPi(this);
        const _action: ActionTypes = this.actionInfo.action as ActionTypes;
        switch (_action) {
            case ActionTypes.PLAY_PAUSE:
                this.action = new PlayPausePi(this, this.actionInfo.context, this.playPauseSettings);
                break;
            case ActionTypes.PLAY_PLAYLIST:
                this.action = new PlayPlaylistPi(this, this.actionInfo.context, this.playlistSettings);
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

    public getLangString(
        key: keyof LocalizationInterface['PI'],
        vars?: Record<string, unknown>,
        defaultValue: string = 'NOT TRANSLATED'
    ) {
        return this.i18n.t(key, vars, defaultValue);
    }

    private setupLocalization() {
        this.fetchLocalizationFile(this.info.application.language ?? 'en', (b, s) => {
            if (!b) {
                this.logMessage(`Failed to load the localization file. Reason: ${s}. Using default language.`);
                // try to load the default language
                this.fetchLocalizationFile('en', (b2, s2) => {
                    if (!b2) {
                        this.logMessage(`Failed to load the default localization file. Reason: ${s2}.`);
                    }
                    this.localization = (s2 as LocalizationInterface).PI;
                    this.i18n.setMessages(this.localization);
                    this.translateHtml();
                });
                return;
            }
            this.localization = (s as LocalizationInterface).PI;
            this.i18n.setMessages(this.localization);
            this.translateHtml();
        });
    }

    private translateHtml() {
        this.i18n.apply();
        this.setInnerHtmlByClass('connection-status-value', this.getLangString("CONNECTION_STATUS_NOT_CHECKED"));
    }

    @SDOnPiEvent('didReceiveGlobalSettings')
    private receivedGlobalSettings() {
        this.globalSettingsPi?.newGlobalSettingsReceived();
        this.action?.newGlobalSettingsReceived();
    }

    @SDOnPiEvent('didReceiveSettings')
    private receivedSettings(event: DidReceiveSettingsEvent) {
        this.action?.newSettingsReceived(event);
    }

    private setupElements() {
        this.playPauseSettings = document.getElementById('playPauseSettings') as HTMLElement;
        this.actionElement = document.getElementById('action') as HTMLInputElement;
        this.displayFormatElement = document.getElementById('displayFormat') as HTMLInputElement;
        this.saveElement = document.getElementById('save') as HTMLButtonElement;
        this.globalSettings = document.getElementById('globalSettings') as HTMLElement;
        this.globalHostElement = document.getElementById('globalHost') as HTMLInputElement;
        this.globalPortElement = document.getElementById('globalPort') as HTMLInputElement;
        this.globalAuthButtonElement = document.getElementById('globalAuthButton') as HTMLButtonElement;
        this.globalAuthStatusElement = document.getElementById('globalAuthStatus') as HTMLElement;
        this.globalConnectionStatusElement = document.getElementById('globalConnectionStatus') as HTMLElement;
        this.globalSaveElement = document.getElementById('globalSave') as HTMLButtonElement;
        this.globalSettingsDetailsElement = document.getElementById('globalSettingsDetails') as HTMLDetailsElement;

        this.playlistSettings = document.getElementById('playlistSettings') as HTMLElement;
        this.playlistSelectElement = document.getElementById('playlistSelect') as HTMLSelectElement;
        this.playlistUrlElement = document.getElementById('playlistUrl') as HTMLInputElement;
        this.playlistUrlStatusElement = document.getElementById('playlistUrlStatus') as HTMLElement;
        this.playlistSaveElement = document.getElementById('playlistSave') as HTMLButtonElement;
        this.playlistRefreshButtonElement = document.getElementById('playlistRefresh') as HTMLButtonElement;

        this.volumeSettings = document.getElementById('volumeSettings') as HTMLElement;
        this.volumeInput = document.getElementById('volumeInput') as HTMLInputElement;

        this.errorsElement = document.getElementById('errors') as HTMLElement;
        this.errorTemplateElement = document.getElementById('error-template') as HTMLElement;
    }
}

new YTMDPi();
