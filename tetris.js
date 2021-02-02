/*
    Daniel
	JavaScript Game - HTML5 Tetris
	tetris.js - Provides the code that runs the tetris game
    Contact me: https://github.com/Dani21/Tetris5/issues
	
	Plans:
	 - Saving options locally
	 - Local High Scores with Name/Date/Score/Level + Reset
*/

window.tetrisinfo = { version: "0.5.0", updated: new Date("5/26/2013")};

// Fixing things for IE8:
if(!document.getElementsByClassName) {
    document.getElementsByClassName = function(classname) {
        var possibilities = this.getElementsByTagName('*');
        var results = [];
        for(var tmp = possibilities.length-1; tmp >= 0; tmp--)
            if(possibilities[tmp].className.indexOf(classname) != -1)
                results.splice(0, 0, possibilities[tmp]);
        return results;
    };
}
if(!('forEach' in Array.prototype)) {
    Array.prototype.forEach = function(action, that) {
        for(var i = 0; i < this.length; i++)
            if(i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}

var Tetrimino = {
    element: undefined,
    cells: [[],[],[],[]],
    type: 'empty',
    top: '',
    left: '',
    ready: false,
    create: function(type) {
        var src = document.createElement('div');
        src.className = 'tetrimino';
        this.cells = [[],[],[],[]];
        for(var i = 0; i < 4; i++) {
            var outerTemp = document.createElement('div');
            for(var x = 0; x < 4; x++){
                var innerTemp = document.createElement('div');
                innerTemp.className = 'mino invis';
                this.cells[i].push(innerTemp);
                outerTemp.appendChild(innerTemp);
            }
            src.appendChild(outerTemp);
        }
        this.element = src;
        this.type = 'empty';
        if(type)
            this.setType(type);
        return this;
    },
    clear: function() {
        for(var i = 0; i < 4; i++)
            for(var x = 0; x < 4; x++)
                this.cells[i][x].className = 'mino invis';
        this.ready = false;
    },
    tetriminoBecome: function(source, type) {
        for(var i = 0; i < 4; i++)
            for(var x = 0; x < 4; x++)
                source.childNodes[i].childNodes[x].className = 'mino invis';
        switch(type) {
            case 'O':
                source.childNodes[2].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[3].className = 'mino visible';
                source.childNodes[3].childNodes[2].className = 'mino visible';
                source.childNodes[3].childNodes[3].className = 'mino visible';
                break;
            case 'I':
                source.childNodes[1].childNodes[0].className = 'mino visible';
                source.childNodes[1].childNodes[1].className = 'mino visible';
                source.childNodes[1].childNodes[2].className = 'mino visible';
                source.childNodes[1].childNodes[3].className = 'mino visible';
                break;
            case 'T':
                source.childNodes[1].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[1].className = 'mino visible';
                source.childNodes[2].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[3].className = 'mino visible';
                break;
            case 'L':
                source.childNodes[1].childNodes[3].className = 'mino visible';
                source.childNodes[2].childNodes[1].className = 'mino visible';
                source.childNodes[2].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[3].className = 'mino visible';
                break;
            case 'J':
                source.childNodes[1].childNodes[1].className = 'mino visible';
                source.childNodes[2].childNodes[1].className = 'mino visible';
                source.childNodes[2].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[3].className = 'mino visible';
                break;
            case 'S':
                source.childNodes[1].childNodes[2].className = 'mino visible';
                source.childNodes[1].childNodes[3].className = 'mino visible';
                source.childNodes[2].childNodes[1].className = 'mino visible';
                source.childNodes[2].childNodes[2].className = 'mino visible';
                break;
            case 'Z':
                source.childNodes[1].childNodes[1].className = 'mino visible';
                source.childNodes[1].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[2].className = 'mino visible';
                source.childNodes[2].childNodes[3].className = 'mino visible';
                break;
            case 'empty':
                source.className = 'tetrimino';
                break;
            default:
                console.log('Unknown tetrimino type: ' + type);
                source.className = 'tetrimino';
                return;
        }
        source.className = 'tetrimino ' + type;
    },
    setType: function(type) {
        this.tetriminoBecome(this.element, type);
        this.top = (this.getSize()-1);
        this.left = Math.floor(this.getSize()/2) + 4;
        this.update();
        this.type = type;
        this.ready = true;
    },
    update: function() {
        var y = this.element.clientHeight/4;
        var x = this.element.clientWidth/4;
        this.element.style.top = (3 - 2*y + (this.top-3)*y) + 'px';
        this.element.style.left = (this.left-3)*x + 'px';  
    },
    getSize: function() {
        var size = 4-this.indexOfFirstFromLeft();
        var temp = 4-this.indexOfFirstFromTop();
        if(temp > size)
            size = temp;
        return size;
    },
    indexOfFirstFromTop: function() {
        for(var i = 0; i < 4; i++){
            var cur = this.element.childNodes[i].childNodes;
            for(var x = 0; x < 4; x++)
                if(cur[x].className.indexOf('invis') == -1)
                    return i;
        }
        return -1;
    },
    indexOfFirstFromLeft: function() {
        var el0 = this.element.childNodes[0].childNodes;
        var el1 = this.element.childNodes[1].childNodes;
        var el2 = this.element.childNodes[2].childNodes;
        var el3 = this.element.childNodes[3].childNodes;
        for(var i = 0; i < 4; i++)
            if(el0[i].className.indexOf('invis') == -1 || el1[i].className.indexOf('invis') == -1 || el2[i].className.indexOf('invis') == -1 || el3[i].className.indexOf('invis') == -1)
                return i;
        return -1;
    },
    proposeRightRotation: function() {
        var size = this.getSize();
        var temp = [[false, false, false, false],[false, false, false, false],[false, false, false, false],[false, false, false, false]];
        var i, x;
        for(i = 4-size; i < 4; i++)
            for(x = 4-size; x < 4; x++)
                if(this.cells[i][x].className.indexOf('invis') == -1)
                    temp[x][7-(i+size)] = true;
        return temp;
    },
    proposeLeftRotation: function() {
        var size = this.getSize();
        var temp = [[false, false, false, false],[false, false, false, false],[false, false, false, false],[false, false, false, false]];
        var i, x;
        for(i = 4-size; i < 4; i++)
            for(x = 4-size; x < 4; x++)
                if(this.cells[i][x].className.indexOf('invis') == -1)
                    temp[7-(x+size)][i] = true;
        return temp;
    }
}
var Matrix = {
    element: undefined, // Will contain HTML div element of the Matrix itself
    rows: [], // 22 high, will contain HTML div elements of the rows of the Matrix
    cells: [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]], // 22 high x 10 wide, will contain HTML div elements of the cells of the Matrix
    falling: undefined, // Tetrimino object
    shadow: [], // Array of shadowed elements in Matrix
    toDelete: [], // Array of row elements to be cleared
    swapped: false, // Whether the user has placed a tetrimino in the Hold location since a tetrimino last landed
    other: undefined, // The type of tetrimino in the Hold position
    next: [], // Array of elements for the next three tetriminos
    bag: [],
    score: 0, // Total score
    combo: 0, // Combo streak length
    level: 1, // Level user is currently on
    lines: 0, // Lines cleared in this level
    scoreHolder: undefined, // Element that displays the score
    levelHolder: undefined, // Element that displays the level
    lineHolder: undefined, // Element that displays how many lines required to level up
    fallingFunction: undefined,
    movesAtBottom: 0,
    relaxed: false,
    normal: true,
    stressful: false,
	tapQueue: [],
    difficulty: undefined,
	debug: false,
    create: function() {
        var src = document.createElement('div');
        src.className = 'tetrisgrid';
        for(var i = 0; i < 22; i++) {
            var outerTemp = document.createElement('div');
            for(var x = 0; x < 10; x++) {
                var innerTemp = document.createElement('div');
                innerTemp.className = 'tetriscell empty';
                this.cells[i].push(innerTemp);
                outerTemp.appendChild(innerTemp);
            }
            this.rows.push(outerTemp);
            src.appendChild(outerTemp);
        }
        this.element = src;
        this.scoreHolder = document.getElementById('score');
        this.levelHolder = document.getElementById('level');
        this.lineHolder = document.getElementById('lines');
        this.falling = Tetrimino.create();
    },
    newGame: function() {
        var i;
        
        // HTML/CSS changes
        this.element.style.opacity = ''; // Removes any opacity in Matrix
        this.scoreHolder.innerHTML = '0';
        this.levelHolder.innerHTML = '1';
        this.lineHolder.innerHTML = '5 lines';
        var a = document.getElementsByClassName('tetrismessage'); // In case there's still a message left
        for(i = 0; i < a.length; i++)
            a[i].parentNode.removeChild(a[i]);
        a = document.getElementById('paused'); // Or it was paused
        if(a)
            a.parentNode.removeChild(a);
        if(this.other) { // Removes the swapped tetrimino if it's saved
            this.other = undefined;
            Tetrimino.tetriminoBecome(document.getElementById('hold'), 'empty');
        }
        for(i = 0; i < this.next.length; i++)
            this.next[i].className = 'tetrisnext';
        
        // Class object changes:
        for(i = 0; i < 22; i++)
            for(var x = 0; x < 10; x++)
                this.cells[i][x].className = 'tetriscell empty';
        this.bag = [];
        window.types.forEach(function(x){grid.bag.push(x)});
        this.next = [];
        this.score = 0;
        this.combo = 0;
        this.level = 1;
        this.lines = 0;
        this.movesAtBottom = 0;
        this.swapped = false;
        this.nextTetrimino();
        this.createShadow();
        this.difficulty = this.normal || 2*this.stressful;
        this.autoDrop.main();
    },
    nextTetrimino: function() {
        if(this.bag.length === 0) {
            window.types.forEach(function(x){grid.bag.push(x)});
        }
        if(this.next.length === 0) {
            this.next = document/*.getElementById('htmltetris')*/.getElementsByClassName('tetrisnext');
            this.next = [this.next[0], this.next[1],this.next[2]]; // Sets this to be a static array
            Tetrimino.tetriminoBecome(this.next[0], this.bag.splice(Math.floor(Math.random()*this.bag.length),1)[0]);
            Tetrimino.tetriminoBecome(this.next[1], this.bag.splice(Math.floor(Math.random()*this.bag.length),1)[0]);
            Tetrimino.tetriminoBecome(this.next[2], this.bag.splice(Math.floor(Math.random()*this.bag.length),1)[0]);
        }
        var temp = this.next[0].className;
        temp = temp[temp.length-1];
        this.falling.setType(temp);
        
        temp = this.next[1].className;
        temp = temp.charAt(temp.length-1);
        Tetrimino.tetriminoBecome(this.next[0], temp);
        
        temp = this.next[2].className;
        temp = temp.charAt(temp.length-1);
        Tetrimino.tetriminoBecome(this.next[1], temp);
        
        Tetrimino.tetriminoBecome(this.next[2], this.bag.splice(Math.floor(Math.random()*this.bag.length),1)[0]);
    },
    
    // The rest of the methods are for moving the tetrimino
    inplaceTest: function(boolGrid, indexSource) { // This checks a grid for validity, a double array of booleans
        for(var i = 0; i < 4; i++)
            for(var x = 0; x < 4; x++) {
                if(boolGrid[i][x] && ((indexSource[0]-3+i) < 0 || (indexSource[0]-3+i) >= 22 || (indexSource[1]-3+x) < 0 || (indexSource[1]-3+x) > 9 || this.cells[indexSource[0]-3+i][indexSource[1]-3+x].className.indexOf('empty') == -1))
                    return false;
            }
        return true;
    },
    specifiedTest: function(indexGrid, indexSource) { // This checks specific coordinates for validity, an array (or list) of pairs of coordinates
        for(var i = 0; i < indexGrid.length; i++)
            if((indexSource[0]-3+indexGrid[i][0]) < 0 || (indexSource[0]-3+indexGrid[i][0]) >= 22 || (indexSource[1]-3+indexGrid[i][1]) < 0 || (indexSource[1]-3+indexGrid[i][1]) > 9 || this.cells[indexSource[0]-3+indexGrid[i][0]][indexSource[1]-3+indexGrid[i][1]].className.indexOf('empty') == -1)
                return false;
        return true;
    },
    atBottom: function() {
        var toTest = [];
        var x, i;
        for(x = grid.falling.indexOfFirstFromLeft(); x < 4; x++) // We're using x first, primarily goes through column by column instead of normal, checking from bottom up
            for(i = 3; i >= grid.falling.indexOfFirstFromTop(); i--)
                if(grid.falling.cells[i][x].className.indexOf('invis') == -1) {
                    toTest.push([i+1,x]); // If it found a mino, it adds its coordinates to toTest
                    break; // And continues onto the next column
                }
        // If we can move down:
        return !grid.specifiedTest(toTest, [grid.falling.top, grid.falling.left]);
    },
    autoDrop: {
        moveDown: function() {
            grid.falling.top++; // It moves the tetrimino's coordinates
            grid.falling.update(); // And the tetrimino updates its position on the page
            grid.movesAtBottom = 0;
            grid.autoDrop.main();
        },
        main: function() {
            if(!grid.difficulty)
                return;
            clearInterval(grid.fallingFunction);
            if(grid.atBottom())
                grid.fallingFunction = setTimeout(function(){if(grid.atBottom()) grid.land(); else grid.autoDrop.moveDown(); }, 500);
            else
                grid.fallingFunction = setTimeout(grid.autoDrop.moveDown, 1000*Math.pow(0.75,grid.level-1));
        }
    },
    move: function(direction) {
        var toTest = [];
        var i, x;
        var wasBottom = this.atBottom();
        switch(direction) {
            // In this case, we check for if the tetrimino can exist at this place to begin with
            case 'spawn':
                for(i = 0; i < 4; i++) {
                    toTest.push([]);
                    for(x = 0; x < 4; x++) {
                        if(this.falling.cells[i][x].className.indexOf('invis') == -1)
                            toTest[i].push(true);
                        else
                            toTest[i].push(false);
                    }
                }
                this.movesAtBottom = 0;
                this.autoDrop.main();
                if(this.inplaceTest(toTest, [this.falling.top, this.falling.left]))
                    return true;
                return false;
            
            // In the following types of moves, the tetrimino's minos are mutated instead of the whole tetrimino shifting
            case 'clockwise':
                toTest = this.falling.proposeRightRotation(); // Gets a double array of booleans on where the new minos would be
                if(this.inplaceTest(toTest, [this.falling.top, this.falling.left])) { // Tests this
                    this.falling.clear(); // Empties the tetrimino's contents
                    for(i = 0; i < 4; i++)
                        for(x = 0; x < 4; x++)
                            if(toTest[i][x])
                                this.falling.cells[i][x].className = 'mino visible'; // Adds the new minos to the tetrimino
                    this.falling.ready = true;
                    this.createShadow();
                    this.movesAtBottom++;
                    if(this.atBottom() || wasBottom) {
                        if(this.movesAtBottom == 15)
                            this.move('down');
                        else
                            this.autoDrop.main();
                    }
                    return true;
                }
                return false;
            case 'counterclockwise':
                toTest = this.falling.proposeLeftRotation(); // Gets a double array of booleans on where the new minos would be
                if(this.inplaceTest(toTest, [this.falling.top, this.falling.left])) { // Tests this
                    this.falling.clear(); // Empties the tetrimino's contents
                    for(i = 0; i < 4; i++)
                        for(x = 0; x < 4; x++)
                            if(toTest[i][x])
                                this.falling.cells[i][x].className = 'mino visible'; // Adds the new minos to the tetrimino
                    this.falling.ready = true;
                    this.createShadow();
                    this.movesAtBottom++;
                    if(this.atBottom() || wasBottom) {
                        if(this.movesAtBottom == 15)
                            this.move('down');
                        else
                            this.autoDrop.main();
                    }
                    return true;
                }
                return false;
                
            // In the following types of moves, the whole tetrimino moves instead of staying in place
            case 'left':
                for(i = this.falling.indexOfFirstFromTop(); i < 4; i++)
                    for(x = this.falling.indexOfFirstFromLeft(); x < 4; x++)
                        if(this.falling.cells[i][x].className.indexOf('invis') == -1) {
                            toTest.push([i,x-1]); // If it found a mino, it adds its coordinates to toTest
                            break; // And continues onto the next row
                        }
                if(this.specifiedTest(toTest, [this.falling.top, this.falling.left])) {
                    this.falling.left--; // It moves the tetrimino's coordinates
                    this.falling.update(); // And the tetrimino updates its position on the page
                    this.createShadow();
                    this.movesAtBottom++;
                    if(this.atBottom() || wasBottom) {
                        if(this.movesAtBottom == 15)
                            this.move('down');
                        else
                            this.autoDrop.main();
                    }
                    return true;
                }
                return false;
            case 'down':
                if(wasBottom) {
                    this.land(); // If it can't move down without collision, it's placed here
                    return false;
                }
                this.falling.top++; // It moves the tetrimino's coordinates
                this.falling.update(); // And the tetrimino updates its position on the page
                this.score++;
                this.scoreHolder.innerHTML = this.score;
                this.movesAtBottom = 0;
                if(this.atBottom())
                    this.autoDrop.main();
                return true;
            case 'right':
                for(i = this.falling.indexOfFirstFromTop(); i < 4; i++)
                    for(x = 3; x > 0; x--)
                        if(this.falling.cells[i][x].className.indexOf('invis') == -1) {
                            toTest.push([i,x+1]); // If it found a mino, it adds its coordinates to toTest
                            break; // And continues onto the next row
                        }
                if(this.specifiedTest(toTest, [this.falling.top, this.falling.left])) { // If this can be placed without collision
                    this.falling.left++; // It moves the tetrimino's coordinates
                    this.falling.update(); // And the tetrimino updates its position on the page
                    this.createShadow();
                    this.movesAtBottom++;
                    if(this.atBottom() || wasBottom) {
                        if(this.movesAtBottom == 15)
                            this.move('down');
                        else
                            this.autoDrop.main();
                    }
                    return true;
                }
                return false;
            case 'swap':
                if(!this.swapped) {
                    var temp;
                    if(this.other) {
                        temp = this.other;
                        this.other = this.falling.type;
                        this.falling.setType(temp);
                    }
                    else {
                        this.other = this.falling.type;
                        this.nextTetrimino();
                    }
                    this.falling.tetriminoBecome(document.getElementById('hold'), this.other);
                    this.swapped = true;
                    this.createShadow();
                    this.movesAtBottom = 0;
                    this.autoDrop.main();
                    return true;
                }
                return false;
            default: // Invalid move
                return false;
        }
    },
    createShadow: function() {
        var smallest = 22, i, x;
        for(i = 0; i < this.shadow.length; i++) {
            this.shadow[i].className = 'tetriscell empty';
        }
        for(x = 0; x < 4; x++) {
            for(i = 3; i >= 0; i--) { // Goes from bottom up in each column
                if(this.falling.cells[i][x].className.indexOf('invis') == -1) {
                    this.shadow = [i,x];
                    break;
                }
            }
            if(this.shadow[1] == x) {
                for(i = this.shadow[0]-3+this.falling.top; i < 22; i++) {
                    if(this.cells[i][x-3+this.falling.left].className.indexOf('empty') == -1) {
                        if(i-this.shadow[0] < smallest)
                            smallest = i-this.shadow[0];
                        break;
                    }
                }
                if(smallest > 22-this.shadow[0])
                    smallest = 22-this.shadow[0];
            }
        }
        for(i = 0; i < 4; i++)
            for(x = 0; x < 4; x++) {
                if(this.falling.cells[i][x].className.indexOf('invis') == -1) { // Insert shadow
                    this.cells[i-1+smallest][x-3+this.falling.left].className = 'tetriscell empty shadow';
                    this.shadow.push(this.cells[i-1+smallest][x-3+this.falling.left]);
                }
            }
    },
    land: function() {
        // This method places a tetrimino in the Matrix permanently and looks for lines to clear
        grid.shadow = [];
        grid.falling.ready = false;
        var results = [], temp = true;
        clearInterval(grid.fallingFunction);
        for(var i = 0; i < 4 && grid.falling.top-3+i < 22; i++) {
            if(grid.falling.top-3+i < 0)
                continue;
            for(var x = 0; x < 4; x++) // This for loop goes through each mino of the tetrimino and places it in the matrix
                if(grid.falling.element.childNodes[i].childNodes[x].className.indexOf('invis') == -1)
                    grid.cells[grid.falling.top-3+i][grid.falling.left-3+x].className = 'tetriscell ' + grid.falling.type;
            for(x = 0; x < 10; x++)
                if(grid.cells[grid.falling.top-3+i][x].className.indexOf('empty') != -1) {
                    temp = false;
                    break;
                }
            if(temp)
                results.push(grid.falling.top-3+i);
            temp = true;
        }
        if(results.length !== 0) {
            grid.addScore(results.length);
            grid.flash(results);
        }
        else {
            grid.combo = 0;
            grid.scoreHolder.innerHTML = grid.score; // In case user dropped tetrimino
        }
        grid.falling.setType(grid.next[0].className.charAt(grid.next[0].className.length-1)); // A new block is created and that's placed at the top
        if(grid.move('spawn')) {
            grid.nextTetrimino();
            grid.autoDrop.main();
        }
        else {
            // This block doesn't have space to be placed at the top
            grid.falling.clear();
            if(results.length === 0) // If there aren't lines to be cleared, then the game is over
                grid.gameOver();
        }
        grid.swapped = false;
        grid.createShadow();
    },
    flash: function(remove) {
        var elements = [];
        for(var i=0; i < remove.length; i++) {
            if(this.toDelete.indexOf(this.rows[remove[i]]) != -1) // Skip row if this is being deleted already
                continue;
            this.toDelete.push(this.rows[remove[i]]);
            elements.push(this.rows[remove[i]]);
        }
        for(i = 0; i < elements.length; i++)
            elements[i].style.opacity = "0.8";
        (function(r){window.setTimeout(function(){ for(var i=0; i < r.length; i++) r[i].style.opacity = "1";},250);})(elements);
        (function(r){window.setTimeout(function(){ for(var i=0; i < r.length; i++) r[i].style.opacity = "0.8";},350);})(elements);
        (function(r){window.setTimeout(function(){ for(var i=0; i < r.length; i++) r[i].style.opacity = "1";},600);})(elements);
        (function(r){window.setTimeout(function(){
            for(var i=0; i < r.length; i++) {
                var index = grid.rows.indexOf(r[i]);
                var a = grid.rows.splice(index,1)[0];
                a.parentNode.removeChild(a);
                grid.toDelete.splice(grid.toDelete.indexOf(a),0);
                grid.cells.splice(index,1);
                var outerTemp = document.createElement('div');
                for(var x = 0; x < 10; x++) {
                    var innerTemp = document.createElement('div');
                    innerTemp.className = 'tetriscell empty';
                    outerTemp.appendChild(innerTemp);
                }
                grid.cells.splice(0,0,outerTemp.childNodes);
                grid.rows.splice(0,0,outerTemp);
                document.getElementsByClassName('tetrisgrid')[0].insertBefore(outerTemp,document.getElementsByClassName('tetrisgrid')[0].firstChild);
            }
            if(!grid.falling.ready) { // If there previously wasn't space to place a block at the top
                grid.falling.setType(grid.next[0].className.charAt(grid.next[0].className.length-1));
                if(grid.move('spawn')) {
                    grid.nextTetrimino();
                    this.autoDrop.main();
                }
                else {
                    grid.falling.clear();
                    grid.gameOver();
                }
            }
            grid.createShadow();    // Would remove or set the shadow depending on if we needed it
                                    // Also in case the next block would actually fall further
        },700);})(elements);
    },
    gameOver: function() {
        clearInterval(this.fallingFunction);
        this.element.style.opacity = '0.2';
        this.createMessage([['h1','Game Over!']]);
    },
    pause: function() {
        if(!grid.falling.ready)
            return;
        grid.falling.ready = false;
        
        var a = document.createElement('div');
        clearInterval(grid.fallingFunction);
        grid.element.style.opacity = '0.3';
        a.innerHTML = 'Click to resume...';
        a.id = 'paused';
        a.className = 'tetrisbutton tetrisoption';
        a.style.position = 'absolute';
        a.style.top = '50%';
        a.style.left = '50%';
        a.style.OTransform = 'translate(-50%, -50%)';
        a.style.msTransform = 'translate(-50%, -50%)';
        a.style.MozTransform = 'translate(-50%, -50%)';
        a.style.WebkitTransform = 'translate(-50%, -50%)';
        a.style.transform = 'translate(-50%, -50%)';
        a.style.margin = '0px';
        a.style.opacity = '0';
        setTimeout(function(){a.style.opacity = '1'},500);
        a.onclick = function() {
            this.parentNode.removeChild(this);
            grid.element.style.opacity = '1.0';
            grid.autoDrop.main();
            grid.falling.ready = true;
        };
        document.getElementById('htmltetris').appendChild(a);
    },
    createMessage: function(contents, menu) {
        var a = document.createElement('div');
        grid.pause();
		a.className = 'tetrismessage';
		var close = function(e) {
			if (!e) e = window.event;
			e = e.target || e.srcElement;
			while(e.className.indexOf('tetrismessage') == -1)
				e = e.parentNode;
			e.style.opacity = '';
			e.title = '';
			window.setTimeout(function() {e.parentNode.removeChild(e);}, 500); // To fade out
			e.onclick = undefined;
		}
		if(menu) {
			a.className += ' tetrismenu';
			a.style.backgroundColor = '#181515';
			var img = document.createElement('img');
			img.src = window.host + 'close.png';
			img.alt = 'close';
			img.title = 'Close this message';
			img.onclick = close;
			img.className = 'tetrisclick';
			a.appendChild(img);
		} else {
			a.title = 'Close this message';
			a.onclick = close;
		}
        document.getElementById('htmltetris').appendChild(a);
        (function(a) {window.setTimeout(function() {a.style.opacity = '1.0';},20);})(a); // To fade in
        var temp;
        for(var i = 0; i < contents.length; i++) {
            temp = a.appendChild(document.createElement(contents[i][0]));
            if(contents[i][1]) {
                temp.innerHTML = contents[i][1];
                if(contents[i][2]) {
                    temp.className = contents[i][2];
                    temp.onclick = contents[i][3];
                    temp.title=contents[i][1];
                }
            }
        }
        return a;
    },
    setDifficulty: function(option) {
        var buttons = document.getElementsByClassName('tetrisdifficulty');
        for(var i = 0; i < buttons.length; i++)
            buttons[i].className = 'tetrisbutton tetrisoption tetrisdifficulty';
        switch (option) {
            case 'relaxed':
                this.relaxed = true;
                this.normal = false;
                this.stressful = false;
                break;
            case 'normal':
                this.relaxed = false;
                this.normal = true;
                this.stressful = false;
                break;
            case 'stressful':
                this.relaxed = false;
                this.normal = false;
                this.stressful = true;
                break;
        }
    },
    addScore: function(numLines) {
        /*
        Scoring system from: http://www.tetrisfriends.com/help/tips_appendix.php#scoringchart
        
        T-spins, to be implemented in a future version...
        if(this.falling.type == 'T') {
            
        }
        */
        if(numLines == 1)
            this.score += 100*this.level;
        else if(numLines == 2)
            this.score += 300*this.level;
        else if(numLines == 3)
            this.score += 500*this.level;
        else if(numLines == 4)
            this.score += 800*this.level;
        this.score += this.combo*50*this.level; // If they've completed consecutive line clears, give them combo points
        this.combo++;
        this.lines += numLines;
        if(this.lines >= 5*this.level) {
            this.lines-=5*this.level;
            this.level++;
            this.levelHolder.innerHTML = this.level;
        }
        this.scoreHolder.innerHTML = this.score;
        this.lineHolder.innerHTML = (5*this.level - this.lines) + ' line' + ( 5*this.level - this.lines == 1 ? '' : 's');
    }
}

var host = 'https://dani21.github.io/Tetris5/';

function start() {
    
    window.grid = Matrix;
    
    // Setup webpage:
        var temp, t, z;
        window.local = !!document.getElementById('tetrisStyle');
        if(!local && !window.loaded) {
            // Insert stylesheet:
            temp = document.createElement('link');
            temp.href = host + 'style.css';
            temp.rel = 'stylesheet';
            temp.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(temp);
        }
        
        
        // Tetris container:
        window.htmltetris = document.createElement('div');
        htmltetris.id = 'htmltetris';
		htmltetris.style.visibility = 'hidden';
        document.body.appendChild(htmltetris);
        
        // Matrix title:
        temp = document.createElement('div');
        temp.id = 'matrixtop';
        htmltetris.appendChild(temp);
        
        // Credit due to: http://openclipart.org/detail/74881/cerrar-by-nomade
        t = document.createElement('img');
        t.src = (local ? '' : host) + 'close.png';
        t.alt = 'Close';
        t.title = 'Close Tetris';
		t.className = 'tetrisclick';
        t.onclick = function(){ if(local) window.open('','_self','').close(); else htmltetris.parentNode.removeChild(htmltetris); clearInterval(grid.fallingFunction); grid.falling.ready = false; htmltetris = undefined; };
        temp.appendChild(t);
        
        t = document.createElement('img');
        t.src = (local ? '' : host) + 'pause.png';
        t.alt = 'Pause';
        t.title = 'Pause Tetris';
		t.className = 'tetrisclick';
		t.style.right = '30px';
        t.onclick = grid.pause;
        temp.appendChild(t);
        
        t = document.createElement('div');
        t.innerHTML = 'HTML5 Tetris';
        temp.appendChild(t);
        
        // Matrix left side:
        temp = document.createElement('div');
        temp.id = 'matrixleft';
        temp.className = 'tetrismain';
        htmltetris.appendChild(temp);
        
        t = Tetrimino.create().element;
        t.id = 'hold';
        temp.appendChild(t);
        
        t = document.createElement('div');
        t.innerHTML = 'Score:';
        z = document.createElement('div');
        z.innerHTML = '0';
        z.id = 'score';
        t.appendChild(z);
        t.innerHTML += 'Level:';
        z = document.createElement('div');
        z.innerHTML = '1';
        z.id = 'level';
        t.appendChild(z);
        t.innerHTML += 'Next level:';
        z = document.createElement('div');
        z.innerHTML = '5 lines';
        z.id = 'lines';
        t.appendChild(z);
        temp.appendChild(t);
        
        t = document.createElement('div');
        t.className = 'tetriscontrols';
        z = document.createElement('div');
        z.className = 'tetrisbutton';
        z.innerHTML = 'Options';
        z.title = 'Change options!';
        z.onclick = function() {
            var msg = [];
            msg.push(['h2','Difficulty:']);
            msg.push(['div', 'Relaxed', 'tetrisbutton tetrisoption tetrisdifficulty' + (grid.relaxed ? ' tetrisselected' : ''), function(event){ grid.setDifficulty('relaxed'); this.className += ' tetrisselected'; event.stopPropagation(); }]);
            msg.push(['div', 'Normal', 'tetrisbutton tetrisoption tetrisdifficulty' + (grid.normal ? ' tetrisselected' : ''), function(event){ grid.setDifficulty('normal'); this.className += ' tetrisselected'; event.stopPropagation(); }]);
            msg.push(['div', 'Stressful', 'tetrisbutton tetrisoption tetrisdifficulty' + (grid.stressful ? ' tetrisselected' : ''), function(event){ alert('One day this will be finished... And it\'ll be awesome!'); /* grid.setDifficulty('stressful'); this.className += ' tetrisselected';*/ event.stopPropagation(); }]);
			msg.push(['h2','Debugging Mode:']);
			msg.push(['div', 'Off', 'tetrisbutton tetrisoption tetrisdebug' + (grid.debug ? '' : ' tetrisselected'), function(event){ var a=document.createElement('style'); a.type='text/css'; a.innerHTML='#htmltetris .tetrimino .mino.invis { visibility: hidden; }'; document.body.appendChild(a); var b=document.getElementsByClassName('tetrisdebug'); for(var i=0;i<b.length; i++) {b[i].className='tetrisoption tetrisbutton tetrisdebug'} this.className+=' tetrisselected'; grid.debug = false; event.stopPropagation(); }]);
			msg.push(['div', 'On', 'tetrisbutton tetrisoption tetrisdebug' + (grid.debug ? ' tetrisselected' : ''), function(event){ var a=document.createElement('style'); a.type='text/css'; a.innerHTML='#htmltetris .tetrimino .mino.invis { visibility: visible; }'; document.body.appendChild(a); var b=document.getElementsByClassName('tetrisdebug'); for(var i=0;i<b.length; i++) {b[i].className='tetrisoption tetrisbutton tetrisdebug'} this.className+=' tetrisselected'; grid.debug = true; event.stopPropagation(); }]);
            var el = grid.createMessage(msg, true);
        };
        t.appendChild(z);
        
		if(window.navigator.mozApps) {
			var myApp = window.navigator.mozApps.getSelf();
			myApp.onsuccess = function(e){
				myApp = myApp.result;
				if(myApp && myApp.manifest.version == tetrisinfo.version)
					return;
				var z = document.getElementById('tetrisbookmark');
				z.className = 'tetrisbutton';
				z.title = 'Play Tetris at any time!';
				if(!myApp) {
					z.innerHTML = 'Install';
				} else {
					z.innerHTML = 'Update';
				}
				z.onclick = function() {
					var msg = [];
					if(!myApp) {
						msg.push(['h2','Install']);
					} else {
						msg.push(['h2','Update']);
					}
					msg.push(['p','You can install Tetris to this device by tapping the button below, and open it from your home screen for easy access!']);
					var el = grid.createMessage(msg,true);
					el = el.appendChild(document.createElement('div'));
					el.onclick = function(event){ window.navigator.mozApps.install(host + 'manifest.webapp'); };
					el.className = 'tetrisbutton tetrisoption';
					el.style.color = '#C8C7C8';
					el.style.marginBottom = '12px';
					el.title = 'Play tetris right now!';
					el.innerHTML = 'Install';
				}
			};
			z = document.createElement('div');
			z.id = 'tetrisbookmark';
			t.appendChild(z);
		} else {
			z = document.createElement('div');
			z.className = 'tetrisbutton';
			z.title = 'Play Tetris at any time!';
			z.innerHTML = 'Bookmark';
			z.onclick = function() {
				var msg = [];
				msg.push(['h2','Bookmark']);
				msg.push(['p','Drag the link below to your bookmarks toolbar, and click it at anytime to play Tetris on the page you\'re viewing!']);
				var el = grid.createMessage(msg,true);
				el = el.appendChild(document.createElement('a'));
				el.href = "javascript:(function(){var a = document.createElement('script'); a.src = 'https://dani21.github.io/Tetris5/tetris.js'; document.head.appendChild(a);})();";
				el.onclick = function(event){ return false; };
				el = el.appendChild(document.createElement('div'));
				el.className = 'tetrisbutton tetrisoption';
				el.style.color = '#C8C7C8';
				el.style.marginBottom = '12px';
				el.title = 'Play tetris right now!'
				el.innerHTML = 'Tetris';
			}
			t.appendChild(z);
		}

        z = document.createElement('div');
        z.className = 'tetrisbutton';
        z.innerHTML = 'Help';
        z.title = 'Instructions on how to play';
        z.onclick = function() {
            var msg = [];
            msg.push(['h2','Instructions:']);
            msg.push(['p','The goal of tetris is to continuously place Tetrimino blocks to fill up every cell of rows, which clears those lines.']);
            msg.push(['h2','Controls:']);
            msg.push(['p','Left/A - Move Tetrimino left']);
            msg.push(['p','Right/D - Move Tetrimino right']);
            msg.push(['p','Down/S - Move Tetrimino down one row']);
            msg.push(['p','Space - Drop Tetrimino to bottom']);
            msg.push(['p','Up/W - Rotate Tetrimino Right']);
            msg.push(['p','Control - Rotate Tetrimino Left']);
            msg.push(['p','Shift - Swap current Tetrimino with Hold queue']);
            //msg.push(['p','Esc/P - Pause the game']);
            grid.createMessage(msg);
        };
        t.appendChild(z);
        temp.appendChild(t);
        htmltetris.appendChild(temp);
        
        // Create Matrix:
        temp = document.createElement('div');
        temp.id = 'matrix';
        temp.className = 'tetrismain';
        htmltetris.appendChild(temp);
        
        // Matrix right side:
        temp = document.createElement('div');
        temp.id = 'matrixright';
        temp.className = 'tetrismain';
        htmltetris.appendChild(temp);
        
        t = Tetrimino.create().element;
        t.className += ' tetrisnext';
        temp.appendChild(t); // 1
        
        t = Tetrimino.create().element;
        t.className += ' tetrisnext';
        temp.appendChild(t); // 2
        
        t = Tetrimino.create().element;
        t.className += ' tetrisnext';
        temp.appendChild(t); // 3
        
        t = document.createElement('div');
        t.className = 'tetriscontrols';
        z = document.createElement('div');
        z.className = 'tetrisbutton';
        z.innerHTML = 'New Game';
        z.title = 'Start a new game!';
        z.onclick = function(){grid.newGame()};
        t.appendChild(z);
        temp.appendChild(t);
        htmltetris.appendChild(temp);
        
        // Create audio element:
        temp = document.createElement('audio');
        temp.title = 'Song Source: http://www.newgrounds.com/audio/listen/269767';
        temp.controls = 'controls';
        //temp.autoplay='autoplay';
        temp.loop='loop';
        temp.style.margin = '10px auto';
        temp.style.display = 'block';
        temp.style.maxWidth = '95%';
        temp.style.clear = 'both';
        temp.onfocus = temp.blur;
        
        // Source 1:
        t = document.createElement('source');
        t.src = (local ? '' : host) + 'tetris.ogg';
        t.type = 'audio/ogg';
        temp.appendChild(t);
        
        // Source 2:
        t = document.createElement('source');
        t.src = 'http://audio.ngfiles.com/269000/269767_HardCoreTetris.mp3';
        t.type = 'audio/mpeg';
        temp.appendChild(t);
        htmltetris.appendChild(temp);
		// Old:
        if(false)//htmltetris.parentNode == document.body)
            setTimeout(function() {
                // Fit screen best:
                t = self.innerHeight - 16 - htmltetris.clientHeight + 360; // leftover vertical space
                t = t - t%20 + 3; // Gets a form fitting height to tetris viewport
                temp = document.createElement('style');
                temp.rel = 'stylesheet';
                temp.type = 'text/css';
                temp.innerHTML = '#htmltetris > div:not(:first-child) { height: calc(' + t + 'px);}';
                t = t/(363) * 352; // 400 (width) - 52 (borders/paddings inside)
                temp.innerHTML += ' #htmltetris { width: calc(' + t + 'px); }';
                document.head.appendChild(temp);
            },1250);
		// New/lazy:
		setTimeout(function() {
			var ratio=self.innerWidth/htmltetris.clientWidth;
			if(self.innerWidth/self.innerHeight > htmltetris.clientWidth/htmltetris.clientHeight)
				ratio=self.innerHeight/htmltetris.clientHeight;
			if(self.innerWidth<400) {
				htmltetris.style.left = Math.abs(htmltetris.clientWidth-self.innerWidth)/-2+'px';
			}
			htmltetris.style.transform = 'scale('+ratio+')';
			htmltetris.style.visibility = 'visible';
        },250);
        
    // Set up game:
    window.loaded = true;
    window.types = ['O', 'I', 'L', 'T', 'J', 'S', 'Z'];
    grid.create();
	var lastUpdated = Math.floor((new Date().getTime() - tetrisinfo.updated.getTime())/(1000*3600*24));
	grid.createMessage([ // Instructional popup
		["h2", "Information:"],
		["p", "Welcome to this version of Tetris! This game is currently in development (updated " + (lastUpdated<1 ? "today" : (lastUpdated==1 ? "yesterday" : (lastUpdated + " days ago"))) + "), so keep checking back for improvements :)"],
		["h2", "Coming Soon:"],
		["ul", "<li>More debugging features.</li><li>Adding onscreen controls for touchscreen devices.</li><li>A selection of more Tetris songs to listen to.</li><li>A proper way to credit others who've helped me on this project.</li><li>And much, much more...</li>"],
		["h4", "For now, enjoy the game!"]
	]);
    
    // Give functionality to the game through the webpage:
    document.onkeydown = function() {
        (function(event) {
            if(useControl(event.keyCode)) {
                event.preventDefault();
                event.returnValue = false;
            }
        })(window.event || arguments[0]);
    }
    window.onblur = function() { grid.pause(); };
    
    // Insert game elements:
    document.getElementById('matrix').appendChild(grid.element);
    document.getElementById('matrix').appendChild(grid.falling.element);
}
function useControl(key) {
    // More at: http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
    if(!grid.falling.ready)
        return false;
    switch(key) {
        case 40: // Down
        case 83: // S
            grid.move('down');
            return true;
        case 38: // Up
        case 87: // W
            grid.move('clockwise');
            return true;
        case 39: // Right
        case 68: // D
            grid.move('right');
            return true;
        case 37: // Left
        case 65: // A
            grid.move('left');
            return true;
        case 17: // Ctrl
            grid.move('counterclockwise');
            return true;
        case 32: // Space
            while(grid.move('down')) // Moves down until it can't, which places the tetrimino and returns false
                grid.score++; // Moving an element down gets you one point, dropping gets 2x that much all the way down
            return true;
        case 16: // Shift
            grid.move('swap');
            return true;
        /*
        case 27: // Esc
        case 80: // P
            grid.pause();
            return true;
        */
    }
    return false;
}
if(document.body) {
	window.startbody=start;
	window.start = function() {
		window.startbody();
		window.htmltetris.style.zIndex = '999999999';		window.htmltetris.style.OTransform = 'translate(-50%, -50%)';
		window.htmltetris.style.msTransform = 'translate(-50%, -50%)';
		window.htmltetris.style.MozTransform = 'translate(-50%, -50%)';
		window.htmltetris.style.WebkitTransform = 'translate(-50%, -50%)';
		window.htmltetris.style.transform = 'translate(-50%, -50%)';
	};
}
