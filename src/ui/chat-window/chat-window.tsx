import data from "../dummy-data.js";
import { Component } from "preact";
import * as styles from "./chat-window.css";

enum BubbleType {
    text = "text"
}

enum DisplayUpdateMethod {
    scrollToBottom,
    displayButton,
    doNothing
}

interface ChatBubble {
    type: BubbleType;
    text?: string;
    time: number;
}

interface ChatWindowState {
    items: ChatBubble[];
    itemsToDisplay: ChatBubble[];
    displayUpdateMethod: DisplayUpdateMethod;
}

interface ChatWindowProps {
    url: string;
    currentTime: number;
}

export class ChatWindow extends Component<ChatWindowProps, ChatWindowState> {
    container: HTMLDivElement;

    constructor(props) {
        super(props);

        this.fetchItems();

        this.state = {
            items: [],
            itemsToDisplay: [],
            displayUpdateMethod: DisplayUpdateMethod.scrollToBottom
        };

        this.scrollCheck = this.scrollCheck.bind(this);
        this.scrollFinished = this.scrollFinished.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    async fetchItems() {
        let res = await fetch(this.props.url);
        let json = (await res.json()) as ChatBubble[];
        this.setState({
            items: json,
            itemsToDisplay: this.filterItemsToCurrentDisplay(this.props, json)
        });
    }

    renderChatBubble(item: ChatBubble, idx: number) {
        return <div className={styles.bubble}>{item.text}</div>;
    }

    filterItemsToCurrentDisplay(props: ChatWindowProps, items: ChatBubble[]) {
        return items.filter(i => i.time <= props.currentTime);
    }

    componentWillReceiveProps(nextProps: ChatWindowProps) {
        this.setState({
            itemsToDisplay: this.filterItemsToCurrentDisplay(nextProps, this.state.items)
        });
    }

    renderMoreButton() {
        if (this.state.displayUpdateMethod !== DisplayUpdateMethod.displayButton) {
            return null;
        }
        return (
            <div class={styles.moreButton}>
                <button onClick={() => this.scrollToBottom()}>New messages</button>
            </div>
        );
    }

    render() {
        return (
            <div class={styles.chatContainer}>
                {this.renderMoreButton()}
                <div className={styles.chat} ref={el => (this.container = el as HTMLDivElement)}>
                    <div class={styles.spacer} />
                    {this.state.itemsToDisplay.map(this.renderChatBubble)}
                </div>
            </div>
        );
    }

    scrollFinished() {
        let bottomScrollPosition = this.container.scrollHeight - this.container.clientHeight;

        let isAtBottom = this.container.scrollTop == bottomScrollPosition;

        this.setState({
            displayUpdateMethod: isAtBottom
                ? DisplayUpdateMethod.scrollToBottom
                : DisplayUpdateMethod.displayButton
        });
    }

    scrollFinishTimer: number;

    scrollCheck() {
        if (this.scrollFrameIdentifier) {
            // if this is present then we're in the process
            // of animating a scroll. If it isn't user-initiated,
            // we ignore it.
            return;
        }

        // Otherwise we "debounce" the scroll event, as Chrome continually
        // fires scroll events

        clearTimeout(this.scrollFinishTimer);
        this.scrollFinishTimer = setTimeout(this.scrollFinished, 100);
    }

    checkIfAtScrollBottom() {
        let outerHeight = this.container.clientHeight;
        let scrollHeight = this.container.scrollHeight;
        let scrollPosition = this.container.scrollTop;

        let scrollBottom = scrollPosition + outerHeight;
        return scrollBottom == scrollHeight;
    }

    scrollFrameIdentifier?: number;

    scrollToBottom(instant = false) {
        if (this.scrollFrameIdentifier) {
            // If we have an existing scroll running, cancel it
            cancelAnimationFrame(this.scrollFrameIdentifier);
        }

        this.setState({
            displayUpdateMethod: DisplayUpdateMethod.scrollToBottom
        });

        let targetScrollTop = this.container.scrollHeight - this.container.clientHeight;

        if (instant == true) {
            this.container.scrollTop = targetScrollTop;
            return;
        }

        let distance = targetScrollTop - this.container.scrollTop;
        let duration = 300;
        let startTime = Date.now();
        let currentScrollPosition = this.container.scrollTop;

        // We use requestAnimationFrame() to run doScroll() over and over
        // until we've hit our target position.

        let doScroll = rightNow => {
            let timeElapsedSoFar = Date.now() - startTime;
            let howFarAlong = timeElapsedSoFar / duration;
            let scrollTo = currentScrollPosition + distance * howFarAlong;

            // actually set the scroll position:
            this.container.scrollTop = scrollTo;

            if (howFarAlong < 1) {
                // if we haven't completed the full scroll yet, schedule another frame:
                this.scrollFrameIdentifier = requestAnimationFrame(doScroll);
            } else {
                // if we have, clear the existing reference. This variable is checked
                // in addNewItem(), so we want to make sure it is consistent.
                this.scrollFrameIdentifier = undefined;
            }
        };

        doScroll(startTime);
    }

    addNewItem(newItem: ChatBubble) {
        // If we're already at the bottom of the view, we want to automatically scroll
        // down to expose the new chat message. But if the user has scrolled up, we want to
        // show a button indiciating they can go down.

        let method = this.checkIfAtScrollBottom()
            ? DisplayUpdateMethod.scrollToBottom
            : DisplayUpdateMethod.displayButton;

        if (this.scrollFrameIdentifier) {
            // If we have a scrollFrameIdentifier it means we are currently
            // in the process of an animated scroll. If that's the case, we
            // want to continue the animation down to the new item.
            method = DisplayUpdateMethod.scrollToBottom;
        }

        this.setState({
            items: this.state.items.concat([newItem]),
            displayUpdateMethod: method
        });
    }

    componentDidUpdate(oldProps, oldState: ChatWindowState) {
        if (this.state.itemsToDisplay.length <= oldState.itemsToDisplay.length) {
            return;
        }

        if (this.state.displayUpdateMethod == DisplayUpdateMethod.scrollToBottom) {
            this.scrollToBottom();
        }
    }

    componentDidMount() {
        this.scrollToBottom(true);

        // Not sure how to add a passive listener via JSX, so
        // we do it here. Typescript definition for addEventListener
        // hasn't been updated though, so we have to "as any"

        let options = { passive: true } as any;
        this.container.addEventListener("scroll", this.scrollCheck, options);
    }
}
