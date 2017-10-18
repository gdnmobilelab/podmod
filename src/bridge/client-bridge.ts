import { Comlink } from "comlinkjs";
import { WorkerBridge } from "./worker-bridge";

declare var navigator: Navigator;

export const ClientBridge = (async function() {
    let reg = await navigator.serviceWorker.ready;
    let channel = new MessageChannel();
    reg.active.postMessage("comlink", [channel.port1]);
    let proxy: any = Comlink.proxy(channel.port2);
    return (await new proxy.WorkerBridge()) as WorkerBridge;
})();
