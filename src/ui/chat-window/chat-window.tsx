import data from "../dummy-data.js";
import * as React from "react";
import * as styles from "./chat-window.css";
import { PerformanceScrollView, AddNewItemsTo } from "performance-scroll-view";
import { ChatBubble, ChatBubbleProperties } from "../chat-bubble/chat-bubble";
import { Script } from "../../interfaces/script";

interface ChatWindowState {
    visibleItems: ChatBubbleProperties[];
}

interface ChatWindowProps {
    script?: Script;
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
            visibleItems: []
        };
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
        console.log("RECEIVED", newProps.script);
        if (!newProps.script) {
            // if we don't have a script yet, ignore
            return;
        }
        let timeChange = newProps.currentTime !== this.props.currentTime;
        let scriptChange = newProps.script !== this.props.script;

        if (scriptChange) {
            // If the script object has changed, we want to wipe out any existing items and
            // replace with new ones that fit the offsets.

            let currentScriptItems = newProps.script.items.filter(i => i.time <= newProps.currentTime);
            this.setState({
                visibleItems: currentScriptItems
            });
        } else if (timeChange) {
            // Otherwise, if the time has changed we just want to add the items modified since

            let itemsSinceLastTime = newProps.script.items.filter(
                i => i.time > this.props.currentTime && i.time <= newProps.currentTime
            );

            let newChapters = newProps.script.chapters.filter(
                c => c.time > this.props.currentTime && c.time <= newProps.currentTime
            );

            if (newChapters.length > 0) {
                let chapterBubbles: ChatBubbleProperties[] = newChapters.map(c => {
                    return {
                        chapterIndicator: c,
                        time: c.time
                    };
                });

                itemsSinceLastTime = itemsSinceLastTime
                    .concat(chapterBubbles)
                    .sort((a, b) => a.time - b.time);
            }

            this.setState({
                visibleItems: this.state.visibleItems.concat(itemsSinceLastTime)
            });
        }
    }

    render() {
        let innerView: JSX.Element | null = null;

        if (this.state.visibleItems.length > 0) {
            // We only create the view when we have items, that way we avoid the initial items
            // being animated into view.
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
