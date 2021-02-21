import {DefaultAction} from "./default.action";
import {KeyUpEvent, WillAppearEvent} from "streamdeck-typescript";
import {takeUntil} from "rxjs/operators";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";
import {TrackAndPlayerInterface} from "../interfaces/information.interface";

export class LikeAction extends DefaultAction {
	private liked = false;

	onContextAppear(event: WillAppearEvent) {
		this.socket.onTick$.pipe(takeUntil(this.destroy$)).subscribe(data => this.handleLike(event, data));
	}

	onKeypressUp(event: KeyUpEvent) {
		this.socket.trackThumbsUp();
	}

	handleLike(event: WillAppearEvent, data: TrackAndPlayerInterface) {
		if (Object.keys(data).length === 0) {
			return;
		}
		const _liked = data.player.likeStatus === 'LIKE';
		if (this.liked !== _liked) {
			this.liked = _liked;
			this.setContext(event.context);
			this.plugin.setState(this.liked ? StateType.ON : StateType.OFF);
		}
	}
}
