const asyncHandler = require('express-async-handler');
const { CommentsDao } = require('../model/dao/comment.dao');
const { CommentsDto } = require('../model/dto/comment.dto');
const { FeedsDto } = require('../model/dto/feed.dto');
const { CommentsValidator } = require('../validations/comment.validation');


class CommentsController {

    /**
     * @desc create a new comment
     * @route /api/v1/circles/feeds/:feedId/users/:userId/comments/
     * @method POST
     * @access public
     */
    static createComment = asyncHandler(async (req, res) => {

        const commentDto = new CommentsDto(req.body);
        commentDto.feedId = req.params.feedId;
        commentDto.userId = req.params.userId;

        const error = CommentsValidator.createComment(commentDto);

        if (error && error.error && error.error.details && error.error.details[0]) {
            res.status(400).json({ message: error.error.details[0].message });
        }
        
        const commentDao = new CommentsDao();
        try {
            const comment = await commentDao.createComment(commentDto);
            res.status(201).json(comment);
        } catch (err) {

            const prefixes = ['User', 'Feed', 'Comment'];
            if (prefixes.some(prefix => err.message.startsWith(prefix))) {
                res.status(409).json({ message: err.message });
            }
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });


    /**
     * @desc get comments by feedId id
     * @route /api/v1/circles/feeds/:feedId/comments/
     * @method GET
     * @access public
     */
    static getCommentsByFeedId = asyncHandler(async (req, res) => {
        const feedDto = new FeedsDto(req.body);
        feedDto.id = req.params.feedId;

        const commentDao = new CommentsDao();

        try {
            const comments = await commentDao.getCommentsByFeedId(feedDto);
            res.status(200).json(comments);  
        } catch (err) {

            if (err.message === 'Feed Id is invalid.') res.status(404).json({ message: err.message});

            res.status(500).json({ message: 'Internal Server Error' });
        } 
    });

    /**
     * @desc update comment by id
     * @route /api/v1/circles//feeds/:feedId/users/:userId/comments/:commentId
     * @method PUT
     * @access public
     */
    static updateCommentById = asyncHandler(async (req, res) => {
        const commentDto = new CommentsDto(req.body);
        commentDto.id = req.params.commentId;
        commentDto.feedId = req.params.feedId;
        commentDto.userId = req.params.userId;

        const commentDao = new CommentsDao();
        const error = CommentsValidator.updateComment(commentDto);

        if (error && error.error && error.error.details && error.error.details[0]) {
            res.status(400).json({ message: error.error.details[0].message });
        }

        try {
            await commentDao.updateCommentById(commentDto);
            res.status(201).json({ message: 'Comment updated successfully' }); ;
        } catch (err) {
            if (err.message === 'Comment Id is invalid.') {
                res.status(409).json({ message: err.message });
            } else if (err.code === 'P2025' && err.meta?.cause === 'Record to update not found.') {
                res.status(409).json({ message: 'Comment Id is invalid.' });
            }
            res.status(500).json({ message: 'Internal Server Error' });   
        }
    });

    /**
     * @desc delete comment by id
     * @route /api/v1/circles//feeds/:feedId/users/:userId/comments/:commentId
     * @method DELETE
     * @access public
     */
    static deleteCommentById = asyncHandler(async (req, res) => {
        const commentDto = new CommentsDto(req.body);
        commentDto.id = req.params.commentId;
        commentDto.feedId = req.params.feedId;
        commentDto.userId = req.params.userId;

        const commentDao = new CommentsDao();
        try {
            await commentDao.deleteCommentById(commentDto);
            res.status(201).json({ message: 'Comment deleted successfully' }); ;
        } catch (err) {
            if (err.message === 'Comment Id is invalid.') {
                res.status(409).json({ message: err.message });
            } else if (err.code === 'P2025' && err.meta?.cause === 'Record to update not found.') {
                res.status(409).json({ message: 'Comment Id is invalid.' });
            }
            res.status(500).json({ message: 'Internal Server Error' });   
        }
    });
}

module.exports = { CommentsController }