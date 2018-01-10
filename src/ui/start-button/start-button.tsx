import * as React from "react";
import * as styles from "./start-button.css";

interface StartButtonProps {
    display: boolean;
    onPlay: (withPushAlerts: boolean) => void;
}

function requestPermissionThenOnPlay(onSuccess: (withPushAlerts: boolean) => void) {
    Notification.requestPermission().then(result => {
        if (result === "granted") {
            onSuccess(true);
        }
    });
}

export function StartButton(props: StartButtonProps) {
    let className = styles.startButtonContainer;

    if (props.display === false) {
        className += " " + styles.hidden;
    }

    return (
        <div className={className}>
            <button
                className={styles.highlightedButton}
                onClick={() => requestPermissionThenOnPlay(props.onPlay)}
            >
                Play with push alerts
            </button>
            <button onClick={() => props.onPlay(false)}>Play without push alerts</button>
        </div>
    );
}
