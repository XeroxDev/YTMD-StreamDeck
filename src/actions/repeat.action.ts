import {KeyUpEvent, SDOnActionEvent, WillAppearEvent, WillDisappearEvent,} from 'streamdeck-typescript';
import {ActionTypes} from '../interfaces/enums';
import {YTMD} from '../ytmd';
import {DefaultAction} from './default.action';
import {RepeatMode, StateOutput} from "ytmdesktop-ts-companion";

export class RepeatAction extends DefaultAction<RepeatAction> {
    private icons = {
        NONE:
            'iVBORw0KGgoAAAANSUhEUgAAAJAAAABzCAMAAABASHumAAACdlBMVEWcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJz449hNAAAA0XRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT9AQUNERUZJSktMUFFSVldYWVtdXl9gYWJjZWhpamtsbW9wcXN0dXZ4eXt8fX5/gIGEhYaKi46QkZKTlZaXmJqbnJ2eoKKjpKapqqytr7KztLW2t7m6u7y9vr/AwcLDxMXGx8rLzM3Oz9HS09TV1tfY2tvc3d7f4OHi4+Tl5ufo6evs7u/x8vP09fb3+Pn6+/z9/gJ4abEAAAOuSURBVBgZzcHrWxN0GAbgZ2w5DIE4DAcpUSlWlqWBQVFWlBqCphYoImRBlJmomBWaFAYWnWeWtIpaYIBgqDkCI00Ogx3cnv8oQOKSy/dDX+L93Tf+X5bS7vDfx26HMQpaSHr3x8AQy3/mlK0LYIToz/2c0p8PE9gPBDjt2zzoi9kc5ozjGVD3xKUIZ4zVQVvON7zRYBV0ZTRytstrbdB0IMDZwmczoeiuPt7kk3ToKaRgfyrUVFIQrICa7ZSc3QwtD49Q4nkcSixfRSj5zgElOR5KfPW3QMnzHZRcq4iBkpJRSnxrrdDhqKKo/TEoSToaoqT5QShJbAlSUh8PJdm/UHK5BlqKTlMysAVaSq5Q0pdlg47EXZSE3GlQ4niboro0KEk46afk5TjoiHqgnZLBrdCyoY0Sz3poKRmg5PtlUBJbTsl4sw1KFtZS4quxQUnCF+MUBIvmQ0fU0nYKIt5caFnfRolrFbQUn6fk/Qwose+kxF8LLan7KOmrgJak5gAF3nwosaS3URDuSIeWp09TEPkoGVqKeyjZ44CWsiAFoRctUOJ4nZKuDdCSdGyUgpZc/MtqT7tnDmWu+YOSLxMsuC7vQ/dPc+iH1nFKhg/juqXNNMNY2TxM2ktTDK2xYUInjeFZgQk0SOO9AGiSg3EATfJXNUCjnMsBzVIPmuU30CzjoFl6QLMcBo3Skw2a5M9dAE1SEwvQIB8sAdBOY7Quw4RqmuLKozZMuLMpQiMMbbNiStbRU+45dMo9RsnVtzDNOu825xxKyb5ISXMcdCQ0DFPgyoKOtBpKfl0HJa9co8C/yQIdpb2UvJoIHc92UxBqjIcKy5JOCsKeVOhI/TRIQe+T0LG4lpIL26HDXkmJfy+UlF2k5N3F0PFcFyWf3Q8V1vvOUBC+sBI6FroCFPgKoqFi0SFKht+wQEV8FSVjTRbo2HmJkhN3Q8fGTkpa86HCurKbkv4i6EhxByjZEQsVaUcoOuSAiuRqSoInk6Gj/Col51ZYoWJLFyW/b4IKS+4ZSgZfgw5na4iSdxZAhbMhQknTcqhw7qbIswo6yscoGXrKChXF3ZQESqOhIq+DkpE66Ig6EaHElQAdq0cp+TEHSnZQ0lUILZUUBLZBTQEFe1KgJv08b3LcCUW7A5wt3HkHNC16j7MNPBMFVQ+5eKOBl6DtEW+EM3wHoW5+YZAzGtKhz7rPx2mu1TCB7eNxTop482CGTDcnhTfeCkOs+9pP9r5phzFe8Iz0H3Hgv/sHOW+Df+Nm+TcAAAAASUVORK5CYII=',
        ONE:
            'iVBORw0KGgoAAAANSUhEUgAAAJAAAACGCAMAAAAFF/MMAAACslBMVEUAAACcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJy29ObjAAAA5XRSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkrLC0vMDEyNDU2Nzg5Ojw9Pj9AQUJERkdISUpLTE1OT1BRUlNUVVZXWFpbXF1eYGJjZGVoaWtsbW5wcXJzdXZ3eHp7fH1+f4CBgoSFhoeIiouMjY6PkJGSk5SVl5iZmpucnZ6foKGio6SlpqeoqaqrrK2u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',
        ALL:
            'iVBORw0KGgoAAAANSUhEUgAAAJAAAACGCAMAAAAFF/MMAAACqVBMVEUAAACcnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJzszOJyAAAA4nRSTlMAAQIDBAYHCAkKCwwNDg8QERIUFRYXGBkaGxwdHh8gISIjJCUmJygpKywtMDEyNDU2Nzk6PD0+P0BBQkNERkdISUpLTE1OT1BRUlNVVldYWVpbXF1eYmNkZWZoaWtsbW5vcHFyc3R1dnd4enx9fn+AgYKEhYaHiIuMjo+QkZOUlZeYmZqbnJ2en6ChoqOkpaanqKmqq62ur7CxsrO0tba3uLm6u7y9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',
    };
    private events: { context: string, method: (state: StateOutput) => void }[] = [];
    private currentMode: RepeatMode = RepeatMode.NONE;


