// 获取DOM元素
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const messageBox = document.getElementById('messageBox');
const closeMessage = document.getElementById('closeMessage');

// 变量初始化
let closeAttempts = 0;
let isMessageOpen = false;
let popupCount = 0;
let popupInterval;
let isContinuousMode = false;
let popupSpeed = 2000; // 初始弹窗间隔

// 扩展夏日祝福消息数组，增加更多祝福语
const summerMessages = [
    "愿你的夏天充满阳光和欢笑！☀️",
    "希望你有一个清凉愉快的夏日！🍉",
    "夏日炎炎，愿你心情甜甜！😊",
    "夏天的风，吹走所有烦恼！🌬️",
    "愿你在这个夏天收获满满！🌾",
    "夏日的美好，与你共享！❤️",
    "冰淇淋和西瓜，夏日必备！🍦🍉",
    "阳光、海滩、好心情！🏖️",
    "愿你的夏天像彩虹一样绚烂！🌈",
    "夏日时光，快乐无限！🎉",
    "夏日快乐，清凉一夏！💦",
    "愿夏日的阳光温暖你的心！☀️",
    "夏日来临，好运不断！🍀",
    "炎炎夏日，有你更甜！💝",
    "夏日假期，精彩无限！🌟",
    "愿你的夏天比彩虹更美丽！🌈",
    "夏日的风，带来好消息！🍃",
    "夏天的味道，幸福的味道！🍉",
    "愿你拥有一个完美的夏天！💫",
    "夏日里的小确幸，送给你！🎁",
    "阳光、海浪、沙滩，夏日的美好！🌊",
    "夏日快乐，吉祥如意！🙏",
    "愿夏天的热情点燃你的梦想！🔥",
    "炎炎夏日，快乐加倍！🎊",
    "夏日的每一天，都值得期待！✨"
];

// 打开祝福消息
function openWishMessage() {
    if (isMessageOpen) return;
    
    isMessageOpen = true;
    messageBox.style.display = 'flex';
    popupCount++;
    
    // 每次打开时随机更换祝福内容
    updateWishContent();
    
    // 添加音效（如果浏览器支持）
    playSound();
    
    // 添加页面震动效果
    document.body.classList.add('shake');
    setTimeout(() => {
        document.body.classList.remove('shake');
    }, 500);
}

// 更新祝福内容
function updateWishContent() {
    const messageBody = document.querySelector('.message-body');
    const randomIndex = Math.floor(Math.random() * summerMessages.length);
    const randomMessage = summerMessages[randomIndex];
    
    // 创建新的内容
    const newContent = document.createElement('div');
    newContent.className = 'new-message';
    newContent.innerHTML = `
        <p>${randomMessage}</p>
        <p>这是第 ${popupCount} 个夏日祝福！</p>
        <div class="summer-elements">
            <span class="emoji">☀️</span>
            <span class="emoji">🌊</span>
            <span class="emoji">🍉</span>
            <span class="emoji">🍦</span>
            <span class="emoji">🏖️</span>
        </div>
    `;
    
    // 清空现有内容并添加新内容
    messageBody.innerHTML = '';
    messageBody.appendChild(newContent);
    
    // 添加淡入动画
    newContent.style.opacity = '0';
    setTimeout(() => {
        newContent.style.transition = 'opacity 0.5s ease-in-out';
        newContent.style.opacity = '1';
    }, 10);
}

