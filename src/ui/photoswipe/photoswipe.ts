import "photoswipe/dist/photoswipe.css";
import "photoswipe/dist/default-skin/default-skin.css";
import GalleryTemplate from "./html-template";
import * as React from "react";
import * as PhotoSwipeLib from "photoswipe/dist/photoswipe.min";
import * as PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default.min";

let container: Element | undefined = undefined;

export function getPhotoSwipeContainer() {
    if (!container) {
        document.body.innerHTML += GalleryTemplate;
        container = document.getElementsByClassName("pswp")[0]!;
    }
    return container!;
}

interface PhotoSwipeImage {
    src: string;
    w: number;
    h: number;
    title: string;
}

interface PhotoSwipeCustomHTML {
    html: string;
    title: string;
}

interface PhotoSwipeProperties {
    items: (PhotoSwipeImage | PhotoSwipeCustomHTML)[];
    onClose?: () => void;
}

interface PhotoSwipeState {
    galleryContainer?: Element;
    gallery?: PhotoSwipeLib;
}

export class PhotoSwipe extends React.Component<PhotoSwipeProperties, PhotoSwipeState> {
    constructor(props) {
        super(props);
        this.state = {};
        this.galleryDestroyed = this.galleryDestroyed.bind(this);
    }

    render() {
        return null;
    }

    componentDidMount() {
        let actualContainer = document.createElement("div");
        actualContainer.innerHTML = GalleryTemplate;
        let el = actualContainer.getElementsByClassName("pswp")[0]!;
        document.body.appendChild(actualContainer);
        let gallery = new PhotoSwipeLib(el, PhotoSwipeUI_Default, this.props.items);
        gallery.init();

        gallery.listen("destroy", this.galleryDestroyed);

        // Links in captions seem to do weird things. We need to catch the event.

        Array.from(el.querySelectorAll(".pswp__caption a")).forEach(el => {
            el.addEventListener("touchstart", e => e.stopPropagation());
        });

        this.setState({
            galleryContainer: el,
            gallery: gallery
        });
    }

    galleryDestroyed() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    componentWillUnmount() {
        if (this.state.galleryContainer) {
            document.body.removeChild(this.state.galleryContainer.parentNode!);
        }
    }
}
