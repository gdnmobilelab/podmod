import "photoswipe/dist/photoswipe.css";
import "photoswipe/dist/default-skin/default-skin.css";
import GalleryTemplate from "./html-template";
import * as React from "react";
import * as PhotoSwipeLib from "photoswipe";
import * as PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";

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
}

interface PhotoSwipeProperties {
    items: PhotoSwipeImage[];
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
        console.log(PhotoSwipeLib);
        let gallery = new PhotoSwipeLib(el, PhotoSwipeUI_Default, this.props.items);
        gallery.init();

        gallery.listen("destroy", this.galleryDestroyed);

        this.setState({
            galleryContainer: el,
            gallery: gallery
        });
    }

    galleryDestroyed() {
        console.log("DESTROY");
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
