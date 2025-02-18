import { getNotifications, NotiReaded, saveNotification } from "../dao/NotificationDao.js";

export const guardarNotification = async (params, res) => {
    try {

        // Crear un nuevo Notification
        const notification = {
            content: params.content,
            user: params.user,
            receta: params.receta,
            reactions: params?.reactions,
            parentComment: params?.parentComment
        };

        const newNotificaiton = await saveNotification(notification);

        return res.status(200).json({ status: 'ok', notification: newNotificaiton, message: 'Notificacion registrado con éxito' });

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}

export const obtenerNotificationes = async (params, res) => {
    try {

        const Notifications = await getNotifications(params.idNotificated, params.page, params.limit);

        return res.status(200).json({ status: 'ok', notifications: Notifications.notifications, total: Notifications.totalCount, totalUnread: Notifications.totalUnreadCount, message: 'Notificaciones Obtenidas' });

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}

export const readedActionNotification = async (params, res) => {
    try {

        const Notifications = await NotiReaded(params.idNotifications);

        return res.status(200).json({ status: 'ok', notifications: Notifications, message: 'Notificaciones Leidas' });

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}