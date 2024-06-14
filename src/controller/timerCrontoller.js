const { Player } = require("../model/player");
const Game = require("../model/game")

let startTime = null;
let timer;
let startPause;
let pauseTime = 0;

class timerController {
    static async postStartTimer(req, res) {
        const { code } = req.params;
    
        try {
            console.log(code)
            const currGame = await Game.findOne({code});
    
            if (!currGame) {
                return res.status(404).send({ title: "Não encontrado", message: "Jogo não encontrado" });
            }
            
            if (currGame.startTime) {
                return res.send({ startTime: currGame.startTime, message: "O cronômetro já está em execução." });
            }
        
            currGame.startTime = new Date();
    
            let timer = setTimeout(() => {
                console.log("Tempo encerrado.");
                currGame.finished = true;
                saveExcel();
                clearTimeout(timer);
            }, currGame.duration * 1000);

            await currGame.save()

            res.send({startTime: currGame.startTime, message: `Cronômetro de ${currGame.duration/3600} hora iniciado.` });
        
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getPauseTimer(req, res) {
        if (startPause) {
            pauseTime += Date.now() - startPause;
            startPause = null;
            return res.send({ pauseTime: pauseTime, paused: false });
        }

        startPause = Date.now();
        res.send({ pauseTime: pauseTime, paused: true });
    }

    static async getCheckTimer(req, res) {
        const { code } = req.params;
    
        try {
            const currGame = await Game.findOne({code});
    
            if (!currGame) {
                return res.status(404).send({ title: "Não encontrado", message: "Jogo não encontrado" });
            }

            if (!currGame.startTime) {
                return res.status(409).send("O cronômetro não está em execução.");
            }

            var elapsedTime = (Date.now() - currGame.startTime)// - pauseTime;
            // if (startPause) {
            //     elapsedTime -= Date.now(); // - startPause;
            // }
    
            const remainingTime = Math.max(0, (currGame.duration * 1000) - elapsedTime);

            const hours = Math.floor(remainingTime / 3600000);
            const minutes = Math.floor((remainingTime % 3600000) / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
    
            return res.send({
                startTime: currGame.startTime,
                leftTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                //paused: !!startPause
            });
        
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getFinished(req, res) {
        try {
            var filename = await saveExcel(competitors, weights);
            return res.download("./" + filename, filename);
        } catch (error) {
            return res.status(500).send("Atividade finalizada, porém, o excel falhou.");
        }
    }

    static async postReset(req, res) {
        started = false;
        startTime = null;
        timer = null;
        startPause = null;
        pauseTime = 0;
        finished = false;
        competitors = {};
        testDuration = 3600;
        reset = true;
        res.send("Atividade finalizada.");
    }

    static async postSetOptions(req, res) {
        const { timer, tries } = req.body;
        showTimer = timer === "on";
        showTries = tries === "on";
        res.send({ showTimer, showTries });
    }

    static async postSetTime(req, res) {
        const { time } = req.body;
        if (isNaN(time)) {
            return res.status(400).send("Valor inválido");
        }
        testDuration = Number(time);
        console.log("Novo tempo de prova:", testDuration);
        return res.send({ testDuration });
    }
}

module.exports = timerController;
