var cWidth = 640;
var cHeight = 480;
var bWidth = 10;
var bHeight = 10;
var bStrength = parseInt($('#bStrength').val());
var mDown = false;
var conShow = true;

var pixelRGB = [];
var pixelCase = [];

var canvas = document.getElementById('pixelCanvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

$(document).ready(function() {

    setup();

    $(document).mousedown(function() {
        mDown = true;
    }).mouseup(function() {
        mDown = false;
    });
    $(document).tooltip();

    $(document).on('input', '#bStrength', function() {
        bStrength = parseInt($('#bStrength').val());
    });

    canvas.addEventListener('mousemove', function(e) {
        if (!mDown) return;
        var rect = canvas.getBoundingClientRect();
        var r = Math.floor((e.clientY - rect.top) / bHeight);
        var c = Math.floor((e.clientX - rect.left) / bWidth);
        if (r >= 0 && r < cHeight / bHeight && c >= 0 && c < cWidth / bWidth) {
            colorChange(r, c);
        }
    });

    $('#reset').on('click', function() {
        reset();
    });

    $('#gradient').on('click', function() {
        var amount = $('#gradRange').val();
        var time = $('#time').val();
        var one = $('#gradX').val();
        var two = $('#gradY').val();
        doGradients(amount, one, two, time);
    });

    $('#fuzz').on('click', function() {
        var amount = $('#fuzzRange').val();
        var time = $('#time').val();
        var min = $('#fuzzMin').val();
        var max = $('#fuzzMax').val();
        var mix = false;
        if ($('#fuzzMix').is(':checked')) {
            mix = true;
        } else {
            mix = false;
        }
        doFuzz(amount, min, max, mix, time);
    });

    $('#whiteShift').on('click', function() {
        var range = $('#whiteRange').val();
        whiteShift(range);
    });

    $('#makeBox').on('click', function() {
        var x = parseInt($('#boxX').val());
        var c = parseInt($('#boxY').val());
        var strength = parseInt($('#boxStrength').val());
        var size = parseInt($('#boxSize').val());
        makeBox(x, c, size, strength);
    });

    $('#consoleButton').on('click', function() {
        if (conShow) {
            $('#console').slideUp('400');
            $('.hide').hide();
            $('#consoleButton').html('Open Console');
            $('#consoleBox').css({'padding-bottom': '5px'});
            conShow = false;
        } else {
            $('#console').slideDown('400');
            $('.hide').show();
            $('#consoleButton').html('Close Console');
            conShow = true;
        }
    });

    $('#runButton').on('click', function() {
        run();
    });

    $('#darker').on('click', function() {
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
    pixelCase[r][c] = (pixelCase[r][c] + 1) % 3;
}

function colorChange(r, c, subAmt) {
    if (subAmt === undefined) subAmt = bStrength;

    var info = getInfo(r, c);
    var rgb = info[0];
    var count = info[1];

    switch (count) {
        case 0:
            if (rgb[0] !== 0) {
                rgb[0] -= subAmt;
            } else if (rgb[0] === 0 && rgb[1] !== 0) {
                rgb[1] -= subAmt;
            } else if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] !== 0) {
                rgb[2] -= subAmt;
            } else if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) {
                rgb[0] = 255;
                rgb[1] = 255;
                rgb[2] = 255;
                cycleCase(r, c);
            }
            break;
        case 1:
            if (rgb[1] !== 0) {
                rgb[1] -= subAmt;
            } else if (rgb[1] === 0 && rgb[2] !== 0) {
                rgb[2] -= subAmt;
            } else if (rgb[1] === 0 && rgb[2] === 0 && rgb[0] !== 0) {
                rgb[0] -= subAmt;
            } else if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) {
                rgb[0] = 255;
                rgb[1] = 255;
                rgb[2] = 255;
                cycleCase(r, c);
            }
            break;
        case 2:
            if (rgb[2] !== 0) {
                rgb[2] -= subAmt;
            } else if (rgb[2] === 0 && rgb[0] !== 0) {
                rgb[0] -= subAmt;
            } else if (rgb[0] === 0 && rgb[2] === 0 && rgb[1] !== 0) {
                rgb[1] -= subAmt;
            } else if (rgb[0] === 0 && rgb[1] === 0 && rgb[2] === 0) {
                rgb[0] = 255;
                rgb[1] = 255;
                rgb[2] = 255;
                cycleCase(r, c);
            }
            break;
    }

    rgb[0] = Math.max(0, Math.min(255, rgb[0]));
    rgb[1] = Math.max(0, Math.min(255, rgb[1]));
    rgb[2] = Math.max(0, Math.min(255, rgb[2]));

    pixelRGB[r][c] = rgb;
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

function makeBox(r, c, size, strength) {
    var a = r - (size / 2);
    var b = c + (size / 2);
    for (var bb = b; bb < (b + (size / 2)); bb++) {
        for (var ab = a; ab < (a + (size / 2)); ab++) {
            colorChange(parseInt(ab), parseInt(bb), parseInt(strength));
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

function run() {
    var code = $('#console').val();
    var lines = code.split('\n');
    var matches = [];
    for (var i = 0; i < lines.length; i++) {
        matches.push(lines[i].match(/(\w+)/g));
    }

    for (var i = 0; i < lines.length; i++) {
        setTimeout(function(i) {
            switch (matches[i][0]) {
                case "darker":
                    darker(matches[i][1]);
                    break;
                case "gradient":
                    gradient(matches[i][1], matches[i][2], matches[i][3]);
                    break;
                case "fuzz":
                    fuzz(matches[i][1], matches[i][2], matches[i][3]);
                    break;
            }
        }, i * 250, i);
    }
}
