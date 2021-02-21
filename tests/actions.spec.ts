import {DislikeAction} from "../src/actions/dislike.action";
import {KeyUpEvent, StreamDeckPlugin, WillAppearEvent} from "streamdeck-typescript";
import {expect} from "chai";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";
import {LikeAction} from "../src/actions/like.action";
import {MuteAction} from "../src/actions/mute.action";
import {NextAction} from "../src/actions/next.action";
import {PrevAction} from "../src/actions/prev.action";
import {VolChangeAction} from "../src/actions/vol-change.action";
import {PlayPauseAction} from "../src/actions/play-pause.action";
import {TrackAndPlayerInterface} from "../src/interfaces/information.interface";
import {YtmdSocketHelper} from "../src/helper/ytmd-socket-helper";

describe('Testing all actions', () => {
	function createFakeApi(): any {
		return new class {
			pluginContext: string;
			state: StateType;
			title: string;
			alert = 0;
			okay = 0;

			setState(state: StateType) {
				this.state = state;
			}

			showAlert() {
				this.alert++;
			}

			showOk() {
				this.okay++;
			}

			setTitle(title: string) {
				this.title = title;
			}
		}
	}

	const fakeKeyUpEvent: KeyUpEvent = {
		context: '',
		action: '',
		device: '',
		event: "keyUp",
		payload: {
			state: StateType.OFF,
			userDesiredState: StateType.OFF,
			coordinates: {column: 1, row: 2},
			isInMultiAction: false,
			settings: ''
		}
	}
	const fakeWillAppearEvent: WillAppearEvent = {
		device: 'device',
		action: 'action',
		context: 'context',
		payload: {settings: '', coordinates: {row: 1, column: 1}, isInMultiAction: false, state: StateType.OFF},
		event: "willAppear"
	}
	const socket = YtmdSocketHelper.getInstance();

	describe('Test dislike action', () => {
		const fakeApi = createFakeApi();
		const dislike = new DislikeAction(fakeApi as StreamDeckPlugin);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				expect(dislike.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		});
		describe('Test handleDislike()', () => {
			it('should set pluginContext to "context"', () => {
				dislike.handleDislike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.pluginContext).to.be.equals('context', 'Context is not "context"');
			});
			it('should set state to ON', () => {
				dislike.handleDislike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.ON, 'State is not ON');
			});
			it('should set state to OFF', () => {
				dislike.handleDislike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'LIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.OFF, 'State is not OFF');
			});
		});
	});
	describe('Test like action', () => {
		const fakeApi = createFakeApi();
		const like = new LikeAction(fakeApi as StreamDeckPlugin);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				expect(like.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		});
		describe('Test handleDislike()', () => {
			it('should set pluginContext to "context"', () => {
				like.handleLike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'LIKE'}});
				expect(fakeApi.pluginContext).to.be.equals('context');
			});
			it('should set state to ON', () => {
				like.handleLike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'LIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.ON);
			});
			it('should set state to OFF', () => {
				like.handleLike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.OFF);
			});
		});
	});
	describe('Test mute action', () => {
		const fakeApi = createFakeApi();
		const mute = new MuteAction(fakeApi as StreamDeckPlugin);
		mute.onContextAppear(fakeWillAppearEvent)
		describe('Test onKeypressUp()', () => {
			it('should mute', () => {
				expect(mute.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
			it('unmute', () => {
				expect(mute.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		})
	});
	describe('Test volume change action', () => {
		const fakeApi = createFakeApi();
		const volChangeUp = new VolChangeAction(fakeApi as StreamDeckPlugin, 'UP', 10);
		const volChangeDown = new VolChangeAction(fakeApi as StreamDeckPlugin,'DOWN', 10);

		describe('Volume up', () => {
			it('should set volume +10', () => {
				expect(MuteAction.currentVolume$.getValue()).to.be.equals(50);
				volChangeUp.onKeypressUp(fakeKeyUpEvent);
				expect(MuteAction.currentVolume$.getValue()).to.be.equals(60);
			})
		});
		describe('Volume down', () => {
			it('should set volume -10', () => {
				expect(MuteAction.currentVolume$.getValue()).to.be.equals(60);
				volChangeDown.onKeypressUp(fakeKeyUpEvent);
				expect(MuteAction.currentVolume$.getValue()).to.be.equals(50);
			})
		});
	});
	describe('Test next action', () => {
		const fakeApi = createFakeApi();
		const next = new NextAction(fakeApi as StreamDeckPlugin);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				expect(next.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		});
	});
	describe('Test prev action', () => {
		const fakeApi = createFakeApi();
		const prev = new PrevAction(fakeApi as StreamDeckPlugin);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				expect(prev.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		});
	});
	describe('Test play-pause action', () => {
		const fakeApi = createFakeApi();
		const playPause = new PlayPauseAction(fakeApi as StreamDeckPlugin);
		describe('Test onKeypressUp()', () => {
			it('stop playing', () => {
				expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
			it('start playing', () => {
				expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.be.undefined;
			});
		});
		describe('Test handlePlayerData()', () => {
			it('should change title', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {seekbarCurrentPositionHuman: '01:23'}});
				expect(fakeApi.title).to.be.equals('01:23');
			});
			it('should change state to OFF', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {seekbarCurrentPositionHuman: '01:23', isPaused: false}});
				expect(fakeApi.state).to.be.equals(StateType.OFF);
			});
			it('should change state to ON', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {seekbarCurrentPositionHuman: '01:23', isPaused: true}});
				expect(fakeApi.state).to.be.equals(StateType.ON);
			});
			it('should set alert to 1', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, <TrackAndPlayerInterface>{});
				expect(fakeApi.state).to.be.equals(StateType.ON);
			});
		});
		describe('Test onContextAppear()', () => {
			playPause.onContextAppear(fakeWillAppearEvent);
			it('should set alert to 2', () => {
				socket.onError$.next();
				expect(fakeApi.alert).to.be.equals(2);
			});
			it('should set okay to 1', () => {
				socket.onConnect$.next();
				expect(fakeApi.okay).to.be.equals(1);
			});
		});
	});
	describe('Disconnecting', () => {
		socket.disconnect();
	});
});
