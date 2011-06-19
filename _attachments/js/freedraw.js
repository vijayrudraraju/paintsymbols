// freedraw
// toimawb
// vijay rudraraju
// may 27 2011

var _globalMode = "input";

Object.prototype.clone = function() {
    var newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i == 'clone') continue;
        if (this[i] && typeof this[i] == "object") {
            newObj[i] = this[i].clone();
        } else newObj[i] = this[i]
    } return newObj;
};

var _canvasWidth = 800;
var _canvasHeight = 600;
var _mX = 0; 
var _mY = 0;
var projectionCode = [];

function globalP(p) {
	p.mouseMoved = function() {
		_mX = p.mouseX;
		_mY = p.mouseY;
	};

	p.mouseClicked = function() {
	};

	p.setup = function() {
		//p.println(p.PFont.list());

		p.size(_canvasWidth,_canvasHeight);
		var font = p.loadFont("monospace");
		p.textFont(font);
        p.fill(0);
        p.stroke(0);
	};

	p.draw = function() {
        if (_globalMode == "input") {
            //p.background(0);
            resetBlackCanvas();
            updateInputTree();
            drawInputTree();
        } else if (_globalMode == "edit") {
            p.noLoop();
            resetWhiteCanvas();
        }
	};
}

var p;
var symbols = {};
$(document).ready(function() {
		p = new Processing($('#composeCanvas')[0], globalP);

        initSymbols();
        initButtonClickHandlers();
        initCharSelectHandler();

        var dbname = "paintsymbols";
        p.println($.couch.db(dbname).allDocs({success:function(data){},crossDomain:true}));
});

function initSymbols() {
    var symbolIndices = $('#charSelect').children().map(function() {
            return this.innerHTML; 
            });
    for (var i=0;i<symbolIndices.length;i++) {
        symbols[symbolIndices[i]] = {};
        symbols[symbolIndices[i]].code = "";
        symbols[symbolIndices[i]].projectionCode = [];
        /*
        symbols[symbolIndices[i]].code += "var canvas = document.getElementById('editorCanvas');\n";
        symbols[symbolIndices[i]].code += "var context = canvas.getContext('2d');\n";
        symbols[symbolIndices[i]].code += "context.lineWidth = 1;\n\n";
        symbols[symbolIndices[i]].code += sprintf("context.strokeStyle = \"%s\";\n", stroke_color);
        symbols[symbolIndices[i]].code += sprintf("context.fillStyle = \"%s\";\n\n", fill_color);
        */
    }
}

//var eventStore;
function initCharSelectHandler() {
    this.lastVal = 'a';
    $('#charSelect').change(function(thisEvent) {
            saveLastSymbolState();
            lastVal = $('#charSelect').val();
            execute(lastVal);
            });
}
function saveLastSymbolState() {
    symbols[lastVal].code = $('#textarea').val();
    symbols[lastVal].projectionCode = projectionCode;
}
function execute(index) {
    resetWhiteCanvas();
    $('#textarea').val(symbols[index].code);
    projectionCode = symbols[index].projectionCode;
    window.eval( $('#textarea').val() );
}

function initButtonClickHandlers() {
    $('#levelSwitch').toggleClass('editClosed');
    $('#point').toggleClass('buttonDown');
    $('#textarea').val("");
    $('#composeCanvas').click(drawPoint);
    $('#line').toggleClass('buttonUp');

    //$('#composeCanvas').toggle(true);
    $('#editClosedText').toggle(true);
    $('#editorCanvas').toggle(false);
    $('#textarea').toggle(false);
    $('#buttonTable').toggle(false);
    $('#charSelect').toggle(false);
    $('#editOpenText').toggle(false);

    $('#levelSwitch').click(function() {
            if (_globalMode == "input") {
                _globalMode = "edit";
                //p.println("edit");
            } else if (_globalMode == "edit") {
                _globalMode = "input";
                //p.println("input");
                p.loop();
            }

            //$('#composeCanvas').toggle();
            //$('#editorCanvas').toggle();
            //$('#textarea').toggle();
            $('#input').toggle();
            $('#buttonTable').toggle();
            $('#charSelect').toggle();
            $('#levelSwitch').toggleClass('editClosed');
            $('#levelSwitch').toggleClass('editOpen');
            $('#editClosedText').toggle();
            $('#editOpenText').toggle();

            saveLastSymbolState();
            });
}

