import { ClientBridge } from "../bridge/client-bridge";
import { PendingPromise } from "../util/pending-promise";

async function showNotification() {
    (await ClientBridge).notification.showNotification("test notification", {});
}

function performFade(from: number, to: number) {
    let startTime = Date.now();
    let targetVolume = to;
    let duration = 200;

    let { promise, fulfill, reject } = new PendingPromise<void>();

    function doFade() {
        let rightNow = Date.now();
        if (rightNow - startTime > duration) {
            audioTag.volume = targetVolume;
            fulfill();
            return;
        }
        let soFar = (rightNow - startTime) / duration;

        let volumeSoFar = (from - targetVolume) * soFar;

        audioTag.volume = from - volumeSoFar;

        requestAnimationFrame(doFade);
    }

    doFade();

    return promise;
}

async function fadeNotification() {
    await Notification.requestPermission();
    performFade(1, 0.3).then(() => {
        beep.onended = () => {
            performFade(0.3, 1);
        };
        beep.play();
    });
    (await ClientBridge).notification.showNotification("Mona", {
        body: "This is the link I was talking about [www.whatever.com]",
        silent: true,
        tag: "blah",
        icon: "/bundles/mona-ep-1/mona-headshot.png"
    } as any);
}

let audioTag: HTMLAudioElement;
let beep: HTMLAudioElement;

document.addEventListener("click", e => {
    console.log("TOUCHSTART");
    beep.volume = 0.5;
    beep.play().then(() => beep.pause());
});

declare const MediaMetadata: any;

export function createAudioTest() {
    let media = (navigator as any).mediaSession;
    if (media) {
        media.metadata = new MediaMetadata({
            title: "Episode 1: Plan P",
            artist: "Guardian US",
            album: "Chances Are",
            artwork: [{ src: "podcast.jpg" }]
        });
        media.setActionHandler("play", function() {});
        media.setActionHandler("pause", function() {});
        media.setActionHandler("seekbackward", function() {});
        media.setActionHandler("seekforward", function() {});
        media.setActionHandler("previoustrack", function() {});
        media.setActionHandler("nexttrack", function() {});
    }

    return (
        <div>
            <audio
                src="./bundles/mona-ep-1/Data_Pod_E01_v3_192519.mp3"
                controls
                ref={el => (audioTag = el as any)}
            />
            <audio
                src="./bundles/mona-ep-1/alert-noise3.mp3"
                ref={el => (beep = el as any)}
            />
            <button onClick={showNotification}>Normal notification</button>
            <button onClick={fadeNotification}>Custom notification</button>
        </div>
    );
}
