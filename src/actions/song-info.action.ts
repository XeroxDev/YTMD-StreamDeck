import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {StateOutput, TrackState} from "ytmdesktop-ts-companion";

export class SongInfoAction extends DefaultAction<SongInfoAction> {
    private events: { context: string, method: (state: StateOutput) => void }[] = [];

    private titleIndex = 0;
    private currentTitle: string;
    private authorIndex = 0;
    private currentAuthor: string;
    private albumIndex = 0;
    private currentAlbum: string;
    private currentThumbnail: string;
    private lastChange: {context: string, date:Date }[] = [];

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    private static getScrollingText(text: string, index: number, plus: number) {
        return (text + ''.padEnd(plus)).substring(index, index + plus);
    }

    @SDOnActionEvent('willAppear')
    public onContextAppear(event: WillAppearEvent): void {
        this.reset();

        let found = this.events.find(e => e.context === event.context);
        if (found) {
            return;
        }

        found = {
            context: event.context,
            method: (state: StateOutput) => this.handleSongInfo(event, state).catch(reason => {
                console.error(reason);
                this.plugin.logMessage(`Error while executing handleSongInfo. state: ${JSON.stringify(state)}, event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
                this.plugin.showAlert(event.context)
            })
        };

        this.events.push(found);

        this.socket.addStateListener(found.method);
    }

    reset() {
        this.titleIndex = 0;
        this.authorIndex = 0;
        this.albumIndex = 0;
        this.currentTitle = '';
        this.currentAuthor = '';
        this.currentAlbum = '';
        this.currentThumbnail = '';
    }

    @SDOnActionEvent('willDisappear')
    public onContextDisappear(event: WillDisappearEvent): void {
        const found = this.events.find(e => e.context === event.context);
        if (!found) {
            return;
        }

        this.socket.removeStateListener(found.method);
        this.events = this.events.filter(e => e.context !== event.context);
    }

    @SDOnActionEvent('keyUp')
    public onKeypressUp(event: KeyUpEvent): void {
        this.rest.playPause().catch(reason => {
            console.error(reason);
            this.plugin.logMessage(`Error while playPause toggle (song info). event: ${JSON.stringify(event)}, error: ${JSON.stringify(reason)}`);
            this.plugin.showAlert(event.context)
        });
    }

    private getSongData(data: StateOutput): {
        title: string,
        album: string,
        author: string,
        cover: string
    } {
        let title = 'N/A';
        let album = 'N/A';
        let author = 'N/A';
        let cover = this.generatePlaceholderCover('N/A');

        if (!data.player || !data.video) return {title, album, author, cover};

        const trackState = data.player.trackState;

        switch (trackState) {
            case TrackState.PAUSED:
                title = 'Paused';
                album = 'Paused';
                author = 'Paused';
                break;
            case TrackState.PLAYING:
                title = data.video.title ?? title;
                album = data.video.album ?? album;
                author = data.video.author ?? author;
                cover = data.video.thumbnails[data.video.thumbnails.length - 1].url ?? cover;
                break;
            default:
                break;
        }

        return {title, album, author, cover};
    }

    private async handleSongInfo(event: WillAppearEvent, state: StateOutput) {
        const lastChange = this.lastChange.find(l => l.context === event.context);
        if (lastChange && new Date().getTime() - lastChange.date.getTime() < 450) return;
        this.lastChange = this.lastChange.filter(l => l.context !== event.context);
        this.lastChange.push({context: event.context, date: new Date()});

        const {title, album, author, cover} = this.getSongData(state);

        if (this.currentTitle !== title) this.titleIndex = 0;
        if (this.currentAlbum !== album) this.albumIndex = 0;
        if (this.currentAuthor !== author) this.authorIndex = 0;
        if (this.currentThumbnail !== cover)
            await this.plugin.setImageFromUrl(cover, event.context);

        this.currentTitle = title;
        this.currentAuthor = author;
        this.currentAlbum = album;
        this.currentThumbnail = cover;

        let displayTitle = this.currentTitle;
        let displayAlbum =
            this.currentAlbum === displayTitle ? '' : this.currentAlbum;
        let displayAuthor =
            this.currentAuthor === this.currentTitle
                ? ''
                : this.currentAuthor;

        const plus = 6;
        if (!displayTitle && !displayAlbum && !displayAuthor) return;

        if (this.currentTitle.length > plus) {
            displayTitle = SongInfoAction.getScrollingText(
                ''.padStart(plus, ' ') + displayTitle,
                this.titleIndex,
                plus
            );
            this.titleIndex++;
            if (this.titleIndex >= this.currentTitle.length + plus)
                this.titleIndex = 0;
        }

        if (this.currentAuthor.length > plus) {
            displayAuthor = SongInfoAction.getScrollingText(
                ''.padStart(plus, ' ') + displayAuthor,
                this.authorIndex,
                plus
            );
            this.authorIndex++;
            if (this.authorIndex >= this.currentAuthor.length + plus)
                this.authorIndex = 0;
        }

        if (this.currentAlbum.length > plus) {
            displayAlbum = SongInfoAction.getScrollingText(
                ''.padStart(plus, ' ') + displayAlbum,
                this.albumIndex,
                plus
            );
            this.albumIndex++;
            if (this.albumIndex >= this.currentAlbum.length + plus)
                this.albumIndex = 0;
        }

        this.plugin.setTitle(
            `${displayTitle}\n${displayAlbum}\n${displayAuthor}`,
            event.context
        );
    }

    private generatePlaceholderCover(text: string): string {
        // draw a rectangle with black background and white text and then use "toDataURL" to convert to a data URL
        const canvas = document.createElement('canvas');
        canvas.width = 144;
        canvas.height = 144;

        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white'; // Text color
        this.fitTextOnCanvas(text, canvas, ctx, 10);

        return canvas.toDataURL('image/png');
    }

    private fitTextOnCanvas(text: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, padding: number) {
        let fontSize = 100; // Starting with a high font size
        ctx.textBaseline = 'middle'; // Align text vertically in the middle
        ctx.textAlign = 'center'; // Align text horizontally in the center

        // Function to measure text width for a given font size
        function getTextWidth(text: string, font: string): number {
            ctx.font = font;
            return ctx.measureText(text).width;
        }

        // Reduce font size until the text fits within the canvas with padding
        let widthWithPadding = canvas.width - 2 * padding;
        let heightWithPadding = canvas.height - 2 * padding;
        do {
            ctx.font = `${fontSize}px Arial`; // Adjust font here as needed
            fontSize -= 1;
        } while (getTextWidth(text, ctx.font) > widthWithPadding || fontSize > heightWithPadding);

        // Draw the text on the canvas
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
}
