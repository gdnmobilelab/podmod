import * as React from "react";
import * as styles from "./progress.css";
import { Chapter } from "../../interfaces/script";

interface PlayerProgressProps {
    duration: number;
    currentPosition: number;
    onChange: (number) => void;
    currentChapterName?: string;
}

interface PlayerProgressState {
    pickedUp: boolean;
}

export class Progress extends React.Component<PlayerProgressProps, PlayerProgressState> {
    slider: HTMLInputElement;

    render() {
        let chapterName = "";
        if (this.props.currentChapterName) {
            chapterName = this.props.currentChapterName;
        }

        return (
            <div className={styles.sliderContainer}>
                <p className={styles.chapterName}>{chapterName}</p>

                <input
                    ref={el => (this.slider = el!)}
                    className={styles.slider}
                    type="range"
                    min="0"
                    max={this.props.duration}
                    onTouchStart={() => {
                        this.setState({ pickedUp: true });
                    }}
                    onTouchEnd={this.touchDown.bind(this)}
                    onChange={e => this.props.onChange(e.currentTarget.value)}
                />
            </div>
        );
    }

    componentDidUpdate() {
        if (this.state && this.state.pickedUp) {
            // if the user is currently interacting with the slider,
            // we don't want to change the current value.
            return;
        }
        this.slider.value = this.props.currentPosition.toString();
    }

    touchDown() {
        this.props.onChange(this.slider.value);
        this.setState(
            {
                pickedUp: false
            },
            () => {
                this.componentDidUpdate();
            }
        );
    }
}
