const express = require('express');
const router = express.Router();
const timerController = require('../controller/timerCrontoller');

router
    .post('/start-timer/:code', timerController.postStartTimer)
    .get('/pause', timerController.getPauseTimer)
    .get('/check/:code', timerController.getCheckTimer)
    .get('/finish', timerController.getFinished)
    .post('/reset', timerController.postReset)
    .post('/setOptions', timerController.postSetOptions)
    .post('/setTime', timerController.postSetTime)

module.exports = router;
