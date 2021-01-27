function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    streamdeck.start(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo);
}
streamdeck.on('ready', function () {
    if (this.actionId !== 'fun.shiro.ytmdc.play-pause') {
        document.getElementById('mainSettings').remove();
        return;
    }

    function updateValue(newSettings) {
        streamdeck.setSettings(newSettings);
    }

    const host = document.getElementById('host'),
        port = document.getElementById('port'),
        password = document.getElementById('password'),
        save = document.getElementById('save');

    streamdeck.getSettings().then(res => {
        const {hostData, portData, passwordData} = res;
        host.value = hostData || 'localhost';
        port.value = portData || 9863;
        password.value = passwordData || '';

    }).catch(err => {
        console.error(err);
    });

    save.onclick = () => {
        const hostData = host.value;
        const portData = port.value;
        const passwordData = password.value;
        updateValue({hostData, portData, passwordData});
    }
});
