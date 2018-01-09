import * as styles from "./frame.css";
import { ChatWindow } from "../chat-window/chat-window";
import * as React from "react";
import { runServiceWorkerCommand, ServiceWorkerNotSupportedError } from "service-worker-command-bridge";
import { CacheSyncRequest, CacheSyncResponse } from "../../interfaces/cache-sync-request";
// import { Waveform } from "../waveform/waveform";
import { Progress } from "../progress/progress";
import { Controls } from "../controls/controls";
import { Header } from "../header/header";
import { Script, mapScriptEntries, makeRelative } from "../../interfaces/script";
import { sendEvent } from "../../util/analytics";
import { StartButton } from "../start-button/start-button";
import { ProgressSlider } from "../progress-slider/progress-slider";

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
    scriptElements?: JSX.Element[];
    currentChapterName?: string;
}

interface PlayerProps {
    scriptURL: string;
}

export class Frame extends React.Component<PlayerProps, PlayerState> {
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
        let absoluteURL = new URL(this.props.scriptURL, window.location.href);
        let response = await fetch(absoluteURL.href);
        let json = (await response.json()) as Script;

        json.audioFile = makeRelative(json.audioFile, absoluteURL.href);

        this.setState({
            script: json,
            scriptElements: mapScriptEntries(json.items, absoluteURL)
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

        let chapterMarks: number[] = [];

        if (this.state.script) {
            duration = this.state.script.metadata.length;

            audio = (
                <audio
                    src={this.state.script.audioFile}
                    preload="auto"
                    onProgress={this.audioProgress}
                    onTimeUpdate={this.timeUpdate}
                    onPlay={this.playStateChange}
                    onPause={this.playStateChange}
                    title={this.state.currentChapterName}
                    style={{ position: "absolute", zIndex: 100 }}
                    ref={el => (this.audioElement = el as HTMLAudioElement)}
                />
            );

            chapterMarks = this.state.script.chapters.map(c => c.time);
        }

        return (
            <div className={styles.frame}>
                {audio}
                <Header
                    metadata={this.state.script ? this.state.script.metadata : undefined}
                    relativeTo={this.props.scriptURL}
                />
                <ChatWindow
                    script={this.state.script}
                    currentTime={this.state.playback ? this.state.playback.current : 0}
                    elements={this.state.scriptElements}
                />
                <div className={styles.controls}>
                    {/* <Waveform
                        dataURL="/bundles/mona-ep-1/waveform.dat"
                        downloadPercentage={loadedPercent}
                        playbackPercentage={playbackPercent}
                    /> */}
                    <ProgressSlider
                        length={duration}
                        currentPosition={currentPosition}
                        chapters={chapterMarks}
                        onSliderChange={newTime => this.setTime(newTime, false)}
                    />
                    {/* <Progress
                        duration={duration}
                        currentPosition={currentPosition}
                        onChange={i => this.setTime(i, false)}
                        currentChapterName={this.state.currentChapterName}
                    /> */}
                    <Controls
                        onPlay={() => this.play()}
                        onPause={() => this.pause()}
                        onRewind={() => this.setTime(-10, true)}
                        onFastForward={() => this.setTime(10, true)}
                        onSkipBack={() => this.moveChapter(-1)}
                        onSkipForward={() => this.moveChapter(1)}
                        canPlay={this.state.playState == PlayState.Paused}
                        canPause={this.state.playState == PlayState.Playing}
                    />
                    {/* <StartButton
                        display={this.state.playback === undefined}
                        onPlay={this.playWithAlertSetting.bind(this)}
                    /> */}
                </div>
            </div>
        );
    }

    playWithAlertSetting(showAlerts: boolean) {
        this.play();
    }

    play() {
        this.audioElement.play();
        sendEvent("Web browser", "Play", "TO BE ADDED");
    }

    pause() {
        this.audioElement.pause();
        sendEvent("Web browser", "Pause");
    }

    moveChapter(byValue: number) {
        if (!this.state.script || !this.state.playback) {
            throw new Error("Cannot move chapters before the script is loaded.");
        }

        if (byValue !== 1 && byValue !== -1) {
            throw new Error("Can only move chapters by one right now");
        }

        for (let i = 0; i < this.state.script.chapters.length; i++) {
            let time = this.state.script.chapters[i].time;

            if (time < this.state.playback.current && i < this.state.script.chapters.length - 1) {
                continue;
            }

            // If the time is greater than our current position, then we know this
            // is the next chapter.

            if (byValue === 1) {
                // If we're moving ahead then we can set it to the time of the current
                // chapter.
                console.info("Skipping forward to chapter at", time);
                this.setTime(time, false);
            } else {
                let previousChapterTime = this.state.script.chapters[i - 1].time;
                console.info("Skipping back to chapter at", previousChapterTime);
                this.setTime(previousChapterTime, false);
            }

            break;
        }
    }

    setTime(toValue: number, relativeToCurrent: boolean) {
        if (relativeToCurrent) {
            this.audioElement.currentTime += toValue;
        } else {
            this.audioElement.currentTime = toValue;
        }

        this.setState({
            playback: {
                total: this.audioElement.duration,
                current: this.audioElement.currentTime
            }
        });
    }

    async componentDidMount() {
        try {
            // let response = await runServiceWorkerCommand<CacheSyncRequest, CacheSyncResponse>("cachesync", {
            //     cacheName: "mona-ep-1",
            //     payloadURL: "./bundles/mona-ep-1/files.json"
            // });
            // response.progressEvents.onmessage = (e: MessageEvent) => {
            //     this.setState({
            //         download: {
            //             current: e.data.current,
            //             total: e.data.total
            //         }
            //     });
            // };
        } catch (ex) {
            if (ex instanceof ServiceWorkerNotSupportedError === false) {
                throw ex;
            }
        }

        this.loadData();

        if ("mediaSession" in navigator) {
            let mediaSession = (navigator as any).mediaSession;

            mediaSession.setActionHandler("play", () => {
                sendEvent("Lockscreen player", "Play", "TO BE ADDED");
            });
            mediaSession.setActionHandler("pause", () => {
                sendEvent("Lockscreen player", "Pause");
            });
            mediaSession.setActionHandler("seekbackward", () => {
                this.setTime(-10, true);
            });
            mediaSession.setActionHandler("seekforward", () => {
                this.setTime(10, true);
            });
            mediaSession.setActionHandler("previoustrack", () => {
                this.moveChapter(-1);
            });
            mediaSession.setActionHandler("nexttrack", () => {
                this.moveChapter(1);
            });
        }
    }

    nextSecondTimeout: number;

    timeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
        let currentTime = this.audioElement.currentTime;
        let nextSecond = Math.ceil(currentTime);
        let untilNextSecond = nextSecond - currentTime;

        clearTimeout(this.nextSecondTimeout);
        this.nextSecondTimeout = setTimeout(() => {
            let chapterName: string | undefined = undefined;
            if (this.state.script && this.state.script.chapters) {
                for (let i = 0; i < this.state.script.chapters.length; i++) {
                    if (this.state.script.chapters[i].time > this.audioElement.currentTime) {
                        break;
                    }
                    chapterName = this.state.script.chapters[i].name;
                }
            }

            this.setState({
                playback: {
                    current: this.audioElement.currentTime,
                    total: this.audioElement.duration
                },
                currentChapterName: chapterName
            });
        }, untilNextSecond * 1000);
    }

