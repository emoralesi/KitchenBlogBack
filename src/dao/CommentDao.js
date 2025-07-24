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

export const getAnswerdOfComment = async (parentComment) => {
    const idComment = new ObjectId(parentComment);

    try {
        const comments = Comment.aggregate([
            {
                $match: { parentComment: idComment }
            }
        ])
        return comments
    } catch (error) {
        console.log(error)
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
        const UserId = await Comment.aggregate(
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
        return UserId;
    } catch (error) {
        throw error
    }
}

export const getCommentUserIdByComment = async (id) => {
    const idComment = new ObjectId(id);

    try {
        const UserId = await Comment.aggregate(
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
        return UserId;
    } catch (error) {
        throw error
    }
}

export const getCommentById = async (id) => {
    const idComment = new ObjectId(id);

    try {
        const comment = await Comment.aggregate(
            [
                {
                    $match: {
                        _id: idComment
                    }
                }
            ]
        );
        return comment;
    } catch (error) {
        throw error
    }
}

export const getCommentOwnerByParentComment = async (id) => {
    const idComment = new ObjectId(id);

    try {
        const UserId = await Comment.aggregate(
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
        return UserId;
    } catch (error) {
        throw error
    }
}


export default { saveComment, getCommentUserIdByComment, getRecetaUserIdByComment, getCommentOwnerByParentComment }