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

    private _matrix: (ActionType | null)[][] = [];
    private _lastCover = '';

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
        this._matrix[row][column] = action;
        this._lastCover = '';
    }

    public removeAction(action: ActionType) {
        const { row, column } = action.pos;
        this._matrix[row][column] = null;
    }

    public async setImage(cover: string) {
        if (this._lastCover !== cover) {
            this._lastCover = cover;
            await this.generateThumbnails(cover);
        }
    }

    private async generateThumbnails(cover: string) {
        // TODO: Generate thumbnails for the perfect squared size
        for (const matrix of this._matrix) {
            for (const item of matrix) {
                if (!item) continue;
                const { context, action, pos } = item;
                this.setImageFromUrl(this._lastCover, context, action, pos, 1);
            }
        }
    }

    /**
     * Sets the action image but instead from file, from URL
     * @param {string} url
     * @param {string} context
     * @param {TargetType} target
     * @param {StateType} state
     * @returns {Promise<string>}
     */
    private setImageFromUrl(
        url: string,
        context: string,
        action: DefaultAction<any>,
        pos: Coordinates,
        dimension: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                //TODO: This should calculate the right size and cut it into the pieces for each action. If it's a single key, show full image

                const tileIndex = 0;
                const tileWidth = canvas.width / dimension;
                const tileHeight = canvas.height / dimension;
                const tilePerLine = dimension;
                const offsetX = (tileIndex % tilePerLine) * tileWidth;
                const offsetY =
                    Math.floor(tileIndex / tilePerLine) * tileHeight;

                let ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('image failed to load'));
                    return;
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

                image.onload = null;
                image.onerror = null;
                (image as any) = null;

                const dataUrl = canvas.toDataURL('image/png');

                action.plugin.setImage(dataUrl, context);
                resolve(dataUrl);
            };
            image.onerror = () => {
                image.onload = null;
                image.onerror = null;
                (image as any) = null;

                reject(new Error('image failed to load'));
            };
            image.src = url;
        });
    }
}
