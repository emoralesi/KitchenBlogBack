import Comment from "../models/commentModel.js";
import { ObjectId } from 'mongodb';

export const saveComment = async (comment) => {
    try {
        const comments = new Comment(comment);
        return await comments.save();
    } catch (error) {
        throw error;
    }
}

export const getPostUserIdByComment = async (id) => {
    const idComment = new ObjectId(id);
    try {
        const UserId = Comment.aggregate(
            [
                {
                    $match: {
                        _id: idComment
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        localField: 'post',
                        foreignField: '_id',
                        as: 'result'
                    }
                }
            ]
        );
        console.log("dao post user", UserId);
        return UserId;
    } catch (error) {
        throw error
    }
}

export const getCommentUserIdByComment = async (id) => {
    const idComment = new ObjectId(id);

    try {
        const UserId = Comment.aggregate(
            [
                {
                    $match: {
                        _id: idComment
                    }
                },
                {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "parentComment",
                        as: "result"
                    }
                },
                {
                    $project: {
                        "result.user": 1,
                        _id: 0,
                        "user": 2
                    }
                }
            ]

        );
        console.log("Dao", UserId);
        return UserId;
    } catch (error) {
        throw error
    }
}

export default { saveComment, getCommentUserIdByComment, getPostUserIdByComment }