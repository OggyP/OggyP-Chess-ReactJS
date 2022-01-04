var engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || 'resources/stockfish/stockfish.js');
var evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || 'resources/stockfish/stockfish.js');

var evalerCommandsToSend = []
var engineCommandsToSend = []

var waitingForReadyEngine = false

function uciCmd(cmd, which) {
    // console.log("UCI: " + cmd);

    if (cmd === 'isready') {
        if (which === evaler)
            waitingForReadyEvaler = true
        else
            waitingForReadyEngine = true
    }
    if (cmd.startsWith('go')) {
        if (which === evaler)
            evalerInfo.isEvaluating = true
        else
            engineInfo.isEvaluating = true
    }

    if (cmd.startsWith('set')) { console.log(cmd) }

    (which || engine).postMessage(cmd);
}

evalerCommandsToSend.push("uci")
engineCommandsToSend.push("uci")

let evalerInfo = { "uciReady": false, 'options': [], "lastEvaluation": "", "isEvaluating": false, "lastBestMove": "" }
let engineInfo = { "uciReady": false, 'options': [], "lastEvaluation": "", "isEvaluating": false, "lastBestMove": "" }

function goToDepth(fenPosition, depth) {
    if (evalerInfo.isEvaluating) {
        evalerCommandsToSend.push('stop')
    }
    evalerCommandsToSend.push('isready')
    evalerCommandsToSend.push("position fen " + fenPosition)
    evalerCommandsToSend.push("go depth " + depth)
    uciCmd(evalerCommandsToSend.shift(), evaler)
}

function goForTime(fenPosition, time) {
    if (engineInfo.isEvaluating) {
        engineCommandsToSend.push('stop')
    }
    engineCommandsToSend.push('isready')
    engineCommandsToSend.push("position fen " + fenPosition)
    engineCommandsToSend.push("go movetime " + time)
    uciCmd(engineCommandsToSend.shift(), engine)
}

const infoTypes = ['depth', 'seldepth', 'multipv', 'score', 'nodes', 'nps', 'hashfull', 'tbhits', 'time', 'pv', 'string']

function parseInfoLine(line, turn) {
    let info = {}
    let currentInfoType = ''
    let words = line.split(' ')
    for (let i = 0; i < words.length; i++) {
        let word = words[i]
        if (word === 'info') continue
        if (infoTypes.includes(word)) {
            currentInfoType = word
            continue
        }
        if (info.hasOwnProperty(currentInfoType)) {
            let wordToAdd = word
            if (currentInfoType === 'score' && !turn)
                if (!isNaN(wordToAdd)) wordToAdd = -Number(wordToAdd)
            info[currentInfoType] += ' ' + wordToAdd
        } else {
            info[currentInfoType] = word
        }
    }
    return info
}

var evaluationTurn = true
const evaluationTextDisplay = $("#evaluation")
const evaluationTextExtraDisplay = $("#evaluation_extra")
var waitingForReadyEvaler = false
var clearUntilReady = false
evaler.onmessage = function(event) {
    var line;

    if (event && typeof event === "object") {
        line = event.data;
    } else {
        line = event;
    }

    if (line === 'readyok') {
        waitingForReadyEvaler = false
        clearUntilReady = false
        evalerInfo.isEvaluating = false
    }

    if (waitingForReadyEvaler) {
        // console.log("returned")
        return
    }

    if (line === 'uciok') {
        evalerInfo.uciReady = true
        uciCmd("setoption name UCI_AnalyseMode value true", evaler)
        uciCmd("setoption name Use NNUE value true", evaler)
        uciCmd("ucinewgame", evaler)
    }

    if (line.startsWith('info') && line.split(' ')[3] !== 'currmove') {
        evalerInfo.lastEvaluation = line
        let parsedLineInfo = parseInfoLine(line, evaluationTurn)
            // console.log(parsedLineInfo)
        if (parsedLineInfo.hasOwnProperty('score')) {
            let evalText = ""
            if (parsedLineInfo.score.includes("mate")) {
                if (Number(parsedLineInfo.score.split(' ')[1]) === 0) {
                    evalText = "Checkmate"
                } else {
                    // console.log(parsedLineInfo.score)
                    evalText = `${(parsedLineInfo.score.split(' ')[1][0] == '-') ? '-' : '+'}M ${Math.abs(Number(parsedLineInfo.score.split(' ')[1]))}`
                }
            } else {
                // Show in points
                if (Number(parsedLineInfo.score.split(' ')[1]) > 0) evalText += "+"
                evalText += (Number(parsedLineInfo.score.split(' ')[1]) / 100).toString()
            }
            evaluationTextDisplay.text(`Depth: ${parsedLineInfo.depth} | Eval: ${evalText}`)
            if (parsedLineInfo.hasOwnProperty("nodes")) {
                evaluationTextExtraDisplay.show()
                evaluationTextExtraDisplay.text(`Nodes: ${parsedLineInfo.nodes} | Moves: ${(parsedLineInfo.pv.length <= 30) ? parsedLineInfo.pv : parsedLineInfo.pv.slice(0, 25) + "..."}`)
            } else {
                evaluationTextExtraDisplay.hide()
            }
        }
        if (parsedLineInfo.hasOwnProperty('pv')) showBestMove(parsedLineInfo.pv.split(' ')[0])
    }
    if (line.startsWith('bestmove')) {
        evalerInfo.lastBestMove = line.split(' ')[1]
            // console.log("Best Move " + line)
        if (importedPGN || (adminUserIds.includes(ownUserId))) showBestMove(evalerInfo.lastBestMove)
        evalerInfo.isEvaluating = false
    }

    if (clearUntilReady) {
        $('.best_move').remove()
            // console.log("Cleared Best Move Square")
    }

    while (evalerCommandsToSend.length > 0 && !waitingForReadyEvaler) {
        uciCmd(evalerCommandsToSend.shift(), evaler)
    }
}

