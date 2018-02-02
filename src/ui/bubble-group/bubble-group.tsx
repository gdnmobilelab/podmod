import * as React from "react";
import { ShowNotification } from "../../interfaces/notification";
import { makeRelative } from "../../interfaces/script";
import { sendNotification, removeNotification } from "../../util/notification-dispatch";
import { activeDing } from "../ding/ding";

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

        if (document.visibilityState === "visible" || !this.props.notification) {
            // If the user is currently on the page we don't show these notifications
            return;
        }

        let data = Object.assign({}, this.props.notification.data, {
            uuid: this.state.uuid
        });

        let notificationOptions: ShowNotification = Object.assign({}, this.props.notification, {
            data
        });

        sendNotification(notificationOptions);
    }

    async componentWillUnmount() {
        removeNotification(this.state.uuid);
    }
}
