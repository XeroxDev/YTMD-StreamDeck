import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {PlaylistSettings} from "../interfaces/context-settings.interface";
import {ErrorOutput} from "ytmdesktop-ts-companion";

export class PlayPlaylistAction extends DefaultAction<PlayPlaylistAction> {
    constructor(
        private plugin: YTMD,
        actionName: string
    ) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent): void {
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp({context, payload: {settings}}: KeyUpEvent<PlaylistSettings>) {
        const playlistUrl = settings?.playlistUrl?.trim();
        const playlistId = settings?.playlistId?.trim();
        if (!playlistUrl && !playlistId) {
            this.plugin.logMessage(`No playlist configured. context: ${JSON.stringify(context)}`);
            this.plugin.showAlert(context);
            return;
        }

        if (playlistUrl && !this.isValidPlaylistUrl(playlistUrl)) {
            this.plugin.logMessage(`Invalid playlist URL. context: ${JSON.stringify(context)}, url: ${playlistUrl}`);
            this.plugin.showAlert(context);
            return;
        }

        this.startPlayback(context, playlistId, playlistUrl);
    }

    private isValidPlaylistUrl(url: string) {
        try {
            const parsed = new URL(url);
            return parsed.searchParams.has('list');
        } catch (e) {
            return false;
        }
    }

    private async startPlayback(context: string, playlistId?: string, playlistUrl?: string) {
        try {
            await this.withTimeout(
                this.rest.changeVideo({playlistId, url: playlistUrl}),
                8000,
                'Playlist start timed out'
            );
            this.plugin.showOk(context);
        } catch (reason) {
            console.error(reason);
            let message = JSON.stringify(reason);
            if (reason satisfies ErrorOutput) {
                message = reason.message;
            }
            this.plugin.logMessage(`Error while starting playlist. context: ${JSON.stringify(context)}, error: ${message}`);
            this.plugin.showAlert(context);
        }
    }

    private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
        let timeoutId: number | undefined;
        const timeoutPromise = new Promise<T>((_, reject) => {
            timeoutId = window.setTimeout(() => {
                reject(new Error(message));
            }, timeoutMs);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        }
    }
}
