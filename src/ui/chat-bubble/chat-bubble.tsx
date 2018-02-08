import * as styles from "./chat-bubble.css";
import * as React from "react";
import { Component } from "react";
import { getPhotoSwipeContainer, PhotoSwipe } from "../photoswipe/photoswipe";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { Chapter, makeRelative } from "../../interfaces/script";

export enum BubbleType {
    text = "text"
}

export interface ChatBubbleImage {
    url: string;
    width: number;
    height: number;
    caption: string;
    video?: boolean;
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
    silent?: boolean;
    notificationOnlyText?: string;
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
        position: "relative",
        maxHeight: "60vh"
    };

    let imageStyles: React.CSSProperties = {
        maxWidth: "100%",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        position: "absolute"
        // maxHeight: "60vh"
    };

    let gallery: JSX.Element | undefined = undefined;

    if (bindTo.state && bindTo.state.expanded === true) {
        var items = bindTo.props.images.map(image => {
            if (image.video === true) {
                return {
                    html: `<video src="${image.url}" class="${
                        styles.expandedVideo
                    }" playsinline autoplay muted/>`,
                    title: image.caption || ""
                };
            }

            let title = image.caption;

            return {
                src: image.url,
                w: image.width,
                h: image.height,
                title: title
            };
        });

        gallery = <PhotoSwipe items={items} onClose={() => setExpandedState(bindTo, false)} />;
    }

    let img: JSX.Element;
    if (bindTo.props.images[0].video === true) {
        img = (
            <video
                src={bindTo.props.images[0].url}
                style={imageStyles}
                autoPlay={true}
                muted={true}
                playsInline={true}
            />
        );
    } else {
        img = <img src={bindTo.props.images[0].url} style={imageStyles} />;
    }

    return (
        <div style={{ maxHeight: "60vh" }}>
            <div
                style={containerStyles}
                className={styles.bubbleImageContainer}
                onClick={() => setExpandedState(bindTo, true)}
            >
                {img}
                {gallery}
            </div>
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

    // let linkImage: JSX.Element | undefined;
    // if (props.link.image) {
    //     linkImage = <img src={props.link.image} className={styles.bubbleLinkImage} />;
    // }

    return (
        <a target="_blank" className={styles.bubbleText + " " + styles.bubbleLink} href={props.link.url}>
            {props.link.title}
            {/* <div className={styles.bubbleLinkImageContainer}>{linkImage}</div> */}
        </a>
    );
}

function renderChapterIndicator(chapter: Chapter | undefined) {
    if (!chapter) {
        return null;
    }
    return (
        <div>
            <div className={styles.chapterIndicatorText}>{chapter.name}</div>
            <div className={styles.chapterIndicatorLine} />
        </div>
    );
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
        this.maybeOpenPhotoSwipe = this.maybeOpenPhotoSwipe.bind(this);
        this.maybeClosePhotoSwipe = this.maybeClosePhotoSwipe.bind(this);
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

        let elements = [
            renderChapterIndicator(this.props.chapterIndicator),
            renderImage(this),
            renderText(this),
            renderLink(this.props)
        ];

        if (elements.some(el => el !== null) === false) {
            return null;
        }

        let containerClassName = styles.bubbleContainer;

        if (this.props.link) {
            containerClassName += " " + styles.linkContainer;
        }

        return (
            <div className={containerClassName} ref={el => (this.containerElement = el)}>
                <div className={className} onTouchStart={this.setTouch} onTouchEnd={this.setTouch}>
                    {elements}
                </div>
            </div>
        );
    }

    maybeOpenPhotoSwipe(e: ServiceWorkerMessageEvent) {
        if (e.data.command !== "podmod.openphoto") {
            return;
        }
        if (e.data.url !== this.props.images![0].url) {
            return;
        }

        this.setState({
            expanded: true
        });
    }

    maybeClosePhotoSwipe(e: ServiceWorkerMessageEvent) {
        console.log("FIRING LISTENER");
        if (e.data.command !== "podmod.closephoto" || this.state.expanded === false) {
            return;
        }
        console.info("Closing photo in response to postMessage");
        this.setState({
            expanded: false
        });
    }

    componentDidMount() {
        if (this.textElement && this.containerElement) {
            // If it's just a text bubble it doesn't automatically change width according to the size
            // of the text container. We have to manually force it to do so.
            // this.containerElement.style.width = this.textElement.getBoundingClientRect().width + "px";
        }

        if (this.props.images && this.props.images.length > 0 && "serviceWorker" in navigator) {
            window.navigator.serviceWorker.addEventListener("message", this.maybeOpenPhotoSwipe);
        }
    }

    componentWillUnmount() {
        if (this.props.images && this.props.images.length > 0 && "serviceWorker" in navigator) {
            window.navigator.serviceWorker.removeEventListener("message", this.maybeOpenPhotoSwipe);
            window.navigator.serviceWorker.removeEventListener("message", this.maybeClosePhotoSwipe);
        }
    }

    componentDidUpdate(oldProps, oldState: ChatBubbleState) {
        if (!this.props.images || this.props.images.length === 0 || "serviceWorker" in navigator === false) {
            return;
        }
        if (oldState.expanded === false && this.state.expanded === true) {
            console.log("SETTING LISTENER");
            window.navigator.serviceWorker.addEventListener("message", this.maybeClosePhotoSwipe);
        } else if (oldState.expanded === true && this.state.expanded === false) {
            console.log("REMOVING LISTENER");
            window.navigator.serviceWorker.removeEventListener("message", this.maybeClosePhotoSwipe);
        }
    }

    setTouch(e: React.TouchEvent<HTMLDivElement>) {
        if (e.type === "touchstart") {
            this.setState({ touched: true });
        } else {
            this.setState({ touched: false });
        }
    }
}
