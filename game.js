// 游戏常量
const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;

// 游戏状态
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = INITIAL_SPEED;
let gameInterval;
let gameRunning = false;
let gamePaused = false;

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// 初始化游戏
function initGame() {
    // 设置初始蛇
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    
    generateFood();
    updateScore();
    highScoreElement.textContent = highScore;
    
    drawGame();
    
    // 禁用暂停按钮，启用开始和重置按钮
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    resetBtn.disabled = false;
}

// 生成食物
function generateFood() {
    // 确保食物不会出现在蛇身上
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置网格大小
    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;
    
    // 绘制蛇头
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(
        snake[0].x * cellWidth,
        snake[0].y * cellHeight,
        cellWidth - 1,
        cellHeight - 1
    );
    
    // 绘制蛇身体
    ctx.fillStyle = '#8BC34A';
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(
            snake[i].x * cellWidth,
            snake[i].y * cellHeight,
            cellWidth - 1,
            cellHeight - 1
        );
    }
    
    // 绘制食物
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(
        food.x * cellWidth + cellWidth / 2,
        food.y * cellHeight + cellHeight / 2,
        cellWidth / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 如果游戏暂停，显示暂停文字
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 更新游戏状态
function updateGame() {
    if (gamePaused) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { x: snake[0].x, y: snake[0].y };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        gameSpeed = Math.max(50, INITIAL_SPEED - (score / 10) * SPEED_INCREASE);
        generateFood();
        updateScore();
        
        // 调整游戏速度
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    } else {
        // 如果没吃到食物，移除尾部
        snake.pop();
    }
    
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 更新分数
function updateScore() {
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // 显示游戏结束信息
    alert(`游戏结束！您的得分是: ${score}`);
    
    // 重置按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 开始游戏
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    
    // 禁用开始按钮，启用暂停按钮
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // 开始游戏循环
    gameInterval = setInterval(updateGame, gameSpeed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
    
    if (!gamePaused) {
        // 如果继续游戏，立即更新一帧
        updateGame();
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    gamePaused = false;
    
    initGame();
}

// 处理键盘输入
function handleKeyDown(event) {
    // 防止页面滚动
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
    
    // 方向控制
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case ' ': // 空格键暂停/继续
            if (gameRunning) {
                togglePause();
            }
            break;
        case 'Enter': // 回车键开始游戏
            if (!gameRunning) {
                startGame();
            }
            break;
        case 'r':
        case 'R': // R键重置游戏
            resetGame();
            break;
    }
}

// 触摸滑动控制
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // 判断滑动方向（优先处理较大的差值）
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 水平滑动
        if (diffX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (diffX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // 垂直滑动
        if (diffY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (diffY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
}

// 创建触摸控制按钮
function createTouchControls() {
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    
    const buttons = [
        { direction: 'up', symbol: '↑', position: '1,0' },
        { direction: 'left', symbol: '←', position: '0,1' },
        { direction: 'right', symbol: '→', position: '2,1' },
        { direction: 'down', symbol: '↓', position: '1,2' }
    ];
    
    buttons.forEach(btn => {
        const [col, row] = btn.position.split(',').map(Number);
        const touchBtn = document.createElement('div');
        touchBtn.className = 'touch-btn';
        touchBtn.style.gridColumn = col + 1;
        touchBtn.style.gridRow = row + 1;
        touchBtn.innerHTML = `<span>${btn.symbol}</span>`;
        
        touchBtn.addEventListener('touchstart', () => {
            switch (btn.direction) {
                case 'up':
                    if (direction !== 'down') nextDirection = 'up';
                    break;
                case 'down':
                    if (direction !== 'up') nextDirection = 'down';
                    break;
                case 'left':
                    if (direction !== 'right') nextDirection = 'left';
                    break;
                case 'right':
                    if (direction !== 'left') nextDirection = 'right';
                    break;
            }
        }, { passive: true });
        
        touchControls.appendChild(touchBtn);
    });
    
    document.querySelector('.game-container').appendChild(touchControls);
}

// 窗口大小变化时调整画布
function handleResize() {
    const containerWidth = document.querySelector('.container').offsetWidth;
    const newSize = Math.min(containerWidth - 40, 400); // 减去padding和边距
    
    canvas.width = newSize;
    canvas.height = newSize;
    
    if (gameRunning || !gameRunning && !gamePaused) {
        drawGame();
    }
}

// 添加事件监听器
function setupEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    
    // 按钮控制
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    
    // 触摸控制
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // 窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 创建触摸控制按钮
    createTouchControls();
}

// 初始化游戏和事件监听器
function init() {
    setupEventListeners();
    handleResize();
    initGame();
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', init);