import * as styles from "./side-menu.css";
import * as React from "react";
import { Script } from "../../interfaces/script";
import { checkIfSubscribed, subscribe, unsubscribe } from "../../util/subscription";

interface SideMenuState {
    opened: boolean;
    subscribed: SubscribeState;
}

interface SideMenuProps {
    script?: Script;
}

enum SubscribeState {
    Subscribed,
    Unsubscribed,
    Unknown
}

const SUBSCRIPTION_TOPIC = "mona_podcast";

export class SideMenu extends React.Component<SideMenuProps, SideMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            subscribed: SubscribeState.Unknown
        };
        this.setAndStopPropagation = this.setAndStopPropagation.bind(this);
        this.toggleSubscriptionState = this.toggleSubscriptionState.bind(this);
    }

    render() {
        let containerStyles = styles.sideMenuContainer;
        if (this.state.opened) {
            containerStyles += " " + styles.openedContainer;
        }

        return (
            <div className={containerStyles} onClick={() => this.setState({ opened: false })}>
                <button
                    className={styles.openerButton}
                    onClick={e => this.setAndStopPropagation(e, { opened: true })}
                >
                    Menu
                </button>
                <div className={styles.sideMenu} onClick={e => e.stopPropagation()}>
                    <button className={styles.openerButton} onClick={() => this.setState({ opened: false })}>
                        Close
                    </button>
                    {this.renderEpisodeDetails()}
                    {this.renderEpisodeNavigator()}
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
                <h3>{this.props.script.metadata.title}</h3>
                <p>{this.props.script.metadata.description}</p>
            </div>
        );
    }

    renderEpisodeNavigator() {
        let label =
            this.state.subscribed === SubscribeState.Subscribed ? "Unsubscribe" : "Subscribe to new episodes";

        return (
            <div>
                <h3>Episodes</h3>
                <ul />
                <button
                    disabled={this.state.subscribed === SubscribeState.Unknown}
                    onClick={this.toggleSubscriptionState}
                >
                    {label}
                </button>
            </div>
        );
    }

    async toggleSubscriptionState() {
        if (this.state.subscribed === SubscribeState.Unknown) {
            throw new Error("Cannot toggle subscription state as it is not known");
        }

        this.setState({
            subscribed: SubscribeState.Unknown
        });

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
    }

    setAndStopPropagation(e: React.MouseEvent<any>, newState: any) {
        e.stopPropagation();
        this.setState(newState);
    }

    async componentDidMount() {
        let isSubscribed = await checkIfSubscribed(SUBSCRIPTION_TOPIC);

        this.setState({
            subscribed: isSubscribed ? SubscribeState.Subscribed : SubscribeState.Unsubscribed
        });
    }
}
