import { ShowNotification, RunCommand, RemoveNotificationOptions } from "worker-commands";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { sendEvent } from "./analytics";

let sendNotifications = false;

export function setNotificationEnableState(enabled: boolean) {
    console.info("Setting notification enabled state to", enabled);
    sendEvent("Web browser", "Allow notifications", enabled ? "Allow" : "Block");

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
    await runServiceWorkerCommand<RunCommand<ShowNotification>, void>("fire-worker-command", {
        command: "notification.show",
        options: opts
    });
}

export async function removeNotification(uuid: string) {
    await runServiceWorkerCommand<RunCommand<RemoveNotificationOptions>, void>("fire-worker-command", {
        command: "notification.close",
        options: {
            tag: uuid
        }
    });
}