    audioProgress(e) {
        console.log(e.target.buffered);
        if (e.target.buffered.length == 0) {
            return;
        }

        let bufferEnd = e.target.buffered.end(e.target.buffered.length - 1);
        if ("serviceWorker" in navigator === false) {
            // If we have a service worker we report progress based on adding files
            // to the cache. But if not we only have the local copy.

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
        } else if ("requestPermission" in Notification) {
            Notification.requestPermission();
        }
    }

    componentDidUpdate(oldProps, oldState: PlayerState) {
        if ("mediaSession" in navigator === false) {
            // If we don't implement the MediaSession API then just ignore all this
            return;
        }

        if (!oldState.script || oldState.currentChapterName === this.state.currentChapterName) {
            // If we already have a script and the chapter names haven't changed, we can ignore
            return;
        }

        if (!this.state.script) {
            // Also, if we still don't have a script, we can still ignore
            return;
        }

        let mediaSession = (navigator as any).mediaSession;

        mediaSession.metadata = new MediaMetadata({
            title: this.state.currentChapterName,
            artist: "The Guardian",
            album: this.state.script.metadata.title,
            artwork: [{ src: "./bundles/mona-ep-1/pee_thumb.png", sizes: "325x333", type: "image/png" }]
        });
    }
}

declare var MediaMetadata;
