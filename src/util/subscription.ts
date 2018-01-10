import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { UnsubscribeOptions, SubscribeOptions } from "pushkin-client";
export const PushSupported = "PushManager" in self;

export async function checkIfSubscribed(topicName: string) {
    let topics = await runServiceWorkerCommand<void, string[]>("get-subscribed-topics");
    return topics.indexOf(topicName) > -1;
}

export async function subscribe(topicName: string) {
    await runServiceWorkerCommand<SubscribeOptions, any>("push-subscribe", {
        topic: topicName
    });
}

export async function unsubscribe(topicName: string) {
    await runServiceWorkerCommand<UnsubscribeOptions, any>("push-unsubscribe", {
        topic: topicName
    });
}
