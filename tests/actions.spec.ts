import {DislikeAction} from "../src/actions/dislike.action";
import {KeyUpEvent, StreamDeckPlugin, WillAppearEvent} from "streamdeck-typescript";
import {YTMD} from "../src/ytmd";
import {expect} from "chai";
import {StateType} from "streamdeck-typescript/dist/src/interfaces/enums";
import {LikeAction} from "../src/actions/like.action";
import {BehaviorSubject} from "rxjs";
import {MuteAction} from "../src/actions/mute.action";
import {NextAction} from "../src/actions/next.action";
import {PrevAction} from "../src/actions/prev.action";
import {VolChangeAction} from "../src/actions/vol-change.action";
import {PlayPauseAction} from "../src/actions/play-pause.action";

describe('Testing all actions', () => {
	function createFakeApi(): any {
		return new class {
			pluginContext: string;
			state: StateType;
			title: string;
			alert = 0;

			setState(state: StateType) {
				this.state = state;
			}

			showAlert() {
				this.alert++;
			}

			setTitle(title: string) {
				this.title = title;
			}
		}
	}

	function createFakePlugin(): any {
		return new class {
			musicData: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
			keyPressed: { method: string, body: any };
			needToError = false;

			async sendRequest(method: string, body: any = '') {
				if (this.needToError)
					throw new Error();

				this.keyPressed = {method, body};
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

	describe('Test dislike action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const dislike = new DislikeAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-thumbs-down'}};
				dislike.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		});
		describe('Test handleDislike()', () => {
			it('should set pluginContext to "context"', () => {
				dislike.handleDislike(fakeWillAppearEvent, {player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.pluginContext).to.be.equals('context', 'Context is not "context"');
			});
			it('should set state to ON', () => {
				dislike.handleDislike(fakeWillAppearEvent, {player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.ON, 'State is not ON');
			});
			it('should set state to OFF', () => {
				dislike.handleDislike(fakeWillAppearEvent, {player: {likeStatus: 'LIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.OFF, 'State is not OFF');
			});
		});
	});
	describe('Test like action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const like = new LikeAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-thumbs-up'}};
				like.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		});
		describe('Test handleDislike()', () => {
			it('should set pluginContext to "context"', () => {
				like.handleLike(fakeWillAppearEvent, {player: {likeStatus: 'LIKE'}});
				expect(fakeApi.pluginContext).to.be.equals('context');
			});
			it('should set state to ON', () => {
				like.handleLike(fakeWillAppearEvent, {player: {likeStatus: 'LIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.ON);
			});
			it('should set state to OFF', () => {
				like.handleLike(fakeWillAppearEvent, {player: {likeStatus: 'DISLIKE'}});
				expect(fakeApi.state).to.be.equals(StateType.OFF);
			});
		});
	});
	describe('Test mute action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const mute = new MuteAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		mute.onContextAppear(fakeWillAppearEvent)
		describe('Test onKeypressUp()', () => {
			it('should mute', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'player-set-volume', value: -1}};
				mute.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
			it('unmute', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'player-set-volume', value: 50}};
				mute.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		})
	});
	describe('Test volume change action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const volChangeUp = new VolChangeAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD, 'UP', 10);
		const volChangeDown = new VolChangeAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD, 'DOWN', 10);

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
		const fakePlugin = createFakePlugin();
		const next = new NextAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-next'}};
				next.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		});
	});
	describe('Test prev action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const prev = new PrevAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		describe('Test onKeypressUp()', () => {
			it('should set keyPressed to corresponding request data', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-previous'}};
				prev.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		});
	});
	describe('Test play-pause action', () => {
		const fakeApi = createFakeApi();
		const fakePlugin = createFakePlugin();
		const playPause = new PlayPauseAction(fakeApi as StreamDeckPlugin, fakePlugin as YTMD);
		describe('Test onKeypressUp()', () => {
			it('stop playing', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-pause'}};
				playPause.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
			it('start playing', () => {
				const shouldBeObj = {method: 'POST', body: {command: 'track-play'}};
				playPause.onKeypressUp(fakeKeyUpEvent);
				expect(fakePlugin.keyPressed).to.deep.equal(shouldBeObj);
			});
		});
		describe('Test handlePlayerData()', () => {
			it('Change title', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, {player: {seekbarCurrentPositionHuman: '01:23'}});
				expect(fakeApi.title).to.be.equals('01:23');
			});
			it('Change state to OFF', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, {player: {seekbarCurrentPositionHuman: '01:23', isPaused: false}});
				expect(fakeApi.state).to.be.equals(StateType.OFF);
			});
			it('Change state to ON', () => {
				playPause.handlePlayerData(fakeWillAppearEvent, {player: {seekbarCurrentPositionHuman: '01:23', isPaused: true}});
				expect(fakeApi.state).to.be.equals(StateType.ON);
			});
		});
	});
});
