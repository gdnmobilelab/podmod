import * as styles from "./chat-bubble.css";
import * as React from "react";
import { Component } from "react";
import { getPhotoSwipeContainer, PhotoSwipe } from "../photoswipe/photoswipe";

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
    type: BubbleType;
    text?: string;
    time: number;
    image?: ChatBubbleImage;
    images?: ChatBubbleImage[];
    link?: ChatBubbleLink;
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

function renderText(props: ChatBubbleProperties) {
    if (!props.text) {
        return null;
    }
    return <div className={styles.bubbleText}>{props.text}</div>;
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

export class ChatBubble extends Component<ChatBubbleProperties, ChatBubbleState> {
    constructor(props) {
        super(props);
        this.setTouch = this.setTouch.bind(this);
    }

    render() {
        let className = styles.bubble;
        if (this.props.image) {
            className += " " + styles.bubbleFullWidth;
        }

        if (this.state && this.state.touched) {
            className += " " + styles.bubbleTouch;
        }

        return (
            <div className={styles.bubbleContainer}>
                <div className={className} onTouchStart={this.setTouch} onTouchEnd={this.setTouch}>
                    {renderImage(this)}
                    {renderText(this.props)}
                    {renderLink(this.props)}
                </div>
            </div>
        );
    }

    setTouch(e: React.TouchEvent<HTMLDivElement>) {
        if (e.type === "touchstart") {
            this.setState({ touched: true });
        } else {
            this.setState({ touched: false });
        }
    }
}
