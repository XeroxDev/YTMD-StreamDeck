import { Subject } from 'rxjs';
import {
    KeyDownEvent,
    KeyUpEvent,
    StreamDeckAction,
    WillAppearEvent,
    WillDisappearEvent,
} from 'streamdeck-typescript';
import { YtmdSocketHelper } from '../helper/ytmd-socket.helper';
import { YTMD } from '../ytmd';

export abstract class DefaultAction<Instance> extends StreamDeckAction<
    YTMD,
    Instance
> {
    destroy$: Subject<any> = new Subject<any>();
    socket: YtmdSocketHelper;

    protected constructor(plugin: YTMD, actionName: string) {
        super(plugin, actionName);
        this.socket = YtmdSocketHelper.getInstance();
        console.log(`Initialized ${actionName}`);
    }

    abstract onContextAppear(event: WillAppearEvent): void;

    abstract onKeypressUp(event: KeyUpEvent): void;

    abstract onContextDisappear(event: WillDisappearEvent): void;

    onKeypressDown(event: KeyDownEvent): void {}
}
