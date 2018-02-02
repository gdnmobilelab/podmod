import * as React from "react";
import * as styles from "./contact-box.css";

interface ContactBoxProps {
    onClose: () => void;
}

export function ContactBox(props: ContactBoxProps) {
    return (
        <div style={{ pointerEvents: "auto" }}>
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
                        <a href="tel:+19175555555">Leave a voicemail</a>
                        <a href="sms:+19175555555">Send a text message</a>
                        <a href="mailto:an@email.address">Write an e-mail</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
