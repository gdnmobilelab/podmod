import { ChatBubbleProperties } from "../ui/chat-bubble/chat-bubble";

export interface Chapter {
    time: number;
    name: string;
}

export interface Script {
    items: ChatBubbleProperties[];
    chapters: Chapter[];
    audioFile: string;
}

export function makeRelative(url: string, baseURL: string) {
    return new URL(url, baseURL).href;
}

function mapScriptEntry(response: ChatBubbleProperties, baseURL: URL): ChatBubbleProperties {
    let mappedProperties: { [key: string]: any } = {};
    // let baseURL = new URL(this.props.url, window.location.href);

    if (response.images) {
        mappedProperties.images = response.images.map(image =>
            Object.assign({}, image, {
                url: makeRelative(image.url, baseURL.href)
            })
        );
    }

    if (response.link) {
        let url = new URL(response.link.url, baseURL.href);
        let imageURL: string | undefined = undefined;

        if (response.link.image) {
            imageURL = new URL(response.link.image, baseURL.href).href;
        }

        mappedProperties.link = Object.assign({}, response.link, {
            url: url.href,
            domain: url.hostname,
            image: imageURL
        });
    }
    return Object.assign({}, response, mappedProperties);
}

export function mapScriptEntries(items: ChatBubbleProperties[], baseURL: URL) {
    return items.map(i => mapScriptEntry(i, baseURL));
}
