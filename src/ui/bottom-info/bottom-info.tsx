import * as React from "react";
import * as styles from "./bottom-info.css";
import { Script } from "../../interfaces/script";

interface BottomInfoProps {
    script?: Script;
    alertsEnabled: boolean;
    onAlertChange: (enabled: boolean) => void;
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

        let checkboxClasses = styles.checkbox;
        if (this.props.alertsEnabled) {
            checkboxClasses += " " + styles.checkboxTicked;
        }

        let buttons: JSX.Element[] = [
            <button
                className={styles.withCheckbox}
                onClick={() => this.props.onAlertChange(!this.props.alertsEnabled)}
            >
                <span className={checkboxClasses} />Show Alerts
            </button>
        ];

        if ("share" in navigator) {
            buttons.push(<button onClick={this.share}>Share</button>);
        }

        return (
            <div className={styles.bottomInfo}>
                <h3>{this.props.script.metadata.title}</h3>
                <p className={styles.subtitle}>{minutes} mins</p>
                <p className={styles.description}>{this.props.script.metadata.description}</p>
                <div>{buttons}</div>
            </div>
        );
    }
}
