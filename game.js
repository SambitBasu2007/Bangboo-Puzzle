// ============================================================
// PIPE PUZZLE GAME ENGINE
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tile size
const TILE_SIZE = 90;
const GRID_SIZE = 6;

// Game states
const STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    LEVEL_COMPLETE: 'level_complete',
    GAME_OVER: 'game_over'
};

// Direction vectors
const DIRECTIONS = {
    up: { x: 0, y: -1, opposite: 'down' },
    down: { x: 0, y: 1, opposite: 'up' },
    left: { x: -1, y: 0, opposite: 'right' },
    right: { x: 1, y: 0, opposite: 'left' }
};

const COUNTER_CLOCKWISE = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up'
};

// Color palette
const COLORS = {
    wall: '#0b2527',
    wallBorder: '#06191a',
    empty: '#153f41',
    emptyBorder: '#25585a',
    start: '#76c9a7',
    startGlow: 'rgba(118, 201, 167, 0.16)',
    finish: '#8acfc6',
    finishGlow: 'rgba(138, 207, 198, 0.16)',
    box: '#e89a42',
    boxGlow: 'rgba(232, 154, 66, 0.18)',
    boxCollected: '#62b89c',
    pipe: '#287d7c',
    pipeBorder: '#175756',
    pipeHighlight: '#4bb4a9',
    rotator: '#358d86',
    rotatorGlow: 'rgba(53, 141, 134, 0.14)',
    player: '#d8f2ed',
    playerGlow: 'rgba(216, 242, 237, 0.14)',
    text: '#e6f2f0',
    gridLine: 'rgba(200, 238, 231, 0.06)'
};

const images = {
    player: new Image(),
    pipeStraight: new Image(),
    pipeCorner: new Image(),
    rotator: new Image(),
    start: new Image(),
    finish: new Image(),
    box: new Image(),
    boxCollected: new Image(),
    wall: new Image(),
    floor: new Image(),
    candy: new Image()
};

images.player.src = 'assets/player.png';
// images.pipeStraight.src = 'assets/pipe-straight.png';
// images.pipeCorner.src = 'assets/pipe-corner.png';
// images.rotator.src = 'assets/rotator.png';
// images.start.src = 'assets/start.png';
images.finish.src = 'assets/finish.png';
// images.box.src = 'assets/box.png';
// images.boxCollected.src = 'assets/box-collected.png';
// images.wall.src = 'assets/wall.png';
// images.floor.src = 'assets/floor.png';
// images.candy.src = 'assets/player-trail.png';

// ============================================================
// LEVEL DEFINITIONS
// ============================================================

