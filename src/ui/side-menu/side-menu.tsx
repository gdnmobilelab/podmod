import * as styles from "./side-menu.css";
import * as React from "react";
import { Script } from "../../interfaces/script";
import { checkIfSubscribed, subscribe, unsubscribe } from "../../util/subscription";
import { makeRelative } from "../../interfaces/script";

interface SideMenuState {
    opened: boolean;
    subscribed: SubscribeState;
}

interface SideMenuProps {
    script?: Script;
    toggleContactBox: () => void;
}

interface Episode {
    name: string;
    id: string;
    status: string;
}

enum SubscribeState {
    Subscribed,
    Unsubscribed,
    Unknown
}

const SUBSCRIPTION_TOPIC = "mona_podcast";

export let showOrHideSideMenu: () => void;

export class SideMenu extends React.Component<SideMenuProps, SideMenuState> {
    constructor(props) {
        super(props);
        let state = {
            opened: false,
            subscribed: SubscribeState.Unknown
        };

        if ("Notification" in window && (Notification as any).permission === "default") {
            // We can't request subscription details without getting notification
            // permission first, so we don't check
            state.subscribed = SubscribeState.Unsubscribed;
        }

        this.state = state;

        this.setAndStopPropagation = this.setAndStopPropagation.bind(this);
        this.toggleSubscriptionState = this.toggleSubscriptionState.bind(this);
    }

    render() {
        let containerStyles = styles.sideMenuContainer;
        if (this.state.opened) {
            containerStyles += " " + styles.openedContainer;
        }

        return (
            <div
                className={containerStyles}
                onClick={() => this.setState({ opened: false })}
                onTouchMove={e => e.stopPropagation()}
            >
                <button
                    className={styles.openerButton}
                    onClick={e => this.setAndStopPropagation(e, { opened: true })}
                >
                    Menu
                </button>
                <div className={styles.sideMenu} onClick={e => e.stopPropagation()}>
                    <button
                        className={styles.openerButton + " " + styles.closerButton}
                        onClick={() => this.setState({ opened: false })}
                    >
                        Close
                    </button>
                    <div className={styles.topWing} />
                    <div className={styles.scroller}>
                        {this.renderEpisodeDetails()}
                        {this.renderEpisodeNavigator()}
                        <h4>Ask Mona a Data Question</h4>
                        <p>Contact Mona by X, Y, Z</p>
                        <button className={styles.subscribeButton} onClick={this.props.toggleContactBox}>
                            Ask Mona a question
                        </button>
                        <h4>Give Feedback</h4>
                        <p>
                            Read about this experimental format here. We want to know what you think about the
                            show.
                        </p>
                        <a
                            target="_blank"
                            href="https://goo.gl/forms/LO6GvPYWRfvR9rpv2"
                            className={styles.subscribeButton}
                        >
                            Take a quick survey
                        </a>
                        <h4>The Team</h4>
                        <ul className={styles.theTeam}>
                            <li>
                                <img
                                    src={makeRelative(
                                        "./bundles/mona-ep-1/mona-headshot-round.png",
                                        window.location.href
                                    )}
                                />
                                <div>
                                    <p>
                                        <em>Host</em>
                                    </p>
                                    <p>Mona Chalabi</p>
                                    <p>Data Editor, The Guardian</p>
                                </div>
                            </li>
                            <li>
                                <img
                                    src={makeRelative(
                                        "./bundles/mona-ep-1/mona-headshot-round.png",
                                        window.location.href
                                    )}
                                />
                                <div>
                                    <p>
                                        <em>Producer</em>
                                    </p>
                                    <p>Josie Holtzman</p>
                                    <p>Producer, Roads and Kingdoms</p>
                                </div>
                            </li>
                            <li>
                                <img
                                    src={makeRelative(
                                        "./bundles/mona-ep-1/gmil-logo.svg",
                                        window.location.href
                                    )}
                                />
                                <div>
                                    <p>
                                        <em>Concept &amp; Development</em>
                                    </p>
                                    <p>The Guardian Mobile Innovation Lab</p>
                                </div>
                            </li>
                        </ul>
                        <p className={styles.contactUs}>
                            Contact us:{" "}
                            <a href="mailto:innovationlab@theguardian.com">innovationlab@theguardian.com</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    renderEpisodeDetails() {
        if (!this.props.script) {
            return null;
        }

        return (
            <div>
                <h3 className={styles.strangebirdHeader}>{this.props.script.metadata.title}</h3>
                <p>{this.props.script.metadata.description}</p>
            </div>
        );
    }

    renderEpisodeNavigator() {
        let label: string;

        if (this.state.subscribed === SubscribeState.Subscribed) {
            label = "Unsubscribe from episode alerts";
        } else if (this.state.subscribed === SubscribeState.Unsubscribed) {
            label = "Subscribe to new episodes";
        } else {
            label = "Working...";
        }

        let episodes: Episode[] = [];

        if (this.props.script) {
            episodes.push({
                name: this.props.script.metadata.episodeName,
                id: this.props.script.episodeId,
                status: "playing"
            });
        }

        let subscribeButton: JSX.Element | null = null;

        if ("Notification" in window && "serviceWorker" in navigator) {
            subscribeButton = (
                <button
                    className={styles.subscribeButton}
                    disabled={this.state.subscribed === SubscribeState.Unknown}
                    onClick={this.toggleSubscriptionState}
                >
                    {label}
                </button>
            );
        }

        return (
            <div>
                <h4>Episodes</h4>
                <ul className={styles.episodeList}>
                    {episodes.map(episode => {
                        return (
                            <li className={styles.episodeEntry}>
                                <span className={styles.episodeName}>{episode.name}</span>
                                <span className={styles.episodeStatus}>{episode.status}</span>
                            </li>
                        );
                    })}
                </ul>
                {subscribeButton}
            </div>
        );
    }

    async toggleSubscriptionState() {
        if (this.state.subscribed === SubscribeState.Unknown) {
            throw new Error("Cannot toggle subscription state as it is not known");
        }

        let permission = await Notification.requestPermission();

        if (permission !== "granted") {
            throw new Error("We do not have notification permissions");
        }

        let oldState = this.state.subscribed;

        this.setState({
            subscribed: SubscribeState.Unknown
        });

        try {
            if (this.state.subscribed === SubscribeState.Subscribed) {
                let sub = await unsubscribe(SUBSCRIPTION_TOPIC);
                this.setState({
                    subscribed: SubscribeState.Unsubscribed
                });
            } else {
                let sub = await subscribe(SUBSCRIPTION_TOPIC);
                this.setState({
                    subscribed: SubscribeState.Subscribed
                });
            }
        } catch (err) {
            console.error(err);
            this.setState({
                subscribed: oldState
            });
        }
    }

    setAndStopPropagation(e: React.MouseEvent<any>, newState: any) {
        e.stopPropagation();
        this.setState(newState);
    }

    async componentDidMount() {
        showOrHideSideMenu = () => {
            this.setState({
                opened: !this.state.opened
            });
        };
        if (
            "Notification" in window &&
            "serviceWorker" in navigator &&
            (Notification as any).permission === "granted"
        ) {
            let isSubscribed = await checkIfSubscribed(SUBSCRIPTION_TOPIC);
            this.setState({
                subscribed: isSubscribed ? SubscribeState.Subscribed : SubscribeState.Unsubscribed
            });
        }
    }
}
