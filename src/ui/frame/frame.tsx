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
import { SideMenu } from "../side-menu/side-menu";
import { BottomSlider } from "../bottom-slider/bottom-slider";
import { Ding, activeDing } from "../ding/ding";
import { BottomInfo } from "../bottom-info/bottom-info";
import { fontsLoaded } from "../../util/fonts";
import { TimeFormatter } from "../time-formatter/time-formatter";
import { NotificationRequestResult } from "../../interfaces/notification";
import { setNotificationEnableState, getNotificationEnableState } from "../../util/notification-dispatch";
import { ContactBox, setShowOrHideFunction } from "../contact-box/contact-box";
import { NotificationPermissionBox } from "../notification-permission-box/notification-permission-box";

declare var FontFaceSet: any;

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
        manuallyScrubbed: boolean;
    };
    playState: PlayState;
    script?: Script;
    scriptElements?: JSX.Element[];
    currentChapterName?: string;
    bottomSliderExpanded: boolean;
    showNotifications: boolean;
    downloadOffline: boolean;
    buffering: boolean;
    showContactWindow?: string;
    notificationPermission?: "granted" | "denied" | "default";
}

interface PlayerProps {
    scriptURL: string;
}

export class Frame extends React.Component<PlayerProps, PlayerState> {
    audioElement: HTMLAudioElement;
    chatWindow: ChatWindow | null;

    constructor(props) {
        super(props);
        this.state = {
            playState: PlayState.Paused,
            bottomSliderExpanded: false,
            showNotifications: false,
            downloadOffline: false,
            buffering: false
        };
        this.timeUpdate = this.timeUpdate.bind(this);
        this.playStateChange = this.playStateChange.bind(this);
        this.audioProgress = this.audioProgress.bind(this);
        this.toggleContactWindow = this.toggleContactWindow.bind(this);
        this.audioError = this.audioError.bind(this);
    }

    async loadData() {
        let absoluteURL = new URL(this.props.scriptURL, window.location.href);

        async function loadAndTransformData() {
            let response = await fetch(absoluteURL.href);
            let json = (await response.json()) as Script;

            json.audioFile = makeRelative(json.audioFile, absoluteURL.href);
            json.baseURL = new URL(".", absoluteURL.href).href;
            json.assets = json.assets.map(url => makeRelative(url, absoluteURL.href));
            json.dingFile = makeRelative(json.dingFile, absoluteURL.href);
            json.metadata.artwork = makeRelative(json.metadata.artwork, absoluteURL.href);
            return json;
        }

        Promise.all([loadAndTransformData(), fontsLoaded]).then(async ([json]) => {
            let cacheName = json.podcastId + "_" + json.episodeId;

            // If the cache already exists then we know we've at least attempted
            // to cache the podcast before now.
            let hasCacheAlready = "caches" in self && (await caches.has(cacheName));

            this.setState({
                script: json,
                scriptElements: mapScriptEntries(json, absoluteURL),
                downloadOffline: hasCacheAlready
            });
        });
    }

    shouldBeInitialView(state: PlayerState) {
        return (
            state.playback === undefined ||
            (state.playState === PlayState.Paused && state.playback.current === 0)
        );
    }

    toggleContactWindow(source?: string) {
        this.setState({
            showContactWindow: source
        });
    }

