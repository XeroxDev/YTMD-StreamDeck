import {DidReceiveSettingsEvent} from 'streamdeck-typescript';
import {YTMDPi} from '../../ytmd-pi';
import {PisAbstract} from '../pis.abstract';
import {ErrorOutput, PlaylistOutput} from "ytmdesktop-ts-companion";
import {getCompanionConnector} from "../services/companion-singleton";
import {GlobalSettingsInterface} from "../../interfaces/global-settings.interface";
import {PlaylistSettings} from "../../interfaces/context-settings.interface";

export class PlayPlaylistPi extends PisAbstract {
    private playlists: PlaylistOutput[] = [];
    private currentSettings: PlaylistSettings = {};
    private static lastLoadAt = 0;
    private static loadTimer?: number;

    constructor(pi: YTMDPi, context: string, sectionElement: HTMLElement) {
        super(pi, context, sectionElement);
        this.pi.playlistSaveElement.onclick = () => this.saveSettings();
        this.pi.playlistRefreshButtonElement.onclick = () => this.loadPlaylists(true);
        this.pi.playlistUrlElement.addEventListener('input', () => this.updateUrlStatus());
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
        if (token) this.scheduleInitialLoad();
    }

    public newSettingsReceived({payload: {settings}}: DidReceiveSettingsEvent<PlaylistSettings>): void {
        this.currentSettings = settings ?? {};
        this.pi.playlistUrlElement.value = settings.playlistUrl ?? '';
        this.applyPlaylistSelection();
        this.updateUrlStatus();
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

    private scheduleInitialLoad() {
        const now = Date.now();
        if (now - PlayPlaylistPi.lastLoadAt < 15000) {
            return;
        }
        if (PlayPlaylistPi.loadTimer) {
            window.clearTimeout(PlayPlaylistPi.loadTimer);
        }
        PlayPlaylistPi.loadTimer = window.setTimeout(() => {
            this.loadPlaylists(false);
        }, 2000);
    }

    private async loadPlaylists(showErrors: boolean) {
        if (showErrors) {
            this.pi.removeError('playlist-fetch-error');
        }
        const settings = this.settingsManager.getGlobalSettings<GlobalSettingsInterface>();
        if (!settings?.token) {
            if (showErrors) {
                this.pi.showError(
                    'playlist-fetch-error',
                    this.pi.getLangString("PLAYLIST_ERROR_TITLE"),
                    this.pi.getLangString("PLAYLIST_AUTH_HINT")
                );
            }
            return;
        }

        let host = settings.host;
        const port = parseInt(settings.port);
        if (host === 'localhost') host = '127.0.0.1';

        this.pi.playlistSelectElement.disabled = true;
        this.updatePlaylistSelect();

        try {
            const connector = getCompanionConnector();
            connector.settings = {
                ...connector.settings,
                host,
                port,
                token: settings.token
            };

            this.playlists = await connector.restClient.getPlaylists();
            PlayPlaylistPi.lastLoadAt = Date.now();
            this.updatePlaylistSelect(this.currentSettings.playlistId ?? '');
        } catch (e) {
            this.playlists = [];
            this.updatePlaylistSelect();
            if (showErrors) {
                let msg = "";
                if (e satisfies ErrorOutput) {
                    if (e.statusCode === 429) {
                        const seconds = this.getRetrySeconds(e.message);
                        msg = this.pi.getLangString("PLAYLIST_ERROR_RATE_LIMIT", {seconds});
                    } else {
                        msg = e.message;
                    }
                } else {
                    msg = JSON.stringify(e);
                }
                this.pi.showError(
                    'playlist-fetch-error',
                    this.pi.getLangString("PLAYLIST_ERROR_TITLE"),
                    msg
                );
            }
        } finally {
            this.pi.playlistSelectElement.disabled = false;
        }
    }

    private saveSettings() {
        const playlistId = this.pi.playlistSelectElement.value,
            playlistUrl = this.pi.playlistUrlElement.value;

        this.settingsManager.setContextSettingsAttributes(this.context, {
            playlistId: playlistId || undefined,
            playlistUrl: playlistUrl || undefined
        });
    }

    private updateUrlStatus() {
        const status = this.pi.playlistUrlStatusElement;
        const urlValue = this.pi.playlistUrlElement.value.trim();
        if (!urlValue) {
            status.textContent = '';
            status.style.color = '';
            return;
        }

        try {
            const parsed = new URL(urlValue);
            const listParam = parsed.searchParams.get('list');
            if (!listParam) {
                status.textContent = this.pi.getLangString("PLAYLIST_URL_STATUS_MISSING_LIST");
                status.style.color = 'orange';
                return;
            }
            status.textContent = this.pi.getLangString("PLAYLIST_URL_STATUS_VALID");
            status.style.color = 'green';
        } catch (e) {
            status.textContent = this.pi.getLangString("PLAYLIST_URL_STATUS_INVALID");
            status.style.color = 'red';
        }
    }

    private getRetrySeconds(message?: string) {
        if (!message) return 5;
        const match = message.match(/retry in (\\d+) seconds?/i);
        if (!match) return 5;
        const seconds = parseInt(match[1], 10);
        if (Number.isNaN(seconds)) return 5;
        return seconds;
    }
}
