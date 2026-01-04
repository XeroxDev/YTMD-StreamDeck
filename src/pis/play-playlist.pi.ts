import {DidReceiveSettingsEvent} from 'streamdeck-typescript';
import {YTMDPi} from '../ytmd-pi';
import {PisAbstract} from './pis.abstract';
import {CompanionConnector, ErrorOutput, PlaylistOutput} from "ytmdesktop-ts-companion";
import {PluginData} from "../shared/plugin-data";
import {GlobalSettingsInterface} from "../interfaces/global-settings.interface";
import {PlaylistSettings} from "../interfaces/context-settings.interface";

export class PlayPlaylistPi extends PisAbstract {
    private playlists: PlaylistOutput[] = [];
    private currentSettings: PlaylistSettings = {};

    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        super(pi, context, sectionElement);
        this.pi.playlistSaveElement.onclick = () => this.saveSettings();
        this.pi.playlistRefreshButtonElement.onclick = () => this.loadPlaylists();
        this.pi.requestSettings();
        this.pi.requestGlobalSettings();
    }

    public newGlobalSettingsReceived(): void {
        let settings = this.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (Object.keys(settings).length < 3)
            settings = {host: '127.0.0.1', port: '9863'};

        const {
            host = '127.0.0.1',
            port = '9863',
            token = '',
        } = settings as GlobalSettingsInterface;
        if (token) this.loadPlaylists();
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlaylistSettings>): void {
        this.currentSettings = settings ?? {};
        this.pi.playlistCustomElement.value = settings.customPlaylistId ?? '';
        this.applyPlaylistSelection();
    }

    private applyPlaylistSelection() {
        if (!this.playlists.length) return;
        const playlistId = this.currentSettings.playlistId ?? '';
        this.pi.playlistSelectElement.value = this.playlists.some(item => item.id === playlistId) ? playlistId : '';
    }

    private updatePlaylistSelect(selectedId?: string) {
        const select = this.pi.playlistSelectElement;
        const placeholder = this.pi.getLangString("PLAYLIST_SELECT");
        select.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = placeholder;
        select.appendChild(defaultOption);

        this.playlists.forEach((playlist) => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.title;
            select.appendChild(option);
        });

        select.value = selectedId ?? '';
    }

    private async loadPlaylists() {
        this.pi.removeError('playlist-fetch-error');
        const settings = this.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (!settings?.token) {
            this.pi.showError(
                'playlist-fetch-error',
                this.pi.getLangString("AUTH_STATUS_ERROR"),
                this.pi.getLangString("PLAYLIST_AUTH_HINT")
            );
            return;
        }

        let host = settings.host;
        const port = parseInt(settings.port);
        if (host === 'localhost') host = '127.0.0.1';

        this.pi.playlistSelectElement.disabled = true;
        this.updatePlaylistSelect();

        try {
            const connector = new CompanionConnector({
                appId: PluginData.APP_ID,
                appName: PluginData.APP_NAME,
                appVersion: PluginData.APP_VERSION,
                host,
                port,
                token: settings.token
            });

            this.playlists = await connector.restClient.getPlaylists();
            this.updatePlaylistSelect(this.currentSettings.playlistId ?? '');
        } catch (e) {
            this.playlists = [];
            this.updatePlaylistSelect();
            let msg = "";
            if (e satisfies ErrorOutput) {
                msg = e.message;
            } else {
                msg = JSON.stringify(e);
            }
            this.pi.showError(
                'playlist-fetch-error',
                this.pi.getLangString("AUTH_STATUS_ERROR"),
                msg
            );
        } finally {
            this.pi.playlistSelectElement.disabled = false;
        }
    }

    private saveSettings() {
        const playlistId = this.pi.playlistSelectElement.value,
            customPlaylistId = this.pi.playlistCustomElement.value;

        this.settingsManager.setContextSettingsAttributes(this.context, {
            playlistId: playlistId || undefined,
            customPlaylistId: customPlaylistId || undefined
        });
    }
}
