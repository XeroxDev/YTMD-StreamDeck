import IntlMessageFormat from 'intl-messageformat';
import {LocalizationInterface} from '../../interfaces/localization.interface';

export class PiI18n {
    private messages: LocalizationInterface['PI'] | undefined;

    public setMessages(messages: LocalizationInterface['PI']) {
        this.messages = messages;
    }

    public t(
        key: keyof LocalizationInterface['PI'],
        vars?: Record<string, unknown>,
        fallback = 'NOT TRANSLATED'
    ) {
        if (!this.messages) return fallback;
        const message = this.messages[key];
        if (!message) return fallback;
        try {
            const formatter = new IntlMessageFormat(message);
            return formatter.format(vars) as string;
        } catch (e) {
            return message;
        }
    }

    public apply(root: ParentNode = document) {
        const textNodes = root.querySelectorAll<HTMLElement>('[data-i18n]');
        textNodes.forEach((node) => {
            const key = node.dataset.i18n as keyof LocalizationInterface['PI'];
            const text = this.t(key);
            node.textContent = text;
        });

        const htmlNodes = root.querySelectorAll<HTMLElement>('[data-i18n-html]');
        htmlNodes.forEach((node) => {
            const key = node.dataset.i18nHtml as keyof LocalizationInterface['PI'];
            const html = this.t(key);
            node.innerHTML = html;
        });
    }
}