const LEVELS = [
    // Level 1 - Tutorial (from screenshot)
    {
        id: 1,
        name: "First Steps",
        grid: [
            ['X', 'E', 'R', 'R', 'E', 'X'],
            ['E', 'B', 'V', 'V', 'B', 'E'],
            ['X', 'E', 'S', 'F', 'E', 'X'],
            ['E', 'B', 'C', 'C', 'B', 'E'],
            ['X', 'C', 'E', 'E', 'C', 'X'],
            ['X', 'X', 'X', 'X', 'X', 'X']
        ],
        pipeConfigs: {
            '1,2': { type: 'vertical', dirs: ['up', 'down'] },
            '1,3': { type: 'vertical', dirs: ['up', 'down'] },
            '3,2': { type: 'corner', dirs: ['down', 'right'] },
            '3,3': { type: 'corner', dirs: ['up', 'right'] },
            '4,1': { type: 'corner', dirs: ['up', 'right'] },
            '4,4': { type: 'corner', dirs: ['up', 'left'] }
        },
        playerStart: { x: 2, y: 2 },
        totalBoxes: 4
    },
    // Level 2 - The Maze
    {
        id: 5,
        name: "Puzzle 2",
        grid: [
            ['B', 'S', 'E', 'E', 'F', 'B'],
            ['E', 'X', 'X', 'X', 'X', 'E'],
            ['E', 'R', 'E', 'E', 'V', 'E'],
            ['E', 'R', 'C', 'V', 'X', 'E'],
            ['E', 'X', 'R', 'R', 'E', 'B'],
            ['E', 'X', 'R', 'R', 'E', 'B']
        ],
        pipeConfigs: {
            '2,4': { type: 'vertical', dirs: ['left', 'right'] },
            '3,2': { type: 'corner', dirs: ['up', 'right'] },
            '3,3': { type: 'vertical', dirs: ['up', 'down'] }
        },
        playerStart: { x: 1, y: 0 },
        totalBoxes: 4
    },
    // Level 3 - Rotator Madness
    {
        id: 3,
        name: "Puzzle 1",
        grid: [
            ['S', 'E', 'E', 'E', 'X', 'X'],
            ['E', 'F', 'X', 'B', 'E', 'E'],
            ['E', 'B', 'X', 'X', 'E', 'V'],
            ['E', 'E', 'E', 'X', 'X', 'E'],
            ['R', 'E', 'E', 'V', 'E', 'B'],
            ['X', 'E', 'R', 'E', 'V', 'E']
        ],
        pipeConfigs: {
            '2,5': { type: 'vertical', dirs: ['left', 'right'] },
            '4,3': { type: 'vertical', dirs: ['up', 'down'] },
            '5,4': { type: 'vertical', dirs: ['up', 'down'] }
        },
        playerStart: { x: 0, y: 0 },
        totalBoxes: 3
    },
    // Level 4 - The Gauntlet
    {
        id: 4,
        name: "The Gauntlet",
        grid: [
            ['S', 'E', 'X', 'X', 'B', 'R'],
            ['V', 'C', 'E', 'R', 'E', 'V'],
            ['E', 'E', 'V', 'C', 'E', 'B'],
            ['B', 'C', 'E', 'E', 'V', 'E'],
            ['E', 'E', 'R', 'E', 'V', 'F'],
            ['X', 'B', 'E', 'C', 'E', 'X']
        ],
        pipeConfigs: {
            '1,0': { type: 'vertical', dirs: ['left', 'right'] },
            '1,1': { type: 'corner', dirs: ['up', 'right'] },
            '1,5': { type: 'vertical', dirs: ['left', 'right'] },
            '2,2': { type: 'vertical', dirs: ['up', 'down'] },
            '2,3': { type: 'corner', dirs: ['up', 'left'] },
            '3,1': { type: 'corner', dirs: ['up', 'right'] },
            '3,4': { type: 'vertical', dirs: ['left', 'right'] },
            '4,4': { type: 'vertical', dirs: ['left', 'right'] },
            '5,3': { type: 'corner', dirs: ['up', 'left'] }
        },
        playerStart: { x: 0, y: 0 },
        totalBoxes: 4
    },
    // Level 5 - Final Challenge
    {
        id: 5,
        name: "Final Challenge",
        grid: [
            ['X', 'E', 'S', 'E', 'R', 'C'],
            ['E', 'C', 'V', 'C', 'E', 'B'],
            ['B', 'R', 'E', 'E', 'E', 'V'],
            ['E', 'E', 'V', 'C', 'E', 'F'],
            ['X', 'C', 'E', 'B', 'V', 'E'],
            ['E', 'R', 'B', 'E', 'E', 'X']
        ],
        pipeConfigs: {
            '0,5': { type: 'corner', dirs: ['up', 'left'] },
            '1,1': { type: 'corner', dirs: ['up', 'right'] },
            '1,2': { type: 'vertical', dirs: ['left', 'right'] },
            '1,3': { type: 'corner', dirs: ['down', 'left'] },
            '2,5': { type: 'vertical', dirs: ['left', 'right'] },
            '2,1': { type: 'corner', dirs: ['down', 'right'] },
            '3,2': { type: 'vertical', dirs: ['up', 'down'] },
            '3,3': { type: 'corner', dirs: ['down', 'right'] },
            '4,1': { type: 'corner', dirs: ['up', 'right'] },
            '4,4': { type: 'vertical', dirs: ['up', 'down'] }
        },
        playerStart: { x: 2, y: 0 },
        totalBoxes: 4
    },

    {
        id: 6,
        name: "Puzzle 3",
        grid: [
            ['S', 'E', 'R', 'V', 'E', 'B'],
            ['E', 'R', 'B', 'E', 'X', 'E'],
            ['V', 'E', 'V', 'X', 'E', 'V'],
            ['E', 'X', 'E', 'R', 'E', 'E'],
            ['B', 'E', 'V', 'E', 'B', 'F'],
            ['E', 'E', 'R', 'E', 'V', 'E']
        ],
        pipeConfigs: {
            '0,3': { type: 'vertical', dirs: ['up', 'down'] },
            '2,0': { type: 'vertical', dirs: ['left', 'right'] },
            '2,2': { type: 'vertical', dirs: ['up', 'down'] },
            '2,5': { type: 'vertical', dirs: ['left', 'right'] },
            '4,2': { type: 'vertical', dirs: ['up', 'down'] },
            '5,4': { type: 'vertical', dirs: ['up', 'down'] }
        },
        playerStart: { x: 0, y: 0 },
        totalBoxes: 4
    },
];

