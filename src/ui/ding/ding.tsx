import * as React from "react";
import { PendingPromise } from "../../util/pending-promise";

interface DingProps {
    audioURL: string;
    getMainAudioElement: () => HTMLAudioElement;
}

async function performFade(el: HTMLAudioElement, from: number, to: number) {
    let startTime = Date.now();
    let duration = 200;

    let { promise, fulfill, reject } = new PendingPromise<void>();

    function doFade() {
        let rightNow = Date.now();
        if (rightNow - startTime > duration) {
            el.volume = to;
            fulfill();
            return;
        }
        let soFar = (rightNow - startTime) / duration;

        let volumeSoFar = (from - to) * soFar;

        el.volume = from - volumeSoFar;

        // requestAnimationFrame(doFade);
        // can't use requestAnimationFrame as it doesn't fire when the tab is inactive
        setTimeout(doFade, 1);
    }

    doFade();

    return promise;
}

async function playInFull(el: HTMLAudioElement) {
    let { promise, fulfill } = new PendingPromise<Event>();

    el.addEventListener("ended", fulfill);
    el.play();

    await promise;
    el.currentTime = 0;
    el.removeEventListener("ended", fulfill);
}

// Total hack but the React model is getting in the way here.
export let activeDing: Ding | undefined;

export class Ding extends React.Component<DingProps, any> {
    dingAudioElement: HTMLAudioElement | null;

    shouldPlayDings: boolean = true;

    constructor(props) {
        super(props);
        this.activateAudioElement = this.activateAudioElement.bind(this);
    }

    render() {
        return (
            <audio
                src={this.props.audioURL}
                loop={false}
                ref={el => (this.dingAudioElement = el)}
                preload="auto"
            />
        );
    }

    async ding() {
        if (this.shouldPlayDings === false) {
            console.warn("DING: wanted to ding, but it's disabled");
            return;
        }
        console.info("DING: dinging");
        if (!this.dingAudioElement) {
            throw new Error("Tried to play 'ding' element, but it didn't exist");
        }

        let targetAudioElement = this.props.getMainAudioElement();

        await performFade(targetAudioElement, 1, 0.3);
        await playInFull(this.dingAudioElement);
        await performFade(targetAudioElement, 0.3, 1);
    }

    componentDidMount() {
        // We need to get this to play in reaction to a touch event, so that we're
        // able to freely play it later. So we set up this touch handler.
        console.info("DING: adding touchstart listener");
        document.addEventListener("touchend", this.activateAudioElement);
        if (activeDing) {
            throw new Error("Can only have one active ding element!");
        }
        activeDing = this;
    }

    componentWillUnmount() {
        document.removeEventListener("touchend", this.activateAudioElement);
    }

    async activateAudioElement() {
        if (!this.dingAudioElement) {
            throw new Error("Tried to activate 'ding' element, but it didn't exist");
        }
        console.info("DING: activating <audio> element");
        document.removeEventListener("touchend", this.activateAudioElement);
        this.dingAudioElement.volume = 0;
        await this.dingAudioElement.play();
        this.dingAudioElement.pause();
        // this.dingAudioElement.currentTime = 0;
        this.dingAudioElement.volume = 1;
    }
}
