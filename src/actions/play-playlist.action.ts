import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {PlaylistSettings} from "../interfaces/context-settings.interface";

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
        const playlistId = settings?.customPlaylistId?.trim() || settings?.playlistId?.trim();
        if (!playlistUrl && !playlistId) {
            this.plugin.logMessage(`No playlist configured. context: ${JSON.stringify(context)}`);
            this.plugin.showAlert(context);
            return;
        }

        this.rest.changeVideo({playlistId, url: playlistUrl}).catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while starting playlist. context: ${JSON.stringify(context)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(context);
        });
    }
}
