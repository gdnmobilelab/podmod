import { NotificationBridge } from "./notification";
import { Comlink } from "comlinkjs";

export class WorkerBridge {
    async what() {
        console.log("whaa");
    }
    notification: NotificationBridge = new NotificationBridge();
}
