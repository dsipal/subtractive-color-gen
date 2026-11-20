const canvas = document.getElementById('pixelCanvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
var cWidth = canvas.width;
var cHeight = canvas.height;
var bWidth = 10;
var bHeight = 10;
var bStrength = parseInt(document.querySelector('#bStrength').value);
var mDown = false;
var conShow = true;

var pixelRGB = [];
var pixelCase = [];


document.addEventListener('DOMContentLoaded', function() {

    setup();

    document.querySelector('#brush').addEventListener('click', function() {
        var brushStrength = parseInt(document.querySelector('#bStrength').value, 10);
        bStrength = brushStrength;
    });

    document.addEventListener('mousedown', function() {
        mDown = true;
    });
    document.addEventListener('mouseup', function() {
        mDown = false;
    });

    var bStrengthInput = document.querySelector('#bStrength');
    if (bStrengthInput) {
        bStrengthInput.addEventListener('input', function() {
            bStrength = parseInt(bStrengthInput.value, 10);
        });
    }

    function getCell(e) {
        var rect = canvas.getBoundingClientRect();
        // position inside the border, in screen pixels
        var x = e.clientX - rect.left - canvas.clientLeft;
        var y = e.clientY - rect.top - canvas.clientTop;
        // convert to canvas pixels (clientWidth/Height leave out the border)
        x *= canvas.width / canvas.clientWidth;
        y *= canvas.height / canvas.clientHeight;
        return { r: Math.floor(y / bHeight), c: Math.floor(x / bWidth) };
    }

    canvas.addEventListener('mousemove', function(e) {
        if (!mDown) return;
        var cell = getCell(e);
        if (cell.r >= 0 && cell.r < cHeight / bHeight &&
            cell.c >= 0 && cell.c < cWidth / bWidth) {
            colorChange(cell.r, cell.c);
        }
    });

    document.querySelector('#reset').addEventListener('click', function() {
        reset();
    });

    document.querySelector('#gradient').addEventListener('click', function() {
        var amount = document.querySelector('#gradRange').value;
        var time = document.querySelector('#time').value;
        var one = document.querySelector('#gradX').value;
        var two = document.querySelector('#gradY').value;
        doGradients(amount, one, two, time);
    });

    document.querySelector('#fuzz').addEventListener('click', function() {
        var amount = document.querySelector('#fuzzRange').value;
        var time = document.querySelector('#time').value;
        var min = document.querySelector('#fuzzMin').value;
        var max = document.querySelector('#fuzzMax').value;
        var mix = document.querySelector('#fuzzMix').checked;
        doFuzz(amount, min, max, mix, time);
    });

    document.querySelector('#whiteShift').addEventListener('click', function() {
        var range = document.querySelector('#whiteRange').value;
        whiteShift(range);
    });

    document.querySelector('#runButton').addEventListener('click', function() {
        run();
    });

    document.querySelector('#darker').addEventListener('click', function() {
        darker();
    });
});

function setup() {
    for (var r = 0; r < cHeight / bHeight; r++) {
        pixelRGB[r] = [];
        pixelCase[r] = [];
        for (var c = 0; c < cWidth / bWidth; c++) {
            pixelRGB[r][c] = [255, 255, 255];
            pixelCase[r][c] = 0;
        }
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cWidth, cHeight);
}

function drawPixel(r, c) {
    var rgb = pixelRGB[r][c];
    ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    ctx.fillRect(c * bWidth, r * bHeight, bWidth, bHeight);
}

function getInfo(r, c) {
    return [pixelRGB[r][c].slice(), pixelCase[r][c]];
}

function cycleCase(r, c) {
    if (pixelRGB[r][c].every(v => v === 0)) {
        pixelRGB[r][c] = [255, 255, 255];
        return pixelCase[r][c] = 0;
    }
    return pixelCase[r][c] = (pixelCase[r][c] + 1) % 3;
}

function colorChange(r, c, subAmt) {
    if (subAmt === undefined) subAmt = bStrength;

    var info = getInfo(r, c);
    var count = info[1] !== undefined ? info[1] : 0;
    var rgb = info[0] !== undefined ? info[0].slice() : [255, 255, 255];
    if (rgb[count] < subAmt) {
        count = cycleCase(r, c);
    }
    if (rgb[count] < subAmt) {
        count = cycleCase(r, c);
        rgb = pixelRGB[r][c].slice();   // re-read in case cycleCase reset it to white
    }
    rgb[count] = rgb[count] - subAmt;



    rgb[0] = Math.max(0, Math.min(255, rgb[0]));
    rgb[1] = Math.max(0, Math.min(255, rgb[1]));
    rgb[2] = Math.max(0, Math.min(255, rgb[2]));

    pixelRGB[r][c] = [rgb[0], rgb[1], rgb[2]];
    drawPixel(r, c);
}

function gradient(i, one, two) {
    if (i === undefined) i = 1;
    if (one === undefined) one = 0;
    if (two === undefined) two = 1;
    for (var a = 0; a < i; a++) {
        one++;
        for (var r = 0; r < cHeight / bHeight; r++) {
            two++;
            for (var c = 0; c < cWidth / bWidth; c++) {
                var subAmt = one * two;
                colorChange(r, c, subAmt);
            }
        }
    }
}

function doGradients(i, one, two, time) {
    if (i === undefined) i = 1;
    if (one === undefined) one = 0;
    if (two === undefined) two = 1;
    if (time === undefined) time = 250;
    for (var x = 0; x < i; x++) {
        setTimeout(function(y) {
            gradient(1, one, two);
        }, x * time, x);
    }
}

function fuzz(min, max, mix) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 255;
    if (mix === undefined) mix = true;
    for (var r = 0; r < cHeight / bHeight; r++) {
        for (var c = 0; c < cWidth / bWidth; c++) {
            if (mix) {
                var subAmt = parseInt(min) + Math.floor(Math.random() * parseInt(max));
                colorChange(r, c, subAmt);
            } else {
                pixelRGB[r][c] = randGen(min, max);
                drawPixel(r, c);
            }
        }
    }
}

