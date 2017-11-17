import * as React from "react";
import * as styles from "./waveform.css";

interface WaveformProps {
    dataURL: string;
    downloadPercentage: number;
    playbackPercentage: number;
}

interface WaveformState {
    waveformData?: Uint8Array;
    svgPath?: string;
}

export class Waveform extends React.Component<WaveformProps, WaveformState> {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderWaveform() {
        let lines: JSX.Element[] = [];

        let percentEach = 1;

        for (let i = 0; i < 200; i = i + 2) {
            let top = 50;
            let height = 1;

            if (this.state.waveformData) {
                top = this.state.waveformData[i];
                height = this.state.waveformData[i + 1] - top;
            }

            let percentAlong = i / 200;
            let classes = [styles.waveformBar];

            if (percentAlong < this.props.downloadPercentage) {
                classes.push(styles.waveformBarLoaded);
            }
            if (percentAlong < this.props.playbackPercentage) {
                classes.push(styles.waveformBarPlayback);
            }

            let x = i / 2 * percentEach;
            lines.push(
                <rect
                    x={x + "%"}
                    width={percentEach + "%"}
                    y={top + "%"}
                    height={height + "%"}
                    strokeWidth={1 / window.devicePixelRatio}
                    className={classes.join(" ")}
                    key={"blob-" + x}
                />
            );
        }

        return <svg className={styles.waveformSvg}>{lines}</svg>;
    }

    render() {
        return <div className={styles.waveform}>{this.renderWaveform()}</div>;
    }

    async componentDidMount() {
        let res = await fetch(this.props.dataURL);
        let arrayBuffer = await res.arrayBuffer();
        let array = new Uint8Array(arrayBuffer);

        this.setState({
            waveformData: array
        });
    }
}