function showBestMove(move) {
    if (!clearUntilReady) {
        $('.best_move').remove()
        if (move !== '(none)') {
            // console.log("Draw Best Move Square")
            let startingPos = [fromChessNotation.x[move[0]], fromChessNotation.y[move[1]]]
            let endingPos = [fromChessNotation.x[move[2]], fromChessNotation.y[move[3]]]
            piecesLayer.append(`<square class="best_move best_move_start" style="transform: translate(${(!flipBoard) ? (startingPos[0] * boxSize) + 'px, ' + (startingPos[1] * boxSize) : ((7 - startingPos[0]) * boxSize) + 'px, ' + ((7 - startingPos[1]) * boxSize)}px);"></square>`)
            piecesLayer.append(`<square class="best_move best_move_end" style="transform: translate(${(!flipBoard) ? (endingPos[0] * boxSize) + 'px, ' + (endingPos[1] * boxSize) : ((7 - endingPos[0]) * boxSize) + 'px, ' + ((7 - endingPos[1]) * boxSize)}px);"></square>`)
        }
    }
}

function stopSearching(newGame = false) {
    if (evalerInfo.isEvaluating) {
        evalerCommandsToSend.push('stop')
    }
    evalerCommandsToSend.push('isready')
    if (newGame) evalerCommandsToSend.push('ucinewgame')
    uciCmd(evalerCommandsToSend.shift(), evaler)
}

function stopSearchingEngine() {
    if (engineInfo.isEvaluating) {
        engineCommandsToSend.push('stop')
    }
    waitingForReadyEngine = true
    engineCommandsToSend.push('isready')
    engineCommandsToSend.push('ucinewgame')
    uciCmd(engineCommandsToSend.shift(), engine)
}

engine.onmessage = function(event) {
    var line;

    if (event && typeof event === "object") {
        line = event.data;
    } else {
        line = event;
    }

    console.log("Engine: " + line)

    if (line === 'readyok') {
        waitingForReadyEngine = false
        engineInfo.isEvaluating = false
    }

    if (waitingForReadyEngine) {
        // console.log("returned engine")
        return
    }

    if (line === 'uciok') {
        engineInfo.uciReady = true
            // uciCmd("setoption name UCI_AnalyseMode value true", evaler)
        uciCmd("setoption name Use NNUE value true", engine)
        uciCmd("ucinewgame", engine)
    }

    if (line.startsWith('info') && line.split(' ')[3] !== 'currmove') {
        evalerInfo.lastEvaluation = line
        let parsedLineInfo = parseInfoLine(line, evaluationTurn)
            // console.log(parsedLineInfo)
        if (parsedLineInfo.hasOwnProperty('depth')) {
            if (Number(parsedLineInfo.depth) >= 30) uciCmd("stop", engine)
        }
        if (!adminUserIds.includes(ownUserId)) {
            // Show what it is thinking
            if (parsedLineInfo.hasOwnProperty('pv') && stockfishLevel === 20) showBestMove(parsedLineInfo.pv.split(' ')[0])
            evaluationTextDisplay.text(`Depth: ${parsedLineInfo.depth} | Nodes: ${parsedLineInfo.nodes}`)
        }
    }

    if (line.startsWith('bestmove')) {
        // console.log(waitingForReadyEngine)
        engineInfo.isEvaluating = false
        let move = line.split(' ')[1]
        let startingPos = [fromChessNotation.x[move[0]], fromChessNotation.y[move[1]]]
        let endingPos = [fromChessNotation.x[move[2]], fromChessNotation.y[move[3]]]
        let recievedMoveData = {
            "startingPos": startingPos,
            "endingPos": endingPos
        }
        if (chessBoard[startingPos[1]][startingPos[0]].piece === 'p' && startingPos[0] !== endingPos[0] && chessBoard[endingPos[1]][endingPos[0]] === 'NA') recievedMoveData.specialCase = "enpassant"
        if (chessBoard[startingPos[1]][startingPos[0]].piece === 'k' && Math.abs(startingPos[0] - endingPos[0]) > 1) recievedMoveData.specialCase = "castle"
        if (move.length === 5) {
            // promote
            recievedMoveData.promote = move[4] + "d"
        }
        // console.log(recievedMoveData)
        receivedMove({
            "data": recievedMoveData
        })
    }

    while (engineCommandsToSend.length > 0 && !waitingForReadyEngine) {
        uciCmd(engineCommandsToSend.shift(), engine)
    }
}