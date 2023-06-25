const movesAudio = new Audio("audio/moves.mp3");
const musicAudio = new Audio("audio/music.mp3");

let boxes = document.querySelectorAll(".boxes");

let totalPlayers = 2;

let signs = {
    one: "x", two: "o"
};

let sign_elements = {
    one: `<div class="${signs.one} ${signs.one}-common"></div>`,
    two: `<div class="${signs.two} ${signs.two}-common"></div>`
}

let scores = {
    one: 0, two: 0
};

let matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

const win_moves = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let play = true, toggle = true;

function handleSubmit(players) {
    totalPlayers = players;

    welcomeSection.style.bottom = "100vh";
}

function onlyOne(radio) {
    let radios = document.querySelectorAll("input");

    radios.forEach(item => {
        if (item !== radio) item.checked = false;
        else item.checked = true;
    });
}

function reset() {
    matrix = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    boxes.forEach(box => {
        box.innerHTML = "";
    });
}

function toHome() {
    welcomeSection.style.bottom = 0;
    signSection.style.bottom = 0;

    reset();

    scores = {
        one: 0,
        two: 0
    };

    scoreOne.innerHTML = scores.one;
    scoreTwo.innerHTML = scores.two;
}

signForm.addEventListener("submit", event => {
    event.preventDefault();

    const form = new FormData(event.target);

    const x = form.get("x-symbol");
    const o = form.get("o-symbol");
    
    signs.one = x == "on"?"x":"o";
    signs.two = o == "on"?"x":"o";

    sign_elements.one = `<div class="${signs.one} ${signs.one}-common"></div>`;
    sign_elements.two = `<div class="${signs.two} ${signs.two}-common"></div>`;

    signSection.style.bottom = "100vh";

    musicAudio.play();
});

const sleep = seconds => {
    return new Promise(resolve => 
        setTimeout(resolve, seconds * 1000)
    );
}

async function check() {
    if (matrix.flat().filter(value => value == 0).length == 0) {
        await sleep(0.6);
        
        reset();
        return false;
    }

    for (const value of win_moves) {
        let values = value.map(
            value => matrix[Math.floor(value / 3)][value % 3]
        );
            
        if (values.filter(value => value == "x").length == 3 || values.filter(value => value == "o").length == 3) {        
            if (values[0] == signs.one) scores.one += 1; else scores.two += 1;
                
            scoreOne.innerHTML = scores.one;
            scoreTwo.innerHTML = scores.two;

            await sleep(0.6);

            reset();
            return false;
        }
    }

    return true;
}

function minmax(sign) {
    let moves = [];

    let d1 = matrix.map((value, index) => value[index]);

    if (d1.filter(value => value ==  0).length > 0 && d1.filter(value => value == sign).length == 2) {
        moves.push([Number(d1.indexOf(0)), Number(d1.indexOf(0))]);
    }

    let d2 = matrix.map((value, index) => value[2-index]);

    if (d2.filter(value => value ==  0).length > 0 && d2.filter(value => value == sign).length == 2) {
        moves.push([Number(d2.indexOf(0)), 2-Number(d2.indexOf(0))]);
    }

    for (let index = 0; index < matrix.length; index++) {
        if (matrix[index].filter(value => value ==  0).length > 0 && matrix[index].filter(value => value == sign).length == 2) {
            moves.push([index, Number(matrix[index].indexOf(0))]);
        }

        let col = matrix.map(value => value[index]);

        if (col.filter(value => value ==  0).length > 0 && col.filter(value => value == sign).length == 2) {
            moves.push([Number(col.indexOf(0)), index]);
        }
    }

    return moves;
}

async function singlePlayerGame(box, row, col) {
    if (matrix[row][col] == 0) {
        box.innerHTML = sign_elements.one;
        matrix[row][col] = signs.one;

        play = await check();

        if (play) {
            let moves = minmax(signs.two);

            if (moves.length == 0) {
                moves = minmax(signs.one);

                if (moves.length == 0) {
                    for (let row = 0; row < matrix.length; row++) {
                        for (let col = 0; col < matrix[row].length; col++) {
                            if (matrix[row][col] == 0) {
                                moves.push([row, col]);
                            }
                        }
                    }
                }
            }

            await sleep(0.2);
            
            let [x, y] = moves[Math.floor(Math.random() * moves.length)];
            
            matrix[x][y] = signs.two;
            boxes[x*3 + y%3].innerHTML = sign_elements.two;
            
            play = await check();
        }
    }
}

async function doublePlayerGame(box, row, col) {
    if (matrix[row][col] == 0) {
        if (toggle) {
            box.innerHTML = sign_elements.one;
            matrix[row][col] = signs.one;
        } else {
            box.innerHTML = sign_elements.two;
            matrix[row][col] = signs.two;
        }
        toggle = !toggle;

        await check();
    }
}

boxes.forEach((box, index)=> {
    const row = Math.floor(index / 3);
    const col = Math.floor(index % 3);

    box.addEventListener("click", ()=> {
        movesAudio.play();

        if (totalPlayers == 1) singlePlayerGame(box, row, col);
        else doublePlayerGame(box, row, col);
    });
});