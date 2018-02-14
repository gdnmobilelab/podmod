import * as React from "react";
import * as styles from "./start-button.css";
import { NotificationsSupported } from "../../bridge/notification";
import { NotificationRequestResult } from "../../interfaces/notification";
import { sendEvent } from "../../util/analytics";

interface StartButtonProps {
    display: boolean;
    onPlay: (withNotifications: boolean) => void;
    onNotificationPermissionChange: (newPermission: NotificationRequestResult) => void;
}

async function requestPermission(onChange: (newPermission: NotificationRequestResult) => void) {
    // Playing audio has to be triggered during a touch event, so we can't
    // request notification permission then play - we must play, ask notification
    // permission then report if there's an error
    let result = await Notification.requestPermission();
    onChange(result);
}

export function StartButton(props: StartButtonProps) {
    let className = styles.startButtonContainer;

    if (props.display === false) {
        className += " " + styles.hidden;
    }

    let playWithAlertsButton: JSX.Element | undefined = undefined;

    if (NotificationsSupported) {
        return (
            <div className={className}>
                <button
                    className={styles.highlightedButton}
                    onClick={() => {
                        sendEvent("Web browser", "Play", "With push alert");
                        props.onPlay(true);
                        requestPermission(props.onNotificationPermissionChange);
                    }}
                >
                    Play with push alerts
                </button>
                <button
                    onClick={() => {
                        sendEvent("Web browser", "Play", "Without push alert");
                        props.onPlay(false);
                    }}
                >
                    Play without push alerts
                </button>
            </div>
        );
    } else {
        return (
            <div className={className}>
                <button className={styles.highlightedButton} onClick={() => props.onPlay(false)}>
                    Play
                </button>
            </div>
        );
    }
}
