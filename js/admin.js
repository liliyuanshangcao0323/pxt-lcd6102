// 管理员端功能模块
const admin = {
    // 初始化管理员界面
    init() {
        this.renderUserManagementPage();
        this.setupEventListeners();
    },
    
    // 渲染用户管理页面
    renderUserManagementPage() {
        const contentContainer = document.getElementById('content');
        contentContainer.innerHTML = `
            <div class="admin-container">
                <h2>用户管理</h2>
                
                <!-- 角色筛选 -->
                <div class="filter-container">
                    <select id="role-filter">
                        <option value="all">所有用户</option>
                        <option value="teacher">老师</option>
                        <option value="student">学生</option>
                    </select>
                    
                    <!-- 搜索框 -->
                    <div class="search-container">
                        <input type="text" id="user-search" placeholder="搜索用户ID或姓名...">
                        <button id="search-btn" class="btn btn-primary">搜索</button>
                    </div>
                    
                    <!-- 添加用户按钮 -->
                    <button id="add-user-btn" class="btn btn-success">添加用户</button>
                </div>
                
                <!-- 用户列表 -->
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>用户ID</th>
                                <th>角色</th>
                                <th>姓名</th>
                                <th>联系方式</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="user-list"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        // 初始加载用户列表
        this.loadUserList();
    },
    
    // 加载用户列表
    loadUserList() {
        const userListElement = document.getElementById('user-list');
        const roleFilter = document.getElementById('role-filter').value;
        const searchQuery = document.getElementById('user-search').value.toLowerCase();
        
        let users = [];
        if (roleFilter === 'all') {
            users = appData.getUsers();
        } else {
            users = appData.getUsersByRole(roleFilter);
        }
        
        // 搜索过滤
        if (searchQuery) {
            users = users.filter(user => 
                user.id.toLowerCase().includes(searchQuery) || 
                user.name.toLowerCase().includes(searchQuery)
            );
        }
        
        // 渲染用户列表
        userListElement.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.role === 'teacher' ? '老师' : '学生'}</td>
                <td>${user.name}</td>
                <td>${user.contact || '未设置'}</td>
                <td>
                    ${user.id === 'superadmin' ? 
                        '<span class="text-muted">无法操作</span>' : 
                        `
                            <button class="btn btn-sm btn-info edit-user" data-id="${user.id}">编辑</button>
                            <button class="btn btn-sm btn-warning reset-pwd" data-id="${user.id}">重置密码</button>
                            <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">删除</button>
                        `
                    }
                </td>
            `;
            userListElement.appendChild(row);
        });
    },
    
    // 设置事件监听器
    setupEventListeners() {
        // 角色筛选变化
        document.getElementById('role-filter').addEventListener('change', () => this.loadUserList());
        
        // 搜索按钮
        document.getElementById('search-btn').addEventListener('click', () => this.loadUserList());
        
        // 搜索框回车
        document.getElementById('user-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadUserList();
        });
        
        // 添加用户按钮
        document.getElementById('add-user-btn').addEventListener('click', () => this.showAddUserModal());
        
        // 编辑用户按钮事件委托
        document.getElementById('user-list').addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-user')) {
                const userId = e.target.getAttribute('data-id');
                this.showEditUserModal(userId);
            } else if (e.target.classList.contains('reset-pwd')) {
                const userId = e.target.getAttribute('data-id');
                this.resetUserPassword(userId);
            } else if (e.target.classList.contains('delete-user')) {
                const userId = e.target.getAttribute('data-id');
                this.deleteUser(userId);
            }
        });
    },
    
    // 显示添加用户模态框
    showAddUserModal() {
        this.showModal('添加用户', `
            <form id="add-user-form">
                <div class="form-group">
                    <label for="new-user-id">用户ID</label>
                    <input type="text" id="new-user-id" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="new-user-role">角色</label>
                    <select id="new-user-role" class="form-control" required>
                        <option value="teacher">老师</option>
                        <option value="student">学生</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-user-name">姓名</label>
                    <input type="text" id="new-user-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="new-user-contact">联系方式</label>
                    <input type="text" id="new-user-contact" class="form-control">
                </div>
                <div id="student-fields" class="hidden">
                    <div class="form-group">
                        <label for="new-user-class">班级</label>
                        <input type="text" id="new-user-class" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="new-user-position">职位</label>
                        <select id="new-user-position" class="form-control">
                            <option value="">无</option>
                            <option value="班长">班长</option>
                            <option value="副班长">副班长</option>
                            <option value="学习委员">学习委员</option>
                            <option value="文体委员">文体委员</option>
                            <option value="宣传委员">宣传委员</option>
                        </select>
                    </div>
                </div>
            </form>
        `, () => {
            const form = document.getElementById('add-user-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddUser();
            });
            
            // 角色变化时显示/隐藏学生特定字段
            document.getElementById('new-user-role').addEventListener('change', (e) => {
                const studentFields = document.getElementById('student-fields');
                if (e.target.value === 'student') {
                    studentFields.classList.remove('hidden');
                } else {
                    studentFields.classList.add('hidden');
                }
            });
        });
    },
    
    // 提交添加用户
    submitAddUser() {
        const userId = document.getElementById('new-user-id').value.trim();
        const role = document.getElementById('new-user-role').value;
        const name = document.getElementById('new-user-name').value.trim();
        const contact = document.getElementById('new-user-contact').value.trim();
        
        if (!userId || !name) {
            this.showMessage('请填写必填字段', 'error');
            return;
        }
        
        const user = {
            id: userId,
            password: role === 'teacher' ? 'teacher123' : 'student123',
            role: role,
            name: name,
            contact: contact
        };
        
        if (appData.addUser(user)) {
            // 如果是学生，同时添加到学生列表
            if (role === 'student') {
                const classInfo = document.getElementById('new-user-class').value.trim();
                const position = document.getElementById('new-user-position').value;
                
                appData.addStudent({
                    id: userId,
                    name: name,
                    class: classInfo || '未分配',
                    position: position || '',
                    contact: contact
                });
            }
            
            this.closeModal();
            this.loadUserList();
            this.showMessage('用户添加成功！', 'success');
        } else {
            this.showMessage('用户ID已存在！', 'error');
        }
    },
    
    // 显示编辑用户模态框
    showEditUserModal(userId) {
        const user = appData.getUserById(userId);
        if (!user) return;
        
        const isStudent = user.role === 'student';
        const studentInfo = isStudent ? appData.getStudentById(userId) : null;
        
        this.showModal('编辑用户', `
            <form id="edit-user-form">
                <div class="form-group">
                    <label>用户ID</label>
                    <input type="text" class="form-control" value="${user.id}" disabled>
                    <input type="hidden" id="edit-user-id" value="${user.id}">
                </div>
                <div class="form-group">
                    <label for="edit-user-name">姓名</label>
                    <input type="text" id="edit-user-name" class="form-control" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-user-contact">联系方式</label>
                    <input type="text" id="edit-user-contact" class="form-control" value="${user.contact || ''}">
                </div>
                ${isStudent ? `
                <div class="form-group">
                    <label for="edit-user-class">班级</label>
                    <input type="text" id="edit-user-class" class="form-control" value="${studentInfo?.class || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-user-position">职位</label>
                    <select id="edit-user-position" class="form-control">
                        <option value="">无</option>
                        <option value="班长" ${studentInfo?.position === '班长' ? 'selected' : ''}>班长</option>
                        <option value="副班长" ${studentInfo?.position === '副班长' ? 'selected' : ''}>副班长</option>
                        <option value="学习委员" ${studentInfo?.position === '学习委员' ? 'selected' : ''}>学习委员</option>
                        <option value="文体委员" ${studentInfo?.position === '文体委员' ? 'selected' : ''}>文体委员</option>
                        <option value="宣传委员" ${studentInfo?.position === '宣传委员' ? 'selected' : ''}>宣传委员</option>
                    </select>
                </div>
                ` : ''}
            </form>
        `, () => {
            const form = document.getElementById('edit-user-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitEditUser();
            });
        });
    },
    
    // 提交编辑用户
    submitEditUser() {
        const userId = document.getElementById('edit-user-id').value;
        const name = document.getElementById('edit-user-name').value.trim();
        const contact = document.getElementById('edit-user-contact').value.trim();
        
        const user = appData.getUserById(userId);
        if (!user) return;
        
        const updates = {
            name: name,
            contact: contact
        };
        
        // 如果是学生，更新学生信息
        if (user.role === 'student') {
            const classInfo = document.getElementById('edit-user-class').value.trim();
            const position = document.getElementById('edit-user-position').value;
            
            updates.class = classInfo || '未分配';
            updates.position = position || '';
        }
        
        if (appData.updateUser(userId, updates)) {
            this.closeModal();
            this.loadUserList();
            this.showMessage('用户信息更新成功！', 'success');
        } else {
            this.showMessage('更新失败，请重试！', 'error');
        }
    },
    
    // 重置用户密码
    resetUserPassword(userId) {
        if (confirm('确定要重置该用户的密码吗？重置后密码将变为默认密码。')) {
            const user = appData.getUserById(userId);
            if (!user) return;
            
            const defaultPassword = user.role === 'teacher' ? 'teacher123' : 'student123';
            
            if (appData.resetPassword(userId, defaultPassword)) {
                this.showMessage(`密码已重置为：${defaultPassword}`, 'success');
            } else {
                this.showMessage('密码重置失败！', 'error');
            }
        }
    },
    
    // 删除用户
    deleteUser(userId) {
        if (confirm('确定要删除该用户吗？此操作不可恢复！')) {
            if (appData.deleteUser(userId)) {
                this.loadUserList();
                this.showMessage('用户已成功删除！', 'success');
            } else {
                this.showMessage('删除失败，请重试！', 'error');
            }
        }
    },
    
    // 显示模态框
    showModal(title, content, onShown) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-modal">取消</button>
                    <button class="btn btn-primary submit-modal">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => modal.classList.add('show'), 10);
        
        // 绑定事件
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        modal.querySelector('.cancel-modal').addEventListener('click', () => this.closeModal());
        modal.querySelector('.submit-modal').addEventListener('click', () => {
            const form = modal.querySelector('form');
            if (form) form.dispatchEvent(new Event('submit'));
        });
        
        // 点击空白处关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        
        // 调用回调
        if (onShown) onShown();
    },
    
    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    // 显示消息
    showMessage(message, type = 'info') {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message message-${type}`;
        messageContainer.textContent = message;
        
        document.body.appendChild(messageContainer);
        
        // 显示消息
        setTimeout(() => messageContainer.classList.add('show'), 10);
        
        // 3秒后自动关闭
        setTimeout(() => {
            messageContainer.classList.remove('show');
            setTimeout(() => messageContainer.remove(), 300);
        }, 3000);
    }
};

// 暴露给全局
window.admin = admin;