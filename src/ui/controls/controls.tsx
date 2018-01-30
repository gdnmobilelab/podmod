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
    let playButtonAction: (() => void) | undefined = undefined;
    let playButtonText = "Play";
    let playButtonClass = styles.play;

    if (props.canPlay) {
        playButtonAction = props.onPlay;
    } else if (props.canPause) {
        playButtonAction = props.onPause;
        playButtonText = "Pause";
        playButtonClass = styles.pause;
    }

    return (
        <div className={styles.controls}>
            <div className={styles.controlsInner}>
                {/* <button onClick={props.onSkipBack}>- Chapter</button> */}
                <button className={styles.back15} onClick={props.onRewind}>
                    - 10s
                </button>
                <button className={playButtonClass} onClick={playButtonAction}>
                    Play
                </button>
                <button className={styles.forward15} onClick={props.onFastForward}>
                    + 10s
                </button>
                {/* <button onClick={props.onSkipForward}>+ Chapter</button> */}
                <button className={styles.more} onClick={props.onBottomToggle}>
                    More
                </button>
            </div>
        </div>
    );
}
