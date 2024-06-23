import { saveNotification } from "../dao/NotificationDao.js";

export const sendNotification = async (params) => {
    try {
        // Crear un nuevo Notification
        const notification = {
            readed: false,
            user_notificated: params.user_notificated,
            user_action: params.user_action,
            reference_id: params.reference_id, // referenciaModelo es un campo virtual que se utilizará para determinar si la referencia es para un Receta o un Comentario
            referenceModelo: params.referenceModelo,
            action: params.action
        };

        // Guardar la notificación y obtener el registro guardado
        const newNotification = await saveNotification(notification);

        // Devolver el nuevo registro
        return newNotification;

    } catch (error) {
        console.error('Error al registrar notificacion:', error);
    }
}