// 创建随机弹窗 - 增强版
function createRandomPopup() {
    popupCount++;
    
    // 连续模式下，保持合理数量的弹窗
    if (popupCount > 100) {
        // 移除一些旧的弹窗
        const oldPopups = document.querySelectorAll('.random-popup');
        if (oldPopups.length > 50) {
            for (let i = 0; i < oldPopups.length / 3; i++) {
                if (oldPopups[i]) {
                    closeRandomPopup(oldPopups[i]);
                }
            }
        }
    }
    
    // 创建新的弹窗元素
    const popup = document.createElement('div');
    popup.className = 'random-popup new-message';
    
    // 随机颜色和样式
    const colors = [
        'rgba(255, 182, 193, 0.9)',  // 浅粉红
        'rgba(173, 216, 230, 0.9)',  // 浅蓝
        'rgba(144, 238, 144, 0.9)',  // 浅绿
        'rgba(255, 222, 173, 0.9)',  // 浅黄
        'rgba(221, 160, 221, 0.9)',  // 紫罗兰
        'rgba(255, 160, 122, 0.9)',  // 浅珊瑚
        'rgba(255, 240, 245, 0.9)'   // 淡紫红
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const fontSize = 13 + Math.random() * 5;
    const borderRadius = 10 + Math.random() * 15;
    const width = 180 + Math.random() * 100;
    
    // 设置样式
    popup.style.cssText = `
        position: fixed;
        padding: 12px 18px;
        background: ${randomColor};
        color: ${randomColor.includes('255, 255, 255') ? 'black' : 'white'};
        border-radius: ${borderRadius}px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        font-size: ${fontSize}px;
        font-weight: ${400 + Math.floor(Math.random() * 3) * 100};
        max-width: ${width}px;
        text-align: center;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        user-select: none;
        border: 2px solid rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(5px);
    `;
    
    // 随机选择一条祝福消息
    const randomIndex = Math.floor(Math.random() * summerMessages.length);
    popup.textContent = summerMessages[randomIndex];
    
    // 随机位置，确保在视口内
    const maxX = window.innerWidth - width - 40;
    const maxY = window.innerHeight - 120;
    const randomX = Math.max(20, Math.random() * maxX);
    const randomY = Math.max(20, Math.random() * maxY);
    
    popup.style.left = `${randomX}px`;
    popup.style.top = `${randomY}px`;
    
    // 添加到页面
    document.body.appendChild(popup);
    
    // 淡入动画
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
    }, 50);
    
    // 添加轻微浮动动画
    let animationFrame;
    const floatAnimation = () => {
        const randomX = (Math.random() - 0.5) * 6;
        const randomY = (Math.random() - 0.5) * 6;
        const duration = 2000 + Math.random() * 2000;
        
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            
            if (progress < 1) {
                const easeProgress = easeInOutQuad(progress);
                popup.style.transform = `translate(${randomX * easeProgress}px, ${randomY * easeProgress}px)`;
                animationFrame = requestAnimationFrame(animate);
            } else {
                popup.style.transform = 'translate(0, 0)';
                setTimeout(floatAnimation, 1000 + Math.random() * 2000);
            }
        };
        
        animationFrame = requestAnimationFrame(animate);
    };
    
    // 缓动函数
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // 启动浮动动画
    setTimeout(floatAnimation, 500);
    
    // 设置自动关闭时间
    const closeTime = isContinuousMode ? 2000 + Math.random() * 3000 : 3000 + Math.random() * 4000;
    setTimeout(() => {
        closeRandomPopup(popup);
    }, closeTime);
    
    // 添加点击关闭事件，点击后立即创建新弹窗
    popup.addEventListener('click', () => {
        closeRandomPopup(popup);
        // 点击关闭后快速创建新弹窗
        setTimeout(() => {
            createRandomPopup();
        }, 100);
    });
}

// 关闭随机弹窗的专用函数
function closeRandomPopup(popup) {
    if (!popup || !document.body.contains(popup)) return;
    
    // 关闭动画
    popup.style.opacity = '0';
    popup.style.transform = 'translateY(20px) scale(0.8) rotate(5deg)';
    popup.style.transition = 'all 0.4s ease-out';
    
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
            popupCount = Math.max(0, popupCount - 1);
            
            // 连续模式下，立即创建新弹窗
            if (isContinuousMode) {
                setTimeout(createRandomPopup, 100 + Math.random() * 300);
            }
        }
    }, 400);
}

// 处理"暂不打开"按钮的点击事件（带有趣味性效果）
function handleCloseAttempt(event) {
    closeAttempts++;
    
    // 每次点击，按钮会随机移动位置
    const containerRect = document.querySelector('.buttons').getBoundingClientRect();
    const btnRect = event.target.getBoundingClientRect();
    
    // 计算随机位置，但确保按钮仍在容器内
    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    // 移动按钮
    event.target.style.position = 'relative';
    event.target.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    // 在第三次尝试后，提示用户
    if (closeAttempts === 3) {
        showTooltip(event.target, '真的不看看夏日祝福吗？☀️');
    } else if (closeAttempts === 5) {
        showTooltip(event.target, '错过了会很可惜哦~ 🍉');
    } else if (closeAttempts >= 7) {
        // 尝试多次后，让"暂不打开"按钮变为"好吧，我看看"
        event.target.textContent = '好吧，我看看';
        event.target.classList.remove('close-button');
        event.target.classList.add('open-button');
        event.target.onclick = openWishMessage;
    }
}

