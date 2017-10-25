import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { ShowNotification } from "./interfaces/notification";

function go() {
    console.log("wtf");
    Notification.requestPermission().then(() => {
        console.log("do it?");
        // return runServiceWorkerCommand<ShowNotification>("show-notification", {
        //     title: "test!"
        // });
    });
}

export const div = <div onClick={go}>whaaaa</div>;
