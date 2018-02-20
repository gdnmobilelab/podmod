import data from "../dummy-data.js";
import * as React from "react";
import * as styles from "./chat-window.css";
import { PerformanceScrollView, AddNewItemsTo } from "performance-scroll-view";
import { ChatBubble, ChatBubbleProperties } from "../chat-bubble/chat-bubble";
import { Script } from "../../interfaces/script";
import { activeDing } from "../ding/ding";
import { sendEvent } from "../../util/analytics";

interface ChatWindowState {
    numberOfVisibleItems: number;
    alreadySentScrollEvent: boolean;
}

interface ChatWindowProps {
    script?: Script;
    elements?: JSX.Element[];
    currentTime: number;
    playDings: boolean;
}

function easeOutBack(t: number, b: number, c: number, d: number, s: number = 0) {
    if (s === 0) {
        s = 1.70158;
    }
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

function newMessageGenerator(numberOfMessages: number) {
    let messagesText = numberOfMessages > 1 ? "messages" : "message";

    return (
        <div className={styles.moreMessages}>
            &#8595;&nbsp;&nbsp;{numberOfMessages}&nbsp;&nbsp;new {messagesText}
        </div>
    );
}

export class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {
    container: HTMLDivElement;

    constructor(props) {
        super(props);

        this.generateItem = this.generateItem.bind(this);

        this.state = {
            numberOfVisibleItems: 0,
            alreadySentScrollEvent: false
        };
    }

    generateItem(indexes: number[]) {
        return Promise.resolve(
            indexes.map(idx => {
                return this.props.elements![idx] || null;
                // let properties = this.state.visibleItems[idx];
                // if (!properties) {
                //     throw new Error("No item at index requested");
                // }
                // return <ChatBubble {...properties} />;
            })
        );
    }

    componentWillReceiveProps(newProps: ChatWindowProps) {
        if (!newProps.script) {
            // if we don't have a script yet, ignore
            return;
        }
        if (activeDing) {
            activeDing.shouldPlayDings = newProps.playDings;
        }

        let timeChange = newProps.currentTime !== this.props.currentTime;
        let scriptChange = newProps.script !== this.props.script;

        if (timeChange === false && scriptChange === false) {
            return;
        }

        let newVisibleItems: ChatBubbleProperties[] = newProps.script.items.filter(
            i => i.time <= newProps.currentTime
        );

        let newChapters = newProps.script.chapters.filter(c => c.time <= newProps.currentTime);

        this.setState({
            numberOfVisibleItems: newVisibleItems.length + newChapters.length
        });

        // let newChapters = newProps.script.chapters.filter(c => c.time <= newProps.currentTime);

        // if (newChapters.length > 0) {
        //     let chapterBubbles: ChatBubbleProperties[] = newChapters.map(c => {
        //         return {
        //             chapterIndicator: c,
        //             time: c.time
        //         };
        //     });

        //     newVisibleItems = newVisibleItems.concat(chapterBubbles).sort((a, b) => a.time - b.time);
        // }
        // console.log(newVisibleItems);
        // this.setState({
        //     visibleItems: newVisibleItems
        // });
    }

    scrollView: PerformanceScrollView | null;

    render() {
        let innerView: JSX.Element | null = null;
        let avatar: JSX.Element | null = null;

        if (this.state.numberOfVisibleItems > 0 && this.props.script) {
            // We only create the view when we have items, that way we avoid the initial items
            // being animated into view.
            innerView = (
                <PerformanceScrollView
                    className={styles.chat + " chat-window"}
                    numberOfItems={this.state.numberOfVisibleItems}
                    itemBufferSize={this.props.elements!.length}
                    itemGenerator={this.generateItem}
                    addNewItemsTo={AddNewItemsTo.Bottom}
                    animationEaseFunction={easeOutBack}
                    animationDuration={750}
                    startIndex={this.state.numberOfVisibleItems - 1}
                    ref={el => (this.scrollView = el)}
                    moreIndicatorGenerator={newMessageGenerator}
                />
            );

            avatar = (
                <div
                    className={styles.avatar}
                    style={{
                        backgroundImage: `url(${this.props.script.baseURL +
                            this.props.script.metadata.avatarFile})`
                    }}
                >
                    <div className={styles.avatarInner} />
                </div>
            );
        }

        let touchMoveListen: ((Event) => void) = e => e.stopPropagation();

        if (this.state.alreadySentScrollEvent === false) {
            touchMoveListen = e => {
                sendEvent("Web browser", "Scrolling", "");
                e.stopPropagation();
                this.setState({
                    alreadySentScrollEvent: true
                });
            };
        }

        return (
            <div
                className={styles.chatContainer}
                onTouchStart={() => {
                    this.setState({
                        alreadySentScrollEvent: false
                    });
                }}
                onTouchMove={touchMoveListen}
            >
                {innerView}
                {avatar}
            </div>
        );
    }

    refreshScrollViewSize() {
        if (this.scrollView) {
            this.scrollView.recalculatePositions();
        }
    }
}
