import * as styles from "./controls.css";
import * as React from "react";

interface PlayerControlProperties {
    canPlay: boolean;
    canPause: boolean;
    onPlay: () => void;
    onPause: () => void;
    onRewind: () => void;
    onFastForward: () => void;
    onSkipBack: () => void;
    onSkipForward: () => void;
    onBottomToggle: () => void;
}

export function Controls(props: PlayerControlProperties) {
    return (
        <div className={styles.controls}>
            <button onClick={props.onSkipBack}>- Chapter</button>
            <button onClick={props.onRewind}>- 10s</button>
            <button onClick={props.onPlay} disabled={props.canPlay == false}>
                Play
            </button>
            <button onClick={props.onPause} disabled={props.canPause == false}>
                Pause
            </button>
            <button onClick={props.onFastForward}>+ 10s</button>
            <button onClick={props.onSkipForward}>+ Chapter</button>
            <button onClick={props.onBottomToggle}>More</button>
        </div>
    );
}
