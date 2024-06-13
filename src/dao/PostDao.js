import Post from '../models/postModel.js';
import { ObjectId } from 'mongodb';

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

export const getPostComentReactions = async (idPost) => {
    const postId = new ObjectId(idPost);
    try {
        return await Post.aggregate(
            [
                {
                    $match: { _id: postId }
                },
                {
                    $lookup: {
                        from: "comments",
                        let: { postId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$post", "$$postId"] },
                                    $or: [
                                        { "parentComment": null },
                                        { "parentComment": { $exists: false } }
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    from: "comments",
                                    localField: "_id",
                                    foreignField: "parentComment",
                                    as: "responses"
                                }
                            }
                        ],
                        as: "comments"
                    }
                },
                {
                    $addFields: {
                        comments: {
                            $cond: {
                                if: { $eq: [{ $size: "$comments" }, 0] },
                                then: [],
                                else: "$comments"
                            }
                        }
                    }
                }
            ])
    } catch (error) {
        throw error;
    }
}

export default { savePost, getPostComentReactions }