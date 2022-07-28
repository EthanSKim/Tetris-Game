import BLOCKS from "./blocks.js"

// DOM
const playground = document.querySelector(".playground > ul");
const gameStartText = document.querySelector(".gameStart-text");
const gameOverText = document.querySelector(".gameOver-text");
const pausedText = document.querySelector(".paused-text");
const scoreDisplay = document.querySelector(".score");
const startButton = document.querySelector(".gameStart-text > button");
const restartButton = document.querySelector(".gameOver-text > button");
const box = document.querySelector(".box");
const holdBox = document.querySelector(".holdBox > ul");
const queueBox = document.querySelector(".queueBox > ul");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// Variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let tempHeldItem;
let nextItem = "";
let tempNextItem;

let heldItem = {
    type: "tree",
    direction: 0,
    top: 0,
    left: 0
};

const movingItem = {
    type: "tree",
    direction: 0,
    top: 0,
    left: 0,
};

init();

// functions
function init() {
    tempMovingItem = { ...movingItem }; // spread operator
    for(let i=0; i<GAME_ROWS; i++) {
        prependNewLine();
    }
    for(let i=0; i<4; i++) {
        createHoldBox();
        createQueueBox();
    }
}


function prependNewLine() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<GAME_COLS; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

function createHoldBox() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<4; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    holdBox.prepend(li);
}

function createQueueBox() {
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for(let j=0; j<4; j++) {
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    queueBox.prepend(li);
}

function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block=> {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if (isAvailable) {
            target.classList.add(type, "moving");
        } else {
            tempMovingItem = { ...movingItem }
            if(moveType === 'retry') {
                clearInterval(downInterval);
                box.style.pointerEvents = "none";
                showGameOverText()
            }
            setTimeout(()=> {
                renderBlocks('retry');
                if(moveType === "top"){
                    seizeBlock();
                }
            },0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })
    generateNewBlock();
}

function generateNewBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top", 1);
    }, duration);

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    tempNextItem = blockArray[randomIndex][0];
    //movingItem.top = 0;
    //movingItem.left = 3;
    //movingItem.direction = 0;
    //tempMovingItem = { ...movingItem }
    showOnQueueBox();
}

function checkEmpty(target) {
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection() {
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction+=1;
    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top",1);
    }, 15);
}

function holdBlock() {
    let empty = true;
    const HBchildNodes = holdBox.childNodes;
    HBchildNodes.forEach(child => {
        child.children[0].childNodes.forEach(li => {
            if(li.classList.contains("held")) {
                empty = false;
            }
            li.className = "";
        })
    })
    eraseBlock();
    if(!empty) {
        tempHeldItem = { ...movingItem }
        tempMovingItem = { ...heldItem }
        movingToHold();
        generateHeldBlock();
    } else {
        tempHeldItem = { ...movingItem }
        tempMovingItem = { ...heldItem }
        movingToHold();
        console.log("hi");
        generateNewBlock();
    }
    

}

function movingToHold() {
    // 1. render moving block to holdBox
    BLOCKS[tempHeldItem.type][0].some(block => {
        const x = block[0];
        const y = block[1];
        const target = holdBox.childNodes[y].childNodes[0].childNodes[x];
        target.classList.add(tempHeldItem.type, "held");
    })
    heldItem = { ...movingItem }
}

function eraseBlock() {
    // 2. remove moving block from playground
    const PGchildNodes = playground.childNodes;
    PGchildNodes.forEach(child => {
        child.children[0].childNodes.forEach(li => {
            if(li.classList.contains("moving")) {
                clearInterval(downInterval);
                li.classList.remove(movingItem.type, "moving");
            }
        })
    })

}

function generateHeldBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock("top", 1);
    }, duration);
    movingItem.type = tempMovingItem.type;
    tempMovingItem.top = 0;
    tempMovingItem.left = 3;
    tempMovingItem.direction = 0;
    renderBlocks();
}

function showOnQueueBox() {
    const QBchildNodes = queueBox.childNodes;
    QBchildNodes.forEach(child => {
        child.children[0].childNodes.forEach(li => {
            li.classList = "";
        })
    })
    BLOCKS[tempNextItem][0].some(block => {
        const x = block[0];
        const y = block[1];
        const target = queueBox.childNodes[y].childNodes[0].childNodes[x];
        target.classList.add(tempNextItem);
    })
    if(nextItem === "") {
        nextItem = tempNextItem;
        movingItem.type = nextItem;
        movingItem.top = 0;
        movingItem.left = 3;
        movingItem.direction = 0;
        tempMovingItem = { ...movingItem }
        generateNewBlock();
    } else {
        movingItem.type = nextItem;
        movingItem.top = 0;
        movingItem.left = 3;
        movingItem.direction = 0;
        tempMovingItem = { ...movingItem }
        nextItem = tempNextItem;
    }
}

function showGameOverText() {
    gameOverText.style.display = "flex";
}

// Event handling
document.addEventListener("keydown", e=>{
    switch (e.keyCode) {
        case 39:
            moveBlock("left", 1);
            break;
        case 37:
            moveBlock("left", -1);
            break;
        case 40:
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        case 67:
            holdBlock();
        default:
            break;
    }
})

startButton.addEventListener("click", ()=> {
    gameStartText.style.display = "none";
    box.style.pointerEvents = "initial";
    generateNewBlock();
})

restartButton.addEventListener("click", ()=>{
    score = 0;
    scoreDisplay.innerHTML = score;
    playground.innerHTML = "";
    gameOverText.style.display = "none";
    box.style.pointerEvents = "initial";
    init();
    generateNewBlock();
})

box.addEventListener("click", (e) => {
    if(e.target.classList.contains('pause')) {
        e.target.classList.toggle('pause');
        e.target.classList.toggle('resume');
        pausedText.style.display = "inherit";
        clearInterval(downInterval);
    } else {
        e.target.classList.toggle('pause');
        e.target.classList.toggle('resume');
        pausedText.style.display = "none";
        downInterval = setInterval(() => {
            moveBlock("top", 1);
        }, duration);
    }
})