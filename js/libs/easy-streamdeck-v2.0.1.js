(function () {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {exports: {}};
                e[i][0].call(p.exports, function (r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }

        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }

    return r
})()({
    1: [function (require, module, exports) {
        const Streamdeck = require("./src/");
        if (typeof window === "object" && typeof document === "object") {
            window.streamdeck = new Streamdeck;
            window.connectSocket = window.streamdeck.start.bind(window.streamdeck)
        } else {
            module.exports = Streamdeck
        }
    }, {"./src/": 12}],
    2: [function (require, module, exports) {
        const util = require("../common/utils.js");

        function validateTarget(target) {
            target = target == null ? 0 : target;
            if (String(target) === target) {
                target = target.toLowerCase()
            }
            switch (target) {
                case 0:
                case"both":
                    return 0;
                case 1:
                case"hardware":
                    return 1;
                case 2:
                case"software":
                    return 2;
                default:
                    throw new TypeError("invalid target argument")
            }
        }

        function contextWrapper(streamdeck) {
            class Context {
                constructor(action, id) {
                    this.action = action;
                    this.id = id
                }

                send(data) {
                    streamdeck.send({
                        event: "sendToPropertyInspector",
                        context: this.id,
                        action: this.action,
                        payload: data
                    })
                }

                setTitle(title, target) {
                    if (title != null && !util.isString(title)) {
                        throw new TypeError("invalid title argument")
                    }
                    streamdeck.send({
                        event: "setTitle",
                        context: this.id,
                        payload: {title: title == null ? null : title, target: validateTarget(target)}
                    })
                }

                setImage(image, target) {
                    streamdeck.send({
                        event: "setImage",
                        context: this.id,
                        payload: {image: image == null ? null : image, target: validateTarget(target)}
                    })
                }

                imageToDataUrl = function (url) {
                    return new Promise((resolve, reject) => {
                        let image = new Image;
                        image.onload = function () {
                            let canvas = document.createElement("canvas");
                            canvas.width = image.naturalWidth;
                            canvas.height = image.naturalHeight;
                            let ctx = canvas.getContext("2d");
                            ctx.drawImage(image, 0, 0);
                            image.onload = null;
                            image.onerror = null;
                            image = null;
                            resolve(canvas.toDataURL("image/png"))
                        };
                        image.onerror = function () {
                            image.onload = null;
                            image.onerror = null;
                            image = null;
                            reject(new Error("image failed to load"))
                        };
                        image.src = url
                    })
                }

                setImageFromUrl(url, target) {
                    if (!util.isString(url, {notEmpty: true})) {
                        throw new TypeError("invalid url")
                    }
                    target = validateTarget(target);
                    let self = this;
                    this.imageToDataUrl(url).then(res => self.setImage(res, target), () => {
                    }).catch(() => {
                    })
                }

                setState(state) {
                    if (!util.isNumber(state, {while: true, min: 0})) {
                        throw new TypeError("invalid state argument")
                    }
                    streamdeck.send({event: "setState", context: this.id, payload: {state: state}})
                }

                setSettings(settings) {
                    streamdeck.send({event: "setSettings", context: this.id, payload: settings})
                }

                showAlert() {
                    streamdeck.send({event: "showAlert", context: this.id})
                }

                showOk() {
                    streamdeck.send({event: "showAlert", context: this.id})
                }
            }

            return Context
        }

        module.exports = contextWrapper
    }, {"../common/boilers.js": 5, "../common/utils.js": 9}],
    3: [function (require, module, exports) {
        const util = require("../common/utils.js");
        const irnClient = require("../common/irn-client.js");
        const onmessage = require("./onmessage.js");
        const context = require("./context.js");

        function background(streamdeck, deviceList) {
            const contextList = {};
            const irn = irnClient(streamdeck);
            Object.defineProperties(streamdeck, {
                onMessage: {value: onmessage.call(streamdeck, deviceList, contextList)},
                contexts: {
                    enumerable: true, get: function () {
                        return Object.assign({}, contextList)
                    }
                },
                switchToProfile: {
                    enumerable: true, value: function switchToProfile(profile, device) {
                        if (!util.isString(profile)) {
                            throw new Error("invalid profile argument")
                        }
                        this.send({
                            event: "switchToProfile",
                            context: this.id,
                            device: device,
                            payload: {profile: profile}
                        })
                    }
                },
                Context: {enumerable: true, value: context(streamdeck)}
            });
            Object.defineProperties(streamdeck.Context, {
                invoke: {
                    enumerable: true,
                    value: function invoke(method, ...args) {
                        let res = irn.invoke(method, ...args);
                        this.send(res.result);
                        return res.promise
                    }
                }, notify: {
                    enumerable: true, value: function notify(event, ...args) {
                        this.send(irn.notify(event, ...args))
                    }
                }
            });
            irn.register("$getTitle", function () {
                return this.title
            });
            irn.register("$setTitle", function (title, target) {
                this.setTitle(title, target);
                return title
            });
            irn.register("$getImage", function () {
                throw new Error("not supported")
            });
            irn.register("$setImage", function (image, target) {
                this.setImage(image, target)
            });
            irn.register("$setImageFromUrl", function (url, target) {
                this.setImageFromUrl(url, target)
            });
            irn.register("$getState", function () {
                return this.state
            });
            irn.register("$setState", function (state) {
                this.setState(state);
                this.state = state;
                return state
            });
            irn.register("$getSettings", function () {
                return this.settings
            });
            irn.register("$setSettings", function (settings) {
                this.setSettings(settings);
                this.settings = settings;
                return settings
            });
            irn.register(`$showAlert`, function () {
                this.showAlert()
            });
            irn.register(`$showOk`, function () {
                this.showOk()
            })
        }

        module.exports = background
    }, {"../common/irn-client.js": 8, "../common/utils.js": 9, "./context.js": 2, "./onmessage.js": 4}],
    4: [function (require, module, exports) {
        const util = require("../common/utils.js");

        function onMessageWrapper(deviceList, contextList) {
            let streamdeck = this;
            return function onmessage(evt) {
                let msg = evt.data;
                if (msg == null || !util.isString(msg, {match: /^\{[\s\S]+\}$/})) {
                    return this.emit("websocket:message", evt.data)
                }
                try {
                    msg = JSON.parse(msg)
                } catch (ignore) {
                    return this.emit("websocket:message", evt.data)
                }
                let eventName, info;
                switch (msg.event) {
                    case"applicationDidLaunch":
                    case"applicationDidTerminate":
                        if (msg.payload == null || !util.isString(msg.payload.application, {notEmpty: true})) {
                            return this.emit("websocket:message", evt.data)
                        }
                        eventName = msg.event === "applicationDidLaunch" ? "launch" : "terminate";
                        this.emit(`application:${eventName}`, msg.payload.application);
                        this.emit(`application`, {event: eventName, application: msg.payload.application});
                        return;
                    case"deviceDidConnect":
                    case"deviceDidDisconnect":
                        if (!util.isString(msg.device, {notEmpty: true}) || msg.deviceInfo.size == null || msg.deviceInfo.size.columns == null || msg.deviceInfo.size.rows == null || !util.isNumber(msg.deviceInfo.type, {
                            whole: true,
                            min: 0
                        }) || !util.isNumber(msg.deviceInfo.size.columns, {
                            whole: true,
                            min: 0
                        }) || !util.isNumber(msg.deviceInfo.size.rows, {whole: true, min: 0})) {
                            return this.emit("websocket:message", evt.data)
                        }
                        info = {
                            id: msg.device,
                            type: msg.deviceInfo.type,
                            columns: msg.deviceInfo.size.rows,
                            rows: msg.deviceInfo.size.rows
                        };
                        if (msg.event === "deviceDidConnect") {
                            deviceList[info.id] = Object.assign({}, info);
                            eventName = "connect"
                        } else {
                            delete deviceList[info.id];
                            eventName = "disconnect"
                        }
                        this.emit(`device:${eventName}`, info);
                        this.emit("device", {event: eventName, device: info});
                        return;
                    case"keyUp":
                    case"keyDown":
                    case"willAppear":
                    case"willDisappear":
                    case"titleParametersDidChange":
                    case"sendToPlugin":
                        if (!util.isString(msg.context, {match: /^[A-F\d]{32}$/}) || !util.isString(msg.action, {match: /^[^\\\/;%@:]+$/}) || msg.payload == null) {
                            return this.emit("websocket:message", evt.data)
                        }
                        break;
                    default:
                        return this.emit("websocket:message", evt.data)
                }
                let device;
                if (deviceList[msg.device] != null) {
                    device = Object.assign({}, deviceList[msg.device])
                } else {
                    device = {id: msg.device}
                }
                let context;
                if (contextList[msg.context] != null) {
                    context = contextList[msg.context]
                } else {
                    context = new streamdeck.Context(msg.action, msg.context)
                }
                context.action = msg.action;
                if (msg.event === "sendToPlugin") {
                    return this.emit("message", msg.payload, {self: context})
                }
                let params = msg.payload.titleParameters;
                if (msg.payload.settings == null || msg.payload.coordinates == null || !util.isNumber(msg.payload.coordinates.row, {
                    whole: true,
                    min: 0
                }) || !util.isNumber(msg.payload.coordinates.column, {
                    whole: true,
                    min: 0
                }) || msg.payload.state != null && !util.isNumber(msg.payload.state, {
                    whole: true,
                    min: 0
                }) || msg.payload.isInMultiAction != null && !util.isBoolean(msg.payload.isInMultiAction) || msg.event === "titleParametersDidChange" && (!util.isString(msg.payload.title) || params == null || !util.isString(params.fontFamily) || !util.isNumber(params.fontSize, {
                    whole: true,
                    min: 6
                }) || !util.isString(params.fontStyle) || !util.isBoolean(params.fontUnderline) || !util.isBoolean(params.showTitle) || !util.isString(params.titleAlignment, {match: /^(?:top|middle|bottom)$/}) || !util.isString(params.titleColor, {match: /^#(?:[a-f\d]{1,8})$/}))) {
                    return this.emit("websocket:message", evt.data)
                }
                context.row = msg.payload.coordinates.row;
                context.column = msg.payload.coordinates.column;
                context.device = device;
                context.settings = msg.payload.settings;
                if (msg.payload.isInMultiAction != null) {
                    context.isInMultiAction = msg.payload.isInMultiAction
                }
                if (msg.payload.state != null) {
                    context.state = msg.payload.state
                }
                switch (msg.event) {
                    case 'didReceiveSettings':
                        console.log(this);
                        return;
                    case"keyUp":
                    case"keyDown":
                        eventName = msg.event === "keyUp" ? "up" : "down";
                        this.emit(`keypress:${eventName}`, null, {self: context});
                        this.emit("keypress", {event: eventName}, {self: context});
                        return;
                    case"willAppear":
                    case"willDisappear":
                        if (msg.event === "willAppear") {
                            contextList[context.id] = context;
                            eventName = "appear"
                        } else {
                            delete contextList[context.id];
                            eventName = "disappear"
                        }
                        this.emit(`context:${eventName}`, null, {self: context});
                        this.emit(`context`, {event: eventName}, {self: context});
                        return;
                    case"titleParametersDidChange":
                        info = context.title;
                        context.title = {
                            text: msg.payload.title,
                            font: params.fontFamily,
                            style: params.fontStyle,
                            underline: params.fontUnderline,
                            shown: params.showTitle,
                            alignment: params.titleAlignment,
                            color: params.titleColor
                        };
                        this.emit("context:titlechange", info, {self: context});
                        this.emit("context", {event: "titlechange", previousTitle: info}, {self: context});
                        return
                }
            }
        }

        module.exports = onMessageWrapper
    }, {"../common/utils.js": 9}],
    5: [function (require, module, exports) {
        if (typeof WebSocket !== "function") {
            exports.WebSocket = require("ws")
        } else {
            exports.WebSocket = WebSocket
        }
    }, {"image-data-uri": undefined, ws: undefined}],
    6: [function (require, module, exports) {
        const Emitter = require("./emitter.js");
        const {WebSocket: WebSocket} = require("./boilers.js");
        const $websock = Symbol("ws connection");
        const $readyState = Symbol("ws readyState");
        const $spooledMessages = Symbol("ws spooled messages");
        const $reconnectTimeout = Symbol("ws reconnect timeout");
        const $reconnectDelay = Symbol("ws reconnect delay");
        const $addressKey = Symbol("ws address key");
        let onConnect = false;

        function cleanup(self) {
            if (self[$websock] != null) {
                if (self[$websock].readyState < 2) {
                    self[$websock].close()
                }
                self[$websock].onopen = null;
                self[$websock].onmessage = null;
                self[$websock].onclose = null;
                self[$websock].onerror = null;
                self[$websock] = null;
                self[$readyState] = 0
            }
            if (self[$reconnectTimeout]) {
                clearTimeout(self[$reconnectTimeout])
            }
        }

        function reconnect(self) {
            self[$readyState] = 1;
            self[$reconnectTimeout] = setTimeout(self.connect.bind(self), self[$reconnectDelay]);
            self[$reconnectDelay] *= 1.5;
            if (self[$reconnectDelay] > 3e4) {
                self[$reconnectDelay] = 3e4
            }
        }

        class Connection extends Emitter {
            constructor() {
                super();
                Object.defineProperty(this, $websock, {writable: true, value: null});
                Object.defineProperty(this, $readyState, {writable: true, value: 0});
                Object.defineProperty(this, $reconnectDelay, {writable: true, value: 1e3});
                Object.defineProperty(this, $spooledMessages, {writable: true, value: []})
            }

            onOpen() {
                if (this[$reconnectTimeout]) {
                    clearTimeout(this[$reconnectTimeout]);
                    this[$reconnectTimeout] = null;
                    this[$reconnectDelay] = 1e3
                }
                this[$readyState] = 2;
                onConnect = true;
                this.emit("websocket:connect");
                onConnect = false;
                if (this[$spooledMessages].length) {
                    this[$spooledMessages].forEach(msg => this[$websock].send(msg));
                    this[$spooledMessages] = []
                }
                this[$readyState] = 3;
                this.emit("websocket:ready")
            }

            onMessage(evt) {
                this.emit("websocket:message", evt.data)
            }

            onClose(evt) {
                let reason;
                switch (evt.code) {
                    case 1e3:
                        reason = "Normal Closure. The purpose for which the connection was established has been fulfilled.";
                        break;
                    case 1001:
                        reason = 'Going Away. An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
                        break;
                    case 1002:
                        reason = "Protocol error. An endpoint is terminating the connection due to a protocol error";
                        break;
                    case 1003:
                        reason = "Unsupported Data. An endpoint received a type of data it doesn't support.";
                        break;
                    case 1004:
                        reason = "--Reserved--. The specific meaning might be defined in the future.";
                        break;
                    case 1005:
                        reason = "No Status. No status code was actually present.";
                        break;
                    case 1006:
                        reason = "Abnormal Closure. The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
                        break;
                    case 1007:
                        reason = "Invalid frame payload data. The connection was closed, because the received data was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629]).";
                        break;
                    case 1008:
                        reason = 'Policy Violation. The connection was closed, because current message data "violates its policy". This reason is given either if there is no other suitable reason, or if there is a need to hide specific details about the policy.';
                        break;
                    case 1009:
                        reason = "Message Too Big. Connection closed because the message is too big for it to process.";
                        break;
                    case 1010:
                        reason = "Mandatory Ext. Connection is terminated the connection because the server didn't negotiate one or more extensions in the WebSocket handshake. Mandatory extensions were: " + evt.reason;
                        break;
                    case 1011:
                        reason = "Internl Server Error. Connection closed because it encountered an unexpected condition that prevented it from fulfilling the request.";
                        break;
                    case 1015:
                        reason = "TLS Handshake. The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
                        break;
                    default:
                        reason = "Unknown reason";
                        break
                }
                cleanup(this);
                this.emit(`websocket:close`, {code: evt.code, reason: reason});
                reconnect(this)
            }

            onError() {
                cleanup(this);
                this.emit("websocket:error");
                reconnect(this)
            }

            connect(address) {
                if (this[$websock]) {
                    return this
                }
                if (address != null) {
                    if (this[$addressKey] == null) {
                        Object.defineProperty(this, $addressKey, {value: address})
                    } else {
                        this[$addressKey] = address
                    }
                }
                this[$readyState] = 1;
                this[$websock] = new WebSocket(this[$addressKey]);
                this[$websock].onopen = this.onOpen.bind(this);
                this[$websock].onmessage = this.onMessage.bind(this);
                this[$websock].onerror = this.onError.bind(this);
                this[$websock].onclose = this.onClose.bind(this);
                return this
            }

            send(data) {
                data = JSON.stringify(data);
                if (onConnect === true || this[$readyState] === 3 && !this[$spooledMessages].length) {
                    this[$websock].send(data)
                } else {
                    this[$spooledMessages].push(data)
                }
                return this
            }
        }

        module.exports = Connection
    }, {"./boilers.js": 5, "./emitter.js": 7}],
    7: [function (require, module, exports) {
        const util = require("./utils.js");
        const $eventListenersKey = Symbol("event listeners");

        class Emitter {
            constructor() {
                Object.defineProperty(this, $eventListenersKey, {value: {}})
            }

            on(event, handler, isOnce) {
                if (!util.isString(event, {notEmpty: true})) {
                    throw new TypeError("invalid name argument")
                }
                if (!util.isCallable(handler)) {
                    throw new TypeError("invalid handler argument")
                }
                if (isOnce != null && !util.isBoolean(isOnce)) {
                    throw new TypeError("invalid isOnce argument")
                }
                if (this[$eventListenersKey][event] == null) {
                    this[$eventListenersKey][event] = []
                }
                this[$eventListenersKey][event].push({handler: handler, once: isOnce == null ? false : isOnce});
                return this
            }

            off(event, handler, isOnce) {
                if (!util.isString(event, {notEmpty: true})) {
                    throw new TypeError("invalid name argument")
                }
                if (!util.isCallable(handler)) {
                    throw new TypeError("invalid handler argument")
                }
                if (isOnce != null && !util.isBoolean(isOnce)) {
                    throw new TypeError("invalid isOneTimeHandler argument")
                }
                let listeners = self[$eventListenersKey][event];
                if (listeners == null || !listeners.length) {
                    return
                }
                let idx = listeners.length;
                do {
                    idx -= 1;
                    let listener = listeners[idx];
                    if (listener.handler === handler && listener.once === isOnce) {
                        listeners.splice(idx, 1);
                        break
                    }
                } while (idx > 0);
                return this
            }

            once(event, handler) {
                return this.on(event, handler, true)
            }

            nonce(event, handler) {
                return this.off(event, handler, true)
            }

            emit(event, data, options) {
                if (!util.isString(event, {notEmpty: true})) {
                    throw new TypeError("invalid event name")
                }
                if (this[$eventListenersKey] == null || this[$eventListenersKey][event] == null || this[$eventListenersKey][event].length === 0) {
                    return this
                }
                options = options == null ? {} : options;
                let self = this, listeners = this[$eventListenersKey][event], stopped = false,
                    evt = Object.create(null), idx = 0;
                Object.defineProperties(evt, {
                    stop: {
                        enumerable: true, value: function stop() {
                            stopped = true
                        }
                    }, data: {enumerable: true, value: data}
                });
                while (idx < listeners.length) {
                    let listener = listeners[idx];
                    if (listener.once) {
                        listeners.splice(idx, 1)
                    } else {
                        idx += 1
                    }
                    listener.handler.call(options.self != null ? options.self : self, evt);
                    if (stopped && options.stoppable !== false) {
                        break
                    }
                }
                return this
            }
        }

        module.exports = Emitter
    }, {"./utils.js": 9}],
    8: [function (require, module, exports) {
        const util = require("./utils.js");
        const idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const reserved = "0".repeat(32);

        function format(id, type, meta, data) {
            return {irn: {id: id, type: type, meta: meta, data: data == null ? null : data}}
        }

        function irnClient(streamdeck) {
            let $pending = {}, $methods = {};
            const genId = function () {
                let result = "";
                do {
                    let i = 32;
                    while (i--) {
                        result += idChars[Math.floor(Math.random() * 62)]
                    }
                } while (result !== reserved && $pending[result] != null);
                return result
            };
            const registerMethod = function register(method, handler) {
                if (!util.isString(method, {notEmpty: true})) {
                    throw new TypeError("invalid method argument")
                }
                if (!util.isCallable(handler)) {
                    throw new TypeError("invalid handler argument")
                }
                if (util.isKey($methods, method) && $methods[method] != null) {
                    throw new TypeError("method already registered")
                }
                $methods[method] = handler
            };
            Object.defineProperties(streamdeck, {
                register: {
                    enumerable: true, value: function register(...args) {
                        if (util.isString(args[0], {match: /^\$/})) {
                            throw new TypeError("invalid method argument")
                        }
                        registerMethod(...args)
                    }
                }, unregister: {
                    enumerable: true, value: function unregister(method, handler) {
                        if (!util.isString(method, {notEmpty: true, matches: /^[^$]/})) {
                            throw new TypeError("invalid method argument")
                        }
                        if ($methods[method] == null) {
                            return
                        }
                        if (!util.isCallable(handler)) {
                            throw new TypeError("invalid handler argument")
                        }
                        if ($methods[method] !== handler) {
                            throw new TypeError("handler does not match registered handler")
                        }
                        delete $methods[method]
                    }
                }
            });
            streamdeck.on("message", function (evt) {
                let data = evt.data, info;
                if (data == null || data.irn == null || !util.isString(data.irn.id, {match: /^(?:[a-z\d]{32})/i}) || !util.isString(data.irn.type, {match: /^(?:invoke|response|notify)$/}) || !util.isString(data.irn.meta, {notEmpty: true}) || !util.isKey(data.irn, "data")) {
                    return
                }
                data = evt.data.irn;
                const sendProp = streamdeck.layer === "plugin" ? "send" : "sendToPlugin";
                switch (data.type) {
                    case"notify":
                        if (data.id !== reserved) {
                            return
                        }
                        streamdeck.emit(`notify:${data.meta}`, data.data);
                        streamdeck.emit(`notify`, {event: data.meta, data: data.data});
                        break;
                    case"response":
                        if ($pending[data.id] == null) {
                            return
                        }
                        info = $pending[data.id];
                        delete $pending[data.id];
                        clearTimeout(info.timeout);
                        if (data.meta === "ok") {
                            info.resolve(data.data)
                        } else if (data.meta === "error") {
                            info.reject(new Error(data.data))
                        } else {
                            info.reject(new Error("invalid state received"))
                        }
                        break;
                    case"invoke":
                        if ($methods[data.meta] == null) {
                            this[sendProp](format(data.id, "response", "error", "method not registered"))
                        } else if (!util.isArray(data.data)) {
                            this[sendProp](format(data.id, "response", "error", "invalid arguments"))
                        } else {
                            try {
                                info = $methods[data.meta].call(this, ...data.data);
                                if (!(info instanceof Promise)) {
                                    info = Promise.resolve(info)
                                }
                                info.then(res => {
                                    this[sendProp](format(data.id, "response", "ok", res))
                                }, err => {
                                    this[sendProp](format(data.id, "response", "error", err instanceof Error ? err.message : String(err) === err ? err : "unknown error"))
                                }).catch(err => {
                                    this[sendProp](format(data.id, "response", "error", err instanceof Error ? err.message : String(err) === err ? err : "unknown error"))
                                })
                            } catch (err) {
                                this[sendProp](format(data.id, "response", "error", err.message))
                            }
                        }
                        break
                }
                evt.stop()
            });
            return {
                invoke: function (method, ...args) {
                    let id = genId();
                    return {
                        promise: new Promise((resolve, reject) => {
                            $pending[id] = {
                                resolve: resolve, reject: reject, timeout: setTimeout(function () {
                                    delete $pending[id];
                                    reject(new Error("invoke timed out"))
                                }, 3e4)
                            }
                        }), result: format(id, "invoke", method, args)
                    }
                }, notify: function (event, data) {
                    return format(reserved, "notify", event, data)
                }, register: registerMethod
            }
        }

        module.exports = irnClient
    }, {"./utils.js": 9}],
    9: [function (require, module, exports) {
        "use strict";
        const hasOwnProperty = Object.prototype.hasOwnProperty;

        function isBoolean(subject) {
            return subject === true || subject === false
        }

        function isNumber(subject, opts = {}) {
            if (typeof subject !== "number" || Number(subject) !== subject) {
                return false
            }
            if (!opts.allowNaN && isNaN(subject)) {
                return false
            }
            if (!opts.allowInfinity && !isFinite(subject)) {
                return false
            }
            if (opts.min && subject < opts.min) {
                return false
            }
            if (opts.max && subject > opts.max) {
                return false
            }
            if (opts.whole && subject % 1 > 0) {
                return false
            }
            return true
        }

        function isString(subject, opts = {}) {
            if (typeof subject !== "string" || String(subject) !== subject) {
                return false
            }
            if (opts.notEmpty && subject === "") {
                return false
            }
            if (opts.match && !opts.match.test(subject)) {
                return false
            }
            return true
        }

        function isBase64(subject, options = {}) {
            if (!isString(subject, {notEmpty: true})) {
                return false
            }
            let char62 = options["62"] != null ? options["62"] : "+",
                char63 = options["63"] != null ? options["63"] : "/";
            if (!isString(char62, {notEmpty: true, matches: /^[+._~-]$/i})) {
                throw new TypeError("specified 62nd character invalid")
            }
            if (!isString(char63, {notEmpty: true, matches: /^[^\/_,:-]$/i})) {
                throw new TypeError("specified 63rd character invalid")
            }
            switch (char62 + char63) {
                case"+/":
                case"+,":
                case"._":
                case".-":
                case"_:":
                case"_-":
                case"~-":
                case"-_":
                    break;
                default:
                    throw new TypeError("invalid 62nd and 63rd character pair")
            }
            char62 = "\\" + char62;
            char63 = "\\" + char63;
            let match = new RegExp(`^(?:[a-z\\d${char62}${char63}]{4})*(?:[a-z\\d${char62}${char63}]{2}(?:[a-z\\d${char62}${char63}]|=)=)?$`, "i");
            return match.test(subject)
        }

        function isArray(subject) {
            return Array.isArray(subject) && subject instanceof Array
        }

        function isKey(subject, key) {
            return hasOwnProperty.call(subject, key)
        }

        const isCallable = function () {
            let fnToStr = Function.prototype.toString, fnClass = "[object Function]", toStr = Object.prototype.toString,
                genClass = "[object GeneratorFunction]",
                hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol",
                constructorRegex = /^\s*class\b/;

            function isES6ClassFn(value) {
                try {
                    let fnStr = fnToStr.call(value);
                    return constructorRegex.test(fnStr)
                } catch (e) {
                    return false
                }
            }

            function tryFunctionObject(value) {
                try {
                    if (isES6ClassFn(value)) {
                        return false
                    }
                    fnToStr.call(value);
                    return true
                } catch (e) {
                    return false
                }
            }

            return function isCallable(value) {
                if (!value) {
                    return false
                }
                if (typeof value !== "function" && typeof value !== "object") {
                    return false
                }
                if (typeof value === "function" && !value.prototype) {
                    return true
                }
                if (hasToStringTag) {
                    return tryFunctionObject(value)
                }
                if (isES6ClassFn(value)) {
                    return false
                }
                let strClass = toStr.call(value);
                return strClass === fnClass || strClass === genClass
            }
        }();
        const deepFreeze = function () {
            function freeze(obj, freezing) {
                Object.keys(obj).forEach(key => {
                    let desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (!isKey(desc, "value")) {
                        return
                    }
                    let value = obj[key];
                    if (value != null && !Object.isFrozen(value) && value instanceof Object && freezing.findIndex(item => item === value) === -1) {
                        freezing.push(value);
                        obj[key] = freeze(value, freezing);
                        freezing.pop(value)
                    }
                });
                return Object.freeze(obj)
            }

            return function deepFreeze(subject) {
                return freeze(subject, [subject])
            }
        }();
        module.exports = Object.freeze({
            isBoolean: isBoolean,
            isNumber: isNumber,
            isString: isString,
            isBase64: isBase64,
            isArray: isArray,
            isKey: isKey,
            isCallable: isCallable,
            deepFreeze: deepFreeze
        })
    }, {}],
    10: [function (require, module, exports) {
        const onmessage = require("./onmessage.js");
        const irnClient = require("../common/irn-client.js");

        function foreground(streamdeck, selfinfo) {
            let irn = irnClient(streamdeck);
            Object.defineProperties(streamdeck, {
                onMessage: {enumerable: true, value: onmessage},
                contextId: {enumerable: true, value: selfinfo.context},
                actionId: {enumerable: true, value: selfinfo.action},
                sendToPlugin: {
                    enumerable: true, value: function sendToPlugin(data) {
                        streamdeck.send({
                            event: "sendToPlugin",
                            action: streamdeck.actionId,
                            context: streamdeck.id,
                            payload: data
                        })
                    }
                },
                invoke: {
                    enumerable: true, value: function invoke(method, ...args) {
                        let res = irn.invoke(method, ...args);
                        this.sendToPlugin(res.result);
                        return res.promise
                    }
                },
                notify: {
                    enumerable: true, value: function notify(event, ...args) {
                        this.sendToPlugin(irn.notify(event, ...args))
                    }
                },
                getTitle: {
                    enumerable: true, value: function getTitle() {
                        return this.invoke("$getTitle")
                    }
                },
                setTitle: {
                    enumerable: true, value: function setTitle(title, target) {
                        return this.invoke("$setTitle", title, target)
                    }
                },
                getImage: {
                    enumerable: true, value: function getImage() {
                        return Promise.reject(new Error("not supported"))
                    }
                },
                setImage: {
                    enumerable: true, value: function setImage(image, target) {
                        return this.invoke("$setImage", image, target)
                    }
                },
                setImageFromUrl: {
                    enumerable: true, value: function setImageFromUrl(url, target) {
                        return this.invoke("$setImageToUrl", url, target)
                    }
                },
                getState: {
                    enumerable: true, value: function getState() {
                        return this.invoke("$getState")
                    }
                },
                setState: {
                    enumerable: true, value: function setState(state) {
                        return this.invoke("$setState", state)
                    }
                },
                getSettings: {
                    enumerable: true, value: function getSettings() {
                        return this.invoke("$getSettings")
                    }
                },
                setSettings: {
                    enumerable: true, value: function setSettings(settings) {
                        return this.invoke("$setSettings", settings)
                    }
                },
                showAlert: {
                    enumerable: true, value: function showAlert() {
                        return this.invoke("$showAlert")
                    }
                },
                showOk: {
                    enumerable: true, value: function showOk() {
                        return this.invoke("$showOk")
                    }
                }
            })
        }

        module.exports = foreground
    }, {"../common/irn-client.js": 8, "./onmessage.js": 11}],
    11: [function (require, module, exports) {
        const util = require("../common/utils.js");

        function onmessage(evt) {
            let msg = evt.data;
            if (msg == null || !util.isString(msg, {match: /^\{[\s\S]+\}$/})) {
                return this.emit("websocket:message", evt.data)
            }
            try {
                msg = JSON.parse(msg)
            } catch (ignore) {
                return this.emit("websocket:message", evt.data)
            }
            if (!util.isString(msg.event, {match: /^sendToPropertyInspector$/})) {
                return this.emit("websocket:message", evt.data)
            }
            this.emit("message", msg.payload)
        }

        module.exports = onmessage
    }, {"../common/utils.js": 9}],
    12: [function (require, module, exports) {
        const util = require("./common/utils.js");
        const Connection = require("./common/connection.js");
        const background = require("./background");
        const foreground = require("./foreground");
        const $ready = Symbol("ready");
        const $port = Symbol("port");
        const $id = Symbol("instance identifier");
        const $register = Symbol("registerEvent");
        const $layer = Symbol("layer");
        const $host = Symbol("host");
        const $deviceList = Symbol("device list");

        class StreamDeck extends Connection {
            on(event, handler, once) {
                if (event === "ready") {
                    if (this.ready) {
                        handler.call(this);
                        return
                    }
                    once = true
                }
                return super.on(event, handler, once)
            }

            off(event, handler, once) {
                if (event === "ready") {
                    once = true
                }
                return super.off(event, handler, once)
            }

            constructor() {
                super();
                Object.defineProperty(this, $ready, {writable: true, value: false});
                Object.defineProperties(this, {
                    ready: {
                        enumerable: true, get: function () {
                            return this[$ready]
                        }
                    }, port: {
                        enumerable: true, get: function () {
                            return this[$id]
                        }
                    }, id: {
                        enumerable: true, get: function () {
                            return this[$id]
                        }
                    }, layer: {
                        enumerable: true, get: function () {
                            return this[$layer]
                        }
                    }, host: {
                        enumerable: true, get: function () {
                            return Object.assign({}, this[$host])
                        }
                    }, devices: {
                        enumerable: true, get: function () {
                            return JSON.parse(JSON.stringify(this[$deviceList]))
                        }
                    }
                })
            }

            openUrl(url) {
                if (!util.isString(url, {notEmpty: true})) {
                    throw new TypeError("invalid url")
                }
                this.send({event: "openUrl", payload: {url: url}})
            }

            start(port, id, register, hostinfo, selfinfo) {
                console.log("start called");
                if (this[$ready] !== false) {
                    throw new Error("start() function already called")
                }
                let readyDesc = Object.getOwnPropertyDescriptor(this, $ready);
                readyDesc.value = true;
                readyDesc.writable = false;
                if (util.isString(port, {match: /^\d+$/i})) {
                    port = Number(port)
                }
                if (!util.isNumber(port, {whole: true, min: 0, max: 65535})) {
                    throw new TypeError("invalid port argument")
                }
                if (!util.isString(register, {match: /^register(?:Plugin|PropertyInspector)$/})) {
                    throw new TypeError("invalid registerEvent argument")
                }
                if (util.isString(hostinfo)) {
                    try {
                        hostinfo = JSON.parse(hostinfo)
                    } catch (e) {
                        throw new TypeError("invalid hostInfo argument")
                    }
                }
                if (hostinfo == null || !util.isKey(hostinfo, "application") || !util.isKey(hostinfo.application, "language") || !util.isString(hostinfo.application.language) || !util.isKey(hostinfo.application, "platform") || !util.isString(hostinfo.application.platform) || !util.isKey(hostinfo.application, "version") || !util.isString(hostinfo.application.version) || !util.isKey(hostinfo, "devices") || !util.isArray(hostinfo.devices)) {
                    throw new TypeError("invalid environment argument")
                }
                let deviceList = {};
                hostinfo.devices.forEach(device => {
                    if (device == null || !util.isString(device.id, {match: /^[A-F\d]{32}$/}) || device.size == null || !util.isNumber(device.size.rows, {
                        whole: true,
                        min: 1
                    }) || !util.isNumber(device.size.columns, {
                        whole: true,
                        min: 1
                    }) || device.type != null && !util.isNumber(device.type, {whole: true, min: 0})) {
                        throw new TypeError("invalid device list")
                    }
                    deviceList[device.id] = {
                        id: device.id,
                        rows: device.size.rows,
                        columns: device.size.columns,
                        type: device.type
                    }
                });
                if (register === "registerPropertyInspector") {
                    if (util.isString(selfinfo)) {
                        try {
                            selfinfo = JSON.parse(selfinfo)
                        } catch (e) {
                            throw new TypeError("invalid selfInfo argument")
                        }
                    }
                    if (selfinfo == null || !util.isString(selfinfo.context, {match: /^[A-F\d]{32}$/}) || !util.isString(selfinfo.action, {notEmpty: true})) {
                        throw new TypeError("invalid selfInfo argument")
                    }
                } else if (selfinfo != null) {
                    throw new TypeError("selfinfo specified for plugin")
                }
                Object.defineProperty(this, $port, {value: port});
                Object.defineProperty(this, $id, {value: id});
                Object.defineProperty(this, $register, {value: register});
                Object.defineProperty(this, $layer, {value: register === "registerPlugin" ? "plugin" : "propertyinspector"});
                Object.defineProperty(this, $host, {value: hostinfo.application});
                Object.defineProperty(this, $deviceList, {value: deviceList});
                if (this[$layer] === "plugin") {
                    background(this, deviceList)
                } else {
                    foreground(this, selfinfo)
                }
                let self = this;
                this.connect(`ws://localhost:${port}`);
                this.on("websocket:connect", function (evt) {
                    evt.stop();
                    self.send({event: register, uuid: id})
                });
                this.emit("ready")
            }
        }

        module.exports = StreamDeck
    }, {"./background": 3, "./common/connection.js": 6, "./common/utils.js": 9, "./foreground": 10}]
}, {}, [1]);
