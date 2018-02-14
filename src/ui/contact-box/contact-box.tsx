import * as React from "react";
import * as styles from "./contact-box.css";
import { sendEvent } from "../../util/analytics";
interface ContactBoxProps {
    onClose: () => void;
    source: string;
}

export function setShowOrHideFunction(func: () => void) {
    showOrHideContactBox = func;
}

export let showOrHideContactBox: (from: string) => void;

export function ContactBox(props: ContactBoxProps) {
    // total hack shortcut to show/hide window

    return (
        <div
            style={{ pointerEvents: "auto", position: "absolute", width: "100%", height: "100%", zIndex: 11 }}
        >
            <div
                className={styles.contactBoxBack}
                onClick={e => {
                    props.onClose();
                    e.stopPropagation();
                }}
            />
            <div className={styles.contactBox}>
                <h3>Ask Mona a Data Question</h3>
                <p>
                    Have a data question of your own? Share it with Mona, and she may make a brand new Strange
                    Bird episode about it. Reach out, ask your question, and we'll be in touch.
                </p>
                <ul>
                    <li>
                        <a
                            href="tel:+15038327563"
                            onClick={() => {
                                sendEvent("Web browser", "Leave a voicemail", props.source);
                            }}
                        >
                            Leave a voicemail
                        </a>
                        <a
                            href="sms:+15038327563"
                            onClick={() => {
                                sendEvent("Web browser", "Send text", props.source);
                            }}
                        >
                            Send a text message
                        </a>
                        <a
                            href="mailto:strangebird@theguardian.com"
                            onClick={() => {
                                sendEvent("Web browser", "Write email", props.source);
                            }}
                        >
                            Write an e-mail
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
