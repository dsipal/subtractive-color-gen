var cWidth = $('#boxContainer').width();
var cHeight = $('#boxContainer').height();
var bWidth = $('.box').width();
var bHeight = $('.box').height();
var bStrength = parseInt($('#bStrength').val());
var mDown = false;
var conShow = true;
$(document).ready(function() {

    setup(); //create the canvas

    //keeping track of if mouse is down or not.

    $(document).mousedown(function() {
        mDown = true;
    }).mouseup(function() {
        mDown = false;
    });
    $(document).tooltip();

    $(document).on('input', '#bStrength', function() {
        bStrength = parseInt($('#bStrength').val());
    });

    $('.box').on('mouseover', function() { //the drawing function!
        if (mDown) {
            var id = $(this).attr('id');
            var nums = id.match(/\d+/g);
            var x = parseInt(nums[0]);
            var c = parseInt(nums[1]);
            colorChange(x, c);
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
    console.log(cHeight);
    console.log(cWidth);
    console.log(bHeight);
    console.log(bWidth);
    console.log((cHeight / bHeight));
    console.log((cWidth / bWidth));

    for (var r = 0; r < (cHeight / bHeight); r++) {
        for (var c = 0; c < ((cWidth / bWidth)); c++) {
            var box = $("<div class='box' id=" + 'row-' + r + '-col-' + c + "></div>");
            box.appendTo('#boxContainer');
        }
    }
    //set case for all pixels to 0.
    $('.box').data('case', 0);
}

function gradient(i = 1, one = 0, two = 1) {
    for (a = 0; a < i; a++) {
        one++;
        for (var r = 0; r < (cHeight / bHeight); r++) {
            two++;
            for (var c = 0; c < (cWidth / bWidth); c++) {
                subAmt = one * two;
                colorChange(r, c, subAmt);
            }
        }
    }
}

function doGradients(i = 1, one = 0, two = 1, time = 250) {
    for (var x = 0; x < i; x++) {
        setTimeout(function(y) {
            gradient(1, one, two);
        }, x * time, x);
    }
}

function fuzz(min = 0, max = 255, mix = true) {
    for (var r = 0; r < (cHeight / bHeight); r++) {
        for (var c = 0; c < (cWidth / bWidth); c++) {
            if (mix) {
                var subAmt = (min + Math.floor(Math.random() * max))
                colorChange(r, c, subAmt);
            } else {
                $('#' + 'row-' + r + '-col-' + c).css("background-color", randGen(min, max));
            }
        }
    }
}

function randGen(min, max) {
    var r = min + Math.floor(Math.random() * max);
    var g = min + Math.floor(Math.random() * max);
    var b = min + Math.floor(Math.random() * max);

    return "rgb(" + r + "," + g + "," + b + ")";
}



function darker(amount) {
    for (var x = 0; x < (cHeight / bHeight); x++) {
        for (var c = 0; c < (cWidth / bWidth); c++) {
            colorChange(x, c, amount);
        }
    }
}

function doFuzz(i = 1, min = 0, max = 255, mix = 0, time = 250) {
    for (var x = 0; x < i; x++) {
        setTimeout(function(y) {
            fuzz(min, max, mix);
        }, x * time, x);
    }
}

function whiteShift(range) {
    for (var x = 0; x < (cHeight / bHeight); x++) {
        for (var c = 0; c < (cWidth / bWidth); c++) {
            var info = getInfo(x, c);
            var rgb = info[0];

            if (rgb[0] > (255 - range) && rgb[1] > (255 - range) && rgb[2] > (255 - range)) {
                cycleCase(x, c);
                colorChange(x, c, 85);
            }
        }
    }
}

function cycleCase(x, c) {
    var info = getInfo(x, c);
    var count = info[1];
    switch (count) {
        case 0:
            $('#' + 'row-' + x + '-col-' + c).data('case', 1);
            break;
        case 1:
            $('#' + 'row-' + x + '-col-' + c).data('case', 2);
            break;
        case 2:
            $('#' + 'row-' + x + '-col-' + c).data('case', 0);
            break;
    }
}

function getInfo(r, c) {
    var color = $('#' + 'row-' + r + '-col-' + c).css('background-color');
    var rgb = color.replace(/^rgb?\(|\s+|\)$/g, '').split(',');
    rgb[0] = parseInt(rgb[0]);
    rgb[1] = parseInt(rgb[1]);
    rgb[2] = parseInt(rgb[2]);

    var count = $('#' + 'row-' + r + '-col-' + c).data('case');

    var info = [rgb, count];

    return info;
}

function makeBox(r, c, size, strength) {
    var a = r - (size / 2);
    var b = c + (size / 2);
    console.log(a, b, size, strength);
    for (var bb = b; bb < (b + (size / 2)); bb++) {
        for (var ab = a; ab < (a + (size / 2)); ab++) {
            colorChange(parseInt(ab), parseInt(bb), parseInt(strength));
        }
    }
}

function colorChange(r, c, subAmt = bStrength) {

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
    $('#' + 'row-' + r + '-col-' + c).css("background-color", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
}


function reset() {
    for (var r = 0; r < (cHeight / bHeight); r++) {
        for (var c = 0; c < (cWidth / bWidth); c++) {
            var rgb = [255, 255, 255];
            $('#' + 'row-' + r + '-col-' + c).css("background-color", "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
            $('#' + 'row-' + r + '-col-' + c).data('case', 0);
        }
    }
}

function run() {
    var code = $('#console').val();
    console.log(code);
    var lines = code.split('\n');
    var matches = [];
    for (var i = 0; i < lines.length; i++) {
        matches.push(lines[i].match(/(\w+)/g));
    }
    console.log(matches);

    for (var i = 0; i < lines.length; i++) {
        console.log(i);
        console.log(matches[0][0]);
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
