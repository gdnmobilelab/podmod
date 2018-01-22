import * as React from "react";
import * as styles from "./bottom-info.css";
import { Script } from "../../interfaces/script";

interface BottomInfoProps {
    script?: Script;
    alertsEnabled: boolean;
}

interface BottomInfoState {}

export class BottomInfo extends React.Component<BottomInfoProps, BottomInfoState> {
    constructor(props) {
        super(props);
        this.share = this.share.bind(this);
    }

    share() {
        (navigator as any).share({
            url: window.location.href,
            title: this.props.script ? this.props.script.metadata.title : ""
        });
    }

    render() {
        if (!this.props.script) {
            return null;
        }

        let minutes = Math.round(this.props.script.metadata.length / 60);

        let buttons: JSX.Element[] = [];

        if ("share" in navigator) {
            buttons.push(<button onClick={this.share}>Share</button>);
        }

        return (
            <div className={styles.bottomInfo}>
                <h3>{this.props.script.metadata.title}</h3>
                <p>{minutes} mins</p>
                <div>{buttons}</div>
            </div>
        );
    }
}
