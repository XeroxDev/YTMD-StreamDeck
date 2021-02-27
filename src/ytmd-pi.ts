import {SDOnPiEvent, StreamDeckPropertyInspectorHandler} from 'streamdeck-typescript';
import {ActionTypes}                                     from './interfaces/enums';
import {PisAbstract}                                     from './pis/pis.abstract';
import {PlayPausePi}                                     from './pis/play-pause.pi';
import {VolumeChangePi}                                  from './pis/volume-change.pi';

export class YTMDPi extends StreamDeckPropertyInspectorHandler {
    private action: PisAbstract = new PisAbstract(this, '');

    constructor() {
        super();
    }

    @SDOnPiEvent('setupReady')
    private documentLoaded() {
        const _action: ActionTypes = this.actionInfo.action as ActionTypes;
        switch (_action) {
            case ActionTypes.PLAY_PAUSE:
                this.action = new PlayPausePi(this, this.actionInfo.context);
                break;
            case ActionTypes.VOLUME_UP:
                this.action = new VolumeChangePi(this, this.actionInfo.context, 'UP');
                break;
            case ActionTypes.VOLUME_DOWN:
                this.action = new VolumeChangePi(this, this.actionInfo.context, 'DOWN');
                break;
        }
    }

    @SDOnPiEvent('didReceiveGlobalSettings')
    private receivedGlobalSettings() {
        this.action.newGlobalSettingsReceived();
    }

    @SDOnPiEvent('didReceiveSettings')
    private receivedSettings() {
        this.action.newSettingsReceived();
    }
}

new YTMDPi();
