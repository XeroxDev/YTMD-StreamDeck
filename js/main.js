class Main {
    buttons;
    static MUSICDATA = new rxjs.BehaviorSubject(undefined);
    static PLAY_SETTINGS;

    constructor() {
        const playPause = new PlayPauseAction();
        const next = new NextAction();
        const prev = new PrevAction();
        const volumeDown = new VolChangeAction('DOWN', 10);
        const volumeUp = new VolChangeAction('UP', 10);
        const mute = new MuteAction();
        const like = new LikeAction();
        const dislike = new DislikeAction();

        this.buttons = [
            {
                name: 'play-pause',
                clazz: playPause
            },
            {
                name: 'next',
                clazz: next
            },
            {
                name: 'prev',
                clazz: prev
            },
            {
                name: 'volume-down',
                clazz: volumeDown
            },
            {
                name: 'volume-up',
                clazz: volumeUp
            },
            {
                name: 'mute',
                clazz: mute
            },
            {
                name: 'like',
                clazz: like
            },
            {
                name: 'dislike',
                clazz: dislike
            }
        ];

        setInterval(() => {
            Main.sendRequest('GET').then(value => {
                Main.MUSICDATA.next(value);
            })
        }, 500);
        this.initializeActions();
    }

    initializeActions() {
        const buttons = this.buttons;
        streamdeck.on('context:appear', function (event) {
            for (let action of buttons) {
                if (this.action === `fun.shiro.ytmdc.${action.name}`) {
                    action.clazz.context = this;
                    action.clazz.onContextAppear(event);
                    break;
                }
            }
        });
        streamdeck.on('context:disappear', function (event) {
            for (let action of buttons) {
                if (this.action === `fun.shiro.ytmdc.${action.name}`) {
                    action.clazz.context = this;
                    action.clazz.onContextDisappear(event);
                    break;
                }
            }
        });
        streamdeck.on('keypress:up', function (event) {
            for (let action of buttons) {
                if (this.action === `fun.shiro.ytmdc.${action.name}`) {
                    action.clazz.context = this;
                    action.clazz.onKeypressUp(event);
                    break;
                }
            }
        });
    }

    static async sendRequest(method, body) {
        if (!Main.PLAY_SETTINGS)
            return;
        const {hostData = 'localhost', portData = 9863, passwordData} = Main.PLAY_SETTINGS;
        return fetch(`http://${hostData}:${portData}/query`, {
            method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'pragma': 'no-cache',
                'cache-control': 'no-cache',
                'Authorization': `Bearer ${passwordData}`
            }
        }).then(response => response.json()).catch(reason => true);
    }
}

streamdeck.on('ready', function () {
    new Main();
});

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    streamdeck.start(inPort, inPluginUUID, inRegisterEvent, inInfo);
}