function randGen(min, max) {
    min = parseInt(min);
    max = parseInt(max);
    var r = min + Math.floor(Math.random() * max);
    var g = min + Math.floor(Math.random() * max);
    var b = min + Math.floor(Math.random() * max);
    return [
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b))
    ];
}

function darker(amount) {
    if (amount === undefined) amount = bStrength;
    for (var x = 0; x < cHeight / bHeight; x++) {
        for (var c = 0; c < cWidth / bWidth; c++) {
            colorChange(x, c, amount);
        }
    }
}

function doFuzz(i, min, max, mix, time) {
    if (i === undefined) i = 1;
    if (min === undefined) min = 0;
    if (max === undefined) max = 255;
    if (mix === undefined) mix = 0;
    if (time === undefined) time = 250;
    for (var x = 0; x < i; x++) {
        setTimeout(function(y) {
            fuzz(min, max, mix);
        }, x * time, x);
    }
}

function whiteShift(range) {
    for (var x = 0; x < cHeight / bHeight; x++) {
        for (var c = 0; c < cWidth / bWidth; c++) {
            var info = getInfo(x, c);
            var rgb = info[0];
            if (rgb[0] > (255 - range) && rgb[1] > (255 - range) && rgb[2] > (255 - range)) {
                cycleCase(x, c);
                colorChange(x, c, 85);
            }
        }
    }
}

function reset() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cWidth, cHeight);
    for (var r = 0; r < cHeight / bHeight; r++) {
        for (var c = 0; c < cWidth / bWidth; c++) {
            pixelRGB[r][c] = [255, 255, 255];
            pixelCase[r][c] = 0;
        }
    }
}

function showInfo() {
    var consoleInfo = document.querySelector('#consoleInfo');   
    consoleInfo.style.display = consoleInfo.style.display === 'none' ? '' : 'none';
}

function run() {
    var consoleInput = document.querySelector('#console');
    var code = consoleInput ? consoleInput.value : '';
    var lines = code.split('\n');
    var matches = [];

    for (var i = 0; i < lines.length; i++) {
        matches.push(lines[i].match(/(\w+)/g));
    }

    for (var i = 0; i < lines.length; i++) {
        setTimeout(function(index) {
            if (!matches[index] || !matches[index][0]) return;
            switch (matches[index][0]) {
                case 'darker':
                    darker(matches[index][1]);
                    break;
                case 'gradient':
                    gradient(matches[index][1], matches[index][2], matches[index][3]);
                    break;
                case 'fuzz':
                    fuzz(matches[index][1], matches[index][2], matches[index][3]);
                    break;
            }
        }, i * 250, i);
    }
}
