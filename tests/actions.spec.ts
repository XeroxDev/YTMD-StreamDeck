import {expect} from 'chai';
import {StateType, TargetType} from 'streamdeck-typescript/dist/src/interfaces/enums';
import {MuteAction} from '../src/actions/mute.action';
import {VolChangeAction} from '../src/actions/vol-change.action';
import {PlayPauseAction} from '../src/actions/play-pause.action';
import {TrackAndPlayerInterface} from '../src/interfaces/information.interface';
import {YtmdSocketHelper} from '../src/helper/ytmd-socket.helper';
import {
    KeyDownEvent,
    KeyUpEvent,
    PossibleEventsToSend,
    StreamDeckPluginHandler,
    WillAppearEvent
} from 'streamdeck-typescript';
import {LikeDislikeAction} from '../src/actions/like-dislike.action';
import {YTMD} from '../src/ytmd';
import {ActionTypes} from '../src/interfaces/enums';
import {NextPrevAction} from '../src/actions/next-prev-action';

// TODO: Some day we should write better tests then just checking for undefined or not to throw.

class FakeApi extends StreamDeckPluginHandler {
    state: StateType = StateType.OFF;
    title: string;
    alert = 0;
    okay = 0;

    constructor() {
        super();
    }

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

    setImage(
        image: string,
        context: string,
        target?: TargetType,
        state?: StateType
    ) {
    }

    switchToProfile(profile: string, device?: string) {
    }

    sendToPropertyInspector(payload: any, action: string, context: string) {
    }

    protected registerPi(actionInfo: string) {
    }

    protected onOpen() {
    }

    protected onClose() {
    }

    protected onReady() {
    }

    setSettings<Settings = any>(settings: Settings, context: string) {
    }

    requestSettings(context: string) {
    }

    setGlobalSettings<GlobalSettings = any>(settings: GlobalSettings) {
    }

    requestGlobalSettings() {
    }

    openUrl(url: string) {
    }

    logMessage(message: string) {
    }

    send(event: PossibleEventsToSend, data: any) {
    }

    enableDebug() {
    }

    addEventListener(event: string, fnc: Function) {
    }
}

const fakeKeyUpEvent: KeyUpEvent = {
    context: '',
    action: '',
    device: '',
    event: 'keyUp',
    payload: {
        state: StateType.OFF,
        userDesiredState: StateType.OFF,
        coordinates: {column: 1, row: 2},
        isInMultiAction: false,
        settings: '',
    },
};
const fakeKeyDownEvent: KeyDownEvent = {
    context: '',
    action: '',
    device: '',
    event: 'keyDown',
    payload: {
        state: StateType.OFF,
        userDesiredState: StateType.OFF,
        coordinates: {column: 1, row: 2},
        isInMultiAction: false,
        settings: '',
    },
};
const fakeWillAppearEvent: WillAppearEvent = {
    device: 'device',
    action: 'action',
    context: 'context',
    payload: {
        settings: '',
        coordinates: {row: 1, column: 1},
        isInMultiAction: false,
        state: StateType.OFF,
    },
    event: 'willAppear',
};
const socket = YtmdSocketHelper.getInstance();

