import { ChatBubbleProperties, ChatBubble } from "../ui/chat-bubble/chat-bubble";
import { BubbleGroup } from "../ui/bubble-group/bubble-group";
import { ShowNotification } from "./notification";
import * as React from "react";

export interface Chapter {
    time: number;
    name: string;
}

export interface ScriptMetadata {
    title: string;
    description: string;
    avatarFile: string;
    length: number;
}

export interface Script {
    items: ChatBubbleProperties[];
    chapters: Chapter[];
    audioFile: string;

    metadata: ScriptMetadata;
}

export function makeRelative(url: string, baseURL: string) {
    return new URL(url, baseURL).href;
}

function mapScriptEntry(response: ChatBubbleProperties, baseURL: URL): JSX.Element {
    let mappedProperties: ChatBubbleProperties = {
        time: response.time
    };
    // let baseURL = new URL(this.props.url, window.location.href);

    mappedProperties.text = response.text;

    if (response.images) {
        mappedProperties.images = response.images.map(image =>
            Object.assign({}, image, {
                url: makeRelative(image.url, baseURL.href)
            })
        );
    }

    let elements: JSX.Element[] = [<ChatBubble {...mappedProperties} />];

    if (response.link) {
        let url = new URL(response.link.url, baseURL.href);
        let imageURL: string | undefined = undefined;

        if (response.link.image) {
            imageURL = new URL(response.link.image, baseURL.href).href;
        }

        let secondItemProperties: ChatBubbleProperties = {
            time: response.time,
            link: {
                url: url.href,
                domain: url.hostname,
                image: imageURL,
                title: response.link.title
            }
        };

        elements.push(<ChatBubble {...secondItemProperties} />);
    }

    let notificationOptions: ShowNotification = {
        title: "Mona from The Guardian",
        body: response.text,
        icon: makeRelative("./bundles/mona-ep-1/mona-headshot-round.png", window.location.href),
        badge: "https://www.gdnmobilelab.com/uk-election-2017/images/gdn_badge.png"
    };

    if (response.link) {
        notificationOptions.actions = [
            {
                action: "open-link",
                title: "Open link"
            }
        ];
        notificationOptions.data = {
            link_url: response.link.url
        };
    }

    if (mappedProperties.images && mappedProperties.images.length > 0) {
        notificationOptions.image = mappedProperties.images[0].url;
    }

    return <BubbleGroup notification={notificationOptions}>{elements}</BubbleGroup>;
}

export function mapScriptEntries(script: Script, baseURL: URL) {
    let items: JSX.Element[] = [];
    let currentChapterIndex = 0;

    script.items.forEach(scriptItem => {
        let currentChapter = script.chapters[currentChapterIndex];
        if (currentChapter && currentChapter.time < scriptItem.time) {
            items.push(
                <BubbleGroup>
                    <ChatBubble chapterIndicator={currentChapter} time={currentChapter.time} />
                </BubbleGroup>
            );
            currentChapterIndex++;
        }
        items.push(mapScriptEntry(scriptItem, baseURL));
    });

    // let createdItems = script.items.map(i => mapScriptEntry(i, baseURL));

    // let chapterIndicators = script.chapters.map(c => {
    //     return (
    //         <BubbleGroup>
    //             <ChatBubble chapterIndicator={c} time={c.time} />
    //         </BubbleGroup>
    //     );
    // });

    return items;
}
