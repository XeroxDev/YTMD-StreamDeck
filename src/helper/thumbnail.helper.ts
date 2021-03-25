import { Coordinates, StateType, TargetType } from 'streamdeck-typescript';
import { DefaultAction } from '../actions/default.action';

type ActionType = {
    action: DefaultAction<any>;
    pos: Coordinates;
    context: string;
};

export class ThumbnailHelper {
    private static _instance: ThumbnailHelper;
    public static get INSTANCE(): ThumbnailHelper {
        if (!this._instance) this._instance = new ThumbnailHelper();
        return this._instance;
    }

    private _matrix: (Omit<ActionType, 'action'> | null)[][] = [];

    private _lastCover = '';

    private _imageCache: HTMLImageElement | null = null;

    public addAction(action: ActionType) {
        const { row, column } = action.pos;
        if (!this._matrix || this._matrix.length === 0) {
            let biggestX = 0;
            let biggestY = 0;
            for (const device of action.action.plugin.info.devices) {
                if (device.size.rows > biggestX) biggestX = device.size.rows;
                if (device.size.columns > biggestY)
                    biggestY = device.size.columns;
            }

            for (let i = 0; i < biggestX; i++) {
                this._matrix[i] = new Array(biggestY).fill(null);
            }
        }
        this._matrix[row][column] = {
            pos: action.pos,
            context: action.context,
        };
    }

    public removeAction(action: ActionType) {
        const { row, column } = action.pos;
        this._matrix[row][column] = null;
    }

    public async setImage(cover: string) {
        if (cover !== this._lastCover) {
            this._lastCover = cover;
            this._imageCache = null;
        }
        return await this.generateThumbnails(cover);
    }

    private async generateThumbnails(cover: string) {
        // TODO: Generate thumbnails for the perfect squared size
        // for (const matrix of this._matrix) {
        //     for (const item of matrix) {
        //         if (!item) continue;
        //         const { context, pos } = item;
        //         this.setImageFromUrl(this._lastCover, context, pos, 1);
        //     }
        // }

        // Hardcoded until working (so the action has always a image)
        return this.getImageTile(cover, 1, 0);
    }

    /**
     * Sets the action image but instead from file, from URL
     * @param {string} url
     * @param {string} context
     * @param {TargetType} target
     * @param {StateType} state
     * @returns {Promise<string>}
     */
    private getImageTile(
        url: string,
        dimension: number,
        tileIndex: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this._imageCache) {
                let image = new Image();
                image.onload = () => {
                    const calculated = this.calculateImageSize(
                        dimension,
                        tileIndex
                    );
                    if (calculated) resolve(calculated);
                    else reject('Could not get image');
                };
                image.onerror = () => {
                    image.onload = null;
                    image.onerror = null;
                    (image as any) = null;

                    reject(new Error('image failed to load'));
                };
                image.src = url;
                this._imageCache = image;
            } else {
                const calculated = this.calculateImageSize(
                    dimension,
                    tileIndex
                );
                if (calculated) resolve(calculated);
                else reject('Could not get image');
            }
        });
    }

    private calculateImageSize(dimension: number, tileIndex: number) {
        if (!this._imageCache) return null;
        const image = this._imageCache;
        let canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;


        const tileWidth = canvas.width / dimension;
        const tileHeight = canvas.height / dimension;
        const tilePerLine = dimension;
        const offsetX = (tileIndex % tilePerLine) * tileWidth;
        const offsetY = Math.floor(tileIndex / tilePerLine) * tileHeight;

        let ctx = canvas.getContext('2d');
        if (!ctx) {
            return null;
        }

        ctx.drawImage(
            image,
            offsetX,
            offsetY,
            tileWidth,
            tileHeight,
            0,
            0,
            544,
            544
        );

        return canvas.toDataURL('image/png');
    }
}
