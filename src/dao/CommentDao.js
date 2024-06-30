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

export const updateCommentReaction = async (idComment, update) => {
    try {
        const updateReaction = await Comment.findByIdAndUpdate(
            idComment,
            update
        );
        return updateReaction
    } catch (error) {
        console.log(error);
    }

    return updatedUser;
}

export const getRecetaUserIdByComment = async (id) => {
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
                        from: 'recetas',
                        localField: 'receta',
                        foreignField: '_id',
                        as: 'result'
                    }
                }
            ]
        );
        console.log("dao receta user", UserId);
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

export const getCommentOwnerByParentComment = async (id) => {
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
                        localField: "parentComment",
                        foreignField: "_id",
                        as: "OwnerComment"
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


export default { saveComment, getCommentUserIdByComment, getRecetaUserIdByComment, getCommentOwnerByParentComment }