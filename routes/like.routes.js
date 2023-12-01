const router = require('express').Router();
const { LikesController } = require('../controllers/like.controller')

router
    .route('/:circleId/feeds/:feedId/likes')
    .post(LikesController.createLike)
    .get(LikesController.getLikesByFeedId)
    .delete(LikesController.deleteLikeById);

module.exports = { router };
