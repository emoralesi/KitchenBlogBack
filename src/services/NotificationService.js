import { saveNotification } from "../dao/NotificationDao";

export const guardarNotification = async (params, res) => {
    try {

        // Crear un nuevo Notification
        const notification = {
            content: params.content,
            user: params.user,
            post: params.post,
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