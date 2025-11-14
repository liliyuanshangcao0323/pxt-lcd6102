// 通知模块
const notificationModule = {
    notifications: [],
    notificationContainer: null,
    notificationCountEl: null,
    
    // 初始化通知模块
    init() {
        this.createNotificationContainer();
        this.setupNotificationButton();
        this.loadNotifications();
        this.bindEvents();
        this.setupEventListeners();
        this.setupDeadlineReminder();
        this.immediateCheckOverdue(); // 立即检查逾期任务
    },
    
    // 创建通知容器
    createNotificationContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        this.notificationContainer = container;
    },
    
    // 设置通知按钮
    setupNotificationButton() {
        // 确保通知按钮存在于所有导航栏
        const navs = document.querySelectorAll('.nav-menu, .sidebar-menu, .navbar-nav');
        navs.forEach(nav => {
            // 避免重复添加
            if (!nav.querySelector('.notification-button')) {
                const notificationBtn = document.createElement('button');
                notificationBtn.id = 'notification-button';
                notificationBtn.className = 'notification-button';
                notificationBtn.innerHTML = '🔔';
                notificationBtn.title = '通知';
                
                const countSpan = document.createElement('span');
                countSpan.id = 'notification-count';
                countSpan.className = 'notification-count';
                countSpan.textContent = '0';
                notificationBtn.appendChild(countSpan);
                
                // 添加到导航栏
                if (nav.tagName === 'UL') {
                    const li = document.createElement('li');
                    li.appendChild(notificationBtn);
                    nav.appendChild(li);
                } else {
                    nav.appendChild(notificationBtn);
                }
            }
        });
        
        this.notificationCountEl = document.getElementById('notification-count');
        this.createNotificationPanel();
    },
    
    // 创建通知面板
    createNotificationPanel() {
        let panel = document.getElementById('notification-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notification-panel';
            panel.className = 'notification-panel';
            panel.innerHTML = `
                <div class="notification-panel-header">
                    <h3>通知中心</h3>
                    <div class="notification-panel-actions">
                        <button class="btn btn-small btn-secondary mark-all-read">全部标为已读</button>
                        <button class="btn btn-small btn-danger clear-all">清空</button>
                    </div>
                </div>
                <div id="notification-list" class="notification-list">
                    <div class="notification-empty">暂无通知</div>
                </div>
            `;
            document.body.appendChild(panel);
            
            // 全部标为已读事件
            panel.querySelector('.mark-all-read').addEventListener('click', () => {
                this.markAllAsRead();
            });
            
            // 清空通知事件
            panel.querySelector('.clear-all').addEventListener('click', () => {
                this.clearAllNotifications();
            });
        }
    },
    
    // 绑定事件
    bindEvents() {
        // 通知按钮点击事件
        document.getElementById('notification-button')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationPanel();
        });
        
        // 点击页面其他区域关闭通知面板
        document.addEventListener('click', (e) => {
            const notificationButton = document.getElementById('notification-button');
            const notificationPanel = document.getElementById('notification-panel');
            
            if (notificationButton && notificationPanel && 
                !notificationButton.contains(e.target) && 
                !notificationPanel.contains(e.target)) {
                notificationPanel.classList.remove('show');
            }
        });
    },
    
    // 设置系统事件监听器
    setupEventListeners() {
        // 监听任务状态变化
        document.addEventListener('taskStatusChanged', (e) => {
            const { taskId, newStatus, userId, taskTitle } = e.detail || {};
            
            // 发送状态更新通知
            if (taskTitle && newStatus) {
                this.addNotification(
                    '任务状态更新',
                    `任务 "${taskTitle}" 状态已更改为 ${newStatus}`,
                    'info'
                );
            }
        });
        
        // 监听新任务分配
        document.addEventListener('taskAssigned', (e) => {
            const { taskTitle, assignedBy } = e.detail || {};
            
            if (taskTitle) {
                this.addNotification(
                    '新任务分配',
                    `您收到了新任务 "${taskTitle}"`,
                    'warning'
                );
            }
        });
        
        // 监听任务创建
        document.addEventListener('taskCreated', (e) => {
            const { taskTitle, creator } = e.detail || {};
            
            if (taskTitle) {
                this.addNotification(
                    '新任务创建',
                    `新任务 "${taskTitle}" 已创建`,
                    'success'
                );
            }
        });
    },
    
    // 设置截止日期提醒
    setupDeadlineReminder() {
        // 每分钟检查一次即将到期的任务
        setInterval(() => {
            try {
                this.checkOverdueTasks();
            } catch (e) {
                console.error('检查截止日期时出错:', e);
            }
        }, 60000); // 每分钟检查一次
    },
    
    // 立即检查逾期任务（页面加载时调用）
    immediateCheckOverdue() {
        this.checkOverdueTasks();
    },
    
    // 加载通知数据
    loadNotifications() {
        // 从localStorage加载通知
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
            this.notifications = JSON.parse(storedNotifications);
        }
        
        this.renderNotificationList();
        this.updateNotificationCount();
    },
    
    // 保存通知到localStorage
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },
    
    // 添加新通知
    addNotification(title, message, type = 'info', url = null) {
        const notification = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            title: title,
            message: message,
            type: type,
            url: url,
            isRead: false,
            timestamp: new Date().toISOString()
        };
        
        this.notifications.unshift(notification);
        
        // 限制通知数量
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.saveNotifications();
        this.renderNotificationList();
        this.updateNotificationCount();
        
        // 显示桌面通知
        this.showDesktopNotification(notification);
        
        // 显示实时通知条
        this.showNotificationBar(notification);
        
        return notification.id;
    },
    
    // 显示通知条
    showNotificationBar(notification) {
        const container = this.notificationContainer;
        if (!container) return;
        
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${notification.type}`;
        notificationEl.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            <button class="notification-close">×</button>
        `;
        
        container.appendChild(notificationEl);
        
        // 关闭按钮事件
        notificationEl.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotificationBar(notificationEl);
        });
        
        // 点击通知标记为已读
        notificationEl.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close')) {
                notification.isRead = true;
                this.saveNotifications();
                this.updateNotificationCount();
                this.renderNotificationList();
                
                // 如果有URL则跳转
                if (notification.url) {
                    window.location.href = notification.url;
                }
            }
        });
        
        // 自动移除
        setTimeout(() => {
            this.removeNotificationBar(notificationEl);
        }, 8000);
    },
    
    // 移除通知条
    removeNotificationBar(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(100%)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 500);
    },
    
    // 显示桌面通知
    showDesktopNotification(notification) {
        // 检查浏览器是否支持通知
        if (!('Notification' in window)) {
            console.log('此浏览器不支持桌面通知');
            return;
        }
        
        // 请求通知权限
        if (Notification.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/images/logo.png',
                badge: '/images/logo.png',
                requireInteraction: false,
                renotify: true,
                vibrate: [200, 100, 200]
            };
            
            const notif = new Notification(notification.title, options);
            
            // 点击通知跳转到相关页面
            if (notification.url) {
                notif.onclick = () => {
                    window.focus();
                    window.location.href = notification.url;
                    notif.close();
                    this.markAsRead(notification.id);
                };
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showDesktopNotification(notification);
                }
            });
        }
    },
    
    // 标记通知为已读
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
            notification.isRead = true;
            this.saveNotifications();
            this.renderNotificationList();
            this.updateNotificationCount();
        }
    },
    
    // 标记所有通知为已读
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.isRead = true;
        });
        this.saveNotifications();
        this.renderNotificationList();
        this.updateNotificationCount();
    },
    
    // 删除通知
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
        this.renderNotificationList();
        this.updateNotificationCount();
    },
    
    // 清空所有通知
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.renderNotificationList();
        this.updateNotificationCount();
        
        // 清除所有通知条
        const container = this.notificationContainer;
        if (container) {
            container.innerHTML = '';
        }
    },
    
    // 渲染通知列表
    renderNotificationList() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;
        
        notificationList.innerHTML = '';
        
        if (this.notifications.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'notification-empty';
            emptyEl.textContent = '暂无通知';
            notificationList.appendChild(emptyEl);
            return;
        }
        
        this.notifications.forEach(notification => {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.type}`;
            
            const notificationContent = document.createElement('div');
            notificationContent.className = 'notification-content';
            
            const titleEl = document.createElement('div');
            titleEl.className = 'notification-title';
            titleEl.textContent = notification.title;
            
            const messageEl = document.createElement('div');
            messageEl.className = 'notification-message';
            messageEl.textContent = notification.message;
            
            const timeEl = document.createElement('div');
            timeEl.className = 'notification-time';
            timeEl.textContent = this.formatTime(notification.timestamp);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'notification-delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = '删除通知';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNotification(notification.id);
            });
            
            notificationContent.appendChild(titleEl);
            notificationContent.appendChild(messageEl);
            notificationContent.appendChild(timeEl);
            
            notificationEl.appendChild(notificationContent);
            notificationEl.appendChild(deleteBtn);
            
            // 点击通知标记为已读并跳转到相关页面
            notificationEl.addEventListener('click', () => {
                this.markAsRead(notification.id);
                if (notification.url) {
                    window.location.href = notification.url;
                }
            });
            
            notificationList.appendChild(notificationEl);
        });
    },
    
    // 切换通知面板显示状态
    toggleNotificationPanel() {
        const notificationPanel = document.getElementById('notification-panel');
        if (notificationPanel) {
            notificationPanel.classList.toggle('show');
            
            // 显示面板时标记所有通知为已读
            if (notificationPanel.classList.contains('show')) {
                this.markAllAsRead();
            }
        }
    },
    
    // 更新通知数量显示
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.isRead).length;
        
        if (this.notificationCountEl) {
            if (unreadCount > 0) {
                this.notificationCountEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
                this.notificationCountEl.classList.add('show');
            } else {
                this.notificationCountEl.classList.remove('show');
            }
        }
    },
    
    // 格式化时间显示
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return '刚刚';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}分钟前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}小时前`;
        } else if (diffInSeconds < 604800) {
            return `${Math.floor(diffInSeconds / 86400)}天前`;
        } else {
            return date.toLocaleDateString();
        }
    },
    
    // 发送特定事件的通知
    sendEventNotification(eventType, data) {
        switch (eventType) {
            case 'task_assigned':
                return this.addNotification(
                    '新任务分配',
                    `您有一个新任务: ${data.taskName || data.taskTitle || '未命名任务'}`,
                    'info',
                    `#task-${data.taskId}`
                );
            case 'task_completed':
                return this.addNotification(
                    '任务已完成',
                    `${data.studentName || '用户'}已完成任务: ${data.taskName || data.taskTitle || '未命名任务'}`,
                    'success'
                );
            case 'task_due_soon':
                return this.addNotification(
                    '任务即将到期',
                    `任务: ${data.taskName || data.taskTitle || '未命名任务'} 将在${data.timeLeft || '24小时内'}到期`,
                    'warning',
                    `#task-${data.taskId}`
                );
            case 'task_overdue':
                return this.addNotification(
                    '任务已逾期',
                    `任务: ${data.taskName || data.taskTitle || '未命名任务'} 已${data.timeLeft || '超过截止日期'}`,
                    'error',
                    `#task-${data.taskId}`
                );
            case 'student_registered':
                return this.addNotification(
                    '新学生注册',
                    `新学生 ${data.studentName || data.username || '未知用户'} 已注册`,
                    'info'
                );
            case 'comment_added':
                return this.addNotification(
                    '新评论',
                    `${data.userName || '用户'} 评论了任务: ${data.taskName || data.taskTitle || '未命名任务'}`,
                    'info',
                    `#task-${data.taskId}`
                );
            case 'meeting_scheduled':
                return this.addNotification(
                    '会议安排',
                    `新会议 "${data.meetingTitle || '未命名会议'}" 已安排在 ${data.meetingTime || '未指定时间'}`,
                    'info',
                    data.url
                );
            case 'system_alert':
                return this.addNotification(
                    '系统提醒',
                    data.message || '有重要的系统提醒',
                    'warning',
                    data.url
                );
            case 'admin_action':
                return this.addNotification(
                    '管理员操作',
                    data.message || '管理员执行了相关操作',
                    'info',
                    data.url
                );
            default:
                return null;
        }
    },
    
    // 触发系统通知
    triggerSystemNotification(title, message) {
        // 检查浏览器支持和权限
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    try {
                        new Notification(title, {
                            body: message,
                            icon: 'images/logo.png',
                            badge: 'images/logo.png'
                        });
                    } catch (e) {
                        console.error('显示通知失败:', e);
                    }
                }
            });
        }
    },
    
    // 模拟通知（用于测试）
    simulateNotification(type = 'info') {
        const types = {
            info: { title: '信息通知', message: '这是一条信息通知，用于显示一般消息。', type: 'info' },
            success: { title: '操作成功', message: '您的操作已成功完成！', type: 'success' },
            warning: { title: '警告通知', message: '请注意，这里有一些需要您关注的事项。', type: 'warning' },
            error: { title: '错误通知', message: '操作失败，请稍后重试。', type: 'error' }
        };
        
        const notificationData = types[type] || types.info;
        this.addNotification(notificationData.title, notificationData.message, notificationData.type);
    },
    
    // 检查过期任务并发送通知
    checkOverdueTasks() {
        try {
            // 获取任务列表（兼容不同的数据获取方式）
            let tasks = [];
            if (window.appData && typeof window.appData.getAllTasks === 'function') {
                tasks = window.appData.getAllTasks() || [];
            } else if (window.app && typeof window.app.getAllTasks === 'function') {
                tasks = window.app.getAllTasks() || [];
            } else if (localStorage.getItem('tasks')) {
                // 从localStorage获取任务
                try {
                    tasks = JSON.parse(localStorage.getItem('tasks'));
                } catch (e) {
                    tasks = [];
                }
            }
            
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            
            tasks.forEach(task => {
                if (task && task.status !== 'completed' && task.deadline) {
                    const deadline = new Date(task.deadline);
                    const diffTime = deadline - now;
                    const diffHours = diffTime / (1000 * 60 * 60);
                    
                    // 检查是否已过期
                    if (deadline < now) {
                        // 检查是否已经发送过逾期通知（24小时内）
                        const hasSentOverdue = this.notifications.some(n => 
                            n.type === 'error' && 
                            n.title === '任务已逾期' && 
                            n.message.includes(task.title || '') &&
                            new Date(n.timestamp) > new Date(Date.now() - 86400000) // 24小时内
                        );
                        
                        if (!hasSentOverdue) {
                            let timeLeft = '超过截止日期';
                            if (Math.abs(diffHours) < 24) {
                                timeLeft = `${Math.ceil(Math.abs(diffHours))} 小时前`;
                            } else {
                                timeLeft = `${Math.ceil(Math.abs(diffHours) / 24)} 天前`;
                            }
                            
                            this.sendEventNotification('task_overdue', {
                                taskId: task.id,
                                taskName: task.title || '未命名任务',
                                timeLeft: timeLeft
                            });
                        }
                    } 
                    // 检查是否即将到期（24小时内）
                    else if (deadline <= tomorrow && deadline > now) {
                        // 检查是否已经发送过即将到期通知
                        const hasSentDueSoon = this.notifications.some(n => 
                            n.type === 'warning' && 
                            n.title === '任务即将到期' && 
                            n.message.includes(task.title || '') &&
                            new Date(n.timestamp) > new Date(Date.now() - 86400000) // 24小时内只提醒一次
                        );
                        
                        if (!hasSentDueSoon) {
                            let timeLeft = '24小时内';
                            if (diffHours <= 1) {
                                timeLeft = '不到1小时';
                            } else if (diffHours <= 6) {
                                timeLeft = `${Math.ceil(diffHours)} 小时内`;
                            } else if (diffHours <= 12) {
                                timeLeft = `${Math.ceil(diffHours / 6) * 6} 小时内`;
                            }
                            
                            this.sendEventNotification('task_due_soon', {
                                taskId: task.id,
                                taskName: task.title || '未命名任务',
                                timeLeft: timeLeft
                            });
                        }
                    }
                }
            });
        } catch (e) {
            console.error('检查逾期任务时出错:', e);
        }
    }
};

// 导出通知模块
window.notificationModule = notificationModule;