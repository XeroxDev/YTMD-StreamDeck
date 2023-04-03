import {KeyUpEvent, SDOnActionEvent, StateType, WillAppearEvent, WillDisappearEvent} from 'streamdeck-typescript';
import {ActionTypes} from '../interfaces/enums';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {distinctUntilChanged, map, takeUntil} from "rxjs/operators";

export class LibraryAction extends DefaultAction<LibraryAction> {
    private inLibrary: boolean = false;

    constructor(private plugin: YTMD, actionName: ActionTypes) {
        super(plugin, actionName)
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent<any>): void {
        console.log("Started");
        this.socket.onTick$
            .pipe(map(value => value.track.inLibrary), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((inLibrary) => {
                this.inLibrary = inLibrary;
                this.plugin.setState(inLibrary ? StateType.OFF : StateType.ON, event.context);
            });
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent<any>): void {
        if (!this.inLibrary) {
            this.socket.playerAddLibrary();
        }
        this.plugin.setState(this.inLibrary ? StateType.OFF : StateType.ON, event.context);
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent): void {
        this.destroy$.next();
    }

}