describe('Testing all actions', () => {
    describe('Test dislike action', () => {
        const fakeApi = new FakeApi();
        const dislike = new LikeDislikeAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.DISLIKE_TRACK,
            'DISLIKE'
        );
        describe('Test onKeypressUp()', () => {
            it('should set keyPressed to corresponding request data', () => {
                expect(dislike.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
        describe('Test handleDislike()', () => {
            it('should set state to ON', () => {
                dislike.handleLikeDislike(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{player: {likeStatus: 'DISLIKE'}});
                expect(fakeApi.state).to.be.equals(
                    StateType.ON,
                    'State is not ON'
                );
            });
            it('should set state to OFF', () => {
                dislike.handleLikeDislike(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{player: {likeStatus: 'LIKE'}});
                expect(fakeApi.state).to.be.equals(
                    StateType.OFF,
                    'State is not OFF'
                );
            });
        });
    });
    describe('Test like action', () => {
        const fakeApi = new FakeApi();
        const like = new LikeDislikeAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.LIKE_TRACK,
            'LIKE'
        );
        describe('Test onKeypressUp()', () => {
            it('should set keyPressed to corresponding request data', () => {
                expect(like.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
        describe('Test handleDislike()', () => {
            it('should set state to ON', () => {
                like.handleLikeDislike(fakeWillAppearEvent, <TrackAndPlayerInterface>{player: {likeStatus: 'LIKE'}});
                expect(fakeApi.state).to.be.equals(StateType.ON);
            });
            it('should set state to OFF', () => {
                like.handleLikeDislike(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{player: {likeStatus: 'DISLIKE'}});
                expect(fakeApi.state).to.be.equals(StateType.OFF);
            });
        });
    });
    describe('Test mute action', () => {
        const fakeApi = new FakeApi();
        const mute = new MuteAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.VOLUME_MUTE
        );
        mute.onContextAppear(fakeWillAppearEvent);
        describe('Test onKeypressUp()', () => {
            it('should mute', () => {
                expect(mute.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
            it('unmute', () => {
                expect(mute.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
    });
    describe('Test volume change action', () => {
        const fakeApi = new FakeApi();
        const volChangeUp = new VolChangeAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.VOLUME_UP,
            'UP'
        );
        const volChangeDown = new VolChangeAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.VOLUME_DOWN,
            'DOWN'
        );

        describe('Volume up', () => {
            it('should set volume +10', () => {
                expect(MuteAction.currentVolume$.getValue()).to.be.equals(50);
                volChangeUp.onKeypressDown(fakeKeyDownEvent);
                volChangeUp.onKeypressUp(fakeKeyUpEvent);
                expect(MuteAction.currentVolume$.getValue()).to.be.equals(60);
            });
        });
        describe('Volume down', () => {
            it('should set volume -10', () => {
                expect(MuteAction.currentVolume$.getValue()).to.be.equals(60);
                volChangeDown.onKeypressDown(fakeKeyDownEvent);
                volChangeDown.onKeypressUp(fakeKeyUpEvent);
                expect(MuteAction.currentVolume$.getValue()).to.be.equals(50);
            });
        });
    });
    describe('Test next action', () => {
        const fakeApi = new FakeApi();
        const next = new NextPrevAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.NEXT_TRACK,
            'NEXT'
        );
        describe('Test onKeypressUp()', () => {
            it('should set keyPressed to corresponding request data', () => {
                expect(next.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
    });
    describe('Test prev action', () => {
        const fakeApi = new FakeApi();
        const prev = new NextPrevAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.PREV_TRACK,
            'PREV'
        );
        describe('Test onKeypressUp()', () => {
            it('should set keyPressed to corresponding request data', () => {
                expect(prev.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
    });
    describe('Test play-pause action', () => {
        const fakeApi = new FakeApi();
        const playPause = new PlayPauseAction(
            (<unknown>fakeApi) as YTMD,
            ActionTypes.PLAY_PAUSE
        );
        describe('Test onKeypressUp()', () => {
            it('should not throw any exceptions', () => {
                const playKeyUp = fakeKeyUpEvent;
                expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
                playKeyUp.payload.settings = {action: "TOGGLE"};
                expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
                playKeyUp.payload.settings.action = 'PLAY';
                expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
                playKeyUp.payload.settings.action = 'PAUSE';
                expect(playPause.onKeypressUp(fakeKeyUpEvent)).to.not.throw;
            });
        });
        describe('Test handlePlayerData()', () => {
            it('should change title', () => {
                playPause.handlePlayerData(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{player: {seekbarCurrentPosition: 90}});
                expect(fakeApi.title).to.be.equals('01:30');
            });
            it('should change state to OFF', () => {
                playPause.handlePlayerData(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{
                    player: {
                        seekbarCurrentPosition: 90,
                        isPaused: false,
                    },
                });
                expect(fakeApi.state).to.be.equals(StateType.OFF);
            });
            it('should change state to ON', () => {
                playPause.handlePlayerData(fakeWillAppearEvent, <
                    TrackAndPlayerInterface
                    >{
                    player: {
                        seekbarCurrentPosition: 90,
                        isPaused: true,
                    },
                });
                expect(fakeApi.state).to.be.equals(StateType.ON);
            });
            it('should set alert to 1', () => {
                playPause.handlePlayerData(
                    fakeWillAppearEvent,
                    <TrackAndPlayerInterface>{}
                );
                expect(fakeApi.alert).to.be.equals(1);
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
