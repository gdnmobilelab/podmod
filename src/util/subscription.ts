import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { UnsubscribeOptions, SubscribeOptions } from "pushkin-client";
export const PushSupported = "PushManager" in self;

export async function checkIfSubscribed(topicName: string) {
    let topics = await runServiceWorkerCommand<void, string[]>("get-subscribed-topics");
    return topics.indexOf(topicName) > -1;
}

export async function subscribe(topicName: string) {
    await runServiceWorkerCommand<SubscribeOptions, any>("push-subscribe", {
        topic: topicName,
        confirmationPayload: {
            __workerCommandPayload: {
                command: "notification.show",
                options: {
                    title: "You are subscribed",
                    body: "We'll send you a notification like this when a new episode is published.",
                    events: {
                        onclick: [
                            {
                                command: "clients.focus"
                            },
                            {
                                command: "notification.close"
                            }
                        ]
                    }
                }
            }
        },
        confirmationIOS: {
            title: "__",
            body: "__"
        }
    });
}

export async function unsubscribe(topicName: string) {
    await runServiceWorkerCommand<UnsubscribeOptions, any>("push-unsubscribe", {
        topic: topicName
    });
}
