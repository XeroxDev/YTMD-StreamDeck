import {CompanionConnector} from "ytmdesktop-ts-companion";
import {PluginData} from "../../shared/plugin-data";

let connector: CompanionConnector | undefined;

export const getCompanionConnector = () => {
    if (!connector) {
        connector = new CompanionConnector({
            appId: PluginData.APP_ID,
            appName: PluginData.APP_NAME,
            appVersion: PluginData.APP_VERSION,
            host: '127.0.0.1',
            port: 9863
        });
    }
    return connector;
};
