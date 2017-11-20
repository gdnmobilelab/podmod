import data from "../dummy-data.js";
import * as React from "react";
import * as styles from "./chat-window.css";
import { PerformanceScrollView, AddNewItemsTo } from "performance-scroll-view";
import { ChatBubble, ChatBubbleProperties } from "../chat-bubble/chat-bubble";

interface ChatWindowState {
    items?: ChatBubbleProperties[];
    visibleItems: ChatBubbleProperties[];
}

interface ChatWindowProps {
    url: string;
    currentTime: number;
}

function easeOutBack(t: number, b: number, c: number, d: number, s: number = 0) {
    if (s === 0) {
        s = 1.70158;
    }
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

export class ChatWindow extends React.Component<ChatWindowProps, any> {
    container: HTMLDivElement;

    constructor(props) {
        super(props);

        this.generateItem = this.generateItem.bind(this);

        this.state = {
            items: undefined,
            visibleItems: []
        };
    }

    mapResponseToScriptEntry(response: ChatBubbleProperties): ChatBubbleProperties {
        let mappedProperties: { [key: string]: any } = {};
        let baseURL = new URL(this.props.url, window.location.href);

        if (response.images) {
            mappedProperties.images = response.images.map(image =>
                Object.assign({}, response.image, {
                    url: new URL(image.url, baseURL.href).href
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

    async loadData() {
        let response = await fetch(this.props.url);
        let json = (await response.json()) as ChatBubbleProperties[];

        let entries = json.map(this.mapResponseToScriptEntry.bind(this)) as ChatBubbleProperties[];

        this.setState({
            items: entries,
            visibleItems: entries.filter(item => item.time <= this.props.currentTime)
        });
    }

    generateItem(indexes: number[]) {
        return Promise.resolve(
            indexes.map(idx => {
                let properties = this.state.visibleItems[idx];
                if (!properties) {
                    throw new Error("No item at index requested");
                }
                return <ChatBubble {...properties} />;
            })
        );
    }

    componentWillReceiveProps(newProps: ChatWindowProps) {
        if (newProps.currentTime !== this.props.currentTime) {
            this.setState({
                visibleItems: this.state.items.filter(item => item.time <= newProps.currentTime)
            });
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.loadData();
        }, 0);
    }

    render() {
        let innerView: JSX.Element | null = null;

        if (this.state.items) {
            innerView = (
                <PerformanceScrollView
                    className={styles.chat}
                    numberOfItems={this.state.visibleItems.length}
                    itemBufferSize={20}
                    itemGenerator={this.generateItem}
                    addNewItemsTo={AddNewItemsTo.Bottom}
                    animationEaseFunction={easeOutBack}
                    animationDuration={750}
                    startIndex={this.state.visibleItems.length - 1}
                />
            );
        }
        return <div className={styles.chatContainer}>{innerView}</div>;
    }
}
