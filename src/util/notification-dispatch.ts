import { ShowNotification } from "../interfaces/notification";
import { runServiceWorkerCommand } from "service-worker-command-bridge";

let sendNotifications = false;

export function setNotificationEnableState(enabled: boolean) {
    console.info("Setting notification enabled state to", enabled);
    sendNotifications = enabled;
}

export function getNotificationEnableState() {
    return sendNotifications;
}

export async function sendNotification(opts: ShowNotification) {
    if (sendNotifications === false) {
        console.info(`Suppressing notification with title ${opts.title}...`);
        return;
    }
    await runServiceWorkerCommand<ShowNotification, void>("show-notification", opts);
}

export async function removeNotification(uuid: string) {
    runServiceWorkerCommand<any, void>("remove-notification", {
        uuid
    });
}