    audioError(e: React.SyntheticEvent<HTMLAudioElement>) {
        let source = e.target as HTMLAudioElement | HTMLSourceElement;
        if (source instanceof HTMLSourceElement) {
            source = source.parentNode as HTMLAudioElement;
        }
        console.log("error from", source);

        // if (!this.state.playback) {
        //     return;
        // }

        // let listener = () => {
        //     if (!this.state.playback) {
        //         throw new Error("OH NO");
        //     }
        //     console.log("loadstart again?", this.state.playback.current);
        //     (source as HTMLAudioElement).currentTime = this.state.playback.current;
        //     source.removeEventListener("loadstart", listener);
        // };
        // source.addEventListener("loadstart", listener);
        // source.load();
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
        let dingElement: JSX.Element | null = null;
        let contactBox: JSX.Element | null = null;
        let permissionWarning: JSX.Element | null = null;

        let chapterMarks: number[] = [];

        if (this.state.showNotifications === true && this.state.notificationPermission === "denied") {
            permissionWarning = (
                <NotificationPermissionBox
                    onClose={() =>
                        this.setState({
                            showNotifications: false
                        })
                    }
                />
            );
        }

        if (this.state.showContactWindow && this.state.script) {
            sendEvent("Web browser", "Ask Mona", this.state.showContactWindow);
            contactBox = (
                <ContactBox
                    source={this.state.showContactWindow}
                    onClose={() => this.toggleContactWindow(undefined)}
                    contact={this.state.script.contact}
                />
            );
        }

        if (this.state.script) {
            duration = this.state.script.metadata.length;

            audio = (
                <audio
                    // src={this.state.script.audioFile}
                    preload="auto"
                    // controls
                    // onProgress={this.audioProgress}
                    onEnded={() => {
                        sendEvent("Web browser", "Episode completed");
                        sendEvent("Web browser", "Minutes listened", "", this.audioElement.currentTime);
                    }}
                    onTimeUpdate={this.timeUpdate}
                    onPlay={this.playStateChange}
                    onPause={this.playStateChange}
                    onWaiting={() => this.setState({ buffering: true })}
                    // onPlaying={() => this.setState({ buffering: false })}
                    onError={this.audioError}
                    onAbort={() => console.warn("abort!")}
                    // onEnded={() => console.warn("ended!")}
                    // onStalled={() => console.warn("stalled!")}
                    onLoadStart={() => this.setState({ buffering: true })}
                    onCanPlayThrough={() => this.setState({ buffering: false })}
                    title={this.state.currentChapterName}
                    style={{ position: "absolute", zIndex: 100 }}
                    ref={el => (this.audioElement = el as HTMLAudioElement)}
                >
                    <source src={this.state.script.audioFile} />
                </audio>
            );

            dingElement = (
                <Ding audioURL={this.state.script.dingFile} getMainAudioElement={() => this.audioElement} />
            );

            chapterMarks = this.state.script.chapters.map(c => c.time);
        }

        let isInitialView = this.shouldBeInitialView(this.state);
        // this.state.playback === undefined ||
        // (this.state.playState === PlayState.Paused && this.state.playback.current === 0);

        return (
            <div className={styles.frame} onTouchMove={e => e.preventDefault()}>
                {audio}
                {dingElement}
                <Header
                    metadata={this.state.script ? this.state.script.metadata : undefined}
                    showExpanded={isInitialView}
                />
                <ChatWindow
                    script={this.state.script}
                    currentTime={this.state.playback ? this.state.playback.current : 0}
                    elements={this.state.scriptElements}
                    ref={el => (this.chatWindow = el)}
                    playDings={this.state.playback ? !this.state.playback.manuallyScrubbed : true}
                />
                <BottomSlider
                    className={styles.controls}
                    bottomElement={
                        <BottomInfo
                            offlineDownloadEnabled={this.state.downloadOffline}
                            offlineDownloadChange={newValue => this.setState({ downloadOffline: newValue })}
                            script={this.state.script}
                            alertsEnabled={this.state.showNotifications}
                            onAlertChange={newSetting => this.setNotificationSetting(newSetting)}
                        />
                    }
                    expanded={this.state.bottomSliderExpanded}
                >
                    <ProgressSlider
                        length={duration}
                        currentPosition={currentPosition}
                        chapters={chapterMarks}
                        onSliderChange={newTime => this.setTime(newTime, false)}
                    />
                    <div className={styles.timeAndChapter}>
                        <TimeFormatter
                            time={this.state.playback ? this.state.playback.current : 0}
                            className={styles.timeBlock}
                        />
                        <div className={styles.currentChapterName}>
                            {this.state.buffering ? "Buffering..." : this.state.currentChapterName}
                        </div>
                        <TimeFormatter
                            time={
                                this.state.playback
                                    ? this.state.playback.total - this.state.playback.current
                                    : undefined
                            }
                            className={styles.timeBlock + " " + styles.timeLeft}
                        />
                    </div>
                    <Controls
                        onPlay={() => {
                            sendEvent("Web browser", "Play");
                            this.play();
                        }}
                        onPause={() => {
                            sendEvent("Web browser", "Pause");
                            this.pause();
                        }}
                        onRewind={() => {
                            sendEvent("Web browser", "15 seconds backwards");
                            this.setTime(-15, true);
                        }}
                        onFastForward={() => {
                            sendEvent("Web browser", "15 seconds forward");
                            this.setTime(15, true);
                        }}
                        onSkipBack={() => this.moveChapter(-1)}
                        onSkipForward={() => this.moveChapter(1)}
                        canPlay={this.state.playState == PlayState.Paused}
                        canPause={this.state.playState == PlayState.Playing}
                        onBottomToggle={() => {
                            sendEvent(
                                "Web browser",
                                this.state.bottomSliderExpanded ? "Close episode menu" : "Open episode menu"
                            );
                            this.setState({ bottomSliderExpanded: !this.state.bottomSliderExpanded });
                        }}
                    />
                    <StartButton
                        display={isInitialView}
                        onPlay={show => this.playWithNotificationSetting(show)}
                        onNotificationPermissionChange={() => {}}
                    />
                </BottomSlider>
                {contactBox}
                <SideMenu
                    script={this.state.script}
                    toggleContactBox={this.toggleContactWindow}
                    isPlaying={this.state.playback !== undefined}
                    scriptURL={this.props.scriptURL}
                />
                {permissionWarning}
            </div>
        );
    }

