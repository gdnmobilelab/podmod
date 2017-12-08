import * as styles from "./frame.css";
import { ChatWindow } from "../chat-window/chat-window";
import * as React from "react";
import { runServiceWorkerCommand, ServiceWorkerNotSupportedError } from "service-worker-command-bridge";
import { CacheSyncRequest, CacheSyncResponse } from "../../interfaces/cache-sync-request";
// import { Waveform } from "../waveform/waveform";
import { Progress } from "../progress/progress";
import { Controls } from "../controls/controls";
import { Script, mapScriptEntries, makeRelative } from "../../interfaces/script";

enum PlayState {
    Paused,
    Playing,
    Buffering
}

interface PlayerState {
    download?: {
        total: number;
        current: number;
    };
    playback?: {
        current: number;
        total: number;
    };
    playState: PlayState;
    script?: Script;
}

export class Frame extends React.Component<any, PlayerState> {
    audioElement: HTMLAudioElement;

    constructor(props) {
        super(props);
        this.state = {
            playState: PlayState.Paused
        };
        this.timeUpdate = this.timeUpdate.bind(this);
        this.playStateChange = this.playStateChange.bind(this);
        this.audioProgress = this.audioProgress.bind(this);
    }

    async loadData() {
        let absoluteURL = new URL("/bundles/mona-ep-1/script.json", window.location.href);
        let response = await fetch(absoluteURL.href);
        let json = (await response.json()) as Script;

        json.items = mapScriptEntries(json.items, absoluteURL);
        json.audioFile = makeRelative(json.audioFile, absoluteURL.href);

        this.setState({
            script: json
        });
    }

    render() {
        let loadedPercent = 0;
        let playbackPercent = 0;
        let duration = 0;
        let currentPosition = 0;
        if (this.state.download) {
            loadedPercent = this.state.download.current / this.state.download.total;
        }
        if (this.state.playback) {
            playbackPercent = this.state.playback.current / this.state.playback.total;
            currentPosition = this.state.playback.current;
            duration = this.state.playback.total;
        }

        let audio: JSX.Element | null = null;

        if (this.state.script) {
            audio = (
                <audio
                    src={this.state.script.audioFile}
                    preload="auto"
                    onProgress={this.audioProgress}
                    onTimeUpdate={this.timeUpdate}
                    onPlay={this.playStateChange}
                    onPause={this.playStateChange}
                    title="TEST CONTENT"
                    style={{ position: "absolute", zIndex: 100 }}
                    ref={el => (this.audioElement = el as HTMLAudioElement)}
                />
            );
        }

        return (
            <div className={styles.frame}>
                {audio}

                <ChatWindow
                    script={this.state.script}
                    currentTime={this.state.playback ? this.state.playback.current : 0}
                />
                <div className={styles.controls}>
                    {/* <Waveform
                        dataURL="/bundles/mona-ep-1/waveform.dat"
                        downloadPercentage={loadedPercent}
                        playbackPercentage={playbackPercent}
                    /> */}
                    <Progress
                        duration={duration}
                        currentPosition={currentPosition}
                        onChange={i => this.setTime(i, false)}
                        chapters={this.state.script ? this.state.script.chapters : undefined}
                    />
                    <Controls
                        onPlay={() => this.audioElement.play()}
                        onPause={() => this.audioElement.pause()}
                        onRewind={() => this.setTime(-10, true)}
                        onFastForward={() => this.setTime(10, true)}
                        canPlay={this.state.playState == PlayState.Paused}
                        canPause={this.state.playState == PlayState.Playing}
                    />
                </div>
            </div>
        );
    }

    setTime(toValue: number, relativeToCurrent: boolean) {
        if (relativeToCurrent) {
            this.audioElement.currentTime += toValue;
        } else {
            this.audioElement.currentTime = toValue;
        }
    }

    async componentDidMount() {
        try {
            let response = await runServiceWorkerCommand<CacheSyncRequest, CacheSyncResponse>("cachesync", {
                cacheName: "mona-ep-1",
                payloadURL: "/bundles/mona-ep-1/files.json"
            });
            response.progressEvents.onmessage = (e: MessageEvent) => {
                this.setState({
                    download: {
                        current: e.data.current,
                        total: e.data.total
                    }
                });
            };
        } catch (ex) {
            if (ex instanceof ServiceWorkerNotSupportedError === false) {
                throw ex;
            }
        }

        this.loadData();

        if ("mediaSession" in navigator) {
            let mediaSession = (navigator as any).mediaSession;

            mediaSession.metadata = new MediaMetadata({
                title: "Episode 1",
                artist: "The Guardian",
                album: "Untitled Mona Chalabi Podcast",
                artwork: [{ src: "/bundles/mona-ep-1/pee_thumb.png", sizes: "325x333", type: "image/png" }]
            });

            // mediaSession.setActionHandler("play", function() {});
            // mediaSession.setActionHandler("pause", function() {});
            mediaSession.setActionHandler("seekbackward", function() {});
            mediaSession.setActionHandler("seekforward", function() {});
            mediaSession.setActionHandler("previoustrack", function() {});
            mediaSession.setActionHandler("nexttrack", function() {});
        }
    }

    nextSecondTimeout: number;

    timeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
        let currentTime = this.audioElement.currentTime;
        let nextSecond = Math.ceil(currentTime);
        let untilNextSecond = nextSecond - currentTime;

        clearTimeout(this.nextSecondTimeout);
        this.nextSecondTimeout = setTimeout(() => {
            this.setState({
                playback: {
                    current: this.audioElement.currentTime,
                    total: this.audioElement.duration
                }
            });
            console.log("TIME UPDATE", this.audioElement.currentTime);
        }, untilNextSecond * 1000);
    }

    audioProgress(e) {
        console.log(e.target.buffered);
        if (e.target.buffered.length == 0) {
            return;
        }

        let bufferEnd = e.target.buffered.end(e.target.buffered.length - 1);
        console.log("end");
        if ("serviceWorker" in navigator == false) {
            console.log("send end", bufferEnd);
            this.setState({
                download: {
                    current: bufferEnd,
                    total: this.audioElement.duration
                }
            });
        }

        console.info(e, e.target.buffered.start(0), e.target.buffered.end(0));
    }

    playStateChange(e) {
        this.setState({
            playState: this.audioElement.paused ? PlayState.Paused : PlayState.Playing
        });

        if (this.audioElement.paused) {
            clearTimeout(this.nextSecondTimeout);
        }
    }
}

declare var MediaMetadata;
