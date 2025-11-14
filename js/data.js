// 模拟数据和数据管理
const appData = {
    // 模拟用户数据（使用哈希密码）
    users: [
        {
            id: 'superadmin',
            passwordHash: '307850077',
            salt: 'abcdef123456',
            role: 'admin',
            name: '系统管理员',
            contact: '13800138000',
            lastLogin: null,
            failedAttempts: 0
        },
        {
            id: 'admin',
            passwordHash: '307850077',
            salt: 'abcdef123456',
            role: 'teacher',
            name: '王老师',
            contact: '13800138001',
            lastLogin: null,
            failedAttempts: 0
        },
        {
            id: 'student1',
            passwordHash: '149692222',
            salt: '123456abcdef',
            role: 'student',
            name: '张三',
            class: '高一(1)班',
            position: '学生会主席',
            contact: '13900139001',
            lastLogin: null,
            failedAttempts: 0
        },
        {
            id: 'student2',
            passwordHash: '149692222',
            salt: '123456abcdef',
            role: 'student',
            name: '李四',
            class: '高一(2)班',
            position: '学习部部长',
            contact: '13900139002',
            lastLogin: null,
            failedAttempts: 0
        }
    ],

    // 模拟学生数据
    students: [
        {
            id: 'S2023001',
            name: '张三',
            class: '高一(1)班',
            position: '学生会主席',
            contact: '13900139001'
        },
        {
            id: 'S2023002',
            name: '李四',
            class: '高一(2)班',
            position: '学习部部长',
            contact: '13900139002'
        },
        {
            id: 'S2023003',
            name: '王五',
            class: '高一(1)班',
            position: '体育部部长',
            contact: '13900139003'
        },
        {
            id: 'S2023004',
            name: '赵六',
            class: '高一(3)班',
            position: '文艺部部长',
            contact: '13900139004'
        },
        {
            id: 'S2023005',
            name: '钱七',
            class: '高一(2)班',
            position: '宣传部部长',
            contact: '13900139005'
        }
    ],

    // 模拟任务数据
    tasks: [
        {
            id: 'T2023001',
            title: '组织秋季运动会',
            description: '负责策划和组织学校秋季运动会的各项工作',
            assignee: 'S2023003',
            deadline: '2023-11-30',
            status: 'pending'
        },
        {
            id: 'T2023002',
            title: '准备迎新晚会',
            description: '组织新生迎新晚会的节目编排和场地布置',
            assignee: 'S2023004',
            deadline: '2023-12-15',
            status: 'pending'
        },
        {
            id: 'T2023003',
            title: '期末考试动员',
            description: '组织学习经验交流会，做好期末考试动员工作',
            assignee: 'S2023002',
            deadline: '2023-12-20',
            status: 'pending'
        }
    ],

    // 职位列表
    positions: ['普通成员', '干事', '副部长', '部长', '学生会副主席', '学生会主席'],

    // 安全的用户登录验证
    authenticateUserSecure(username, password) {
        // 查找用户
        const user = this.users.find(u => u.id === username);
        if (!user) return null;
        
        // 检查账户是否被锁定
        if (user.accountLocked) {
            return null;
        }
        
        // 验证密码
        if (securityModule.verifyPassword(password, user.passwordHash, user.salt)) {
            // 重置失败尝试次数
            user.failedAttempts = 0;
            // 记录最后登录时间
            user.lastLogin = new Date().toISOString();
            return user;
        } else {
            // 增加失败尝试次数
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            
            // 连续5次失败后锁定账户
            if (user.failedAttempts >= 5) {
                user.accountLocked = true;
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 锁定30分钟
            }
            
            return null;
        }
    },
    
    // 兼容旧的验证方法（仅用于迁移）
    authenticateUser(username, password) {
        // 尝试使用新的安全验证
        return this.authenticateUserSecure(username, password);
    },

    // 获取所有学生
    getStudents() {
        return [...this.students];
    },

    // 添加学生
    addStudent(student) {
        student.id = `S${Date.now()}`.substring(0, 10);
        this.students.push(student);
        
        // 生成密码哈希
        const defaultPassword = 'student123';
        const salt = securityModule.generateSalt();
        const { hash } = securityModule.hashPassword(defaultPassword, salt);
        
        // 添加对应的登录用户
        this.users.push({
            id: student.id,
            passwordHash: hash,
            salt: salt,
            role: 'student',
            name: student.name,
            class: student.class,
            position: student.position,
            contact: student.contact,
            lastLogin: null,
            failedAttempts: 0,
            accountLocked: false
        });
        return student;
    },

    // 更新学生信息
    updateStudent(studentId, updates) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updates };
            // 同时更新用户信息
            const userIndex = this.users.findIndex(u => u.id === studentId);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...updates };
            }
            return this.students[index];
        }
        return null;
    },

    // 删除学生
    deleteStudent(studentId) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students.splice(index, 1);
            // 同时删除用户
            const userIndex = this.users.findIndex(u => u.id === studentId);
            if (userIndex !== -1) {
                this.users.splice(userIndex, 1);
            }
            return true;
        }
        return false;
    },

    // 搜索学生
    searchStudents(keyword) {
        if (!keyword) return this.getStudents();
        keyword = keyword.toLowerCase();
        return this.students.filter(s => 
            s.id.toLowerCase().includes(keyword) ||
            s.name.toLowerCase().includes(keyword) ||
            s.class.toLowerCase().includes(keyword) ||
            s.position.toLowerCase().includes(keyword)
        );
    },

    // 获取所有任务
    getTasks() {
        return [...this.tasks];
    },

    // 添加任务
    addTask(task) {
        task.id = `T${Date.now()}`.substring(0, 10);
        task.status = 'pending';
        this.tasks.push(task);
        return task;
    },

    // 更新任务
    updateTask(taskId, updates) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updates };
            return this.tasks[index];
        }
        return null;
    },

    // 删除任务
    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            return true;
        }
        return false;
    },

    // 搜索任务
    searchTasks(keyword) {
        if (!keyword) return this.getTasks();
        keyword = keyword.toLowerCase();
        return this.tasks.filter(t => 
            t.id.toLowerCase().includes(keyword) ||
            t.title.toLowerCase().includes(keyword) ||
            t.description.toLowerCase().includes(keyword)
        );
    },

    // 获取用户信息
    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    },
    
    // 获取所有用户
    getUsers() {
        return [...this.users];
    },
    
    // 获取指定角色的用户
    getUsersByRole(role) {
        return this.users.filter(u => u.role === role);
    },
    
    // 添加用户
    addUser(user) {
        // 检查用户名是否已存在
        const existingUser = this.users.find(u => u.id === user.id);
        if (existingUser) {
            return false;
        }
        
        this.users.push(user);
        return true;
    },
    
    // 更新用户
    updateUser(userId, updates) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            
            // 如果是学生用户，同时更新学生信息
            if (updates.role === 'student') {
                const studentIndex = this.students.findIndex(s => s.id === userId);
                if (studentIndex !== -1) {
                    const studentUpdates = {};
                    if (updates.name) studentUpdates.name = updates.name;
                    if (updates.class) studentUpdates.class = updates.class;
                    if (updates.position) studentUpdates.position = updates.position;
                    if (updates.contact) studentUpdates.contact = updates.contact;
                    
                    this.students[studentIndex] = { ...this.students[studentIndex], ...studentUpdates };
                }
            }
            
            return this.users[index];
        }
        return null;
    },
    
    // 删除用户
    deleteUser(userId) {
        // 不能删除超级管理员
        if (userId === 'superadmin') {
            return false;
        }
        
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const user = this.users[index];
            this.users.splice(index, 1);
            
            // 如果是学生用户，同时删除学生信息
            if (user.role === 'student') {
                const studentIndex = this.students.findIndex(s => s.id === userId);
                if (studentIndex !== -1) {
                    this.students.splice(studentIndex, 1);
                }
            }
            
            return true;
        }
        return false;
    },
    
    // 安全地重置用户密码
    resetPassword(userId, newPassword) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            // 生成新的盐值和哈希
            const salt = securityModule.generateSalt();
            const { hash } = securityModule.hashPassword(newPassword, salt);
            
            // 更新密码信息
            this.users[index].passwordHash = hash;
            this.users[index].salt = salt;
            this.users[index].failedAttempts = 0;
            this.users[index].accountLocked = false;
            this.users[index].lockUntil = null;
            
            return true;
        }
        return false;
    },
    
    // 修改用户密码（需要验证当前密码）
    changePassword(userId, currentPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return false;
        
        // 验证当前密码
        if (!securityModule.verifyPassword(currentPassword, user.passwordHash, user.salt)) {
            return false;
        }
        
        // 使用重置密码功能更新密码
        return this.resetPassword(userId, newPassword);
    },
    
    // 获取学生的任务
    getTasksByStudentId(studentId) {
        return this.tasks.filter(t => t.assignee === studentId);
    },

    // 获取用户信息
    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    },

    // 获取学生信息
    getStudentById(studentId) {
        return this.students.find(s => s.id === studentId);
    },
    
    // 添加老师
    addTeacher(teacher) {
        const user = {
            id: teacher.id,
            password: teacher.password || 'teacher123',
            role: 'teacher',
            name: teacher.name,
            contact: teacher.contact
        };
        return this.addUser(user);
    }
};

// 将appData暴露给全局window对象
window.appData = appData;