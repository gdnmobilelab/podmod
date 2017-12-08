import * as React from "react";
import * as styles from "./progress.css";
import { Chapter } from "../../interfaces/script";

interface PlayerProgressProps {
    duration: number;
    currentPosition: number;
    onChange: (number) => void;
    chapters?: Chapter[];
}

export function Progress(props: PlayerProgressProps) {
    let chapterName = "";
    if (props.chapters) {
        for (let i = 0; i < props.chapters.length; i++) {
            if (props.chapters[i].time > props.currentPosition) {
                break;
            }
            chapterName = props.chapters[i].name;
        }
    }

    return (
        <div className={styles.sliderContainer}>
            <p className={styles.chapterName}>{chapterName}</p>

            <input
                className={styles.slider}
                type="range"
                min="0"
                max={props.duration}
                value={props.currentPosition}
                onChange={e => props.onChange(e.currentTarget.value)}
            />
        </div>
    );
}
