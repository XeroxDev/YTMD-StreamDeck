import {DefaultAction} from "./default.action";
import {takeUntil} from "rxjs/operators";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {TrackAndPlayerInterface} from "../interfaces/information.interface";

export class DislikeAction extends DefaultAction {
	private disliked = false;

	onContextAppear(event: WillAppearEvent): void {
		this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => this.handleDislike(event, data));
	}

	onKeypressUp(event: KeyUpEvent): void {
		this.socket.trackThumbsDown();
	}

	handleDislike(event: WillAppearEvent, data: TrackAndPlayerInterface) {
		if (Object.keys(data).length === 0) {
			return;
		}
		const _disliked = data.player.likeStatus === 'DISLIKE';
		if (this.disliked !== _disliked) {
			this.disliked = _disliked;
			this.setContext(event.context);
			this.plugin.setState(this.disliked ? StateType.ON : StateType.OFF)
		}
	}
}
