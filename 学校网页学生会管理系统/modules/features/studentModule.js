// 学生模块示例实现
const studentModule = {
    // 初始化学生模块
    init() {
        // 检查是否已登录且为学生角色
        if (!window.auth?.hasPermission('student')) {
            console.warn('学生模块初始化失败：未登录或权限不足');
            return;
        }
        
        console.log('学生模块初始化成功');
        
        // 初始化学生页面组件
        this.initComponents();
    },
    
    // 初始化页面组件
    initComponents() {
        // 加载我的任务
        this.loadMyTasks();
        
        // 加载个人信息
        this.loadPersonalInfo();
        
        // 初始化事件监听
        this.setupEventListeners();
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 任务状态筛选
        const taskFilter = document.getElementById('student-task-filter');
        if (taskFilter) {
            taskFilter.addEventListener('change', () => {
                this.filterTasks(taskFilter.value);
            });
        }
        
        // 更新个人信息表单
        const profileForm = document.getElementById('student-profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
        
        // 修改密码表单
        const passwordForm = document.getElementById('student-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }
    },
    
    // 加载我的任务
    loadMyTasks() {
        try {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) {
                console.error('无法获取当前用户信息');
                return;
            }
            
            // 从appData获取当前用户的任务
            const tasks = window.appData?.getUserTasks(currentUser.id) || [];
            const tasksContainer = document.getElementById('student-tasks-container');
            
            if (!tasksContainer) return;
            
            // 清空容器
            tasksContainer.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-data">暂无任务分配给您</p>';
                return;
            }
            
            // 创建任务列表
            const table = document.createElement('table');
            table.className = 'student-tasks-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>任务标题</th>
                        <th>状态</th>
                        <th>优先级</th>
                        <th>截止日期</th>
                        <th>剩余时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            tasks.forEach(task => {
                const statusText = this.getStatusText(task.status);
                const priorityText = this.getPriorityText(task.priority);
                const remainingTime = this.calculateRemainingTime(task.dueDate);
                const isOverdue = remainingTime.startsWith('逾期');
                
                const row = document.createElement('tr');
                if (isOverdue && task.status !== 'completed' && task.status !== 'cancelled') {
                    row.className = 'task-overdue';
                }
                
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>
                        <span class="task-status task-status-${task.status}">${statusText}</span>
                    </td>
                    <td>
                        <span class="task-priority task-priority-${task.priority}">${priorityText}</span>
                    </td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td class="${isOverdue ? 'text-danger' : remainingTime.includes('即将到期') ? 'text-warning' : ''}">
                        ${remainingTime}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info view-task" data-id="${task.id}">查看</button>
                        ${(task.status === 'pending' || task.status === 'in_progress') ? 
                            `<button class="btn btn-sm btn-primary update-task" data-id="${task.id}">更新</button>` : 
                            ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            tasksContainer.appendChild(table);
            
            // 绑定任务操作按钮事件
            this.bindTaskActionButtons();
            
        } catch (e) {
            console.error('加载任务列表失败:', e);
        }
    },
    
    // 绑定任务操作按钮事件
    bindTaskActionButtons() {
        // 查看任务
        document.querySelectorAll('.view-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.viewTask(taskId);
            });
        });
        
        // 更新任务
        document.querySelectorAll('.update-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.updateTask(taskId);
            });
        });
    },
    
    // 加载个人信息
    loadPersonalInfo() {
        try {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) return;
            
            const user = window.appData?.getUserById(currentUser.id);
            if (!user) return;
            
            // 填充个人信息表单
            document.getElementById('student-name')?.setAttribute('value', user.name || '');
            document.getElementById('student-student-id')?.setAttribute('value', user.studentId || '');
            document.getElementById('student-class')?.setAttribute('value', user.class || '');
            document.getElementById('student-username')?.setAttribute('value', user.username || '');
            document.getElementById('student-created-at')?.textContent = user.createdAt ? new Date(user.createdAt).toLocaleString() : '-';
            
        } catch (e) {
            console.error('加载个人信息失败:', e);
        }
    },
    
    // 查看任务详情
    viewTask(taskId) {
        const task = window.appData?.getTaskById(taskId);
        if (!task) return;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>任务详情</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-detail-item">
                        <label>任务标题：</label>
                        <span>${task.title}</span>
                    </div>
                    <div class="task-detail-item">
                        <label>任务描述：</label>
                        <div>${task.description}</div>
                    </div>
                    <div class="task-detail-item">
                        <label>状态：</label>
                        <span class="task-status task-status-${task.status}">${this.getStatusText(task.status)}</span>
                    </div>
                    <div class="task-detail-item">
                        <label>优先级：</label>
                        <span class="task-priority task-priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                    </div>
                    <div class="task-detail-item">
                        <label>创建时间：</label>
                        <span>${new Date(task.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="task-detail-item">
                        <label>更新时间：</label>
                        <span>${new Date(task.updatedAt).toLocaleString()}</span>
                    </div>
                    <div class="task-detail-item">
                        <label>截止日期：</label>
                        <span class="${this.calculateRemainingTime(task.dueDate).startsWith('逾期') ? 'text-danger' : ''}">
                            ${new Date(task.dueDate).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    },
    
    // 更新任务状态
    updateTask(taskId) {
        const task = window.appData?.getTaskById(taskId);
        if (!task) return;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>更新任务 - ${task.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="update-task-form">
                        <div class="form-group">
                            <label for="update-task-status">任务状态 *</label>
                            <select id="update-task-status" class="form-control" required>
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="update-task-comment">进度说明</label>
                            <textarea id="update-task-comment" class="form-control" rows="4" placeholder="请输入任务进度或完成情况..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary save-update">保存更新</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // 保存更新
        modal.querySelector('.save-update').addEventListener('click', () => {
            const status = document.getElementById('update-task-status')?.value;
            const comment = document.getElementById('update-task-comment')?.value || '';
            
            if (!status) {
                alert('请选择任务状态');
                return;
            }
            
            // 更新任务
            const updatedTask = {
                ...task,
                status,
                lastComment: comment,
                lastUpdatedBy: window.auth?.getCurrentUser()?.id
            };
            
            const success = window.appData?.updateTask(updatedTask);
            
            if (success) {
                this.showMessage('任务更新成功', 'success');
                modal.remove();
                
                // 重新加载任务列表
                this.loadMyTasks();
                
                // 发送状态更新通知给老师
                this.sendTaskUpdateNotification(task, status, comment);
            }
        });
    },
    
    // 更新个人信息
    updateProfile() {
        try {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) return;
            
            const user = window.appData?.getUserById(currentUser.id);
            if (!user) return;
            
            const name = document.getElementById('student-name')?.value;
            const studentId = document.getElementById('student-student-id')?.value;
            const className = document.getElementById('student-class')?.value;
            
            if (!name || !studentId || !className) {
                alert('请填写所有必填字段');
                return;
            }
            
            // 更新用户信息
            const updatedUser = {
                ...user,
                name,
                studentId,
                class: className
            };
            
            const success = window.appData?.updateUser(updatedUser);
            
            if (success) {
                this.showMessage('个人信息更新成功', 'success');
                
                // 更新当前登录用户的名称
                if (window.auth?.currentUser) {
                    window.auth.currentUser.name = name;
                    localStorage.setItem('currentUser', JSON.stringify(window.auth.currentUser));
                }
            }
        } catch (e) {
            console.error('更新个人信息失败:', e);
            this.showMessage('更新个人信息失败，请重试', 'error');
        }
    },
    
    // 修改密码
    changePassword() {
        try {
            const currentUser = window.auth?.getCurrentUser();
            if (!currentUser) return;
            
            const user = window.appData?.getUserById(currentUser.id);
            if (!user) return;
            
            const currentPassword = document.getElementById('current-password')?.value;
            const newPassword = document.getElementById('new-password')?.value;
            const confirmPassword = document.getElementById('confirm-password')?.value;
            
            // 验证输入
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('请填写所有密码字段');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('新密码和确认密码不一致');
                return;
            }
            
            // 验证当前密码
            let isCurrentPasswordCorrect = false;
            if (window.securityModule && user.passwordHash && user.salt) {
                isCurrentPasswordCorrect = securityModule.verifyPassword(currentPassword, user.passwordHash, user.salt);
            } else {
                // 兼容旧的密码存储方式
                isCurrentPasswordCorrect = (user.password === currentPassword);
            }
            
            if (!isCurrentPasswordCorrect) {
                alert('当前密码不正确');
                return;
            }
            
            // 生成新的密码哈希和盐
            const salt = window.securityModule?.generateSalt() || Math.random().toString(36).substring(2, 15);
            const passwordHash = window.securityModule?.hashPassword(newPassword, salt) || newPassword;
            
            // 更新密码
            const updatedUser = {
                ...user,
                passwordHash,
                salt,
                // 移除明文密码（如果存在）
                password: undefined
            };
            
            const success = window.appData?.updateUser(updatedUser);
            
            if (success) {
                this.showMessage('密码修改成功', 'success');
                document.getElementById('student-password-form')?.reset();
            }
        } catch (e) {
            console.error('修改密码失败:', e);
            this.showMessage('修改密码失败，请重试', 'error');
        }
    },
    
    // 筛选任务
    filterTasks(status) {
        const currentUser = window.auth?.getCurrentUser();
        if (!currentUser) return;
        
        const allTasks = window.appData?.getUserTasks(currentUser.id) || [];
        const filteredTasks = status === 'all' ? allTasks : allTasks.filter(task => task.status === status);
        
        const tasksContainer = document.getElementById('student-tasks-container');
        if (!tasksContainer) return;
        
        // 更新显示的任务列表
        const tbody = tasksContainer.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (filteredTasks.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">没有找到匹配的任务</td></tr>';
                return;
            }
            
            filteredTasks.forEach(task => {
                const statusText = this.getStatusText(task.status);
                const priorityText = this.getPriorityText(task.priority);
                const remainingTime = this.calculateRemainingTime(task.dueDate);
                const isOverdue = remainingTime.startsWith('逾期');
                
                const row = document.createElement('tr');
                if (isOverdue && task.status !== 'completed' && task.status !== 'cancelled') {
                    row.className = 'task-overdue';
                }
                
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>
                        <span class="task-status task-status-${task.status}">${statusText}</span>
                    </td>
                    <td>
                        <span class="task-priority task-priority-${task.priority}">${priorityText}</span>
                    </td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td class="${isOverdue ? 'text-danger' : remainingTime.includes('即将到期') ? 'text-warning' : ''}">
                        ${remainingTime}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info view-task" data-id="${task.id}">查看</button>
                        ${(task.status === 'pending' || task.status === 'in_progress') ? 
                            `<button class="btn btn-sm btn-primary update-task" data-id="${task.id}">更新</button>` : 
                            ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // 重新绑定事件
            this.bindTaskActionButtons();
        }
    },
    
    // 计算剩余时间
    calculateRemainingTime(dueDateString) {
        const now = new Date();
        const dueDate = new Date(dueDateString);
        const diffMs = dueDate - now;
        
        // 逾期
        if (diffMs < 0) {
            const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
            return overdueDays > 0 ? `逾期 ${overdueDays} 天` : '已逾期';
        }
        
        // 即将到期（24小时内）
        const hoursLeft = diffMs / (1000 * 60 * 60);
        if (hoursLeft < 24) {
            if (hoursLeft < 1) {
                const minutesLeft = Math.floor(hoursLeft * 60);
                return `即将到期（${minutesLeft} 分钟）`;
            }
            return `即将到期（${Math.floor(hoursLeft)} 小时）`;
        }
        
        // 剩余天数
        const daysLeft = Math.floor(hoursLeft / 24);
        return `剩余 ${daysLeft} 天`;
    },
    
    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            'pending': '待处理',
            'in_progress': '进行中',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        return statusMap[status] || status;
    },
    
    // 获取优先级文本
    getPriorityText(priority) {
        const priorityMap = {
            'low': '低',
            'medium': '中',
            'high': '高'
        };
        return priorityMap[priority] || priority;
    },
    
    // 显示消息
    showMessage(message, type = 'info') {
        // 创建消息元素
        const msgElement = document.createElement('div');
        msgElement.className = `message message-${type}`;
        msgElement.textContent = message;
        
        // 添加到页面
        document.body.appendChild(msgElement);
        
        // 自动消失
        setTimeout(() => {
            msgElement.classList.add('fade-out');
            setTimeout(() => {
                msgElement.remove();
            }, 500);
        }, 3000);
    },
    
    // 发送任务更新通知
    sendTaskUpdateNotification(task, newStatus, comment) {
        // 获取所有老师
        const teachers = window.appData?.getTeachers() || [];
        
        // 为每位老师创建通知
        teachers.forEach(teacher => {
            const notification = {
                title: '任务状态更新',
                content: `学生更新了任务"${task.title}"的状态为：${this.getStatusText(newStatus)}${comment ? `\n说明：${comment}` : ''}`,
                recipientId: teacher.id,
                isGlobal: false,
                relatedTaskId: task.id,
                type: 'task_update'
            };
            
            window.appData?.addNotification(notification);
        });
    }
};

// 导出模块
window.studentModule = studentModule;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他模块已加载
    setTimeout(() => {
        if (window.auth?.hasPermission('student')) {
            studentModule.init();
        }
    }, 100);
});