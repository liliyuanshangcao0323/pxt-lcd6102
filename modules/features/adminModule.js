// 管理员模块示例实现
const adminModule = {
    // 初始化管理员模块
    init() {
        // 检查是否已登录且为管理员角色
        if (!window.auth?.hasPermission('admin')) {
            console.warn('管理员模块初始化失败：未登录或权限不足');
            return;
        }
        
        console.log('管理员模块初始化成功');
        
        // 初始化管理员页面组件
        this.initComponents();
    },
    
    // 初始化页面组件
    initComponents() {
        // 根据当前页面加载对应组件
        const currentPath = window.location.pathname || window.location.href;
        
        if (currentPath.includes('admin-users')) {
            this.loadUsersPage();
        } else if (currentPath.includes('admin-tasks')) {
            this.loadTasksPage();
        } else if (currentPath.includes('admin-stats')) {
            this.loadStatisticsPage();
        } else if (currentPath.includes('admin-settings')) {
            this.loadSettingsPage();
        } else if (currentPath.includes('admin')) {
            // 默认显示概览
            this.loadDashboard();
        }
        
        // 初始化全局事件监听
        this.setupGlobalEventListeners();
    },
    
    // 设置全局事件监听
    setupGlobalEventListeners() {
        // 管理员菜单高亮
        this.highlightAdminMenu();
        
        // 注销按钮
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.auth?.logout) {
                    window.auth.logout();
                    window.location.href = '../login.html';
                }
            });
        }
    },
    
    // 高亮当前管理员菜单项
    highlightAdminMenu() {
        const currentPath = window.location.pathname || window.location.href;
        const adminLinks = document.querySelectorAll('.admin-nav a');
        
        adminLinks.forEach(link => {
            if (currentPath.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        });
    },
    
    // 加载管理员仪表盘
    loadDashboard() {
        console.log('加载管理员仪表盘');
        
        // 获取统计数据
        const stats = this.getDashboardStats();
        
        // 更新仪表盘数据
        this.updateDashboardCards(stats);
    },
    
    // 获取仪表盘统计数据
    getDashboardStats() {
        const users = window.appData?.getAllUsers() || [];
        const tasks = window.appData?.getAllTasks() || [];
        const notifications = window.appData?.getAllNotifications() || [];
        
        // 计算统计数据
        const totalUsers = users.length;
        const teachers = users.filter(u => u.role === 'teacher').length;
        const students = users.filter(u => u.role === 'student').length;
        const admins = users.filter(u => u.role === 'admin').length;
        
        // 任务统计
        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const overdueTasks = tasks.filter(t => {
            return t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.dueDate) < new Date();
        }).length;
        
        // 通知统计
        const unreadNotifications = notifications.filter(n => !n.isRead).length;
        
        return {
            users: { total: totalUsers, teachers, students, admins },
            tasks: { total: totalTasks, pending: pendingTasks, inProgress: inProgressTasks, 
                    completed: completedTasks, overdue: overdueTasks },
            notifications: { unread: unreadNotifications }
        };
    },
    
    // 更新仪表盘卡片
    updateDashboardCards(stats) {
        // 更新用户统计
        document.getElementById('admin-total-users')?.textContent = stats.users.total;
        document.getElementById('admin-teachers-count')?.textContent = stats.users.teachers;
        document.getElementById('admin-students-count')?.textContent = stats.users.students;
        document.getElementById('admin-admins-count')?.textContent = stats.users.admins;
        
        // 更新任务统计
        document.getElementById('admin-total-tasks')?.textContent = stats.tasks.total;
        document.getElementById('admin-pending-tasks')?.textContent = stats.tasks.pending;
        document.getElementById('admin-in-progress-tasks')?.textContent = stats.tasks.inProgress;
        document.getElementById('admin-completed-tasks')?.textContent = stats.tasks.completed;
        document.getElementById('admin-overdue-tasks')?.textContent = stats.tasks.overdue;
        
        // 更新通知统计
        document.getElementById('admin-unread-notifications')?.textContent = stats.notifications.unread;
    },
    
    // 加载用户管理页面
    loadUsersPage() {
        console.log('加载用户管理页面');
        
        // 加载所有用户
        this.loadAllUsers();
        
        // 初始化添加用户按钮
        const addUserBtn = document.getElementById('admin-add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.openAddUserModal();
            });
        }
        
        // 初始化角色筛选器
        const roleFilter = document.getElementById('admin-role-filter');
        if (roleFilter) {
            roleFilter.addEventListener('change', () => {
                this.filterUsersByRole(roleFilter.value);
            });
        }
    },
    
    // 加载所有用户
    loadAllUsers() {
        try {
            const users = window.appData?.getAllUsers() || [];
            const usersTableBody = document.getElementById('admin-users-table-body');
            
            if (!usersTableBody) return;
            
            // 清空表格
            usersTableBody.innerHTML = '';
            
            // 添加用户行
            users.forEach(user => {
                const row = document.createElement('tr');
                
                // 跳过超级管理员
                if (user.role === 'superadmin' && window.auth?.getCurrentUser()?.role !== 'superadmin') {
                    return;
                }
                
                // 计算账户状态
                const accountStatus = this.getAccountStatus(user);
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name || '-'}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>${user.studentId || user.teacherId || '-'}</td>
                    <td>${user.class || '-'}</td>
                    <td>
                        <span class="user-status ${accountStatus.class}">${accountStatus.text}</span>
                    </td>
                    <td>${user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info admin-view-user" data-id="${user.id}">查看</button>
                        <button class="btn btn-sm btn-primary admin-edit-user" data-id="${user.id}">编辑</button>
                        <button class="btn btn-sm btn-danger admin-delete-user" data-id="${user.id}">删除</button>
                    </td>
                `;
                
                usersTableBody.appendChild(row);
            });
            
            // 绑定用户操作按钮事件
            this.bindUserActionButtons();
            
        } catch (e) {
            console.error('加载用户列表失败:', e);
        }
    },
    
    // 获取账户状态
    getAccountStatus(user) {
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const remainingLockTime = Math.ceil((new Date(user.lockedUntil) - new Date()) / (1000 * 60));
            return { text: `已锁定 (${remainingLockTime}分钟)`, class: 'status-locked' };
        }
        return { text: '活跃', class: 'status-active' };
    },
    
    // 绑定用户操作按钮事件
    bindUserActionButtons() {
        // 查看用户
        document.querySelectorAll('.admin-view-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.viewUser(userId);
            });
        });
        
        // 编辑用户
        document.querySelectorAll('.admin-edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.editUser(userId);
            });
        });
        
        // 删除用户
        document.querySelectorAll('.admin-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.deleteUser(userId);
            });
        });
    },
    
    // 打开添加用户模态框
    openAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>添加新用户</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="admin-add-user-form">
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="add-user-name">姓名 *</label>
                                <input type="text" id="add-user-name" class="form-control" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="add-user-username">用户名 *</label>
                                <input type="text" id="add-user-username" class="form-control" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="add-user-role">角色 *</label>
                                <select id="add-user-role" class="form-control" required>
                                    <option value="teacher">教师</option>
                                    <option value="student">学生</option>
                                    <option value="admin">管理员</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="add-user-id-field">ID</label>
                                <input type="text" id="add-user-id-field" class="form-control" placeholder="教师编号/学号">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="add-user-class">班级</label>
                                <input type="text" id="add-user-class" class="form-control" placeholder="仅学生需要">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="add-user-password">初始密码 *</label>
                                <input type="password" id="add-user-password" class="form-control" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary save-user">保存</button>
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
        
        // 根据角色显示不同的字段标签
        const roleSelect = modal.querySelector('#add-user-role');
        const idField = modal.querySelector('#add-user-id-field');
        
        roleSelect.addEventListener('change', () => {
            const role = roleSelect.value;
            idField.placeholder = role === 'teacher' ? '教师编号' : '学号';
        });
        
        // 保存用户
        modal.querySelector('.save-user').addEventListener('click', () => {
            this.saveNewUser(modal);
        });
    },
    
    // 保存新用户
    saveNewUser(modal) {
        const name = modal.querySelector('#add-user-name')?.value;
        const username = modal.querySelector('#add-user-username')?.value;
        const role = modal.querySelector('#add-user-role')?.value;
        const idField = modal.querySelector('#add-user-id-field')?.value;
        const className = modal.querySelector('#add-user-class')?.value;
        const password = modal.querySelector('#add-user-password')?.value;
        
        // 验证输入
        if (!name || !username || !role || !password) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 检查用户名是否已存在
        const existingUser = window.appData?.getAllUsers()?.find(u => u.username === username);
        if (existingUser) {
            alert('用户名已存在');
            return;
        }
        
        // 生成盐和密码哈希
        const salt = window.securityModule?.generateSalt() || Math.random().toString(36).substring(2, 15);
        const passwordHash = window.securityModule?.hashPassword(password, salt) || password;
        
        // 创建新用户
        const newUser = {
            id: Date.now().toString(),
            name,
            username,
            role,
            [role === 'teacher' ? 'teacherId' : 'studentId']: idField,
            class: role === 'student' ? className : undefined,
            passwordHash,
            salt,
            createdAt: new Date().toISOString(),
            loginAttempts: 0,
            lockedUntil: null
        };
        
        // 保存用户
        const success = window.appData?.addUser(newUser);
        
        if (success) {
            this.showMessage('用户添加成功', 'success');
            modal.remove();
            this.loadAllUsers();
        }
    },
    
    // 查看用户详情
    viewUser(userId) {
        const user = window.appData?.getUserById(userId);
        if (!user) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>用户详情 - ${user.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-detail-grid">
                        <div class="detail-item">
                            <label>ID:</label>
                            <span>${user.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>姓名:</label>
                            <span>${user.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>用户名:</label>
                            <span>${user.username}</span>
                        </div>
                        <div class="detail-item">
                            <label>角色:</label>
                            <span>${user.role}</span>
                        </div>
                        <div class="detail-item">
                            <label>${user.role === 'teacher' ? '教师编号' : '学号'}:</label>
                            <span>${user.teacherId || user.studentId || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>班级:</label>
                            <span>${user.class || '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>账户状态:</label>
                            <span class="user-status ${this.getAccountStatus(user).class}">
                                ${this.getAccountStatus(user).text}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>创建时间:</label>
                            <span>${user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</span>
                        </div>
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
    
    // 编辑用户
    editUser(userId) {
        const user = window.appData?.getUserById(userId);
        if (!user) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>编辑用户 - ${user.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="admin-edit-user-form">
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="edit-user-name">姓名 *</label>
                                <input type="text" id="edit-user-name" class="form-control" value="${user.name}" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="edit-user-role">角色 *</label>
                                <select id="edit-user-role" class="form-control" required>
                                    <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>教师</option>
                                    <option value="student" ${user.role === 'student' ? 'selected' : ''}>学生</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                                    ${user.role === 'superadmin' ? `<option value="superadmin" selected>超级管理员</option>` : ''}
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="edit-user-id-field">ID</label>
                                <input type="text" id="edit-user-id-field" class="form-control" 
                                       value="${user.teacherId || user.studentId || ''}" 
                                       placeholder="${user.role === 'teacher' ? '教师编号' : '学号'}">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="edit-user-class">班级</label>
                                <input type="text" id="edit-user-class" class="form-control" 
                                       value="${user.class || ''}" placeholder="仅学生需要">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="edit-user-password">重置密码（留空则不修改）</label>
                                <input type="password" id="edit-user-password" class="form-control">
                            </div>
                            <div class="form-group col-md-6">
                                <label>账户操作</label>
                                <div class="d-flex gap-2">
                                    ${user.lockedUntil ? 
                                        `<button type="button" class="btn btn-sm btn-primary unlock-account w-100" id="admin-unlock-account">
                                            解锁账户
                                        </button>` : 
                                        `<button type="button" class="btn btn-sm btn-danger lock-account w-100" id="admin-lock-account">
                                            锁定账户
                                        </button>`
                                    }
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary update-user">更新</button>
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
        
        // 更新用户
        modal.querySelector('.update-user').addEventListener('click', () => {
            this.updateUserInfo(userId, modal);
        });
        
        // 锁定账户
        const lockBtn = modal.querySelector('#admin-lock-account');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => {
                this.lockUserAccount(userId);
                modal.remove();
            });
        }
        
        // 解锁账户
        const unlockBtn = modal.querySelector('#admin-unlock-account');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                this.unlockUserAccount(userId);
                modal.remove();
            });
        }
    },
    
    // 更新用户信息
    updateUserInfo(userId, modal) {
        const name = modal.querySelector('#edit-user-name')?.value;
        const role = modal.querySelector('#edit-user-role')?.value;
        const idField = modal.querySelector('#edit-user-id-field')?.value;
        const className = modal.querySelector('#edit-user-class')?.value;
        const password = modal.querySelector('#edit-user-password')?.value;
        
        // 验证输入
        if (!name || !role) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 获取用户
        const user = window.appData?.getUserById(userId);
        if (!user) return;
        
        // 更新用户信息
        const updatedUser = {
            ...user,
            name,
            role,
            [role === 'teacher' ? 'teacherId' : 'studentId']: idField,
            class: role === 'student' ? className : undefined
        };
        
        // 如果需要重置密码
        if (password) {
            const salt = window.securityModule?.generateSalt() || Math.random().toString(36).substring(2, 15);
            const passwordHash = window.securityModule?.hashPassword(password, salt) || password;
            updatedUser.passwordHash = passwordHash;
            updatedUser.salt = salt;
            updatedUser.loginAttempts = 0;
            updatedUser.lockedUntil = null;
        }
        
        // 保存更新
        const success = window.appData?.updateUser(updatedUser);
        
        if (success) {
            this.showMessage('用户信息更新成功', 'success');
            modal.remove();
            this.loadAllUsers();
        }
    },
    
    // 删除用户
    deleteUser(userId) {
        if (confirm('确定要删除此用户吗？此操作无法撤销。')) {
            const success = window.appData?.deleteUser(userId);
            
            if (success) {
                this.showMessage('用户删除成功', 'success');
                this.loadAllUsers();
            }
        }
    },
    
    // 锁定用户账户
    lockUserAccount(userId) {
        if (confirm('确定要锁定此用户账户吗？')) {
            const user = window.appData?.getUserById(userId);
            if (!user) return;
            
            // 锁定30分钟
            const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
            
            const updatedUser = {
                ...user,
                lockedUntil
            };
            
            const success = window.appData?.updateUser(updatedUser);
            
            if (success) {
                this.showMessage('用户账户已锁定', 'success');
                this.loadAllUsers();
            }
        }
    },
    
    // 解锁用户账户
    unlockUserAccount(userId) {
        const user = window.appData?.getUserById(userId);
        if (!user) return;
        
        const updatedUser = {
            ...user,
            lockedUntil: null,
            loginAttempts: 0
        };
        
        const success = window.appData?.updateUser(updatedUser);
        
        if (success) {
            this.showMessage('用户账户已解锁', 'success');
            this.loadAllUsers();
        }
    },
    
    // 根据角色筛选用户
    filterUsersByRole(role) {
        const users = window.appData?.getAllUsers() || [];
        const filteredUsers = role === 'all' ? users : users.filter(u => u.role === role);
        
        const usersTableBody = document.getElementById('admin-users-table-body');
        if (!usersTableBody) return;
        
        // 更新表格
        usersTableBody.innerHTML = '';
        
        filteredUsers.forEach(user => {
            // 跳过超级管理员
            if (user.role === 'superadmin' && window.auth?.getCurrentUser()?.role !== 'superadmin') {
                return;
            }
            
            const row = document.createElement('tr');
            const accountStatus = this.getAccountStatus(user);
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name || '-'}</td>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>${user.studentId || user.teacherId || '-'}</td>
                <td>${user.class || '-'}</td>
                <td>
                    <span class="user-status ${accountStatus.class}">${accountStatus.text}</span>
                </td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info admin-view-user" data-id="${user.id}">查看</button>
                    <button class="btn btn-sm btn-primary admin-edit-user" data-id="${user.id}">编辑</button>
                    <button class="btn btn-sm btn-danger admin-delete-user" data-id="${user.id}">删除</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // 重新绑定事件
        this.bindUserActionButtons();
    },
    
    // 加载任务管理页面
    loadTasksPage() {
        console.log('加载任务管理页面');
        
        // 加载所有任务
        this.loadAllTasks();
        
        // 初始化添加任务按钮
        const addTaskBtn = document.getElementById('admin-add-task-btn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.openAddTaskModal();
            });
        }
    },
    
    // 加载所有任务
    loadAllTasks() {
        try {
            const tasks = window.appData?.getAllTasks() || [];
            const tasksTableBody = document.getElementById('admin-tasks-table-body');
            
            if (!tasksTableBody) return;
            
            // 清空表格
            tasksTableBody.innerHTML = '';
            
            // 添加任务行
            tasks.forEach(task => {
                const row = document.createElement('tr');
                const isOverdue = task.status !== 'completed' && task.status !== 'cancelled' && 
                                 new Date(task.dueDate) < new Date();
                
                row.innerHTML = `
                    <td>${task.id}</td>
                    <td>${task.title}</td>
                    <td>${task.assignedTo ? this.getUserNameById(task.assignedTo) : '未分配'}</td>
                    <td>
                        <span class="task-status task-status-${task.status}">${this.getStatusText(task.status)}</span>
                    </td>
                    <td>
                        <span class="task-priority task-priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                    </td>
                    <td>${task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</td>
                    <td>${task.createdBy ? this.getUserNameById(task.createdBy) : '-'}</td>
                    <td>${task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-info admin-view-task" data-id="${task.id}">查看</button>
                        <button class="btn btn-sm btn-primary admin-edit-task" data-id="${task.id}">编辑</button>
                        <button class="btn btn-sm btn-danger admin-delete-task" data-id="${task.id}">删除</button>
                    </td>
                `;
                
                if (isOverdue) {
                    row.className = 'task-overdue';
                }
                
                tasksTableBody.appendChild(row);
            });
            
            // 绑定任务操作按钮事件
            this.bindTaskActionButtons();
            
        } catch (e) {
            console.error('加载任务列表失败:', e);
        }
    },
    
    // 绑定任务操作按钮事件
    bindTaskActionButtons() {
        // 查看任务
        document.querySelectorAll('.admin-view-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.viewTask(taskId);
            });
        });
        
        // 编辑任务
        document.querySelectorAll('.admin-edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.editTask(taskId);
            });
        });
        
        // 删除任务
        document.querySelectorAll('.admin-delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.deleteTask(taskId);
            });
        });
    },
    
    // 获取用户名
    getUserNameById(userId) {
        const user = window.appData?.getUserById(userId);
        return user ? `${user.name} (${user.username})` : '-';
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
    
    // 打开添加任务模态框
    openAddTaskModal() {
        const students = window.appData?.getStudents() || [];
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>添加新任务</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="admin-add-task-form">
                        <div class="form-group">
                            <label for="add-task-title">任务标题 *</label>
                            <input type="text" id="add-task-title" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="add-task-description">任务描述</label>
                            <textarea id="add-task-description" class="form-control" rows="4"></textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-4">
                                <label for="add-task-assigned-to">分配给 *</label>
                                <select id="add-task-assigned-to" class="form-control" required>
                                    <option value="">-- 请选择学生 --</option>
                                    ${students.map(s => 
                                        `<option value="${s.id}">${s.name} (${s.studentId})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label for="add-task-priority">优先级 *</label>
                                <select id="add-task-priority" class="form-control" required>
                                    <option value="low">低</option>
                                    <option value="medium" selected>中</option>
                                    <option value="high">高</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label for="add-task-due-date">截止日期 *</label>
                                <input type="datetime-local" id="add-task-due-date" class="form-control" required>
                            </div>
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
            this.saveNewTask(modal);
        });
    },
    
    // 保存新任务
    saveNewTask(modal) {
        const title = modal.querySelector('#add-task-title')?.value;
        const description = modal.querySelector('#add-task-description')?.value;
        const assignedTo = modal.querySelector('#add-task-assigned-to')?.value;
        const priority = modal.querySelector('#add-task-priority')?.value;
        const dueDate = modal.querySelector('#add-task-due-date')?.value;
        
        // 验证输入
        if (!title || !assignedTo || !priority || !dueDate) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 创建新任务
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            assignedTo,
            status: 'pending',
            priority,
            dueDate,
            createdBy: window.auth?.getCurrentUser()?.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastComment: '',
            lastUpdatedBy: null
        };
        
        // 保存任务
        const success = window.appData?.addTask(newTask);
        
        if (success) {
            this.showMessage('任务添加成功', 'success');
            modal.remove();
            this.loadAllTasks();
            
            // 发送任务分配通知
            this.sendTaskAssignmentNotification(newTask);
        }
    },
    
    // 查看任务详情
    viewTask(taskId) {
        const task = window.appData?.getTaskById(taskId);
        if (!task) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>任务详情 - ${task.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="task-detail-grid">
                        <div class="detail-item">
                            <label>任务标题:</label>
                            <span>${task.title}</span>
                        </div>
                        <div class="detail-item">
                            <label>任务描述:</label>
                            <div>${task.description || '-'}</div>
                        </div>
                        <div class="detail-item">
                            <label>分配给:</label>
                            <span>${task.assignedTo ? this.getUserNameById(task.assignedTo) : '未分配'}</span>
                        </div>
                        <div class="detail-item">
                            <label>状态:</label>
                            <span class="task-status task-status-${task.status}">${this.getStatusText(task.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>优先级:</label>
                            <span class="task-priority task-priority-${task.priority}">${this.getPriorityText(task.priority)}</span>
                        </div>
                        <div class="detail-item">
                            <label>截止日期:</label>
                            <span>${task.dueDate ? new Date(task.dueDate).toLocaleString() : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>创建者:</label>
                            <span>${task.createdBy ? this.getUserNameById(task.createdBy) : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>创建时间:</label>
                            <span>${task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>最后更新:</label>
                            <span>${task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>最后更新人:</label>
                            <span>${task.lastUpdatedBy ? this.getUserNameById(task.lastUpdatedBy) : '-'}</span>
                        </div>
                        <div class="detail-item">
                            <label>最后评论:</label>
                            <div>${task.lastComment || '-'}</div>
                        </div>
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
        const students = window.appData?.getStudents() || [];
        
        if (!task) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>编辑任务 - ${task.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="admin-edit-task-form">
                        <div class="form-group">
                            <label for="edit-task-title">任务标题 *</label>
                            <input type="text" id="edit-task-title" class="form-control" value="${task.title}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-description">任务描述</label>
                            <textarea id="edit-task-description" class="form-control" rows="4">${task.description || ''}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-4">
                                <label for="edit-task-assigned-to">分配给 *</label>
                                <select id="edit-task-assigned-to" class="form-control" required>
                                    <option value="">-- 请选择学生 --</option>
                                    ${students.map(s => 
                                        `<option value="${s.id}" ${task.assignedTo === s.id ? 'selected' : ''}>
                                            ${s.name} (${s.studentId})
                                        </option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label for="edit-task-status">状态 *</label>
                                <select id="edit-task-status" class="form-control" required>
                                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                                    <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                                    <option value="cancelled" ${task.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label for="edit-task-priority">优先级 *</label>
                                <select id="edit-task-priority" class="form-control" required>
                                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
                                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-task-due-date">截止日期 *</label>
                            <input type="datetime-local" id="edit-task-due-date" class="form-control" 
                                   value="${task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''}" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal">取消</button>
                    <button class="btn btn-primary update-task">更新</button>
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
        
        // 更新任务
        modal.querySelector('.update-task').addEventListener('click', () => {
            this.updateTaskInfo(taskId, modal);
        });
    },
    
    // 更新任务信息
    updateTaskInfo(taskId, modal) {
        const title = modal.querySelector('#edit-task-title')?.value;
        const description = modal.querySelector('#edit-task-description')?.value;
        const assignedTo = modal.querySelector('#edit-task-assigned-to')?.value;
        const status = modal.querySelector('#edit-task-status')?.value;
        const priority = modal.querySelector('#edit-task-priority')?.value;
        const dueDate = modal.querySelector('#edit-task-due-date')?.value;
        
        // 验证输入
        if (!title || !assignedTo || !status || !priority || !dueDate) {
            alert('请填写所有必填字段');
            return;
        }
        
        // 获取任务
        const task = window.appData?.getTaskById(taskId);
        if (!task) return;
        
        // 更新任务信息
        const updatedTask = {
            ...task,
            title,
            description,
            assignedTo,
            status,
            priority,
            dueDate,
            updatedAt: new Date().toISOString()
        };
        
        // 保存更新
        const success = window.appData?.updateTask(updatedTask);
        
        if (success) {
            this.showMessage('任务更新成功', 'success');
            modal.remove();
            this.loadAllTasks();
        }
    },
    
    // 删除任务
    deleteTask(taskId) {
        if (confirm('确定要删除此任务吗？此操作无法撤销。')) {
            const success = window.appData?.deleteTask(taskId);
            
            if (success) {
                this.showMessage('任务删除成功', 'success');
                this.loadAllTasks();
            }
        }
    },
    
    // 发送任务分配通知
    sendTaskAssignmentNotification(task) {
        const notification = {
            title: '新任务分配',
            content: `您有一个新任务需要完成："${task.title}"\n截止日期：${new Date(task.dueDate).toLocaleString()}`,
            recipientId: task.assignedTo,
            isGlobal: false,
            relatedTaskId: task.id,
            type: 'task_assignment'
        };
        
        window.appData?.addNotification(notification);
    },
    
    // 加载统计页面
    loadStatisticsPage() {
        console.log('加载统计页面');
        
        // 加载用户统计
        this.loadUserStatistics();
        
        // 加载任务统计
        this.loadTaskStatistics();
    },
    
    // 加载用户统计
    loadUserStatistics() {
        // 实现用户统计功能
        console.log('加载用户统计数据');
    },
    
    // 加载任务统计
    loadTaskStatistics() {
        // 实现任务统计功能
        console.log('加载任务统计数据');
    },
    
    // 加载系统设置页面
    loadSettingsPage() {
        console.log('加载系统设置页面');
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
    }
};

// 导出模块
window.adminModule = adminModule;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他模块已加载
    setTimeout(() => {
        if (window.auth?.hasPermission('admin')) {
            adminModule.init();
        }
    }, 100);
});