import Post from '../models/postModel.js';

export const savePost = async (post) => {
    try {
        const posts = new Post(post);
        return await posts.save();
    } catch (error) {
        throw error;
    }
}

export const getUserByPostId = async (id) => {
    try {

    } catch (error) {
        throw error
    }
}

export default { savePost }