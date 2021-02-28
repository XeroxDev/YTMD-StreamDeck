import {takeUntil}                                                        from 'rxjs/operators';
import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {YTMD}                                                             from '../ytmd';
import {DefaultAction}                                                    from './default.action';

export class SongInfoAction extends DefaultAction<SongInfoAction> {
    private titleIndex = 0;
    private currentTitle: string;
    private authorIndex = 0;
    private currentAuthor: string;
    private albumIndex = 0;
    private currentAlbum: string;
    private currentThumbnail: string;
    private currentUrl: string;

    constructor(private plugin: YTMD, actionName: string) {
        super(plugin, actionName);
    }

    private static getScrollingText(text: string, index: number, plus: number) {
        return text.substring(index, index + plus);
    }

    @SDOnActionEvent('willAppear')
    public onContextAppear(event: WillAppearEvent): void {
        this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(
            (
                {
                    track: {
                        title,
                        album,
                        author,
                        cover,
                        url
                    }
                }
            ) => {
                if (this.currentTitle !== title)
                    this.titleIndex = 0;
                if (this.currentAlbum !== album)
                    this.albumIndex = 0;
                if (this.currentAuthor !== author)
                    this.authorIndex = 0;
                if (this.currentThumbnail !== cover)
                    this.imageToDataUrl(cover).then(value => this.plugin.setImage(value, event.context));

                this.currentTitle = title;
                this.currentAuthor = author;
                this.currentAlbum = album;
                this.currentThumbnail = cover;
                this.currentUrl = url;

                let displayTitle = this.currentTitle;
                let displayAlbum = this.currentAlbum === displayTitle ? '' : this.currentAlbum;
                let displayAuthor = this.currentAuthor;
                const plus = 5;
                if (!displayTitle && !displayAlbum && !displayAuthor)
                    return;

                if (this.currentTitle.length > plus) {
                    displayTitle = SongInfoAction.getScrollingText(''.padStart(plus, ' ') + displayTitle, this.titleIndex, plus);
                    this.titleIndex++;
                    if (this.titleIndex >= this.currentTitle.length + plus)
                        this.titleIndex = 0;
                }

                if (this.currentAuthor.length > plus) {
                    displayAuthor = SongInfoAction.getScrollingText(''.padStart(plus, ' ') + displayAuthor, this.authorIndex, plus);
                    this.authorIndex++;
                    if (this.authorIndex >= this.currentAuthor.length + plus)
                        this.authorIndex = 0;
                }

                if (this.currentAlbum.length > plus) {
                    displayAlbum = SongInfoAction.getScrollingText(''.padStart(plus, ' ') + displayAlbum, this.albumIndex, plus);
                    this.albumIndex++;
                    if (this.albumIndex >= this.currentAlbum.length + plus)
                        this.albumIndex = 0;
                }

                this.plugin.setTitle(`${displayTitle}\n${displayAlbum}\n${displayAuthor}`, event.context);
            });
    }

    @SDOnActionEvent('willDisappear')
    public onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

    @SDOnActionEvent('keyUp')
    public onKeypressUp(event: KeyUpEvent): void {
        this.plugin.openUrl(this.currentUrl);
    }

    private imageToDataUrl(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let image = new Image();

            image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                let ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('image failed to load'));
                    return;
                }

                ctx.drawImage(image, 0, 0);

                image.onload = null;
                image.onerror = null;
                (image as any) = null;

                resolve(canvas.toDataURL('image/png'));
            };
            image.onerror = () => {

                image.onload = null;
                image.onerror = null;
                (image as any) = null;

                reject(new Error('image failed to load'));
            };
            image.src = url;
        });
    };
}
