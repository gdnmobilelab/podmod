import Analytics from "google-analytics-protocol";

if (ANALYTICS_ID) {
    Analytics.setAnalyticsID(ANALYTICS_ID);
} else {
    console.info("No analytics ID provided");
}

export function sendEvent(
    category: string,
    action: string = "",
    label: string = "",
    value: number | undefined = undefined
) {
    let toSend = {
        t: "event",
        ec: category,
        ea: action,
        el: label,
        ev: value,
        cd1: "{{clientId}}"
    };

    if (!ANALYTICS_ID) {
        return console.info("ANALYTICS: event", toSend);
    }
    Analytics(toSend);
}

export function sendPageView(url: string, title?: string) {
    let brokenApart = new URL(url);

    let toSend = {
        t: "pageview",
        dh: brokenApart.hostname,
        dp: brokenApart.pathname,
        dt: title,
        cd1: "{{clientId}}",
        dr: document.referrer
    };

    if (!ANALYTICS_ID) {
        return console.info("ANALYTICS: pageview", toSend);
    }

    Analytics(toSend);
}
