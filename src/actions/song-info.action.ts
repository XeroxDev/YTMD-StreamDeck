import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { TrackAndPlayerInterface } from '../interfaces/information.interface';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class SongInfoAction extends DefaultAction<SongInfoAction> {
    private titleIndex = 0;
    private currentTitle: string;
    private authorIndex = 0;
    private currentAuthor: string;
    private albumIndex = 0;
    private currentAlbum: string;
    private currentThumbnail: string;
    private currentUrl: string;
    private placeholderCover: string = 'https://via.placeholder.com/128/000000/FFFFFF/?text=';

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    private static getScrollingText(text: string, index: number, plus: number) {
        return (text + ''.padEnd(plus)).substring(index, index + plus);
    }

    @SDOnActionEvent('willAppear')
    public onContextAppear(event: WillAppearEvent): void {
        this.reset();
        this.socket.onTick$
            .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe(async (data) => {
                const {
                    track: { title, album, author, cover, url },
                } = this.getSongData(data);

                if (this.currentTitle !== title) this.titleIndex = 0;
                if (this.currentAlbum !== album) this.albumIndex = 0;
                if (this.currentAuthor !== author) this.authorIndex = 0;
                if (this.currentThumbnail !== cover)
                    await this.plugin.setImageFromUrl(cover, event.context);

                this.currentTitle = title;
                this.currentAuthor = author;
                this.currentAlbum = album;
                this.currentThumbnail = cover;
                this.currentUrl = url;

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
            });
    }
    reset() {
        this.titleIndex = 0;
        this.authorIndex = 0;
        this.albumIndex = 0;
        this.currentTitle = '';
        this.currentAuthor = '';
        this.currentAlbum = '';
        this.currentThumbnail = '';
        this.currentUrl = '';
    }

    @SDOnActionEvent('willDisappear')
    public onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    public onKeypressUp(event: KeyUpEvent): void {
        if (this.currentUrl) this.plugin.openUrl(this.currentUrl);
    }

    private getSongData(
        data: TrackAndPlayerInterface
    ): TrackAndPlayerInterface {
        const {
            player: { hasSong, isPaused },
        } = data;
        if (isPaused) {
            data.track.title = 'Paused';
            data.track.author = 'Paused';
            data.track.album = 'Paused';
        } else if (!hasSong) {
            data.track.cover = this.placeholderCover + 'N%2FA';
            data.track.title = 'N/A';
            data.track.author = 'N/A';
            data.track.album = 'N/A';
        }
        
        if (!data.track.cover) {
            data.track.cover = this.placeholderCover + 'N%2FA';
        }

        return data;
    }
}