// 显示提示框
function showTooltip(element, message) {
    // 创建提示元素
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '6px';
    tooltip.style.fontSize = '14px';
    tooltip.style.zIndex = '1000';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(tooltip);
    
    // 计算位置
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    // 显示提示
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
    
    // 3秒后隐藏并移除提示
    setTimeout(() => {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 300);
    }, 3000);
}

// 关闭祝福消息 - 增强版，确保不断弹窗
function closeWishMessage() {
    if (!isMessageOpen) return;
    
    // 添加关闭动画
    messageBox.style.opacity = '0';
    messageBox.style.transform = 'scale(0.95)';
    messageBox.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.style.opacity = '1';
        messageBox.style.transform = 'scale(1)';
        isMessageOpen = false;
        
        // 关闭后立即再弹出新的祝福，确保'不断地弹窗'
        setTimeout(() => {
            // 不再限制弹窗数量，确保不断弹窗
            openWishMessage();
        }, 500 + Math.random() * 1000); // 更短的间隔时间
    }, 400);
}

// 启动连续弹窗模式 - 增强版
function startContinuousPopups() {
    isContinuousMode = true;
    
    // 立即创建一批弹窗
    for (let i = 0; i < 10; i++) {
        setTimeout(createRandomPopup, i * 150);
    }
    
    // 设置定时创建新弹窗，使用递减的间隔时间
    let intervalTime = 2000;
    popupInterval = setInterval(() => {
        // 随着时间推移，逐渐加快弹窗频率
        if (intervalTime > 300) {
            intervalTime = Math.max(300, intervalTime - 50);
            clearInterval(popupInterval);
            popupInterval = setInterval(() => {
                createRandomPopup();
            }, intervalTime);
        }
        
        // 每次创建1-2个弹窗
        createRandomPopup();
        if (Math.random() > 0.5) {
            setTimeout(createRandomPopup, 100);
        }
    }, intervalTime);
    
    // 播放欢快的音效提示
    playSound('continuous');
}

// 播放音效 - 支持不同类型的音效
function playSound(type = 'default') {
    try {
        // 创建音频上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            // 连接节点
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            // 根据类型设置不同的音效参数
            if (type === 'continuous') {
                // 连续模式启动音效
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
                oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.4); // G5
                oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.6); // C6
                
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 1.2);
            } else {
                // 默认音效
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.5); // C6
                
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
                
                // 播放
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 1.5);
            }
        }
    } catch (error) {
        // 如果浏览器不支持音频，忽略错误
        console.log('音频播放不受支持:', error);
    }
}

// 添加夏日元素动画
function animateSummerElements() {
    const emojis = document.querySelectorAll('.emoji');
    emojis.forEach(emoji => {
        // 随机化浮动动画
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;
        
        emoji.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    });
}

// 添加页面滚动效果
function handleScroll() {
    const elements = document.querySelectorAll('.summer-decoration > *:not(.bubble-container):not(.sparkles)');
    const scrollY = window.scrollY || window.pageYOffset;
    
    elements.forEach(element => {
        const speed = element.dataset.speed || 0.1;
        const yPos = -scrollY * speed;
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// 创建闪光效果
function createSparkles() {
    const sparklesCount = 50;
    const container = document.querySelector('.sparkles');
    
    for (let i = 0; i < sparklesCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // 随机位置
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        
        // 随机大小
        const size = 2 + Math.random() * 3;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        
        // 随机延迟和持续时间
        const delay = Math.random() * 5;
        const duration = 2 + Math.random() * 3;
        sparkle.style.animation = `sparkle-fade ${duration}s ease-in-out ${delay}s infinite`;
        
        container.appendChild(sparkle);
    }
    
    // 定期添加新的闪光效果
    setInterval(() => {
        if (container.children.length < 100) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            const size = 2 + Math.random() * 3;
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            const delay = Math.random() * 5;
            const duration = 2 + Math.random() * 3;
            sparkle.style.animation = `sparkle-fade ${duration}s ease-in-out ${delay}s infinite`;
            container.appendChild(sparkle);
        } else {
            // 移除一些旧的闪光
            while (container.children.length > 80) {
                container.removeChild(container.firstChild);
            }
        }
    }, 1000);
}

// 添加触摸滑动支持
function setupTouchEvents() {
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
        
        // 如果是向上滑动，打开祝福
        if (Math.abs(diffY) > Math.abs(diffX) && diffY < -50) {
            openWishMessage();
        }
    }
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// 添加键盘快捷键
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Enter 键打开祝福
        if (e.key === 'Enter') {
            openWishMessage();
        }
        // Escape 键关闭祝福
        else if (e.key === 'Escape' && isMessageOpen) {
            closeWishMessage();
        }
    });
}