    constructor(private plugin: YTMD, actionName: ActionTypes) {
        super(plugin, actionName);
    }

    @SDOnActionEvent('willAppear')
    onContextAppear(event: WillAppearEvent<any>): void {
        let found = this.events.find(e => e.context === event.context);
        if (found) {
            return;
        }

        found = {
            context: event.context,
            method: (state: StateOutput) => {
                console.log("Repeat mode", state.player.queue?.repeatMode);
                if (state.player.queue?.repeatMode === undefined || state.player.queue.repeatMode === null || state.player.queue.repeatMode === this.currentMode) {
                    return;
                }

                this.currentMode = state.player.queue.repeatMode;

                let mode: "NONE" | "ONE" | "ALL" = "NONE";
                switch (this.currentMode) {
                    case RepeatMode.ALL:
                        mode = "ALL";
                        break;
                    case RepeatMode.ONE:
                        mode = "ONE";
                        break;
                    default:
                        mode = "NONE";
                        break;
                }


                this.plugin.setImage(
                    `data:image/png;base64,${this.icons[mode]}`,
                    event.context
                );
            }
        };

        this.events.push(found);

        this.socket.addStateListener(found.method);
    }

    @SDOnActionEvent('willDisappear')
    onContextDisappear(event: WillDisappearEvent<any>): void {
        const found = this.events.find(e => e.context === event.context);
        if (!found) {
            return;
        }

        this.socket.removeStateListener(found.method);
        this.events = this.events.filter(e => e.context !== event.context);
    }

    @SDOnActionEvent('keyUp')
    onKeypressUp(event: KeyUpEvent<any>): void {
        let mode: RepeatMode;
        switch (this.currentMode) {
            case RepeatMode.ALL:
                mode = RepeatMode.NONE;
                break;
            case RepeatMode.ONE:
                mode = RepeatMode.ALL;
                break;
            default:
                mode = RepeatMode.ONE;
                break;
        }
        console.log("Repeat mode", mode);
        this.rest.repeatMode(mode).catch(reason => {
            console.error(reason);
            this.plugin.showAlert(event.context)
        })
    }
}