// ============================================================
// GAME CLASS
// ============================================================

class PipePuzzleGame {
    constructor() {
        this.state = STATE.MENU;
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.player = { x: 0, y: 0 };
        this.collectedBoxes = 0;
        this.boxesCollected = new Set();
        this.visitedTiles = new Set();
        this.pathHistory = [];
        this.activeRotators = new Set();
        this.particles = [];
        this.animations = [];
        this.pipeStates = new Map();
        this.lastMoveTime = 0;
        this.moveDelay = 150;

        this.setupInput();
        this.gameLoop();
    }

    // Initialize level
    loadLevel(levelIndex) {
        const levelData = LEVELS[levelIndex];
        this.currentLevel = JSON.parse(JSON.stringify(levelData));
        this.currentLevelIndex = levelIndex;

        // Reset player
        this.player = { ...levelData.playerStart };
        this.collectedBoxes = 0;
        this.boxesCollected = new Set();
        this.visitedTiles = new Set([`${this.player.y},${this.player.x}`]);
        this.pathHistory = [{ ...this.player }];
        this.activeRotators = new Set();
        this.particles = [];
        this.animations = [];

        // Initialize pipe states from configs
        this.pipeStates = new Map();
        for (const [key, config] of Object.entries(levelData.pipeConfigs)) {
            this.pipeStates.set(key, {
                type: config.type,
                dirs: [...config.dirs],
                rotation: 0
            });
        }

        document.getElementById('levelIndicator').textContent = 'Random puzzle';
        this.state = STATE.PLAYING;
    }