    setNotificationSetting(showNotifications: boolean) {
        setNotificationEnableState(showNotifications);
        this.setState({
            showNotifications
        });
    }

    playWithNotificationSetting(showNotifications: boolean) {
        this.setNotificationSetting(showNotifications);
        this.play();
    }

    play() {
        this.nextSecondTimeout = undefined;
        this.audioElement.play().catch(console.error);

        if (!this.state.playback) {
            this.setState({
                playback: {
                    current: 0.1,
                    total: -1,
                    manuallyScrubbed: false
                }
            });
        }
    }

    pause() {
        this.audioElement.pause();
        if (this.nextSecondTimeout) {
            clearTimeout(this.nextSecondTimeout);
        }
        this.nextSecondTimeout = undefined;
        sendEvent("Web browser", "Minutes listened", "", this.audioElement.currentTime / 60);
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
        if (this.nextSecondTimeout) {
            clearTimeout(this.nextSecondTimeout);
            this.nextSecondTimeout = undefined;
        }
        this.setState({
            playback: {
                total: this.audioElement.duration,
                current: this.audioElement.currentTime,
                manuallyScrubbed: true
            }
        });
    }

    async componentDidMount() {
        // hackidy hack
        setShowOrHideFunction(this.toggleContactWindow);

        this.loadData();

        if ("mediaSession" in navigator) {
            let mediaSession = (navigator as any).mediaSession;

            mediaSession.setActionHandler("play", () => {
                sendEvent("Lockscreen player", "Play");
                this.play();
            });
            mediaSession.setActionHandler("pause", () => {
                sendEvent("Lockscreen player", "Pause");
                this.pause();
            });
            mediaSession.setActionHandler("seekbackward", () => {
                sendEvent("Web browser", "15 seconds backwards");
                this.setTime(-15, true);
            });
            mediaSession.setActionHandler("seekforward", () => {
                sendEvent("Web browser", "15 seconds forward");
                this.setTime(15, true);
            });
        }

        if (!("permissions" in navigator)) {
            return;
        }

        let notificationPermission = await (navigator as any).permissions.query({ name: "notifications" });
        console.info("PERMISSIONS: existing notification permission is", notificationPermission.state);
        this.setState({
            notificationPermission: notificationPermission.state
        });
        notificationPermission.onchange = () => {
            console.info("PERMISSIONS: notification permission changed to", notificationPermission.state);
            this.setState({
                notificationPermission: notificationPermission.state
            });
        };
    }

    nextSecondTimeout: number | undefined;

    timeUpdate(e: React.SyntheticEvent<HTMLAudioElement>) {
        let currentTime = this.audioElement.currentTime;
        let nextSecond = Math.ceil(currentTime);
        let untilNextSecond = nextSecond - currentTime;

        if (this.nextSecondTimeout || this.audioElement.paused === true) {
            return;
        }
        this.nextSecondTimeout = setTimeout(() => {
            this.nextSecondTimeout = undefined;
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
                    current: nextSecond,
                    total: this.audioElement.duration,
                    manuallyScrubbed: false
                },
                currentChapterName: chapterName
            });
        }, untilNextSecond * 1000);
    }

    audioProgress(e) {
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

        if (this.audioElement.paused && this.nextSecondTimeout) {
            clearTimeout(this.nextSecondTimeout);
        }
    }

    componentDidUpdate(oldProps, oldState: PlayerState) {
        if (
            this.chatWindow &&
            this.shouldBeInitialView(this.state) === false &&
            this.shouldBeInitialView(oldState) === true
        ) {
            // If we've moved from initial to non-initial then the scrollview size
            // will have changed (after the header shrinks). So we need to make sure
            // the scrollview updates accordingly.
            this.chatWindow.refreshScrollViewSize();
        }

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
            artwork: [{ src: this.state.script.metadata.artwork, sizes: "3001x3001", type: "image/jpg" }]
        });
    }
}

declare var MediaMetadata;
