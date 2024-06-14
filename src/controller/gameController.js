const { saveExcel, generate, shuffle } = require('../utils');
const { Player } = require("../model/player");
const Game = require("../model/game")
competitors = {}
const weights = [100, 200, 300, 500, 800];
const testWeights = [100, 200, 300];
const startTime = Date.now(); //Retirar isso

class gameController {
    static async postReady(req, res) {
        const { codigo, name, dataNasc, w1, w2, w3, w4, w5 } = req.body;
        if (!dataNasc) return res.status(400).send("Sem data de nascimento");

        let accessed = false;
        let done = false;
        let time = "";

        let score = {
            w1: w1 || weights[2],
            w2: w2 || 0,
            w3: w3 || 0,
            w4: w4 || 0,
            w5: w5 || 0,
        };

        let realWeights = [0, 1, 3, 4];
        shuffle(realWeights);

        let realScore = [
            2,
            realWeights[0],
            realWeights[1],
            realWeights[2],
            realWeights[3]
        ];

        let tentativas = 0;
        let pieces = 0;

        let code = await generate();

        let newPlayer = new Player({
            name, dataNasc, done, time,
            realScore, score, tentativas,
            pieces, code, accessed,
            createdAt: new Date()
        });
        console.log("Novo jogador:", code, name, realScore);

        try {
            const game = await Game.findOne({code: codigo})

            if(!game)
                return res.status(404).send({ message: "Jogo não encontrado" });

            game.players.set(newPlayer.code, newPlayer)
            await game.save();

            return res.status(201).send({ message: 'Player registered successfully', status: game.startTime ? true : false, code: code });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'Something failed while creating a player' });
        }
    }

    static async patchUpdateWeights(req, res) {
        const { code } = req.params;
        const { w1, w2, w3, w4, w5 } = req.body;
    
        try {
            const player = await Player.findOneAndUpdate(
                { code },
                {
                    $set: {
                        "score.w1": w1,
                        "score.w2": w2,
                        "score.w3": w3,
                        "score.w4": w4,
                        "score.w5": w5
                    }
                },
                { new: true }
            );
    
            if (!player) return res.status(404).send("Competidor não encontrado.");
    
            res.send("Ok");
        } catch (error) {
            console.error("Erro ao atualizar os pesos:", error);
            res.status(500).send("Erro ao atualizar os pesos");
        }
    }
    
    static async patchFinalAnswer(req, res) {
        const { code } = req.params;
        const { w1, w2, w3, w4, w5 } = req.body;
        
        try{
            const competitor = await Player.findOneAndUpdate(
                { code },
                {
                    $set: {
                        "score.w1": w1,
                        "score.w2": w2,
                        "score.w3": w3,
                        "score.w4": w4,
                        "score.w5": w5
                    }
                },
                { new: true }
            );
            if (!competitor) return res.status(404).send("Competidor não encontrado.");
                       
            const elapsedTime = Date.now() - startTime;
            
            const hours = Math.floor(elapsedTime / 3600000);
            const minutes = Math.floor((elapsedTime % 3600000) / 60000);
            const seconds = Math.floor((elapsedTime % 60000) / 1000);
            
            competitor.time = `${hours}:${minutes}:${seconds}`;
            await competitor.save();

            res.send("OK");
        } catch (error) {
            console.error("Erro ao autalizar a resposta final:", error);
            res.status(500).send("Erro ao autalizar a resposta final");
        }
    }

    static async postTestScales(req, res) {
        let { quantities } = req.body;

        if (!quantities) return res.status(400).send({ message: "Vazio" });

        let temp = [testWeights[2], testWeights[0], testWeights[1]];
        let results = [];

        for (let i = 0; i < quantities.length; i++) {
            const bal = quantities[i];
            let plate1 = 0;
            let plate2 = 0;

            for (let j = 0; j < 3; j++) {
                plate1 += bal[j] * temp[j];
                plate2 += bal[j + 5] * temp[j];
            }

            if (plate1 > plate2) results.push(-1);
            else if (plate1 === plate2) results.push(0);
            else results.push(1);
        }

        res.send({ results });
    }

    static async postScales(req, res) {
        const { code } = req.params;
        const { quantities } = req.body;
    
        if (!code) return res.status(400).send({ message: "Code não fornecido" });
        if (!quantities || !Array.isArray(quantities) || quantities.length !== 10) {
            return res.status(400).send({ message: "Quantities deve ser um array de 10 números" });
        }
    
        try {
            console.log(`Buscando competidor com o code: ${code}`);
            const competitor = await Player.findOne({ code });
    
            if (!competitor) return res.status(404).send("Competidor não encontrado");
    
            competitor.tentativas += 1;
            competitor.pieces = 0;
    
            let plate1 = 0;
            let plate2 = 0;
    
            let temp = [
                competitor.realScore[1],
                competitor.realScore[2],
                competitor.realScore[0],
                competitor.realScore[4],
                competitor.realScore[3]
            ];
    
            const weights = [1, 2, 3, 4, 5];
    
            for (let j = 0; j < 5; j++) {
                const value1 = quantities[j];
                const value2 = quantities[j + 5];
    
                if (typeof value1 !== 'number' || typeof value2 !== 'number') {
                    return res.status(400).send({ message: "Quantities deve conter apenas números" });
                }
    
                plate1 += value1 * weights[temp[j]];
                plate2 += value2 * weights[temp[j]];
                competitor.pieces += value1 + value2;
            }
    
            let result;
            if (plate1 > plate2) result = -1;
            else if (plate1 === plate2) result = 0;
            else result = 1;
    
            await competitor.save();
    
            res.send({ result });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Erro no servidor" });
        }
    }

    static async getPlayers(req, res) {
        const { code } = req.params;

        try {
            const game = await Game.findOne({code});

            if(!game)
                return res.status(404).send({ message: "Jogo não encontrado" });
                
            return res.status(200).send(game.players);
        } catch (error) {
            return res.status(500).send({ error: 'Error finding players' });
        }
    }

    // Arrumar
    static async getStatus(req, res) {
        const { gCode, pCode } = req.params;

        try {
            const game = await Game.findOne({ code: gCode });

            if (!game) {
                return res.render("Error", { title: "Não encontrado", message: "Jogo não encontrado" });
            }
            const player = game.players.get("")

            res.send({ finished: game.finished, started: game.startTime ? true : false, startTime: game.showTimer ? game.startTime : null, tries: game.showTries ? player.tentativas : null });
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getGame(req, res) {
        const { code } = req.params;
    
        try {
            const competitor = await Player.findOne({ code });
    
            if (!competitor) {
                return res.render("Error", { title: "Não encontrado", message: "Jogador não encontrado" });
            }
    
            if (competitor.accessed) {
                return res.render("Error", { title: "Já Acessado", message: "Solicite ajuda de um dos instrutores da avaliação" });
            }
    
            competitor.accessed = true;
            await competitor.save();
    
            res.render("Game", { data: data, defaultWeight: weights[2], code, showTimer, showTries, testDuration });
         
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getTest(req, res) {
        // Implementação do método getTest
        res.send("Método getTest ainda não implementado.");
    }

    static async getNewGame(req, res) {
        const newGame = new Game({
            code: await generate(),
            startTime: null,
            period: (new Date()).getHours() > 12 ? "tarde" : "manhã",
            duration: 3600,
            weights: {
                w1: 0,
                w2: 0,
                w3: 0,
                w4: 0,
                w5: 0,
            },
            players: [],
            createdAt: new Date()
        });

        try {
            await newGame.save();
            return res.send({code: newGame.code})
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'Something failed while creating a game' });
        }
    }

    static async getSelectGame(req, res) {    
        try {
            const games = await Game.find();

            if (!games) {
                return res.render("Error", { title: "Não encontrado", message: "Jogo não encontrado" });
            }

            return res.render("SelectProccess", { data: games, url: process.env.CURR_IP});
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getDashboard(req, res) {
        // ARRUMAR
        const { code } = req.params;
    
        try {
            const currGame = await Game.findOne({ code });

            if (!currGame) {
                return res.render("Error", { title: "Não encontrado", message: "Jogo não encontrado" });
            }

            currGame.players.forEach((value, key, map) => {
                console.log(value)
            })

            return res.render("Dashboard", { gameCode: code, data: currGame.players, url: process.env.CURR_IP, startTime: currGame.startTime, currWeigths: {weights: currGame.weights, testWeights: {w1: 1, w2: 2, w3: 3}}, showTimer: true, showTries: true, testDuration: currGame.duration });
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getHistory(req, res) {
        try {
            const games = await Game.find();

            if (!games) {
                return res.render("Error", { title: "Não encontrado", message: "Jogo não encontrado" });
            }

            return res.render("History", { data: games, url: process.env.CURR_IP});
        } catch (error) {
            console.error(error);
            res.status(500).send("Erro no servidor");
        }
    }

    static async getFinish(req, res) {
        function formatTime(milliseconds) {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        for (const code in competitors) {
            if (competitors.hasOwnProperty(code)) {
                const competitor = competitors[code];
                if (!competitor.time) {
                    const elapsedTime = Date.now() - startTime;
                    competitor.time = formatTime(elapsedTime);
                }
            }
        }

        finished = true;
        startTime = null;
        try {
            var filename = await saveExcel();
            return res.download("./" + filename, filename);
        } catch (error) {
            return res.status(500).send("Atividade finalizada, porém, o excel falhou.");
        }
    }
}

module.exports = gameController;
