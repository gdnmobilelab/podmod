import * as styles from "./side-menu.css";
import * as React from "react";
import { Script } from "../../interfaces/script";
import { checkIfSubscribed, subscribe, unsubscribe } from "../../util/subscription";
import { makeRelative } from "../../interfaces/script";
import { sendEvent } from "../../util/analytics";

interface SideMenuState {
    opened: boolean;
    subscribed: SubscribeState;
}

interface SideMenuProps {
    script?: Script;
    toggleContactBox: (fromSource: string) => void;
    isPlaying: boolean;
    scriptURL: string;
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

        let teamMembers: JSX.Element[] = [];

        if (this.props.script) {
            teamMembers = this.props.script.team.map((member, idx) => {
                return (
                    <li key={`team_member_${idx}`}>
                        <img src={makeRelative(member.photo, this.props.scriptURL)} />
                        <div>
                            <p>
                                <em>{member.role}</em>
                            </p>
                            <p>{member.name}</p>
                            <p>{member.credit}</p>
                        </div>
                    </li>
                );
            });
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
                        <button
                            className={styles.subscribeButton}
                            onClick={() => this.props.toggleContactBox("Podcast menu")}
                        >
                            Ask now
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
                            onClick={() => sendEvent("Web browser", "Take survey", "Podcast menu")}
                        >
                            Take a quick survey
                        </a>
                        <h4>The Team</h4>
                        <ul className={styles.theTeam}>{teamMembers}</ul>
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
            let episode = {
                name: this.props.script.metadata.episodeName,
                id: this.props.script.episodeId,
                status: ""
            };
            if (episode.id === this.props.script.episodeId && this.props.isPlaying) {
                episode.status = "playing";
            }
            episodes.push(episode);
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
                        let className = styles.episodeEntry;
                        if (this.props.script && episode.id !== this.props.script.episodeId) {
                            className + " " + styles.episodeEntryWithArrow;
                        }

                        return (
                            <li className={className} key={episode.id}>
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
            if (oldState === SubscribeState.Subscribed) {
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

        sendEvent(
            "Web browser",
            oldState === SubscribeState.Subscribed ? "Unsubscribe" : "Subscribe to new episodes"
        );
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