    // Get tile at position
    getTile(x, y) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return 'X';
        return this.currentLevel.grid[y][x];
    }

    // Get pipe state at position
    getPipeState(x, y) {
        return this.pipeStates.get(`${y},${x}`);
    }

    // Check if can move from current position in direction
    canMove(x, y, dir) {
        const tile = this.getTile(x, y);
        const targetX = x + DIRECTIONS[dir].x;
        const targetY = y + DIRECTIONS[dir].y;
        const currentKey = `${y},${x}`;

        // Check bounds
        if (targetX < 0 || targetX >= GRID_SIZE || targetY < 0 || targetY >= GRID_SIZE) {
            return false;
        }

        const targetTile = this.getTile(targetX, targetY);

        // Can't move into walls
        if (targetTile === 'X') return false;

        const targetKey = `${targetY},${targetX}`;
        if (this.visitedTiles.has(targetKey) && !this.isBacktracking(targetX, targetY)) {
            return false;
        }

        // Check if current tile allows exit in this direction
        if (tile === 'V' || tile === 'C') {
            const pipe = this.getPipeState(x, y);
            if (!pipe) return false;
            if (!pipe.dirs.includes(dir)) return false;
        }

        // Check if target tile allows entry from opposite direction
        if (targetTile === 'V' || targetTile === 'C') {
            const targetPipe = this.getPipeState(targetX, targetY);
            if (!targetPipe) return false;
            const oppositeDir = DIRECTIONS[dir].opposite;
            const reversesCurrentRotator = this.isBacktracking(targetX, targetY) &&
                tile === 'R' && this.activeRotators.has(currentKey);
            const targetDirs = reversesCurrentRotator
                ? targetPipe.dirs.map(direction => COUNTER_CLOCKWISE[direction])
                : targetPipe.dirs;
            if (!targetDirs.includes(oppositeDir)) return false;
        }

        return true;
    }

    // The trail is a stack: only the most recently left tile may be revisited.
    isBacktracking(targetX, targetY) {
        const previousPosition = this.pathHistory[this.pathHistory.length - 2];
        return Boolean(
            previousPosition &&
            previousPosition.x === targetX &&
            previousPosition.y === targetY
        );
    }

    // Move player
    move(dir) {
        if (this.state !== STATE.PLAYING) return;

        const now = Date.now();
        if (now - this.lastMoveTime < this.moveDelay) return;
        this.lastMoveTime = now;

        if (!this.canMove(this.player.x, this.player.y, dir)) {
            return;
        }

        const newX = this.player.x + DIRECTIONS[dir].x;
        const newY = this.player.y + DIRECTIONS[dir].y;
        const targetTile = this.getTile(newX, newY);
        const isBacktracking = this.isBacktracking(newX, newY);
        const targetKey = `${newY},${newX}`;
        const currentKey = `${this.player.y},${this.player.x}`;
        const currentTile = this.getTile(this.player.x, this.player.y);

        // A backtrack picks up the most recently dropped candy. A forward
        // move drops a new one, extending the blocked trail.
        if (isBacktracking) {
            // Effects are reversed when the candy is removed from the tile
            // the player is stepping off, not when stepping onto it.
            if (currentTile === 'R' && this.activeRotators.has(currentKey)) {
                this.rotateAllPipes(-1);
                this.activeRotators.delete(currentKey);
            }
            if (currentTile === 'B' && this.boxesCollected.delete(currentKey)) {
                this.collectedBoxes--;
            }
            this.pathHistory.pop();
            this.visitedTiles.delete(currentKey);
        } else {
            this.visitedTiles.add(targetKey);
            this.pathHistory.push({ x: newX, y: newY });

            if (targetTile === 'B' && !this.boxesCollected.has(targetKey)) {
                this.boxesCollected.add(targetKey);
                this.collectedBoxes++;
            }
            if (targetTile === 'R') {
                this.rotateAllPipes(1);
                this.activeRotators.add(targetKey);
            }
        }

        this.player.x = newX;
        this.player.y = newY;

        // Check for finish
        if (targetTile === 'F') {
            if (this.collectedBoxes === this.currentLevel.totalBoxes) {
                this.levelComplete();
            } else {
                document.getElementById('levelIndicator').textContent = 'Collect every orange block';
            }
        }
    }

    // Rotate pipes once in the direction caused by the rotator crossing.
    rotateAllPipes(direction) {
        const rotationMap = direction === -1
            ? COUNTER_CLOCKWISE
            : { up: 'right', right: 'down', down: 'left', left: 'up' };

        for (const [key, pipe] of this.pipeStates) {
            pipe.dirs = pipe.dirs.map(d => rotationMap[d]);
        }
    }

    // Level complete
    levelComplete() {
        this.state = STATE.LEVEL_COMPLETE;
        document.getElementById('levelCompleteModal').classList.add('active');
    }

    // Next level
    nextLevel() {
        document.getElementById('levelCompleteModal').classList.remove('active');

        this.loadLevel(Math.floor(Math.random() * LEVELS.length));
    }

    // Restart level
    restartLevel() {
        this.loadLevel(this.currentLevelIndex);
    }

    // Start game
    startGame() {
        document.getElementById('startModal').classList.remove('active');
        this.loadLevel(Math.floor(Math.random() * LEVELS.length));
    }

    // Input handling
    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (this.state !== STATE.PLAYING) return;

            switch (e.key.toLowerCase()) {
                case 'w': case 'arrowup': this.move('up'); break;
                case 's': case 'arrowdown': this.move('down'); break;
                case 'a': case 'arrowleft': this.move('left'); break;
                case 'd': case 'arrowright': this.move('right'); break;
                case 'r': this.restartLevel(); break;
                case 'n': this.loadLevel(Math.floor(Math.random() * LEVELS.length)); break;
            }
        });

        // Touch/Click controls for mobile
        let touchStartX = 0, touchStartY = 0;

        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        canvas.addEventListener('touchend', (e) => {
            if (this.state !== STATE.PLAYING) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const threshold = 30;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > threshold) {
                    this.move(dx > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(dy) > threshold) {
                    this.move(dy > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });
    }

    // ============================================================
    // RENDERING
    // ============================================================

    draw() {
        // Clear canvas
        ctx.fillStyle = '#082426';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // The initial menu is displayed before a board is loaded.
        if (!this.currentLevel) return;

        ctx.save();

        // Draw grid background
        this.drawGrid();

        // Draw tiles
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                this.drawTile(x, y);
            }
        }

        // Draw player
        this.drawPlayer();

        ctx.restore();
    }

    drawGrid() {
        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * TILE_SIZE, 0);
            ctx.lineTo(i * TILE_SIZE, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * TILE_SIZE);
            ctx.lineTo(canvas.width, i * TILE_SIZE);
            ctx.stroke();
        }
    }

    drawTile(x, y) {
        const tile = this.getTile(x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;

        switch (tile) {
            case 'X':
                this.drawWall(px, py);
                break;
            case 'E':
                this.drawEmpty(px, py);
                break;
            case 'S':
                this.drawStart(px, py);
                break;
            case 'F':
                this.drawFinish(px, py);
                break;
            case 'B':
                this.drawBox(px, py, x, y);
                break;
            case 'V':
            case 'C':
                this.drawPipe(px, py, x, y);
                break;
            case 'R':
                this.drawRotator(px, py);
                break;
        }

        if (this.visitedTiles.has(`${y},${x}`) && (this.player.x !== x || this.player.y !== y)) {
            this.drawTrail(px, py);
        }
    }

    drawTrail(px, py) {
        ctx.fillStyle = 'rgba(4, 24, 26, 0.55)';
        ctx.fillRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.strokeStyle = 'rgba(111, 181, 173, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
        ctx.fillStyle = COLORS.box;
        ctx.beginPath();
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 7, 0, Math.PI * 2);
        ctx.fill();
    }

    drawWall(px, py) {
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // X pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 15, py + 15);
        ctx.lineTo(px + TILE_SIZE - 15, py + TILE_SIZE - 15);
        ctx.moveTo(px + TILE_SIZE - 15, py + 15);
        ctx.lineTo(px + 15, py + TILE_SIZE - 15);
        ctx.stroke();
    }

    drawEmpty(px, py) {
        ctx.fillStyle = COLORS.empty;
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);

        // Subtle corner brackets
        ctx.strokeStyle = COLORS.emptyBorder;
        ctx.lineWidth = 2;
        const margin = 10;
        const size = 12;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(px + margin, py + margin + size);
        ctx.lineTo(px + margin, py + margin);
        ctx.lineTo(px + margin + size, py + margin);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(px + TILE_SIZE - margin - size, py + margin);
        ctx.lineTo(px + TILE_SIZE - margin, py + margin);
        ctx.lineTo(px + TILE_SIZE - margin, py + margin + size);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(px + margin, py + TILE_SIZE - margin - size);
        ctx.lineTo(px + margin, py + TILE_SIZE - margin);
        ctx.lineTo(px + margin + size, py + TILE_SIZE - margin);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(px + TILE_SIZE - margin - size, py + TILE_SIZE - margin);
        ctx.lineTo(px + TILE_SIZE - margin, py + TILE_SIZE - margin);
        ctx.lineTo(px + TILE_SIZE - margin, py + TILE_SIZE - margin - size);
        ctx.stroke();
    }

    drawStart(px, py) {
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;

        // Glow
        ctx.fillStyle = COLORS.startGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, TILE_SIZE / 2 - 5, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.fillStyle = COLORS.start;
        ctx.beginPath();
        ctx.roundRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16, 10);
        ctx.fill();

        // Text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START', cx, cy);

        // Arrow down
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 12);
        ctx.lineTo(cx + 6, cy - 12);
        ctx.lineTo(cx, cy - 6);
        ctx.fill();
    }

    drawFinish(px, py) {
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;



        // // Glow
        // ctx.fillStyle = COLORS.finishGlow;
        // ctx.beginPath();
        // ctx.arc(cx, cy, TILE_SIZE / 2 - 5, 0, Math.PI * 2);
        // ctx.fill();

        // Base
        ctx.fillStyle = COLORS.finish;
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4, 5);
        ctx.fill();


        ctx.drawImage(images.finish, px, py, 90, 90);
        // // Bunny face (simple)
        // ctx.fillStyle = '#fff';
        // // Head
        // ctx.beginPath();
        // ctx.arc(cx, cy + 5, 18, 0, Math.PI * 2);
        // ctx.fill();
        // // Ears
        // ctx.beginPath();
        // ctx.ellipse(cx - 10, cy - 15, 6, 14, -0.2, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.beginPath();
        // ctx.ellipse(cx + 10, cy - 15, 6, 14, 0.2, 0, Math.PI * 2);
        // ctx.fill();
        // // Eyes
        // ctx.fillStyle = '#000';
        // ctx.beginPath();
        // ctx.arc(cx - 7, cy + 3, 3, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.beginPath();
        // ctx.arc(cx + 7, cy + 3, 3, 0, Math.PI * 2);
        // ctx.fill();
        // // Nose
        // ctx.fillStyle = '#ff6b9d';
        // ctx.beginPath();
        // ctx.arc(cx, cy + 10, 3, 0, Math.PI * 2);
        // ctx.fill();

    }

    drawBox(px, py, x, y) {
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;
        const isCollected = this.boxesCollected.has(`${y},${x}`);

        if (isCollected) {
            // Collected - show faint outline
            ctx.strokeStyle = COLORS.boxCollected;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(px + 15, py + 15, TILE_SIZE - 30, TILE_SIZE - 30);
            ctx.setLineDash([]);

            // Checkmark
            ctx.strokeStyle = COLORS.boxCollected;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px + 25, py + 35);
            ctx.lineTo(px + 35, py + 50);
            ctx.lineTo(px + 55, py + 25);
            ctx.stroke();
        } else {
            // Glow
            ctx.fillStyle = COLORS.boxGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, TILE_SIZE / 2 - 8, 0, Math.PI * 2);
            ctx.fill();

            // Box
            ctx.fillStyle = COLORS.box;
            ctx.beginPath();
            ctx.roundRect(px + 12, py + 12, TILE_SIZE - 24, TILE_SIZE - 24, 8);
            ctx.fill();

            // X pattern
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px + 20, py + 20);
            ctx.lineTo(px + TILE_SIZE - 20, py + TILE_SIZE - 20);
            ctx.moveTo(px + TILE_SIZE - 20, py + 20);
            ctx.lineTo(px + 20, py + TILE_SIZE - 20);
            ctx.stroke();

            // Inner detail
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPipe(px, py, x, y) {
        const pipe = this.getPipeState(x, y);
        if (!pipe) return;

        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;

        // Check if this pipe is connected to player's current position
        const isConnected = this.isPipeConnected(x, y);

        ctx.save();
        ctx.translate(cx, cy);

        // Base
        ctx.fillStyle = isConnected ? COLORS.pipeHighlight : COLORS.pipe;
        ctx.beginPath();
        ctx.arc(0, 0, TILE_SIZE / 2 - 10, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.pipeBorder;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw connections based on directions
        const pipeWidth = 21;

        pipe.dirs.forEach(dir => {
            ctx.fillStyle = isConnected ? COLORS.pipeHighlight : COLORS.pipe;
            ctx.beginPath();

            switch (dir) {
                case 'up':
                    ctx.rect(-pipeWidth / 2, -TILE_SIZE / 2 + 10, pipeWidth, TILE_SIZE / 2 - 10);
                    break;
                case 'down':
                    ctx.rect(-pipeWidth / 2, 0, pipeWidth, TILE_SIZE / 2 - 10);
                    break;
                case 'left':
                    ctx.rect(-TILE_SIZE / 2 + 10, -pipeWidth / 2, TILE_SIZE / 2 - 10, pipeWidth);
                    break;
                case 'right':
                    ctx.rect(0, -pipeWidth / 2, TILE_SIZE / 2 - 10, pipeWidth);
                    break;
            }
            ctx.fill();

            // Highlight edge
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = 1.3;
            ctx.stroke();
        });

        // Center joint
        ctx.fillStyle = isConnected ? '#5dade2' : COLORS.pipeBorder;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    isPipeConnected(x, y) {
        // Check if player is adjacent and can move through this pipe
        const dx = Math.abs(this.player.x - x);
        const dy = Math.abs(this.player.y - y);
        if (dx + dy !== 1) return false;

        // Check if player can move to this pipe
        const dir = this.getDirection(this.player.x, this.player.y, x, y);
        return this.canMove(this.player.x, this.player.y, dir);
    }

    getDirection(fromX, fromY, toX, toY) {
        if (toX > fromX) return 'right';
        if (toX < fromX) return 'left';
        if (toY > fromY) return 'down';
        return 'up';
    }

    drawRotator(px, py) {
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;

        // Glow
        ctx.fillStyle = COLORS.rotatorGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, TILE_SIZE / 2 - 8, 0, Math.PI * 2);
        ctx.fill();

        // Base
        ctx.fillStyle = COLORS.rotator;
        ctx.beginPath();
        ctx.arc(cx, cy, TILE_SIZE / 2 - 15, 0, Math.PI * 2);
        ctx.fill();

        // Rotating arrows (C shape)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        ctx.save();
        ctx.translate(cx, cy);

        // Draw C-shaped arrow
        ctx.beginPath();
        ctx.arc(0, 0, 14, Math.PI * 0.3, -Math.PI * 0.3);
        ctx.stroke();

        // Arrow head — mirrored horizontally
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(13, -9);
        ctx.lineTo(8, -21);
        ctx.stroke();

        ctx.restore();


    }

    drawPlayer() {
        const px = this.player.x * TILE_SIZE;
        const py = this.player.y * TILE_SIZE;
        const cx = px + TILE_SIZE / 2;
        const cy = py + TILE_SIZE / 2;


        ctx.drawImage(images.player, px, py, 90, 90);

        // Glow
        // ctx.fillStyle = COLORS.playerGlow;
        // ctx.beginPath();
        // ctx.arc(cx, cy, TILE_SIZE / 2 - 5, 0, Math.PI * 2);
        // ctx.fill();

        // // Body
        // ctx.fillStyle = COLORS.player;
        // ctx.beginPath();
        // ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        // ctx.fill();

        // // Inner
        // ctx.fillStyle = '#ff6b6b';
        // ctx.beginPath();
        // ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        // ctx.fill();

        // // Eyes
        // ctx.fillStyle = '#fff';
        // ctx.beginPath();
        // ctx.arc(cx - 5, cy - 3, 4, 0, Math.PI * 2);
        // ctx.arc(cx + 5, cy - 3, 4, 0, Math.PI * 2);
        // ctx.fill();

        // ctx.fillStyle = '#000';
        // ctx.beginPath();
        // ctx.arc(cx - 5, cy - 3, 2, 0, Math.PI * 2);
        // ctx.arc(cx + 5, cy - 3, 2, 0, Math.PI * 2);
        // ctx.fill();

        // // Smile
        // ctx.strokeStyle = '#000';
        // ctx.lineWidth = 2;
        // ctx.beginPath();
        // ctx.arc(cx, cy + 2, 6, 0.2, Math.PI - 0.2);
        // ctx.stroke();
    }

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.vy += 0.1; // gravity

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life / 60;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life / 60), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Main game loop
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ============================================================
// INITIALIZE GAME WHEN DOM IS READY
// ============================================================

let game;

document.addEventListener('DOMContentLoaded', function () {
    game = new PipePuzzleGame();

    // Attach button event listeners
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function () {
            game.startGame();
        });
    }

    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', function () {
            game.nextLevel();
        });
    }

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', function () {
            game.restartLevel();
        });
    }
});
