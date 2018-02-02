import * as React from "react";
import * as styles from "./bottom-info.css";
import { Script } from "../../interfaces/script";
import { Downloader } from "../downloader/downloader";

interface BottomInfoProps {
    script?: Script;
    alertsEnabled: boolean;
    onAlertChange: (enabled: boolean) => void;
    offlineDownloadEnabled: boolean;
    offlineDownloadChange: (enabled: boolean) => void;
}

interface BottomInfoState {}

function getCheckedClassName(isChecked: boolean) {
    let checkboxClasses = styles.checkbox;
    if (isChecked) {
        checkboxClasses += " " + styles.checkboxTicked;
    }

    return checkboxClasses;
}

export class BottomInfo extends React.Component<BottomInfoProps, BottomInfoState> {
    constructor(props) {
        super(props);
        this.share = this.share.bind(this);
    }

    share() {
        (navigator as any).share({
            url: window.location.href,
            title: this.props.script ? this.props.script.metadata.title : ""
        });
    }

    render() {
        if (!this.props.script) {
            return null;
        }

        let minutes = Math.round(this.props.script.metadata.length / 60);

        let buttons: JSX.Element[] = [
            <button
                key="offline-download"
                className={styles.withCheckbox}
                onClick={() => this.props.offlineDownloadChange(!this.props.offlineDownloadEnabled)}
            >
                <Downloader
                    barClassName={styles.downloadBar}
                    urls={this.props.script.assets}
                    cacheName={this.props.script.podcastId + "_" + this.props.script.episodeId}
                    doDownload={this.props.offlineDownloadEnabled}
                    className={styles.downloadBar}
                />
                <span className={getCheckedClassName(this.props.offlineDownloadEnabled)} />
                <span className={styles.bottomInfoButtonText}>Save for Offline</span>
            </button>,
            <button
                key="show-alerts"
                className={styles.withCheckbox}
                onClick={() => this.props.onAlertChange(!this.props.alertsEnabled)}
            >
                <span className={getCheckedClassName(this.props.alertsEnabled)} />Show Alerts
            </button>
        ];

        if ("share" in navigator || 1 == 1) {
            buttons.push(
                <button onClick={this.share} key="share">
                    <span className={styles.share} />Share
                </button>
            );
        }

        return (
            <div className={styles.bottomInfo}>
                <h3>{this.props.script.metadata.title}</h3>
                <p className={styles.subtitle}>{minutes} mins</p>
                <p className={styles.description}>{this.props.script.metadata.description}</p>
                <div>{buttons}</div>
            </div>
        );
    }
}