/*
* canvas functions
*/
function resetWhiteCanvas() {
    p.background(255);
    p.fill(0);
    p.stroke(0);
    p.line(_canvasWidth/2,0,_canvasWidth/2,_canvasHeight);
    p.line(0,_canvasHeight/2,_canvasWidth,_canvasHeight/2);
}
function resetBlackCanvas() {
    p.background(0);
    p.fill(255);
    p.stroke(255);
    p.line(_canvasWidth/2,0,_canvasWidth/2,_canvasHeight);
    p.line(0,_canvasHeight/2,_canvasWidth,_canvasHeight/2);
}

/*
* drawing functions
*/
function drawPoint() {
    //p.println("drawPoint!");
    $('#textarea').val($('#textarea').val()+sprintf("p.ellipse(%d,%d,%d,%d);\n",_mX,_mY,5,5));
    window.eval( $('#textarea').val() );
    projectionCode.push(["point",_mX,_mY]);
}

//var alpha = {};
/*
alpha.a = {path1:0,
    path2:0,
    path3:1,
    path4:1,
    num:0};
alpha.A = alpha.a.clone();
alpha.A.isCapital = true;
alpha.b = {path1:0,
    path2:0,
    path3:0.25,
    path4:0.25,
    path5:0.75,
    path6:0.75,
    path7:1,
    path8:1,
    num:1};
alpha.B = alpha.b.clone();
alpha.B.isCapital = true;
alpha.c = {path1:0,
    path2:0,
    path3:1,
    path4:1,
    num:2};
alpha.C = alpha.c.clone();
alpha.C.isCapital = true;
alpha.d = {path1:0,
    path2:0,
    path3:1,
    path4:1,
    num:3};
alpha.D = alpha.d.clone();
alpha.D.isCapital = true;
alpha.e = {path1:0,
    path2:0,
    path3:1,
    path4:1,
    num:4};
alpha.E = alpha.e.clone();
alpha.E.isCapital = true;
*/

var activeText = "";
var inputTree = [];
function updateInputTree() {
	activeText = $('#input').val();
    inputTree = activeText.split('.');
    for (var i=0;i<inputTree.length;i++) {
        inputTree[i] = inputTree[i].split(' ');
    }
}

function drawInputTree() {
    drawParagraph(inputTree);
}

function drawParagraph(input) {
    for (var i=0;i<input.length;i++) {
        if (input[i] == "") {
            continue;
        }

        if (i==0) {
            drawPhrase(input[0]);
        }
    }
}

function drawPhrase(input) {
    for (var i=0;i<input.length;i++) {
        if (input[i] == "") {
            continue;
        }

        if (i % 3 == 0) {
            p.fill(255-(i*25),0,0);
            p.stroke(255-(i*25),0,0);
        } else if (i % 3 == 1) {
            p.fill(0,255-(i*25),0);
            p.stroke(0,255-(i*25),0);
        } else if (i % 3 == 2) {
            p.fill(0,0,255-(i*25));
            p.stroke(0,0,255-(i*25));
        }

        drawWord(input[i]);
    }
}

function drawWord(input) {
    var projectionArray2;
    var projectionArray;

    if (input.length > 2) {
        projectionArray2 = symbols[input[2]].projectionCode;
        for (var j=0;j<projectionArray2.length;j++) {
            projectionArray = symbols[input[1]].projectionCode;
                window.eval("p.pushMatrix();");
                window.eval(sprintf("p.translate(%d,%d);",projectionArray2[j][1]-(_canvasWidth/2),projectionArray2[j][2]-(_canvasHeight/2)));
            for (var i=0;i<projectionArray.length;i++) {
                window.eval("p.pushMatrix();");
                window.eval(sprintf("p.translate(%d,%d);",projectionArray[i][1]-(_canvasWidth/2),projectionArray[i][2]-(_canvasHeight/2)));
                window.eval(symbols[input[0]].code);
                window.eval("p.popMatrix();");
            }
            window.eval("p.popMatrix();");
        }
    } else if (input.length > 1) {
        projectionArray = symbols[input[1]].projectionCode;
        for (var i=0;i<projectionArray.length;i++) {
            window.eval("p.pushMatrix();");
            window.eval(sprintf("p.translate(%d,%d);",projectionArray[i][1]-(_canvasWidth/2),projectionArray[i][2]-(_canvasHeight/2)));
            window.eval(symbols[input[0]].code);
            window.eval("p.popMatrix();");
        }
    } else if (input.length == 1) {
        window.eval(symbols[input[0]].code);
    }
}
