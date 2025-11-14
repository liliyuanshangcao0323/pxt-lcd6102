// 学生端功能模块
const studentModule = {
    currentStudentId: null,
    currentTaskId: null,
    
    // 初始化学生端
    init() {
        // 获取当前登录学生的ID
        this.currentStudentId = auth.getCurrentUser()?.id;
        if (!this.currentStudentId) {
            window.location.hash = '#login';
            return;
        }
        
        // 初始化我的任务页面
        this.initMyTasks();
        
        // 初始化个人信息页面
        this.initProfile();
        
        // 初始化任务详情页面
        this.initTaskDetails();
    },
    
    // 初始化我的任务页面
    initMyTasks() {
        this.renderMyTaskList();
        this.initTaskFilter();
    },
    
    // 渲染我的任务列表
    renderMyTaskList(filter = 'all') {
        const taskList = document.getElementById('my-task-list');
        let tasks = appData.getTasksByStudentId(this.currentStudentId);
        
        // 根据筛选条件过滤任务
        if (filter === 'pending') {
            tasks = tasks.filter(task => task.status === 'pending');
        } else if (filter === 'completed') {
            tasks = tasks.filter(task => task.status === 'completed');
        } else if (filter === 'overdue') {
            tasks = tasks.filter(task => this.isOverdue(task.deadline, task.status));
        }
        
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">暂无任务</td></tr>';
            return;
        }
        
        tasks.forEach(task => {
            const statusClass = task.status === 'completed' ? 'completed' : 'pending';
            const statusText = task.status === 'completed' ? '已完成' : '待完成';
            const deadlineClass = this.isOverdue(task.deadline, task.status) ? 'overdue' : '';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</td>
                <td class="${deadlineClass}">${task.deadline}</td>
                <td>
                    <span class="task-status ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm detail-btn" data-id="${task.id}">详情</button>
                        ${task.status === 'pending' ? 
                            `<button class="btn-sm complete-btn" data-id="${task.id}">标记完成</button>` : ''
                        }
                    </div>
                </td>
            `;
            taskList.appendChild(row);
        });
        
        // 添加标记完成事件监听
        this.initCompleteTaskButtons();
        this.initTaskDetailsButtons();
    },
    
    // 初始化任务筛选器
    initTaskFilter() {
        document.getElementById('filter-all').addEventListener('click', () => {
            this.updateFilterButtons('all');
            this.renderMyTaskList('all');
        });
        
        document.getElementById('filter-pending').addEventListener('click', () => {
            this.updateFilterButtons('pending');
            this.renderMyTaskList('pending');
        });
        
        document.getElementById('filter-completed').addEventListener('click', () => {
            this.updateFilterButtons('completed');
            this.renderMyTaskList('completed');
        });
        
        // 添加逾期任务筛选
        document.getElementById('filter-overdue').addEventListener('click', () => {
            this.updateFilterButtons('overdue');
            this.renderMyTaskList('overdue');
        });
    },
    
    // 更新筛选按钮状态
    updateFilterButtons(activeFilter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `filter-${activeFilter}`) {
                btn.classList.add('active');
            }
        });
    },
    
    // 初始化标记完成按钮
    initCompleteTaskButtons() {
        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                if (confirm('确定要标记此任务为已完成吗？')) {
                    this.completeTask(taskId);
                }
            });
        });
    },
    
    // 初始化任务详情按钮
    initTaskDetailsButtons() {
        document.querySelectorAll('.detail-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                this.showTaskDetails(taskId);
            });
        });
    },
    
    // 初始化任务详情页面
    initTaskDetails() {
        // 添加返回按钮事件监听
        document.getElementById('task-details-back').addEventListener('click', () => {
            window.location.hash = '#my-tasks';
        });
        
        // 添加标记完成按钮事件监听
        document.getElementById('task-details-complete').addEventListener('click', () => {
            if (confirm('确定要标记此任务为已完成吗？')) {
                this.completeTask(this.currentTaskId);
            }
        });
        
        // 添加提交评论按钮事件监听
        document.getElementById('task-comment-submit').addEventListener('click', () => {
            this.submitTaskComment();
        });
        
        // 添加文件上传功能
        document.getElementById('task-upload-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('file-name-display').textContent = file.name;
                document.getElementById('file-upload-preview').classList.remove('hidden');
            }
        });
        
        // 添加移除文件功能
        document.getElementById('remove-upload').addEventListener('click', () => {
            document.getElementById('task-upload-file').value = '';
            document.getElementById('file-name-display').textContent = '';
            document.getElementById('file-upload-preview').classList.add('hidden');
        });
    },
    
    // 显示任务详情
    showTaskDetails(taskId) {
        this.currentTaskId = taskId;
        const task = appData.getTaskById(taskId);
        
        if (!task) {
            this.showMessage('任务不存在！', 'error');
            return;
        }
        
        // 切换到任务详情页面
        window.location.hash = '#task-details';
        
        // 等待页面切换后渲染详情
        setTimeout(() => {
            // 渲染任务详情
            const taskDetailsContainer = document.getElementById('task-details-container');
            if (taskDetailsContainer) {
                const statusClass = task.status === 'completed' ? 'completed' : 'pending';
                const statusText = task.status === 'completed' ? '已完成' : '待完成';
                const deadlineClass = this.isOverdue(task.deadline, task.status) ? 'overdue' : '';
                
                taskDetailsContainer.innerHTML = `
                    <div class="task-header">
                        <h3>${task.title}</h3>
                        <span class="task-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="task-info">
                        <div class="info-item">
                            <strong>任务ID：</strong>${task.id}
                        </div>
                        <div class="info-item">
                            <strong>任务描述：</strong>${task.description}
                        </div>
                        <div class="info-item">
                            <strong>截止日期：</strong><span class="${deadlineClass}">${task.deadline}</span>
                        </div>
                        <div class="info-item">
                            <strong>负责人：</strong>${appData.getStudentById(task.assignee)?.name || '未分配'}
                        </div>
                    </div>
                `;
            }
            
            // 渲染评论列表
            this.renderTaskComments(taskId);
            
            // 标记完成按钮
            const completeBtn = document.getElementById('complete-task-btn');
            if (completeBtn) {
                if (task.status === 'pending') {
                    completeBtn.style.display = 'inline-block';
                    completeBtn.onclick = () => {
                        if (confirm('确定要标记此任务为已完成吗？')) {
                            const success = appData.updateTask(taskId, { status: 'completed' });
                            if (success) {
                                this.showMessage('任务已成功标记为完成！', 'success');
                                this.showTaskDetails(taskId);
                            } else {
                                this.showMessage('操作失败，请重试！', 'error');
                            }
                        }
                    };
                } else {
                    completeBtn.style.display = 'none';
                }
            }
        }, 100);
    },
    
    // 渲染任务评论
    renderTaskComments(taskId) {
        const commentsContainer = document.getElementById('task-comments');
        if (!commentsContainer) return;
        
        // 获取评论（如果没有实现评论功能，则显示提示）
        commentsContainer.innerHTML = `
            <h4>任务评论</h4>
            <div id="comments-list" class="comments-list">
                <!-- 评论将动态添加 -->
                <div class="no-comments">暂无评论，快来添加第一条评论吧！</div>
            </div>
            <div class="add-comment">
                <textarea id="comment-content" placeholder="请输入评论内容..." rows="3"></textarea>
                <button id="submit-comment" class="btn-primary">提交评论</button>
            </div>
        `;
        
        // 重新绑定事件
        this.initTaskDetails();
    },
    
    // 提交任务评论
    submitTaskComment() {
        const commentContent = document.getElementById('comment-content').value.trim();
        if (!commentContent) {
            this.showMessage('请输入评论内容！', 'error');
            return;
        }
        
        // 这里可以实现评论的保存逻辑
        // 暂时只显示成功消息
        this.showMessage('评论提交成功！', 'success');
        document.getElementById('comment-content').value = '';
        
        // 模拟添加评论到列表
        const commentsList = document.getElementById('comments-list');
        const newComment = document.createElement('div');
        newComment.className = 'comment-item';
        newComment.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${auth.getCurrentUser().name}</span>
                <span class="comment-time">${new Date().toLocaleString()}</span>
            </div>
            <div class="comment-content">${commentContent}</div>
        `;
        
        // 移除暂无评论提示
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) {
            commentsList.removeChild(noComments);
        }
        
        commentsList.appendChild(newComment);
    },
    
    // 检查任务是否已过期
    isOverdue(deadline, status) {
        if (status === 'completed') return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        return deadlineDate < today;
    },
    
    // 初始化个人信息页面
    initProfile() {
        const student = appData.getStudentById(this.currentStudentId);
        if (!student) return;
        
        // 显示个人信息
        document.getElementById('profile-name').textContent = student.name;
        document.getElementById('profile-id').textContent = student.id;
        document.getElementById('profile-class').textContent = student.className || '未设置';
        document.getElementById('profile-phone').textContent = student.phone || '未设置';
        document.getElementById('profile-email').textContent = student.email || '未设置';
        document.getElementById('profile-gender').textContent = student.gender || '未设置';
        document.getElementById('profile-age').textContent = student.age || '未设置';
        document.getElementById('profile-join-date').textContent = student.joinDate || '未设置';
        
        // 计算任务完成统计
        this.calculateTaskStatistics();
        
        // 添加编辑按钮事件监听
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showEditProfileModal();
        });
        
        // 添加修改密码按钮事件监听
        document.getElementById('change-password-btn').addEventListener('click', () => {
            this.showChangePasswordModal();
        });
        
        // 添加导出成绩报告按钮事件监听
        document.getElementById('export-report-btn').addEventListener('click', () => {
            this.exportTaskReport();
        });
    },
    
    // 计算任务统计信息
    calculateTaskStatistics() {
        const tasks = appData.getTasksByStudentId(this.currentStudentId);
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const overdueTasks = tasks.filter(task => this.isOverdue(task.deadline, task.status)).length;
        
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // 更新统计显示
        document.getElementById('task-stats-total').textContent = totalTasks;
        document.getElementById('task-stats-completed').textContent = completedTasks;
        document.getElementById('task-stats-pending').textContent = pendingTasks;
        document.getElementById('task-stats-overdue').textContent = overdueTasks;
        document.getElementById('task-completion-rate').textContent = `${completionRate}%`;
        document.getElementById('completion-progress').style.width = `${completionRate}%`;
    },
    
    // 导出任务报告
    exportTaskReport() {
        const student = appData.getStudentById(this.currentStudentId);
        const tasks = appData.getTasksByStudentId(this.currentStudentId);
        
        let report = `学生任务完成报告\n`;
        report += `姓名: ${student.name}\n`;
        report += `学号: ${student.id}\n`;
        report += `班级: ${student.className || '未设置'}\n`;
        report += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        report += `任务统计:\n`;
        report += `- 总任务数: ${tasks.length}\n`;
        report += `- 已完成: ${tasks.filter(t => t.status === 'completed').length}\n`;
        report += `- 待完成: ${tasks.filter(t => t.status === 'pending').length}\n`;
        report += `- 逾期任务: ${tasks.filter(t => this.isOverdue(t.deadline, t.status)).length}\n\n`;
        report += `任务详情:\n`;
        
        tasks.forEach(task => {
            report += `\n任务ID: ${task.id}\n`;
            report += `标题: ${task.title}\n`;
            report += `状态: ${task.status === 'completed' ? '已完成' : '待完成'}\n`;
            report += `截止日期: ${task.deadline}\n`;
            report += `描述: ${task.description}\n`;
        });
        
        // 创建并下载文本文件
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.name}_任务报告_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('任务报告导出成功！', 'success');
    },
    
    // 显示编辑个人信息模态框
    showEditProfileModal() {
        const student = appData.getStudentById(this.currentStudentId);
        if (!student) return;
        
        // 填充表单数据
        document.getElementById('edit-name').value = student.name;
        document.getElementById('edit-class').value = student.className || '';
        document.getElementById('edit-phone').value = student.phone || '';
        document.getElementById('edit-email').value = student.email || '';
        document.getElementById('edit-gender').value = student.gender || '';
        document.getElementById('edit-age').value = student.age || '';
        
        // 显示模态框
        this.showModal('edit-profile-modal');
    },
    
    // 显示修改密码模态框
    showChangePasswordModal() {
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h3>修改密码</h3>
            <form id="change-password-form">
                <div class="form-group">
                    <label for="current-password">当前密码</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">新密码</label>
                    <input type="password" id="new-password" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="confirm-password">确认新密码</label>
                    <input type="password" id="confirm-password" required>
                </div>
                <button type="submit" class="btn-primary">修改密码</button>
            </form>
        `;
        
        this.showModal();
        
        document.getElementById('change-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // 验证密码
            if (newPassword !== confirmPassword) {
                this.showMessage('两次输入的新密码不一致！', 'error');
                return;
            }
            
            // 验证当前密码
            const user = auth.getCurrentUser();
            if (user.password !== currentPassword) {
                this.showMessage('当前密码错误！', 'error');
                return;
            }
            
            // 更新密码
            const success = appData.updateUser(this.currentStudentId, { password: newPassword });
            if (success) {
                this.hideModal();
                this.showMessage('密码修改成功！', 'success');
                // 更新当前用户密码
                auth.currentUser.password = newPassword;
                localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
            } else {
                this.showMessage('密码修改失败，请重试！', 'error');
            }
        });
    },
    
    // 显示模态框
    showModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'flex';
        
        // 点击关闭按钮
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => this.hideModal();
        }
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    },
    
    // 隐藏模态框
    hideModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // 显示消息
    showMessage(text, type) {
        // 创建临时消息元素
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.zIndex = '1001';
        message.style.minWidth = '250px';
        message.style.padding = '12px 20px';
        message.style.borderRadius = '4px';
        message.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        message.style.transition = 'opacity 0.5s';
        
        // 根据类型设置样式
        if (type === 'success') {
            message.style.backgroundColor = '#f0f9eb';
            message.style.color = '#67c23a';
            message.style.border = '1px solid #e1f3d8';
        } else if (type === 'error') {
            message.style.backgroundColor = '#fef0f0';
            message.style.color = '#f56c6c';
            message.style.border = '1px solid #fbc4c4';
        } else {
            message.style.backgroundColor = '#ecf5ff';
            message.style.color = '#409eff';
            message.style.border = '1px solid #d9ecff';
        }
        
        document.body.appendChild(message);
        
        // 3秒后移除消息
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 500);
        }, 3000);
    }
};

// 将studentModule暴露给全局window对象
window.studentModule = studentModule;