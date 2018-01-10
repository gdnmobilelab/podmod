import * as React from "react";
import * as styles from "./progress-slider.css";
import Pointable from "react-pointable";

interface ProgressSliderProps {
    length: number;
    currentPosition: number;
    chapters: number[];
    onSliderChange: (number) => void;
}

interface ProgressSliderState {
    pickupTime?: number;
    pickupX?: number;
    moveX?: number;
    maximumX?: number;
}

export class ProgressSlider extends React.Component<ProgressSliderProps, ProgressSliderState> {
    sliderElement: HTMLDivElement | null;

    constructor(props) {
        super(props);
        this.state = {};
        this.updateMovePosition = this.updateMovePosition.bind(this);
        this.dropScrubber = this.dropScrubber.bind(this);
        this.pickupScrubber = this.pickupScrubber.bind(this);
    }

    updateMovePosition(e) {
        if (!this.state.pickupX || !this.state.maximumX) {
            throw new Error("Called move update without first calling pickup");
        }

        let positionX = e.clientX - this.state.pickupX;

        // positionX = Math.max(positionX, 0);
        positionX = Math.min(positionX, this.state.maximumX);

        this.setState({
            moveX: positionX
        });
    }

    dropScrubber(e) {
        if (
            this.state.moveX === undefined ||
            this.state.maximumX === undefined ||
            this.state.pickupX === undefined ||
            this.state.pickupTime === undefined
        ) {
            throw new Error("Dropped scrubber with no moveX value");
        }

        let pickedupPercentage = this.state.pickupTime / this.props.length;

        let pickedupX = pickedupPercentage * this.state.maximumX;

        pickedupX += this.state.moveX;

        let newPercentage = pickedupX / this.state.maximumX;

        let newPosition = newPercentage * this.props.length;
        console.log("Dropped at new position", newPosition, this.state.pickupX, this.state.moveX);
        this.props.onSliderChange(newPosition);

        this.setState({
            pickupTime: undefined,
            pickupX: undefined,
            moveX: undefined
        });
    }

    pickupScrubber(e) {
        if (!this.sliderElement) {
            throw new Error(
                "Could not process slider pickup because the container element doesn't exist yet"
            );
        }

        let { width } = this.sliderElement.getBoundingClientRect();

        this.setState({
            pickupTime: this.props.currentPosition,
            pickupX: e.clientX,
            moveX: 0,
            maximumX: width
        });
    }

    componentDidUpdate(oldProps, oldState: ProgressSliderState) {
        if (this.state.pickupTime !== undefined && oldState.pickupTime === undefined) {
            console.info("Setting pointer listener after picking up scrubber");
            document.body.addEventListener("pointermove", this.updateMovePosition);
            document.body.addEventListener("pointerup", this.dropScrubber);
        } else if (this.state.pickupTime === undefined && oldState.pickupTime !== undefined) {
            console.info("Removing scrubber listener event");
            document.body.removeEventListener("pointermove", this.updateMovePosition);
            document.body.removeEventListener("pointerup", this.dropScrubber);
        }
    }

    render() {
        let currentPositionPercent = this.props.currentPosition / this.props.length * 100;

        let chapterPercents = this.props.chapters.map(c => c / this.props.length * 100);

        let currentPositionWrapperStyles = styles.currentPositionWrapper;

        let containerStyles: any = { left: 0 };

        if (this.state.pickupTime !== undefined && this.state.maximumX) {
            // If we've picked it up, we don't want to move it relative to current position any more
            // (otherwise it would move independent of user dragging). So we reset the position to
            // be where the user picked it up, then use CSS transforms to move position according to
            // user drag.

            currentPositionPercent = this.state.pickupTime / this.props.length;

            let positionX = currentPositionPercent * this.state.maximumX;

            currentPositionWrapperStyles += " " + styles.pickedUpWrapper;
            if (this.state.pickupX !== undefined && this.state.moveX !== undefined) {
                positionX += this.state.moveX;

                containerStyles.transform = `translateX(${positionX}px)`;
            }
        } else {
            containerStyles.left = currentPositionPercent + "%";
        }

        return (
            <div className={styles.progressSlider} ref={el => (this.sliderElement = el)}>
                {chapterPercents.map((percent, idx) => {
                    return (
                        <div
                            key={"chapter_" + idx}
                            style={{ left: percent + "%" }}
                            className={styles.chapterMark}
                        />
                    );
                })}
                <Pointable
                    onPointerDown={this.pickupScrubber}
                    // onPointerUp={() => {
                    //     this.setState({ pickupTime: undefined });
                    // }}
                    // onPointerMove={e => {
                    //     this.setState({ moveX: e.clientX });
                    // }}
                    className={currentPositionWrapperStyles}
                    style={containerStyles}
                >
                    <div className={styles.currentPosition} />
                </Pointable>
            </div>
        );
    }
}
