import * as React from "react";
import { ShowNotification } from "worker-commands";
import { makeRelative } from "../../interfaces/script";
import { sendNotification, removeNotification } from "../../util/notification-dispatch";
import { activeDing } from "../ding/ding";
import { sendEvent } from "../../util/analytics";

const ALWAYS_SHOW_NOTIFICATIONS =
    process.env.NODE_ENV === "development" && window.location.href.indexOf("alwaysShow=1") > -1;

interface BubbleGroupProperties {
    notification?: ShowNotification;
    silent: boolean;
}

interface BubbleGroupState {
    uuid: string;
}

function generateRandomishUUID() {
    // https://stackoverflow.com/a/44078785/470339
    return (
        Math.random()
            .toString(36)
            .substring(2) + new Date().getTime().toString(36)
    );
}

export class BubbleGroup extends React.Component<BubbleGroupProperties, BubbleGroupState> {
    constructor(props) {
        super(props);
        this.state = {
            uuid: generateRandomishUUID()
        };
    }

    render() {
        return this.props.children;
    }

    componentDidMount() {
        if (this.props.silent === false) {
            activeDing!.ding();
        }

        if (this.props.notification) {
            sendEvent("Web browser", "Shows", this.props.notification.body);
        }

        if (
            ALWAYS_SHOW_NOTIFICATIONS === false &&
            (document.visibilityState === "visible" || !this.props.notification)
        ) {
            // If the user is currently on the page we don't show these notifications
            return;
        }

        let notificationOptions: ShowNotification = Object.assign({}, this.props.notification, {
            tag: this.state.uuid
        });

        sendNotification(notificationOptions);
    }

    async componentWillUnmount() {
        removeNotification(this.state.uuid);
    }
}
