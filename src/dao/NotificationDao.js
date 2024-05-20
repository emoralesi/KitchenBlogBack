import Notification from "../models/NotificationModel.js";


export const saveNotification = async (notification) => {
    try {
        const notifications = new Notification(notification);
        return await notifications.save();
    } catch (error) {
        throw error;
    }
}

export default { saveNotification }