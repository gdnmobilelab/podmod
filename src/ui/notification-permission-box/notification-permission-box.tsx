import * as React from "react";
import * as contactBoxStyles from "../contact-box/contact-box.css";
import * as styles from "./notification-permission-box.css";

interface PermissionBoxProps {
    onClose: () => void;
}

export function NotificationPermissionBox(props: PermissionBoxProps) {
    return (
        <div
            style={{ pointerEvents: "auto", position: "absolute", width: "100%", height: "100%", zIndex: 11 }}
        >
            <div
                className={contactBoxStyles.contactBoxBack}
                onClick={e => {
                    props.onClose();
                    e.stopPropagation();
                }}
            />
            <div className={contactBoxStyles.contactBox}>
                <h3>To finish enabling alerts...</h3>
                <p>Please change your notification permissions to "Allow" in your Chrome settings.</p>
                <div className={styles.buttonBox}>
                    <button onClick={props.onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
