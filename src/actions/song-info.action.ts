import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {
    KeyUpEvent,
    SDOnActionEvent,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { ThumbnailHelper } from '../helper/thumbnail.helper';
import { TrackAndPlayerInterface } from '../interfaces/information.interface';
import { YTMD } from '../ytmd';
import { DefaultAction } from './default.action';

export class SongInfoAction extends DefaultAction<SongInfoAction> {
    private thumbnailHelper: ThumbnailHelper;
    private currentUrl: string;
    private placeholderCover: string = 'https://via.placeholder.com/128?text=';
    private subscriptions: { [index: string]: { subject: Subject<any> } } = {};

    constructor(plugin: YTMD, actionName: string) {
        super(plugin, actionName);
        this.thumbnailHelper = ThumbnailHelper.INSTANCE;
    }

    private static getScrollingText(text: string, index: number, plus: number) {
        return (text + ''.padEnd(plus)).substring(index, index + plus);
    }

    @SDOnActionEvent('willAppear')
    public onContextAppear({payload: {coordinates, }, context}: WillAppearEvent): void {
        this.subscriptions[context] = {subject: new Subject<any>()};
        let titleIndex = 0;
        let currentTitle: string;
        let authorIndex = 0;
        let currentAuthor: string;
        let albumIndex = 0;
        let currentAlbum: string;
        let currentThumbnail: string;
        this.thumbnailHelper.addAction({
            action: this,
            pos: coordinates,
            context: context,
        });

        this.socket.onTick$
            .pipe(
                distinctUntilChanged(),
                takeUntil(this.subscriptions[context].subject)
            )
            .subscribe(async (data) => {
                const {
                    track: { title, album, author, cover, url },
                } = this.getSongData(data);

                if (currentTitle !== title) titleIndex = 0;
                if (currentAlbum !== album) albumIndex = 0;
                if (currentAuthor !== author) authorIndex = 0;
                if (currentThumbnail !== cover)
                    await this.plugin.setImage(await this.thumbnailHelper.setImage(cover), context);

                currentTitle = title;
                currentAuthor = author;
                currentAlbum = album;
                currentThumbnail = cover;
                this.currentUrl = url;

                let displayTitle = currentTitle;
                let displayAlbum =
                    currentAlbum === displayTitle ? '' : currentAlbum;
                let displayAuthor =
                    currentAuthor === currentTitle ? '' : currentAuthor;

                const plus = 6;
                if (!displayTitle && !displayAlbum && !displayAuthor) return;

                if (currentTitle.length > plus) {
                    displayTitle = SongInfoAction.getScrollingText(
                        ''.padStart(plus, ' ') + displayTitle,
                        titleIndex,
                        plus
                    );
                    titleIndex++;
                    if (titleIndex >= currentTitle.length + plus)
                        titleIndex = 0;
                }

                if (currentAuthor.length > plus) {
                    displayAuthor = SongInfoAction.getScrollingText(
                        ''.padStart(plus, ' ') + displayAuthor,
                        authorIndex,
                        plus
                    );
                    authorIndex++;
                    if (authorIndex >= currentAuthor.length + plus)
                        authorIndex = 0;
                }

                if (currentAlbum.length > plus) {
                    displayAlbum = SongInfoAction.getScrollingText(
                        ''.padStart(plus, ' ') + displayAlbum,
                        albumIndex,
                        plus
                    );
                    albumIndex++;
                    if (albumIndex >= currentAlbum.length + plus)
                        albumIndex = 0;
                }

                this.plugin.setTitle(
                    `${displayTitle}\n${displayAlbum}\n${displayAuthor}`,
                    context
                );
            });
    }

    @SDOnActionEvent('willDisappear')
    public onContextDisappear({payload: {coordinates}, context}: WillDisappearEvent): void {
        this.thumbnailHelper.removeAction({
            action: this,
            pos: coordinates,
            context: context,
        });
        if (this.subscriptions[context])
            this.subscriptions[context].subject.next();
    }

    @SDOnActionEvent('keyUp')
    public onKeypressUp(): void {
        if (this.currentUrl) this.plugin.openUrl(this.currentUrl);
    }

    private getSongData(
        data: TrackAndPlayerInterface
    ): TrackAndPlayerInterface {
        const {
            player: { hasSong, isPaused },
        } = data;
        if (isPaused) {
            data.track.cover = this.placeholderCover + 'Paused';
            data.track.title = 'Paused';
            data.track.author = 'Paused';
            data.track.album = 'Paused';
        } else if (!hasSong) {
            data.track.cover = this.placeholderCover + 'N%2FA';
            data.track.title = 'N/A';
            data.track.author = 'N/A';
            data.track.album = 'N/A';
        }

        return data;
    }
}
