export interface ShowNotification {
    title: string;
    icon: string;
    body?: string;
    data?: any;
    image?: string;
    actions?: NotificationAction[];
    badge: string;
}

export interface NotificationAction {
    title: string;
    action: string;
}
