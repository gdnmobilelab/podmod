import { ChatBubbleProperties, ChatBubble } from "../ui/chat-bubble/chat-bubble";
import { BubbleGroup } from "../ui/bubble-group/bubble-group";
import { ShowNotification, RunCommand } from "worker-commands";
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
    episodeName: string;
    artwork: string;
}

export interface ScriptContact {
    tel?: string;
    sms?: string;
    email?: string;
}

export interface ScriptTeamMember {
    name: string;
    role: string;
    credit: string;
    photo: string;
}

export interface Script {
    items: ChatBubbleProperties[];
    chapters: Chapter[];
    audioFile: string;
    baseURL: string;
    metadata: ScriptMetadata;
    podcastId: string;
    episodeId: string;
    assets: string[];
    dingFile: string;
    contact: ScriptContact;
    team: ScriptTeamMember[];
}

export function makeRelative(url: string, baseURL: string) {
    return new URL(url, baseURL).href;
}

function mapScriptEntry(
    response: ChatBubbleProperties,
    index: number,
    baseURL: URL
): JSX.Element | undefined {
    // Hack for last-minute iOS bug

    if (
        (!("Notification" in window) || !("serviceWorker" in navigator)) &&
        response.link &&
        response.link.specialAction === "open-side-menu"
    ) {
        return undefined;
    }

    let mappedProperties: ChatBubbleProperties = {
        time: response.time
    };
    // let baseURL = new URL(this.props.url, window.location.href);

    mappedProperties.text = response.text;

    let elements: JSX.Element[] = [<ChatBubble {...mappedProperties} key={`item_${index}_main`} />];

    let notificationOptions: ShowNotification = {
        title: "Mona from The Guardian",
        body: response.text || response.notificationOnlyText || "",
        events: {
            onclick: [
                {
                    command: "notification.close"
                },
                {
                    command: "podmod.closephoto"
                },
                {
                    command: "clients.focus"
                }
            ]
        }
    };

    if (response.images && response.images.length > 0) {
        let images = response.images.map(image => {
            let caption = response.text;

            if (!response.text && response.link) {
                caption = `<a target="_blank" href="${response.link.url}">${response.link.title}</a>`;
            }

            return Object.assign({}, image, {
                url: makeRelative(image.url, baseURL.href),
                caption: caption
            });
        });

        notificationOptions.image = images[0].url;

        (notificationOptions.events!.onclick as RunCommand<any>[]).push({
            command: "podmod.openphoto",
            options: {
                url: images[0].url
            }
        });

        elements.unshift(<ChatBubble time={response.time} key={`item_${index}_images`} images={images} />);
    }

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
                title: response.link.title,
                specialAction: response.link.specialAction
            }
        };

        elements.push(<ChatBubble {...secondItemProperties} key={`item_${index}_link`} />);
    }

    if (response.link) {
        notificationOptions.body = response.link.title;
        notificationOptions.actions = [
            {
                action: "openlink",
                title: "Open link"
            }
        ];

        notificationOptions.events!.onopenlink = [
            {
                command: "notification.close"
            },
            {
                command: "clients.open",
                options: {
                    url: response.link.url
                }
            }
        ];
    }

    return (
        <BubbleGroup
            notification={notificationOptions}
            key={"item_" + index}
            silent={response.silent || false}
        >
            {elements}
        </BubbleGroup>
    );
}

export function mapScriptEntries(script: Script, baseURL: URL) {
    let items: JSX.Element[] = [];
    let currentChapterIndex = 0;

    script.items.forEach((scriptItem, idx) => {
        let currentChapter = script.chapters[currentChapterIndex];
        if (currentChapter && currentChapter.time <= scriptItem.time) {
            items.push(
                <BubbleGroup key={"chapter_" + currentChapterIndex} silent={true}>
                    <ChatBubble chapterIndicator={currentChapter} time={currentChapter.time} />
                </BubbleGroup>
            );
            currentChapterIndex++;
        }

        let item = mapScriptEntry(scriptItem, idx, baseURL);
        if (item) {
            items.push(item);
        }
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
