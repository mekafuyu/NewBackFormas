const express = require('express');
const router = express.Router();
const gameController = require('../controller/gameController');


router
    .post('/ready', gameController.postReady)
    .patch('/update-weights/:code', gameController.patchUpdateWeights)
    .patch('/final-answer/:code', gameController.patchFinalAnswer)
    .post('/test-scales', gameController.postTestScales)
    .post('/scales/:code', gameController.postScales)
    .get('/getplayers/:code', gameController.getPlayers)
    .get('/getstatus/:gCode/:pCode', gameController.getStatus)
    .get('/newGame', gameController.getNewGame)
    .get('/game/:code', gameController.getGame)
    .get('/test', gameController.getTest)
    .get('/dashboard/:code', gameController.getDashboard)
    .get('/history', gameController.getHistory)
    .get('/finished', gameController.getFinish)

module.exports = router;



