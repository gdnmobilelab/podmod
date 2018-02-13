import * as React from "react";
import { FileDetails, CacheSync } from "../../io/cache-sync";

interface DownloaderProps extends React.HTMLAttributes<HTMLDivElement> {
    cacheName: string;
    urls: string[];
    doDownload: boolean;
    barClassName?: string;
}

interface DownloaderState {
    downloadCurrent: number;
    downloadTotal: number;
}

const downloadBarStyles: React.CSSProperties = {
    position: "absolute",
    height: "100%",
    top: 0,
    left: 0,
    width: "100%",
    // background: "red",
    transformOrigin: "0px 0px"
};

export class Downloader extends React.Component<DownloaderProps, DownloaderState> {
    cacheSync?: CacheSync;

    constructor(props) {
        super(props);
        this.state = {
            downloadCurrent: 0,
            downloadTotal: 1
        };
        this.updateDownloadProgress = this.updateDownloadProgress.bind(this);
    }

    componentDidMount() {
        if (this.props.doDownload) {
            this.startCacheSync();
        }
    }

    async componentDidUpdate() {
        if (this.props.doDownload) {
            this.startCacheSync();
        } else {
            if (this.cacheSync) {
                this.cacheSync.removeEventListener("progress", this.updateDownloadProgress);
            }
            this.cacheSync = undefined;
            let cacheCurrentlyExists = await caches.has(this.props.cacheName);
            if (cacheCurrentlyExists) {
                await caches.delete(this.props.cacheName);
                this.setState({
                    downloadCurrent: 0,
                    downloadTotal: 1
                });
            }
        }
    }

    startCacheSync() {
        if (this.cacheSync) {
            return;
        }
        this.cacheSync = new CacheSync(this.props.cacheName, this.props.urls);
        this.cacheSync.addEventListener("progress", this.updateDownloadProgress);
        this.cacheSync.complete
            .then(() => {
                console.info("DOWNLOADER: cache complete?");
            })
            .catch(err => {
                console.error("DOWNLOADER: error", err);
            });
        // console.log("woah", e.detail.current);
    }

    updateDownloadProgress(e) {
        this.setState({
            downloadCurrent: e.detail.current,
            downloadTotal: e.detail.total
        });
    }

    render() {
        if (!window.caches) {
            return null;
        }
        let { cacheName, urls, barClassName, doDownload, ...htmlProps } = this.props;

        let soFar = this.state.downloadCurrent / this.state.downloadTotal;

        let barStyles = Object.assign(
            {
                transform: `scaleX(${soFar})`
            },
            downloadBarStyles
        );

        return (
            <div {...htmlProps}>
                <div style={barStyles} className={barClassName} />
            </div>
        );
    }
}
