import { Coordinates } from 'streamdeck-typescript';
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

    public async setImage(cover: string, context: string) {
        if (cover !== this._lastCover) {
            this._lastCover = cover;
            this._imageCache = null;
        }

        let currentItem;
        for (const matrix of this._matrix) {
            for (const item of matrix) {
                if (item?.context === context) {
                    currentItem = item;
                    break;
                }
            }
        }
        if (!currentItem) return;

        let tileIndex = 0,
            currentCol = currentItem.pos.column,
            currentRow = currentItem.pos.row,
            squareInfo = this.getSquareDimension(currentRow, currentCol);

        while (this.validateSquare(squareInfo)) {
            const {x, y, w, h} = squareInfo;
            if (w <= 1 || h <= 1 || (x <= 0 || y <= 0))
                break;
            squareInfo.x--;
            squareInfo.y--;
            squareInfo.w--;
            squareInfo.h--;
        }

        const dimension = squareInfo.w < squareInfo.h ? squareInfo.w : squareInfo.h;
        console.log(dimension, squareInfo);

        return this.getImageTile(cover, dimension === 0 ? 1 : dimension, tileIndex);
    }

    private validateSquare({ y, x, h, w }: any) {
        let iterated = false;
        for (let rowIndex = y; rowIndex < y + h; rowIndex++) {
            for (let colIndex = x; colIndex < x + w; colIndex++) {
                iterated = true;
                if (!this.checkItem(rowIndex, colIndex)) return false;
            }
        }
        return iterated;
    }

    private getSquareDimension(currentRow: number, currentCol: number) {
        let width = 1,
            height = 1,
            lowestCol = currentCol,
            lowestRow = currentRow,
            colBefore = currentCol - 1,
            colNext = currentCol + 1,
            rowBefore = currentRow - 1,
            rowNext = currentRow + 1;
        while (this.checkItem(currentRow, colNext++)) {
            width++;
        }
        while (this.checkItem(currentRow, colBefore--)) {
            width++;
            lowestCol--;
        }
        while (this.checkItem(rowNext++, currentCol)) {
            height++;
        }
        while (this.checkItem(rowBefore--, currentCol)) {
            height++;
            lowestRow--;
        }

        return { x: lowestCol, y: lowestRow, h: height, w: width };
    }

    private checkItem(rowToCheck: number, colToCheck: number) {
        if (!this._matrix[rowToCheck]) return false;
        if (!this._matrix[rowToCheck][colToCheck]) return false;
        return true;
    }

    // public async setImage(cover: string, context: string) {
    //     if (cover !== this._lastCover) {
    //         this._lastCover = cover;
    //         this._imageCache = null;
    //     }

    //     // TODO: Generate thumbnails for the perfect squared size
    //     // for (const matrix of this._matrix) {
    //     //     for (const item of matrix) {s
    //     //         if (!item) continue;
    //     //         const { context, pos } = item;
    //     //         this.setImageFromUrl(this._lastCover, context, pos, 1);
    //     //     }
    //     // }

    //     // Hardcoded until working (so the action has always a image)
    //     return this.getImageTile(cover, 1, 0);
    // }

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
                    this._imageCache = image;
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
