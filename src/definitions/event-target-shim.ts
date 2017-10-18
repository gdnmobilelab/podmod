let globalEventTarget = EventTarget;

declare module "event-target-shim" {
    export class EventTarget extends globalEventTarget {}
}
