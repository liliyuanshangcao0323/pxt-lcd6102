// 教师模块示例实现
const teacherModule = {
    // 初始化教师模块
    init() {
        // 检查是否已登录且为教师角色
        if (!window.auth?.hasPermission('teacher')) {
            console.warn('教师模块初始化失败：未登录或权限不足');
            return;
        }
        
        console.log('教师模块初始化成功');
        
        // 初始化教师页面组件
        this.initComponents();
    },
    
    // 初始化页面组件
    initComponents() {
        // 加载学生列表
        this.loadStudentsList();
        
        // 初始化任务管理
        this.initTaskManagement();
        
        // 初始化事件监听
        this.setupEventListeners();
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 任务创建表单提交
        const taskForm = document.getElementById('teacher-task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createTask();
            });
        }
        
        // 学生搜索
        const studentSearch = document.getElementById('teacher-student-search');
        if (studentSearch) {
            studentSearch.addEventListener('input', () => {
                this.filterStudents(studentSearch.value);
            });
        }
        
        // 任务状态筛选
        const taskStatusFilter = document.getElementById('teacher-task-status-filter');
        if (taskStatusFilter) {
            taskStatusFilter.addEventListener('change', () => {
                this.filterTasks(taskStatusFilter.value);
            });
        }
    },
    
    // 加载学生列表
    loadStudentsList() {
        try {
            // 从appData获取所有学生
            const students = window.appData?.getStudents() || [];
            const studentsContainer = document.getElementById('teacher-students-container');
            
            if (!studentsContainer) return;
            
            // 清空容器
            studentsContainer.innerHTML = '';
            
            if (students.length === 0) {
                studentsContainer.innerHTML = '<p class="no-data">暂无学生数据</p>';
                return;
            }
            
            // 创建学生列表
            const table = document.createElement('table');
            table.className = 'teacher-students-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>学号</th>
                        <th>姓名</th>
                        <th>班级</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.studentId || '-'}</td>
                    <td>${student.name || '-'}</td>
                    <td>${student.class || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-student-details" data-id="${student.id}">查看详情</button>
                        <button class="btn btn-sm btn-primary assign-task" data-id="${student.id}">分配任务</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            studentsContainer.appendChild(table);
            
            // 绑定学生操作按钮事件
            this.bindStudentActionButtons();
            
        } catch (e) {
            console.error('加载学生列表失败:', e);
        }
    },
    
    // 绑定学生操作按钮事件
    bindStudentActionButtons() {
        // 查看学生详情
        document.querySelectorAll('.view-student-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                this.viewStudentDetails(studentId);
            });
        });
        
        // 分配任务
        document.querySelectorAll('.assign-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.id;
                this.openAssignTaskModal(studentId);
            });
        });
    },
    
    // 查看学生详情
    viewStudentDetails(studentId) {
        try {
            const student = window.appData?.getUserById(studentId);
            if (!student) {
                alert('未找到学生信息');
                return;
            }
            
            // 显示学生详情模态框
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3>学生详情</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="student-detail-item">
                            <label>姓名：</label>
                            <span>${student.name}</span>
                        </div>
                        <div class="student-detail-item">
                            <label>学号：</label>
                            <span>${student.studentId}</span>
                        </div>
                        <div class="student-detail-item">
                            <label>班级：</label>
                            <span>${student.class}</span>
                        </div>
                        <div class="student-detail-item">
                            <label>用户名：</label>
                            <span>${student.username}</span>
                        </div>
                        <div class="student-detail-item">
                            <label>注册时间：</label>
                            <span>${new Date(student.createdAt).toLocaleString()}</span>
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
            
            // 点击模态框外部关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
        } catch (e) {
            console.error('查看学生详情失败:', e);
        }
    },
    
    // 初始化任务管理
    initTaskManagement() {
        this.loadTasksList();
    },
    
    // 加载任务列表
    loadTasksList() {
        try {
            // 从appData获取所有任务
            const tasks = window.appData?.getAllTasks() || [];
            const tasksContainer = document.getElementById('teacher-tasks-container');
            
            if (!tasksContainer) return;
            
            // 清空容器
            tasksContainer.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-data">暂无任务数据</p>';
                return;
            }
            
            // 创建任务列表
            const table = document.createElement('table');
            table.className = 'teacher-tasks-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>任务标题</th>
                        <th>负责人</th>
                        <th>状态</th>
                        <th>优先级</th>
                        <th>截止日期</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            
            const tbody = table.querySelector('tbody');
            
            tasks.forEach(task => {
                const assignee = window.appData?.getUserById(task.assigneeId);
                const statusText = this.getStatusText(task.status);
                const priorityText = this.getPriorityText(task.priority);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>${assignee?.name || '-'}</td>
                    <td>
                        <span class="task-status task-status-${task.status}">${statusText}</span>
                    </td>
                    <td>
                        <span class="task-priority task-priority-${task.priority}">${priorityText}</span>
                    </td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-task" data-id="${task.id}">查看</button>
                        <button class="btn btn-sm btn-primary edit-task" data-id="${task.id}">编辑</button>
                        <button class="btn btn-sm btn-danger delete-task" data-id="${task.id}">删除</button>
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
        
        // 编辑任务
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.editTask(taskId);
            });
        });
        
        // 删除任务
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.deleteTask(taskId);
            });
        });
    },
    
    // 创建新任务
    createTask() {
        try {
            const title = document.getElementById('teacher-task-title')?.value;
            const description = document.getElementById('teacher-task-description')?.value;
            const assigneeId = document.getElementById('teacher-task-assignee')?.value;
            const priority = document.getElementById('teacher-task-priority')?.value || 'medium';
            const dueDateInput = document.getElementById('teacher-task-due-date');
            
            // 验证表单
            if (!title || !description || !assigneeId || !dueDateInput?.value) {
                alert('请填写所有必填字段');
                return;
            }
            
            const dueDate = new Date(dueDateInput.value).toISOString();
            
            // 创建任务对象
            const newTask = {
                title,
                description,
                assigneeId,
                status: 'pending',
                priority,
                dueDate
            };
            
            // 保存任务
            const taskId = window.appData?.addTask(newTask);
            
            if (taskId) {
                // 显示成功消息
                this.showMessage('任务创建成功', 'success');
                
                // 重置表单
                document.getElementById('teacher-task-form')?.reset();
                
                // 重新加载任务列表
                this.loadTasksList();
                
                // 发送通知给任务负责人
                this.sendTaskNotification(assigneeId, 'task_assigned', {
                    taskId,
                    taskTitle: title
                });
            }
        } catch (e) {
            console.error('创建任务失败:', e);
            this.showMessage('任务创建失败，请重试', 'error');
        }
    },
    
    // 打开分配任务模态框
    openAssignTaskModal(studentId) {
        const student = window.appData?.getUserById(studentId);
        if (!student) return;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>分配任务给 ${student.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="assign-task-form">
                        <div class="form-group">
                            <label for="assign-task-title">任务标题 *</label>
                            <input type="text" id="assign-task-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="assign-task-description">任务描述 *</label>
                            <textarea id="assign-task-description" class="form-control" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="assign-task-priority">优先级 *</label>
                            <select id="assign-task-priority" class="form-control" required>
                                <option value="low">低</option>
                                <option value="medium" selected>中</option>
                                <option value="high">高</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="assign-task-due-date">截止日期 *</label>
                            <input type="date" id="assign-task-due-date" class="form-control" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary submit-task">分配任务</button>
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
        
        // 提交任务
        modal.querySelector('.submit-task').addEventListener('click', () => {
            const title = document.getElementById('assign-task-title')?.value;
            const description = document.getElementById('assign-task-description')?.value;
            const priority = document.getElementById('assign-task-priority')?.value;
            const dueDateInput = document.getElementById('assign-task-due-date');
            
            if (!title || !description || !dueDateInput?.value) {
                alert('请填写所有必填字段');
                return;
            }
            
            const dueDate = new Date(dueDateInput.value).toISOString();
            
            // 创建任务
            const newTask = {
                title,
                description,
                assigneeId: studentId,
                status: 'pending',
                priority,
                dueDate
            };
            
            const taskId = window.appData?.addTask(newTask);
            
            if (taskId) {
                this.showMessage('任务分配成功', 'success');
                
                // 发送通知
                this.sendTaskNotification(studentId, 'task_assigned', {
                    taskId,
                    taskTitle: title
                });
                
                modal.remove();
                
                // 重新加载任务列表
                this.loadTasksList();
            }
        });
    },
    
    // 查看任务详情
    viewTask(taskId) {
        const task = window.appData?.getTaskById(taskId);
        const assignee = task ? window.appData?.getUserById(task.assigneeId) : null;
        
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
                        <label>负责人：</label>
                        <span>${assignee?.name || '-'}</span>
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
                        <span>${new Date(task.dueDate).toLocaleString()}</span>
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
    
    // 编辑任务
    editTask(taskId) {
        const task = window.appData?.getTaskById(taskId);
        if (!task) return;
        
        // 获取所有学生用于选择
        const students = window.appData?.getStudents() || [];
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>编辑任务</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-task-form">
                        <div class="form-group">
                            <label for="edit-task-title">任务标题 *</label>
                            <input type="text" id="edit-task-title" class="form-control" value="${task.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-description">任务描述 *</label>
                            <textarea id="edit-task-description" class="form-control" rows="4" required>${task.description}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-assignee">负责人 *</label>
                            <select id="edit-task-assignee" class="form-control" required>
                                ${students.map(student => 
                                    `<option value="${student.id}" ${task.assigneeId === student.id ? 'selected' : ''}>${student.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-status">状态 *</label>
                            <select id="edit-task-status" class="form-control" required>
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                                <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-priority">优先级 *</label>
                            <select id="edit-task-priority" class="form-control" required>
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-due-date">截止日期 *</label>
                            <input type="date" id="edit-task-due-date" class="form-control" value="${new Date(task.dueDate).toISOString().split('T')[0]}" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary save-task">保存</button>
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
        
        // 保存任务
        modal.querySelector('.save-task').addEventListener('click', () => {
            const title = document.getElementById('edit-task-title')?.value;
            const description = document.getElementById('edit-task-description')?.value;
            const assigneeId = document.getElementById('edit-task-assignee')?.value;
            const status = document.getElementById('edit-task-status')?.value;
            const priority = document.getElementById('edit-task-priority')?.value;
            const dueDateInput = document.getElementById('edit-task-due-date');
            
            if (!title || !description || !assigneeId || !status || !dueDateInput?.value) {
                alert('请填写所有必填字段');
                return;
            }
            
            const dueDate = new Date(dueDateInput.value).toISOString();
            
            // 更新任务
            const updatedTask = {
                ...task,
                title,
                description,
                assigneeId,
                status,
                priority,
                dueDate
            };
            
            const success = window.appData?.updateTask(updatedTask);
            
            if (success) {
                this.showMessage('任务更新成功', 'success');
                modal.remove();
                
                // 重新加载任务列表
                this.loadTasksList();
                
                // 如果负责人改变或状态改变，发送通知
                if (task.assigneeId !== assigneeId) {
                    this.sendTaskNotification(assigneeId, 'task_reassigned', {
                        taskId,
                        taskTitle: title
                    });
                }
                
                if (task.status !== status) {
                    this.sendTaskNotification(assigneeId, 'task_status_changed', {
                        taskId,
                        taskTitle: title,
                        newStatus: this.getStatusText(status)
                    });
                }
            }
        });
    },
    
    // 删除任务
    deleteTask(taskId) {
        if (confirm('确定要删除这个任务吗？')) {
            const success = window.appData?.deleteTask(taskId);
            
            if (success) {
                this.showMessage('任务删除成功', 'success');
                this.loadTasksList();
            }
        }
    },
    
    // 筛选学生
    filterStudents(keyword) {
        const students = window.appData?.getStudents() || [];
        const filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(keyword.toLowerCase()) ||
            student.studentId.toLowerCase().includes(keyword.toLowerCase()) ||
            (student.class && student.class.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        const studentsContainer = document.getElementById('teacher-students-container');
        if (!studentsContainer) return;
        
        // 更新显示的学生列表
        const tbody = studentsContainer.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (filteredStudents.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">没有找到匹配的学生</td></tr>';
                return;
            }
            
            filteredStudents.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.studentId || '-'}</td>
                    <td>${student.name || '-'}</td>
                    <td>${student.class || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-student-details" data-id="${student.id}">查看详情</button>
                        <button class="btn btn-sm btn-primary assign-task" data-id="${student.id}">分配任务</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // 重新绑定事件
            this.bindStudentActionButtons();
        }
    },
    
    // 筛选任务
    filterTasks(status) {
        const allTasks = window.appData?.getAllTasks() || [];
        const filteredTasks = status === 'all' ? allTasks : allTasks.filter(task => task.status === status);
        
        const tasksContainer = document.getElementById('teacher-tasks-container');
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
                const assignee = window.appData?.getUserById(task.assigneeId);
                const statusText = this.getStatusText(task.status);
                const priorityText = this.getPriorityText(task.priority);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${task.title}</td>
                    <td>${assignee?.name || '-'}</td>
                    <td>
                        <span class="task-status task-status-${task.status}">${statusText}</span>
                    </td>
                    <td>
                        <span class="task-priority task-priority-${task.priority}">${priorityText}</span>
                    </td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-task" data-id="${task.id}">查看</button>
                        <button class="btn btn-sm btn-primary edit-task" data-id="${task.id}">编辑</button>
                        <button class="btn btn-sm btn-danger delete-task" data-id="${task.id}">删除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // 重新绑定事件
            this.bindTaskActionButtons();
        }
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
    
    // 发送任务相关通知
    sendTaskNotification(recipientId, eventType, data) {
        let title, content;
        
        switch (eventType) {
            case 'task_assigned':
                title = '新任务分配';
                content = `您有一个新任务：${data.taskTitle}`;
                break;
            case 'task_reassigned':
                title = '任务重新分配';
                content = `您被分配了一个任务：${data.taskTitle}`;
                break;
            case 'task_status_changed':
                title = '任务状态更新';
                content = `任务"${data.taskTitle}"的状态已更新为：${data.newStatus}`;
                break;
            default:
                title = '任务通知';
                content = '您的任务有新的更新';
        }
        
        // 创建通知
        const notification = {
            title,
            content,
            recipientId,
            isGlobal: false,
            relatedTaskId: data.taskId,
            type: 'task'
        };
        
        window.appData?.addNotification(notification);
        
        // 如果通知模块存在，触发通知显示
        if (window.notificationModule) {
            window.notificationModule.showNotification(title, content, type);
        }
    }
};

// 导出模块
window.teacherModule = teacherModule;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他模块已加载
    setTimeout(() => {
        if (window.auth?.hasPermission('teacher')) {
            teacherModule.init();
        }
    }, 100);
});