// 添加更多夏日效果 - 气泡
function createBubbles() {
    const bubbleCount = 30;
    const container = document.querySelector('.bubble-container');
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.position = 'absolute';
        bubble.style.width = `${5 + Math.random() * 20}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.borderRadius = '50%';
        bubble.style.background = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = `-50px`;
        bubble.style.animation = `rise ${3 + Math.random() * 7}s linear ${Math.random() * 10}s infinite`;
        bubble.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
        
        container.appendChild(bubble);
    }
}

// 初始化所有功能
function init() {
    // 添加事件监听器
    openBtn.addEventListener('click', () => {
        openWishMessage();
        // 点击开始按钮后立即启动连续弹窗模式
        startContinuousPopups();
        
        // 增强的视觉效果 - 闪烁整个页面
        document.body.classList.add('intense-shake');
        setTimeout(() => {
            document.body.classList.remove('intense-shake');
        }, 800);
    });
    closeBtn.addEventListener('click', handleCloseAttempt);
    closeMessage.addEventListener('click', closeWishMessage);
    
    // 添加页面点击事件 - 点击消息框外部关闭消息
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) {
            closeWishMessage();
        }
    });
    
    // 初始化动画和交互
    animateSummerElements();
    setupTouchEvents();
    setupKeyboardShortcuts();
    createBubbles();
    createSparkles(); // 添加闪光效果
    
    // 添加滚动效果（如果页面可以滚动）
    window.addEventListener('scroll', handleScroll);
    
    // 添加额外的气泡上升动画样式和增强效果
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rise {
            0% {
                transform: translateY(0) scale(0.5);
                opacity: 0.5;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateY(-150vh) scale(1.5);
                opacity: 0;
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* 增强的震动效果 */
        @keyframes intense-shake {
            0%, 100% { transform: translateX(0) translateY(0); }
            10% { transform: translateX(-5px) translateY(-5px); }
            20% { transform: translateX(5px) translateY(5px); }
            30% { transform: translateX(-5px) translateY(5px); }
            40% { transform: translateX(5px) translateY(-5px); }
            50% { transform: translateX(-5px) translateY(-5px); }
            60% { transform: translateX(5px) translateY(5px); }
            70% { transform: translateX(-5px) translateY(5px); }
            80% { transform: translateX(5px) translateY(-5px); }
            90% { transform: translateX(-5px) translateY(-5px); }
        }
        
        .intense-shake {
            animation: intense-shake 0.8s ease-in-out;
        }
        
        .random-popup {
            animation: float 3s ease-in-out infinite;
            cursor: pointer;
            user-select: none;
            will-change: transform, box-shadow;
        }
        
        .new-message {
            animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* 鼠标指针特效 */
        body {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2'/%3E%3C/svg%3E") 2 2, pointer;
        }
        
        /* 优化弹窗性能 */
        .random-popup {
            contain: layout style paint;
            backface-visibility: hidden;
        }
    `;
    document.head.appendChild(style);
    
    // 页面加载时的额外效果
    setTimeout(() => {
        // 添加微妙的背景动画
        document.body.style.backgroundPosition = '0 0';
        document.body.style.transition = 'background-position 15s ease-in-out';
        setTimeout(() => {
            document.body.style.backgroundPosition = '100% 100%';
        }, 100);
    }, 1000);
    
    // 增强的自动提示
    setTimeout(() => {
        showTooltip(openBtn, '点击开始接收不断的夏日祝福！🎉');
    }, 2000);
    
    // 3秒后再次提示
    setTimeout(() => {
        showTooltip(openBtn, '夏日祝福正在等待你！☀️');
    }, 5000);
}

// 当页面加载完成后初始化
window.addEventListener('load', init);