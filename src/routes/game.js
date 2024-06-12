const express = require('express');
const router = express.Router();
const gameController = require('../controller/gameController');


router
    .post('/ready', gameController.postReady)
    .patch('/update-weights/:code', gameController.patchUpdateWeights)
    .patch('/final-answer/:code', gameController.patchFinalAnswer)
    .post('/test-scales', gameController.postTestScales)
    .post('/scales/:code', gameController.postScales)
    .get('/competitors', gameController.getCompetitors)
    .get('/players', gameController.getPlayers)
    .get('/status/:code', gameController.getStatus)
    .get('/newGame', gameController.getNewGame)
    .get('/game/:code', gameController.getGame)
    .get('/test', gameController.getTest)
    .get('/dashboard', gameController.getSelectGame)
    .get('/dashboard/:code', gameController.getDashboard)
    .get('/history', gameController.getHistory)
    .get('/finished', gameController.getFinish)

module.exports = router;



