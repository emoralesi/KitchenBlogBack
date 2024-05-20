import { savePost } from "../dao/PostDao.js";
import { obtenerPostByIdUser } from "../dao/UserDao.js"

export const GetPostsByIdUser = async (params, res) => {

    try {

        const posts = await obtenerPostByIdUser(params.id);

        if (posts[0].posteos.length > 0) {
            res.status(200).json({ status: 'ok', message: 'Se encontraron ' + posts[0].posteos.length + ' posts', posts: posts });
        } else {
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Posts' });
        }

    } catch (error) {
        console.error('Error al obtener usuarios posts:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener posts usuarios' });
    }

}

export const guardarPost = async (params, res) => {

    try {

        // Crear un nuevo usuario
        const post = {
            title: params.title,
            content: params.content,
            user: params.user,
        };

        const newPost = await savePost(post);

        return res.status(200).json({ post: newPost, message: 'Post registrado con éxito' });

    } catch (error) {
        console.error('Error al registrar post:', error);
        return res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
    }

}