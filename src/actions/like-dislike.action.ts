import {DefaultAction} from "./default.action";
import {YTMD} from "../ytmd";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {takeUntil} from "rxjs/operators";
import {PlayerInfoInterface, TrackAndPlayerInterface} from "../interfaces/information.interface";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";

export class LikeDislikeAction extends DefaultAction<LikeDislikeAction> {
	constructor(private plugin: YTMD, actionName: string, private likeStatus: PlayerInfoInterface['likeStatus']) {
		super(plugin, actionName);
	}

	onContextAppear(event: WillAppearEvent): void {
		this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => this.handleLikeDislike(event, data));
	}

	onKeypressUp(event: KeyUpEvent): void {
		this.socket.trackThumbsDown();
	}

	handleLikeDislike({context}: WillAppearEvent, data: TrackAndPlayerInterface) {
		if (Object.keys(data).length === 0) {
			return;
		}

		const correctState: boolean = data.player.likeStatus === this.likeStatus;
		this.plugin.setState(correctState ? StateType.ON : StateType.OFF, context);
	}
}
