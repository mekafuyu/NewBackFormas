const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { playerSchema } = require("./player")

const gameSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    startTime: {
        type: Date
    },
    period: {
        type: String,
        enum: ['manhã', 'tarde'], 
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    finished: {
        type: Boolean,
        default: false,
        required: true
    },
    weights: {
        w1: {
            type: Number,
            default: 0
        },
        w2: {
            type: Number,
            default: 0
        },
        w3: {
            type: Number,
            default: 0
        },
        w4: {
            type: Number,
            default: 0
        },
        w5: {
            type: Number,
            default: 0
        }
    },
    players: {
        type: Map,
        of: playerSchema
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
