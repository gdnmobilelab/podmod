import * as styles from "./controls.css";
import * as React from "react";

interface PlayerControlProperties {
    canPlay: boolean;
    canPause: boolean;
    onPlay: () => void;
    onPause: () => void;
}

export function Controls(props: PlayerControlProperties) {
    return (
        <div className={styles.controls}>
            <button onClick={props.onPlay} disabled={props.canPlay == false}>
                Play
            </button>
            <button onClick={props.onPause} disabled={props.canPause == false}>
                Pause
            </button>
        </div>
    );
}
