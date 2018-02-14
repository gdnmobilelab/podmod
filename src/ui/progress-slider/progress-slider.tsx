import * as React from "react";
import * as styles from "./progress-slider.css";
import Pointable from "react-pointable";
// import { MouseEvent } from "react";
import { sendEvent } from "../../util/analytics";

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
    minimumX?: number;
}

function getXFromEvent(e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) {}

export class ProgressSlider extends React.Component<ProgressSliderProps, ProgressSliderState> {
    sliderElement: HTMLDivElement | null;

    constructor(props) {
        super(props);
        this.state = {};
        this.updateMovePositionTouch = this.updateMovePositionTouch.bind(this);
        this.updateMovePositionMouse = this.updateMovePositionMouse.bind(this);
        this.dropScrubber = this.dropScrubber.bind(this);
        this.pickupScrubberTouch = this.pickupScrubberTouch.bind(this);
        this.pickupScrubberMouse = this.pickupScrubberMouse.bind(this);
        this.progressBarClick = this.progressBarClick.bind(this);
    }

    progressBarClick(e: React.MouseEvent<HTMLDivElement>) {
        if (this.state.pickupTime) {
            // We're already in a pickup event, so ignore the click
            return;
        }
        if (!this.sliderElement) {
            throw new Error("No slider element");
        }

        let sliderRect = this.sliderElement.getBoundingClientRect();
        let newX = e.clientX - sliderRect.left;
        newX = Math.max(newX, 0);
        newX = Math.min(newX, sliderRect.width);

        let xPercent = newX / sliderRect.width;

        this.props.onSliderChange(this.props.length * xPercent);
    }

    updateMovePositionMouse(e: MouseEvent) {
        this.updateMovePosition(e.clientX);
    }

    updateMovePositionTouch(e: TouchEvent) {
        this.updateMovePosition(e.touches[0].clientX);
    }

    updateMovePosition(newX: number) {
        if (!this.state.pickupX || !this.state.maximumX || !this.state.minimumX) {
            throw new Error("Called move update without first calling pickup");
        }

        let positionX = newX - this.state.pickupX;

        // positionX = Math.max(positionX, 0);
        positionX = Math.min(positionX, this.state.maximumX);
        positionX = Math.max(positionX, this.state.minimumX);

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

    pickupScrubberTouch(e: React.TouchEvent<HTMLDivElement>) {
        this.pickupScrubber(e.touches[0].clientX);
    }

    pickupScrubberMouse(e: React.MouseEvent<HTMLDivElement>) {
        this.pickupScrubber(e.clientX);
    }

    pickupScrubber(pickupX: number) {
        if (!this.sliderElement) {
            throw new Error(
                "Could not process slider pickup because the container element doesn't exist yet"
            );
        }

        let { width, left } = this.sliderElement.getBoundingClientRect();

        this.setState({
            pickupTime: this.props.currentPosition,
            pickupX: pickupX,
            moveX: 0,
            maximumX: width,
            minimumX: 0 - pickupX + left
        });

        sendEvent("Web browser", "Audio scrubbing");
    }

    componentDidUpdate(oldProps, oldState: ProgressSliderState) {
        if (this.state.pickupTime !== undefined && oldState.pickupTime === undefined) {
            console.info("Setting pointer listener after picking up scrubber");
            document.body.addEventListener("mousemove", this.updateMovePositionMouse);
            document.body.addEventListener("touchmove", this.updateMovePositionTouch);
            document.body.addEventListener("mouseup", this.dropScrubber);
            document.body.addEventListener("touchend", this.dropScrubber);
        } else if (this.state.pickupTime === undefined && oldState.pickupTime !== undefined) {
            console.info("Removing scrubber listener event");
            document.body.removeEventListener("mousemove", this.updateMovePositionMouse);
            document.body.removeEventListener("touchmove", this.updateMovePositionTouch);
            document.body.removeEventListener("mouseup", this.dropScrubber);
            document.body.removeEventListener("touchend", this.dropScrubber);
        }
    }

    render() {
        let currentPositionPercent = this.props.currentPosition / this.props.length * 100;

        let chapterPercents = this.props.chapters.map(c => c / this.props.length * 100);

        let currentPositionWrapperStyles = styles.currentPositionWrapper;

        let containerStyles: any = { left: 0, transform: `translateX(-6px)` };

        if (this.state.pickupTime !== undefined && this.state.maximumX) {
            // If we've picked it up, we don't want to move it relative to current position any more
            // (otherwise it would move independent of user dragging). So we reset the position to
            // be where the user picked it up, then use CSS transforms to move position according to
            // user drag.

            let adjustedPositionPercent = this.state.pickupTime / this.props.length;

            let positionX = adjustedPositionPercent * this.state.maximumX;

            currentPositionWrapperStyles += " " + styles.pickedUpWrapper;
            if (this.state.pickupX !== undefined && this.state.moveX !== undefined) {
                positionX += this.state.moveX;

                containerStyles.transform = `translateX(${positionX - 6}px)`;
            }
        } else {
            if (this.sliderElement) {
                // If we have already rendered, we'll use a CSS transform for better
                // performance.
                let percentToPx = Math.round(
                    this.sliderElement!.clientWidth * (currentPositionPercent / 100)
                );
                containerStyles.transform = `translateX(${percentToPx - 6}px)`;
            } else {
                // but if we haven't, just use a percentage.
                containerStyles.left = currentPositionPercent + "%";
            }
        }

        return (
            <div className={styles.progressSlider} ref={el => (this.sliderElement = el)}>
                <div
                    className={styles.soFarBar}
                    style={{ transform: `scaleX(${currentPositionPercent / 100})` }}
                />

                {chapterPercents.map((percent, idx) => {
                    return (
                        <div
                            key={"chapter_" + idx}
                            style={{ left: percent + "%" }}
                            className={styles.chapterMark}
                        />
                    );
                })}
                <div className={styles.progressSliderTouchTarget} onClick={this.progressBarClick} />
                <div
                    onTouchStart={this.pickupScrubberTouch}
                    onMouseDown={this.pickupScrubberMouse}
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
                </div>
            </div>
        );
    }
}
