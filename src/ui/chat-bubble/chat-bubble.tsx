import * as styles from "./chat-bubble.css";
import * as React from "react";
import { Component } from "react";
import { getPhotoSwipeContainer, PhotoSwipe } from "../photoswipe/photoswipe";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { ShowNotification } from "../../interfaces/notification";
import { Chapter, makeRelative } from "../../interfaces/script";

export enum BubbleType {
    text = "text"
}

export interface ChatBubbleImage {
    url: string;
    width: number;
    height: number;
}

export interface ChatBubbleLink {
    title: string;
    url: string;
    image?: string;
    domain: string;
}

export interface ChatBubbleProperties {
    text?: string;
    time: number;
    images?: ChatBubbleImage[];
    link?: ChatBubbleLink;
    chapterIndicator?: Chapter;
}

interface ChatBubbleState {
    touched: boolean;
    expanded: boolean;
}

function setExpandedState(target: ChatBubble, toValue: boolean) {
    target.setState({
        expanded: toValue
    });
}

function renderImage(bindTo: ChatBubble) {
    if (!bindTo.props.images || bindTo.props.images.length === 0) {
        return null;
    }

    let { width, height } = bindTo.props.images[0];
    console.log("proportion", height, width, height / width * 100, bindTo.props.images[0]);
    let containerStyles: React.CSSProperties = {
        paddingTop: height / width * 100 + "%",
        width: "100%",
        position: "relative"
    };

    let imageStyles: React.CSSProperties = {
        width: "100%",
        top: 0,
        left: 0,
        position: "absolute"
    };

    let gallery: JSX.Element | undefined = undefined;

    if (bindTo.state && bindTo.state.expanded === true) {
        var items = bindTo.props.images.map(image => {
            return {
                src: image.url,
                w: image.width,
                h: image.height
            };
        });

        gallery = <PhotoSwipe items={items} onClose={() => setExpandedState(bindTo, false)} />;
    }

    return (
        <div
            style={containerStyles}
            className={styles.bubbleImageContainer}
            onClick={() => setExpandedState(bindTo, true)}
        >
            <img src={bindTo.props.images[0].url} style={imageStyles} />
            {gallery}
        </div>
    );
}

function renderText(bindTo: ChatBubble) {
    if (!bindTo.props.text) {
        return null;
    }
    return (
        <div className={styles.bubbleTextPadding}>
            <div className={styles.bubbleText} ref={el => (bindTo.textElement = el)}>
                {bindTo.props.text}
            </div>
        </div>
    );
}

function renderLink(props: ChatBubbleProperties) {
    if (!props.link) {
        return null;
    }

    let linkImage: JSX.Element | undefined;
    if (props.link.image) {
        linkImage = <img src={props.link.image} className={styles.bubbleLinkImage} />;
    }

    return (
        <a target="_blank" className={styles.bubbleText + " " + styles.bubbleLink} href={props.link.url}>
            <div>
                <span className={styles.bubbleLinkTitle}>{props.link.title}</span>
                <span className={styles.bubbleLinkDomain}>{props.link.domain}</span>
            </div>
            <div className={styles.bubbleLinkImageContainer}>{linkImage}</div>
        </a>
    );
}

function renderChapterIndicator(chapter: Chapter | undefined) {
    if (!chapter) {
        return null;
    }
    return <div>{chapter.name}</div>;
}

export class ChatBubble extends Component<ChatBubbleProperties, ChatBubbleState> {
    containerElement: HTMLDivElement | null;
    textElement: HTMLDivElement | null;

    constructor(props) {
        super(props);
        this.setTouch = this.setTouch.bind(this);
        this.state = {
            touched: false,
            expanded: false
        };
    }

    render() {
        let className = styles.bubble;

        if (this.props.chapterIndicator) {
            className = styles.chapterIndicator;
        }

        if (this.props.images && this.props.images.length > 0) {
            className += " " + styles.bubbleFullWidth;
        }

        if (this.state.touched) {
            className += " " + styles.bubbleTouch;
        }

        return (
            <div className={styles.bubbleContainer} ref={el => (this.containerElement = el)}>
                <div className={className} onTouchStart={this.setTouch} onTouchEnd={this.setTouch}>
                    {renderChapterIndicator(this.props.chapterIndicator)}
                    {renderImage(this)}
                    {renderText(this)}
                    {renderLink(this.props)}
                </div>
            </div>
        );
    }

    componentDidMount() {
        if (this.textElement && this.containerElement) {
            // If it's just a text bubble it doesn't automatically change width according to the size
            // of the text container. We have to manually force it to do so.

            this.containerElement.style.width = this.textElement.getBoundingClientRect().width + 50 + "px";
        }

        // if (document.visibilityState === "visible") {
        //     // If the user is currently on the page we don't show these notifications
        //     return;
        // }

        // if (this.props.chapterIndicator) {
        //     // We don't show notifications for chapter changes
        //     return;
        // }

        // let notificationOptions: ShowNotification = {
        //     title: "Mona from the Guardian",
        //     icon: makeRelative("./bundles/mona-ep-1/mona-headshot-round.png", window.location.href),
        //     body: this.props.text,
        //     badge: "https://www.gdnmobilelab.com/uk-election-2017/images/gdn_badge.png",
        //     data: {
        //         uuid: this.state.uuid
        //     }
        // };

        // if (this.props.images && this.props.images.length > 0) {
        //     notificationOptions.image = makeRelative(this.props.images[0].url, window.location.href);
        // }

        // if (this.props.link) {
        //     notificationOptions.body = this.props.link.domain;
        //     notificationOptions.actions = [
        //         {
        //             action: "open-link",
        //             title: "Open Link"
        //         }
        //     ];
        // }

        // runServiceWorkerCommand<ShowNotification, void>("show-notification", notificationOptions).catch(
        //     err => {
        //         console.error(err);
        //     }
        // );
    }

    setTouch(e: React.TouchEvent<HTMLDivElement>) {
        if (e.type === "touchstart") {
            this.setState({ touched: true });
        } else {
            this.setState({ touched: false });
        }
    }
}
