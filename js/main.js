class Main {
    buttons;
    static CONTEXT;
    static MUSICDATA = new rxjs.BehaviorSubject();

    constructor(context) {
        Main.CONTEXT = context;
        const playPause = new PlayPauseAction();
        const next = new NextAction();
        const prev = new PrevAction();
        const volumeDown = new VolDownAction();
        const volumeUp = new VolUpAction();
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
        const {hostData, portData, passwordData} = /*await Main.CONTEXT.getSettings();*/ {
            hostData: '192.168.178.42',
            portData: 9863,
            passwordData: ''
        }
        return fetch(`http://localhost:9863/query`, {
            method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'pragma': 'no-cache',
                'cache-control': 'no-cache'
            }
        }).then(response => response.json());
    }

    /*    static async checkConnection(hostData, portData, passwordData) {
            const response = await fetch(`http://${hostData}:${portData}/query`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.table(response);
            return !!response;
        }*/
}

streamdeck.on('ready', function () {
    new Main(this);
});
