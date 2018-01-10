export function sendEvent(
    category: string,
    action: string = "",
    label: string = "",
    value: number | undefined = undefined
) {
    console.info("Sending analytics event:", { category, action, label, value });
}
