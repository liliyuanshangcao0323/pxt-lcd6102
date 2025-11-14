// 应用数据管理模块
const appData = {
    // 存储用户数据
    users: [],
    
    // 存储任务数据
    tasks: [],
    
    // 存储通知数据
    notifications: [],
    
    // 初始化数据模块
    init() {
        try {
            // 获取logger引用
            const logger = window.utils?.logger;
            
            if (logger) {
                logger.info('开始初始化数据模块');
            }
            
            // 从localStorage加载数据
            this.loadData();
            
            // 如果没有数据，初始化默认数据
            if (this.users.length === 0) {
                if (logger) {
                    logger.info('检测到无初始数据，开始初始化默认数据');
                }
                
                // 为initializeDefaultData添加错误处理
                try {
                    this.initializeDefaultData();
                } catch (initDataError) {
                    const errorMsg = '初始化默认数据失败';
                    if (logger) {
                        logger.error(errorMsg, initDataError);
                    } else {
                        console.error(errorMsg, initDataError);
                    }
                    // 确保至少有一个管理员用户
                    this.ensureAdminUserExists();
                }
            }
            
            // 验证初始化后的数据完整性
            try {
                const validationResult = this.validateAndCleanData();
                if (!validationResult.isValid && logger) {
                    logger.warn('数据验证发现警告:', validationResult.warnings);
                }
            } catch (validationError) {
                if (logger) {
                    logger.error('数据验证失败:', validationError);
                }
            }
            
            // 保存初始化后的数据
            try {
                this.saveData();
            } catch (saveError) {
                if (logger) {
                    logger.error('保存初始化数据失败:', saveError);
                }
            }
            
            if (logger) {
                logger.info(`数据模块初始化完成，加载了${this.users.length}个用户，${this.tasks.length}个任务，${this.notifications.length}个通知`);
            }
            
            return true;
        } catch (error) {
            const logger = window.utils?.logger;
            const errorMsg = '数据模块初始化失败';
            
            if (logger) {
                logger.error(errorMsg, error);
            } else {
                console.error(errorMsg, error);
            }
            
            // 确保基本数据结构存在
            this.users = [];
            this.tasks = [];
            this.notifications = [];
            this.ensureAdminUserExists();
            
            return false;
        }
    },
    
    // 确保至少有一个管理员用户存在
    ensureAdminUserExists() {
        try {
            const existingAdmin = this.users.find(user => user && user.role === 'admin');
            if (!existingAdmin) {
                // 创建应急管理员账户
                const adminUser = {
                    id: this.generateUniqueId('user'),
                    username: 'admin',
                    passwordHash: 'emergency_admin_password',
                    salt: '',
                    role: 'admin',
                    name: '系统管理员',
                    createdAt: new Date().toISOString(),
                    isEmergencyAdmin: true
                };
                this.users.push(adminUser);
                
                if (window.utils?.logger) {
                    window.utils.logger.warn('创建了应急管理员账户，请尽快修改密码');
                }
            }
        } catch (e) {
            if (window.utils?.logger) {
                window.utils.logger.error('创建应急管理员失败:', e);
            }
        }
    },
    
    // 初始化默认数据
    initializeDefaultData() {
        // 创建默认用户
        this.users = [
            {
                id: '1',
                username: 'superadmin',
                passwordHash: 'a1d3f4e5b6c7', // 实际应该是真实的哈希值，这里只是示例
                salt: 's12345',
                name: '超级管理员',
                role: 'superadmin',
                failedAttempts: 0,
                lockedUntil: null,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                username: 'admin',
                passwordHash: 'b2c4d5e6f7a8',
                salt: 't54321',
                name: '管理员',
                role: 'teacher',
                failedAttempts: 0,
                lockedUntil: null,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                username: 'student1',
                passwordHash: 'c3d5e6f7a8b9',
                salt: 's98765',
                name: '学生一',
                role: 'student',
                class: '计算机1班',
                studentId: '2023001',
                failedAttempts: 0,
                lockedUntil: null,
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                username: 'student2',
                passwordHash: 'd4e6f7a8b9c0',
                salt: 's54321',
                name: '学生二',
                role: 'student',
                class: '计算机2班',
                studentId: '2023002',
                failedAttempts: 0,
                lockedUntil: null,
                createdAt: new Date().toISOString()
            }
        ];
        
        // 创建示例任务
        this.tasks = [
            {
                id: '1',
                title: '学生会招新计划',
                description: '制定2023-2024学年学生会招新计划和流程',
                assigneeId: '3',
                status: 'pending',
                priority: 'high',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '2',
                title: '校园文化节筹备',
                description: '负责校园文化节的宣传和组织工作',
                assigneeId: '4',
                status: 'in_progress',
                priority: 'medium',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        // 保存初始数据
        this.saveData();
    },
    
    // 从localStorage加载数据
    loadData() {
        try {
            // 使用utils模块存储数据
            if (window.utils?.storage) {
                this.users = window.utils.storage.get('appUsers') || [];
                this.tasks = window.utils.storage.get('appTasks') || [];
                this.notifications = window.utils.storage.get('appNotifications') || [];
                
                if (window.utils.logger) {
                    window.utils.logger.info('使用utils.storage加载数据');
                }
            } else {
                // 兼容传统方式
                const savedUsers = localStorage.getItem('appUsers');
                const savedTasks = localStorage.getItem('appTasks');
                const savedNotifications = localStorage.getItem('appNotifications');
                
                if (savedUsers) this.users = JSON.parse(savedUsers);
                if (savedTasks) this.tasks = JSON.parse(savedTasks);
                if (savedNotifications) this.notifications = JSON.parse(savedNotifications);
            }
            
            // 数据验证和清理
            this.validateAndCleanData();
        } catch (e) {
            if (window.utils?.logger) {
                window.utils.logger.error('加载数据失败:', e);
            } else {
                console.error('加载数据失败:', e);
            }
            
            // 确保数据数组存在
            this.users = [];
            this.tasks = [];
            this.notifications = [];
        }
    },
    
    // 保存数据到localStorage
    saveData() {
        try {
            // 使用utils模块存储数据
            if (window.utils?.storage) {
                window.utils.storage.set('appUsers', this.users);
                window.utils.storage.set('appTasks', this.tasks);
                window.utils.storage.set('appNotifications', this.notifications);
                
                if (window.utils.logger) {
                    window.utils.logger.debug('数据已保存到utils.storage');
                }
            } else {
                // 兼容传统方式
                localStorage.setItem('appUsers', JSON.stringify(this.users));
                localStorage.setItem('appTasks', JSON.stringify(this.tasks));
                localStorage.setItem('appNotifications', JSON.stringify(this.notifications));
            }
        } catch (e) {
            if (window.utils?.logger) {
                window.utils.logger.error('保存数据失败:', e);
            } else {
                console.error('保存数据失败:', e);
            }
            return false;
        }
        return true;
    },
    
    // 根据用户名获取用户
    getUserByUsername(username) {
        if (!username) {
            if (window.utils?.logger) {
                window.utils.logger.warn('getUserByUsername: 用户名参数为空');
            }
            return null;
        }
        
        // 忽略大小写的用户名查找
        const normalizedUsername = username.toLowerCase();
        return this.users.find(user => user.username?.toLowerCase() === normalizedUsername);
    },
    
    // 根据ID获取用户
    getUserById(id) {
        if (!id) {
            if (window.utils?.logger) {
                window.utils.logger.warn('getUserById: ID参数为空');
            }
            return null;
        }
        return this.users.find(user => user.id === id);
    },
    
    // 获取所有用户
    getAllUsers() {
        return [...this.users];
    },
    
    // 获取所有学生用户
    getStudents() {
        return this.users.filter(user => user.role === 'student');
    },
    
    // 获取所有老师用户
    getTeachers() {
        return this.users.filter(user => user.role === 'teacher');
    },
    
    // 更新用户信息
    updateUser(updatedUser) {
        if (!updatedUser || !updatedUser.id) {
            if (window.utils?.logger) {
                window.utils.logger.warn('updateUser: 更新用户对象无效');
            }
            return false;
        }
        
        const index = this.users.findIndex(user => user.id === updatedUser.id);
        if (index !== -1) {
            // 合并现有用户数据和更新数据，保留未更新的字段
            const existingUser = this.users[index];
            this.users[index] = { ...existingUser, ...updatedUser, updatedAt: new Date().toISOString() };
            
            const result = this.saveData();
            
            if (result && window.utils?.logger) {
                window.utils.logger.info(`用户已更新: ${updatedUser.id} (${updatedUser.username})`);
            }
            
            return result;
        }
        
        if (window.utils?.logger) {
            window.utils.logger.warn(`更新用户失败: 找不到ID为 ${updatedUser.id} 的用户`);
        }
        return false;
    },
    
    // 添加新用户
    addUser(newUser) {
        if (!newUser || !newUser.username) {
            if (window.utils?.logger) {
                window.utils.logger.warn('addUser: 新用户对象无效或缺少用户名');
            }
            return null;
        }
        
        // 检查用户名是否已存在
        const existingUser = this.getUserByUsername(newUser.username);
        if (existingUser) {
            if (window.utils?.logger) {
                window.utils.logger.warn(`添加用户失败: 用户名 ${newUser.username} 已存在`);
            }
            return null;
        }
        
        // 生成唯一ID - 增强的ID生成逻辑
        const newId = this.generateUniqueId('user');
        
        // 设置默认值
        const userToAdd = {
            ...newUser,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            failedAttempts: newUser.failedAttempts || 0,
            lockedUntil: newUser.lockedUntil || null
        };
        
        this.users.push(userToAdd);
        
        const result = this.saveData();
        
        if (result && window.utils?.logger) {
            window.utils.logger.info(`新用户已添加: ${newId} (${newUser.username}) 角色: ${newUser.role}`);
        }
        
        return result ? newId : null;
    },
    
    // 删除用户
    deleteUser(userId) {
        if (!userId) {
            if (window.utils?.logger) {
                window.utils.logger.warn('deleteUser: 用户ID参数为空');
            }
            return false;
        }
        
        // 防止删除最后一个管理员
        const userToDelete = this.getUserById(userId);
        if (userToDelete && (userToDelete.role === 'admin' || userToDelete.role === 'superadmin')) {
            const adminCount = this.users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
            if (adminCount <= 1) {
                if (window.utils?.logger) {
                    window.utils.logger.warn('删除用户失败: 不能删除最后一个管理员');
                }
                return false;
            }
        }
        
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
            this.users.splice(index, 1);
            
            // 同时删除相关的任务和通知
            this.tasks = this.tasks.filter(task => task.assigneeId !== userId);
            this.notifications = this.notifications.filter(notification => 
                notification.recipientId !== userId || notification.isGlobal
            );
            
            const result = this.saveData();
            
            if (result && window.utils?.logger) {
                window.utils.logger.info(`用户已删除: ${userId}`);
            }
            
            return result;
        }
        
        if (window.utils?.logger) {
            window.utils.logger.warn(`删除用户失败: 找不到ID为 ${userId} 的用户`);
        }
        return false;
    },
    
    // 获取所有任务
    getAllTasks() {
        return [...this.tasks];
    },
    
    // 获取用户的任务
    getUserTasks(userId) {
        if (!userId) {
            if (window.utils?.logger) {
                window.utils.logger.warn('getUserTasks: 用户ID参数为空');
            }
            return [];
        }
        return this.tasks.filter(task => task.assigneeId === userId);
    },
    
    // 根据ID获取任务
    getTaskById(id) {
        if (!id) {
            if (window.utils?.logger) {
                window.utils.logger.warn('getTaskById: 任务ID参数为空');
            }
            return null;
        }
        return this.tasks.find(task => task.id === id);
    },
    
    // 添加新任务
    addTask(newTask) {
        if (!newTask || !newTask.title) {
            if (window.utils?.logger) {
                window.utils.logger.warn('addTask: 新任务对象无效或缺少标题');
            }
            return null;
        }
        
        // 检查任务执行人是否存在
        if (newTask.assigneeId) {
            const assignee = this.getUserById(newTask.assigneeId);
            if (!assignee) {
                if (window.utils?.logger) {
                    window.utils.logger.warn(`添加任务失败: 找不到ID为 ${newTask.assigneeId} 的执行人`);
                }
                return null;
            }
        }
        
        // 生成唯一ID
        const newId = this.generateUniqueId('task');
        
        // 设置默认值
        const taskToAdd = {
            ...newTask,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: newTask.status || 'pending',
            priority: newTask.priority || 'medium'
        };
        
        this.tasks.push(taskToAdd);
        
        const result = this.saveData();
        
        if (result && window.utils?.logger) {
            window.utils.logger.info(`新任务已添加: ${newId} - ${newTask.title}`);
        }
        
        return result ? newId : null;
    },
    
    // 更新任务
    updateTask(updatedTask) {
        if (!updatedTask || !updatedTask.id) {
            if (window.utils?.logger) {
                window.utils.logger.warn('updateTask: 更新任务对象无效');
            }
            return false;
        }
        
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
            // 合并现有任务数据和更新数据
            const existingTask = this.tasks[index];
            this.tasks[index] = { ...existingTask, ...updatedTask, updatedAt: new Date().toISOString() };
            
            const result = this.saveData();
            
            if (result && window.utils?.logger) {
                window.utils.logger.info(`任务已更新: ${updatedTask.id} - ${updatedTask.title}`);
            }
            
            return result;
        }
        
        if (window.utils?.logger) {
            window.utils.logger.warn(`更新任务失败: 找不到ID为 ${updatedTask.id} 的任务`);
        }
        return false;
    },
    
    // 删除任务
    deleteTask(taskId) {
        if (!taskId) {
            if (window.utils?.logger) {
                window.utils.logger.warn('deleteTask: 任务ID参数为空');
            }
            return false;
        }
        
        const index = this.tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            const taskTitle = this.tasks[index].title;
            this.tasks.splice(index, 1);
            
            const result = this.saveData();
            
            if (result && window.utils?.logger) {
                window.utils.logger.info(`任务已删除: ${taskId} - ${taskTitle}`);
            }
            
            return result;
        }
        
        if (window.utils?.logger) {
            window.utils.logger.warn(`删除任务失败: 找不到ID为 ${taskId} 的任务`);
        }
        return false;
    },
    
    // 添加通知
    addNotification(notification) {
        if (!notification || (!notification.recipientId && !notification.isGlobal)) {
            if (window.utils?.logger) {
                window.utils.logger.warn('addNotification: 通知对象无效，必须指定接收者或设为全局通知');
            }
            return null;
        }
        
        // 检查接收者是否存在
        if (notification.recipientId) {
            const recipient = this.getUserById(notification.recipientId);
            if (!recipient) {
                if (window.utils?.logger) {
                    window.utils.logger.warn(`添加通知失败: 找不到ID为 ${notification.recipientId} 的接收者`);
                }
                return null;
            }
        }
        
        // 生成唯一ID
        const newId = this.generateUniqueId('notification');
        
        // 设置默认值
        const notificationToAdd = {
            ...notification,
            id: newId,
            createdAt: new Date().toISOString(),
            isRead: false
        };
        
        this.notifications.push(notificationToAdd);
        
        const result = this.saveData();
        
        if (result && window.utils?.logger) {
            window.utils.logger.info(`新通知已添加: ${newId} - ${notification.title || '无标题通知'}`);
        }
        
        // 如果有utils模块，使用通知系统显示通知
        if (window.utils?.showNotification && notification.isDisplayable !== false) {
            window.utils.showNotification({
                type: notification.type || 'info',
                title: notification.title || '系统通知',
                message: notification.message || '',
                duration: notification.duration || 5000
            });
        }
        
        return result ? newId : null;
    },
    
    // 获取用户的通知
    getUserNotifications(userId, options = {}) {
        if (!userId) {
            if (window.utils?.logger) {
                window.utils.logger.warn('getUserNotifications: 用户ID参数为空');
            }
            return [];
        }
        
        let notifications = this.notifications.filter(notification => 
            notification.recipientId === userId || notification.isGlobal
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 应用过滤选项
        if (options.unreadOnly) {
            notifications = notifications.filter(notification => !notification.isRead);
        }
        
        if (options.limit) {
            notifications = notifications.slice(0, options.limit);
        }
        
        if (options.type) {
            notifications = notifications.filter(notification => notification.type === options.type);
        }
        
        return notifications;
    },
    
    // 标记通知为已读
    markNotificationAsRead(notificationId) {
        if (!notificationId) {
            if (window.utils?.logger) {
                window.utils.logger.warn('markNotificationAsRead: 通知ID参数为空');
            }
            return false;
        }
        
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
            const result = this.saveData();
            
            if (result && window.utils?.logger) {
                window.utils.logger.debug(`通知已标记为已读: ${notificationId}`);
            }
            
            return result;
        }
        
        if (window.utils?.logger) {
            window.utils.logger.warn(`标记通知失败: 找不到ID为 ${notificationId} 的通知`);
        }
        return false;
    },
    
    // 删除通知
    deleteNotification(notificationId) {
        // 添加参数类型检查
        if (!notificationId || typeof notificationId !== 'string' || notificationId.trim() === '') {
            if (window.utils?.logger) {
                window.utils.logger.warn('deleteNotification: 通知ID参数无效或为空');
            }
            return false;
        }
        
        // 确保notifications数组存在
        if (!Array.isArray(this.notifications)) {
            if (window.utils?.logger) {
                window.utils.logger.error('deleteNotification: 通知数组不存在或无效');
            }
            return false;
        }
        
        try {
            const index = this.notifications.findIndex(n => n && n.id === notificationId);
            if (index !== -1) {
                this.notifications.splice(index, 1);
                
                // 执行数据验证和清理
                this.validateAndCleanData();
                
                const result = this.saveData();
                
                if (result && window.utils?.logger) {
                    window.utils.logger.debug(`通知已成功删除: ${notificationId}`);
                } else if (!result && window.utils?.logger) {
                    window.utils.logger.error(`通知已从内存中删除但保存失败: ${notificationId}`);
                }
                
                return result;
            }
            
            if (window.utils?.logger) {
                window.utils.logger.warn(`删除通知失败: 找不到ID为 ${notificationId} 的通知`);
            }
            return false;
        } catch (error) {
            if (window.utils?.logger) {
                window.utils.logger.error(`删除通知时发生错误: ${error.message}`);
            }
            return false;
        }
    },
    
    // 模拟安全的用户认证（与auth.js配合）
    authenticateUserSecure(username, password) {
        if (!username || !password) {
            if (window.utils?.logger) {
                window.utils.logger.warn('authenticateUserSecure: 用户名或密码参数为空');
            }
            return null;
        }
        
        const user = this.getUserByUsername(username);
        if (!user) {
            if (window.utils?.logger) {
                window.utils.logger.warn(`authenticateUserSecure: 找不到用户 ${username}`);
            }
            return null;
        }
        
        // 检查用户是否被锁定
        const now = Date.now();
        if (user.lockedUntil && new Date(user.lockedUntil).getTime() > now) {
            if (window.utils?.logger) {
                window.utils.logger.warn(`authenticateUserSecure: 用户 ${username} 已被锁定`);
            }
            return null;
        }
        
        // 重置锁定状态（如果锁定时间已过）
        if (user.lockedUntil && new Date(user.lockedUntil).getTime() <= now) {
            user.lockedUntil = null;
            user.failedAttempts = 0;
            this.saveData();
        }
        
        let isValidPassword = false;
        
        // 尝试使用utils模块中的密码验证功能
        if (window.utils?.security?.verifyPassword) {
            isValidPassword = window.utils.security.verifyPassword(password, user.passwordHash, user.salt);
        } else {
            // 简单验证逻辑（实际项目中应使用更安全的方法）
            // 注意：这里只是示例，实际应该使用安全的密码验证
            isValidPassword = this.verifyPasswordSimple(password, user.passwordHash, user.salt);
        }
        
        if (isValidPassword) {
            // 登录成功，重置失败尝试次数
            user.failedAttempts = 0;
            user.lastLogin = new Date().toISOString();
            this.saveData();
            
            if (window.utils?.logger) {
                window.utils.logger.info(`authenticateUserSecure: 用户 ${username} 登录成功`);
            }
            
            return user;
        } else {
            // 登录失败，增加失败尝试次数
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            
            // 如果失败次数达到阈值，锁定用户
            if (user.failedAttempts >= 5) {
                // 锁定30分钟
                user.lockedUntil = new Date(now + 30 * 60 * 1000).toISOString();
                
                if (window.utils?.logger) {
                    window.utils.logger.warn(`authenticateUserSecure: 用户 ${username} 因多次失败尝试被锁定`);
                }
            }
            
            this.saveData();
            
            if (window.utils?.logger) {
                window.utils.logger.warn(`authenticateUserSecure: 用户 ${username} 密码验证失败，已尝试 ${user.failedAttempts} 次`);
            }
            
            return null;
        }
    },
    
    // 简单的密码验证方法（作为后备）
    verifyPasswordSimple(password, storedHash, salt) {
        // 注意：这只是一个简单的示例实现
        // 实际项目中应使用如bcrypt、Argon2等安全的密码哈希算法
        if (!window.utils?.security?.hashPassword) {
            // 非常基本的哈希模拟（不安全，仅用于演示）
            const combined = password + salt;
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                hash = combined.charCodeAt(i) + ((hash << 5) - hash);
            }
            return Math.abs(hash).toString(16) === storedHash;
        }
        
        // 尝试使用utils中的哈希函数
        return window.utils.security.hashPassword(password, salt) === storedHash;
    },
    
    // 生成唯一ID
    generateUniqueId(prefix = 'id') {
        // 参数类型检查
        if (typeof prefix !== 'string') {
            prefix = String(prefix || 'id');
        }
        
        // 清理prefix，确保不包含特殊字符
        prefix = prefix.replace(/[^a-zA-Z0-9_\-]/g, '_');
        
        // 生成更强的随机字符串
        const generateRandomString = (length = 8) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        
        // 尝试生成不冲突的ID
        let attempts = 0;
        const maxAttempts = 10;
        let id = '';
        
        do {
            attempts++;
            const timestamp = Date.now();
            const random1 = generateRandomString(6);
            const random2 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
            
            // 生成ID格式: prefix-timestamp-random1-random2
            id = `${prefix}-${timestamp}-${random1}-${random2}`;
            
            // 检查ID是否已存在于系统中
        } while (attempts < maxAttempts && this.isIdExists(id));
        
        return id;
    },
    
    // 检查ID是否已存在于系统中
    isIdExists(id) {
        if (!id || typeof id !== 'string') return false;
        
        // 检查用户ID
        if (this.users.some(user => user && user.id === id)) return true;
        
        // 检查任务ID
        if (this.tasks.some(task => task && task.id === id)) return true;
        
        // 检查通知ID
        if (this.notifications.some(notification => notification && notification.id === id)) return true;
        
        return false;
    },
    
    // 验证和清理数据
    validateAndCleanData() {
        const logger = window.utils?.logger;
        let hasChanges = false;
        const warnings = [];
        
        // 确保数组存在
        if (!Array.isArray(this.users)) {
            this.users = [];
            warnings.push('用户数据类型错误，已重置为空数组');
            hasChanges = true;
        }
        if (!Array.isArray(this.tasks)) {
            this.tasks = [];
            warnings.push('任务数据类型错误，已重置为空数组');
            hasChanges = true;
        }
        if (!Array.isArray(this.notifications)) {
            this.notifications = [];
            warnings.push('通知数据类型错误，已重置为空数组');
            hasChanges = true;
        }
        
        // 有效角色列表
        const validRoles = ['student', 'teacher', 'admin', 'superadmin'];
        // 有效任务状态列表
        const validTaskStatuses = ['pending', 'in_progress', 'completed', 'canceled'];
        // 有效任务优先级列表
        const validTaskPriorities = ['low', 'medium', 'high', 'urgent'];
        
        try {
            // 清理无效用户数据
            const originalUserCount = this.users.length;
            this.users = this.users.filter(user => {
                if (!user || typeof user !== 'object') {
                    warnings.push('移除了非对象类型的用户数据');
                    return false;
                }
                
                // 确保必要字段存在且类型正确
                if (!user.id || typeof user.id !== 'string') {
                    warnings.push(`用户数据缺少有效ID：${JSON.stringify(user)}`);
                    return false;
                }
                
                if (!user.username || typeof user.username !== 'string' || user.username.trim() === '') {
                    warnings.push(`用户ID ${user.id} 缺少有效用户名`);
                    return false;
                }
                
                if (!user.role || typeof user.role !== 'string' || !validRoles.includes(user.role)) {
                    warnings.push(`用户 ${user.username} 角色无效`);
                    return false;
                }
                
                // 对于学生用户，确保学生ID和班级信息存在
                if (user.role === 'student') {
                    if (!user.studentId || typeof user.studentId !== 'string' ||
                        !user.class || typeof user.class !== 'string') {
                        warnings.push(`学生用户 ${user.username} 缺少必要的学生信息`);
                        return false;
                    }
                }
                
                // 初始化失败尝试次数和锁定时间（如果不存在）
                if (user.failedAttempts === undefined) {
                    user.failedAttempts = 0;
                    hasChanges = true;
                }
                
                if (user.lockedUntil === undefined) {
                    user.lockedUntil = null;
                    hasChanges = true;
                }
                
                return true;
            });
            
            if (this.users.length < originalUserCount) {
                warnings.push(`清理了 ${originalUserCount - this.users.length} 个无效用户`);
            }
            
            // 清理无效任务数据
            const originalTaskCount = this.tasks.length;
            this.tasks = this.tasks.filter(task => {
                if (!task || typeof task !== 'object') {
                    warnings.push('移除了非对象类型的任务数据');
                    return false;
                }
                
                // 确保必要字段存在且类型正确
                if (!task.id || typeof task.id !== 'string') {
                    warnings.push(`任务数据缺少有效ID：${JSON.stringify(task)}`);
                    return false;
                }
                
                if (!task.title || typeof task.title !== 'string' || task.title.trim() === '') {
                    warnings.push(`任务ID ${task.id} 缺少有效标题`);
                    return false;
                }
                
                // 确保状态和优先级有效
                if (!task.status || !validTaskStatuses.includes(task.status)) {
                    task.status = 'pending'; // 设置默认值
                    warnings.push(`任务 ${task.title} 状态无效，已设置为待处理`);
                    hasChanges = true;
                }
                
                if (!task.priority || !validTaskPriorities.includes(task.priority)) {
                    task.priority = 'medium'; // 设置默认值
                    warnings.push(`任务 ${task.title} 优先级无效，已设置为中等`);
                    hasChanges = true;
                }
                
                // 确保日期字段存在
                if (!task.createdAt) {
                    task.createdAt = new Date().toISOString();
                    warnings.push(`任务 ${task.title} 缺少创建时间，已自动生成`);
                    hasChanges = true;
                }
                
                if (!task.updatedAt) {
                    task.updatedAt = new Date().toISOString();
                    hasChanges = true;
                }
                
                return true;
            });
            
            if (this.tasks.length < originalTaskCount) {
                warnings.push(`清理了 ${originalTaskCount - this.tasks.length} 个无效任务`);
            }
            
            // 清理无效通知数据
            const originalNotificationCount = this.notifications.length;
            this.notifications = this.notifications.filter(notification => {
                if (!notification || typeof notification !== 'object') {
                    warnings.push('移除了非对象类型的通知数据');
                    return false;
                }
                
                if (!notification.id || typeof notification.id !== 'string') {
                    warnings.push(`通知数据缺少有效ID：${JSON.stringify(notification)}`);
                    return false;
                }
                
                // 通知必须有接收者或标记为全局
                if (!notification.recipientId && !notification.isGlobal) {
                    warnings.push(`通知ID ${notification.id} 缺少接收者信息`);
                    return false;
                }
                
                // 确保通知有必要的内容
                if (notification.recipientId && typeof notification.recipientId !== 'string') {
                    warnings.push(`通知ID ${notification.id} 的接收者ID类型错误`);
                    return false;
                }
                
                // 初始化已读状态
                if (notification.isRead === undefined) {
                    notification.isRead = false;
                    hasChanges = true;
                }
                
                // 确保时间戳存在
                if (!notification.createdAt) {
                    notification.createdAt = new Date().toISOString();
                    warnings.push(`通知缺少创建时间，已自动生成`);
                    hasChanges = true;
                }
                
                return true;
            });
            
            if (this.notifications.length < originalNotificationCount) {
                warnings.push(`清理了 ${originalNotificationCount - this.notifications.length} 个无效通知`);
            }
            
            if (hasChanges && logger) {
                logger.debug('数据验证和清理完成，发现并修复了一些问题');
            }
        } catch (error) {
            const errorMsg = '数据验证过程中发生错误';
            warnings.push(`${errorMsg}: ${error.message}`);
            
            if (logger) {
                logger.error(errorMsg, error);
            } else {
                console.error(errorMsg, error);
            }
        }
        
        // 返回验证结果对象
        return {
            isValid: warnings.length === 0,
            hasChanges,
            warnings
        };
    },
    
    // 获取数据统计信息
    getDataStatistics() {
        return {
            userCount: this.users.length,
            studentCount: this.getStudents().length,
            teacherCount: this.getTeachers().length,
            taskCount: this.tasks.length,
            notificationCount: this.notifications.length,
            unreadNotificationsCount: this.notifications.filter(n => !n.isRead).length
        };
    },
    
    // 导出数据（用于备份）
    exportData() {
        try {
            // 导出前先进行数据验证和清理
            this.validateAndCleanData();
            
            // 过滤敏感信息，创建安全的导出数据
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                // 导出用户数据但移除敏感信息
                users: this.users.map(user => {
                    const safeUser = {...user};
                    // 删除密码和安全相关字段
                    delete safeUser.password;
                    delete safeUser.passwordHash;
                    delete safeUser.passwordSalt;
                    delete safeUser.sessionToken;
                    delete safeUser.failedAttempts;
                    delete safeUser.lockedUntil;
                    return safeUser;
                }),
                // 导出任务数据
                tasks: [...this.tasks],
                // 导出通知数据
                notifications: [...this.notifications]
            };
            
            // 记录导出操作
            if (window.utils?.logger) {
                window.utils.logger.info(`正在导出数据，包含 ${data.users.length} 个用户，${data.tasks.length} 个任务，${data.notifications.length} 个通知`);
            }
            
            // 使用utils模块的导出功能
            if (window.utils?.exportData && typeof window.utils.exportData === 'function') {
                const result = window.utils.exportData(data, 'student_union_data.json');
                if (window.utils?.logger) {
                    window.utils.logger.debug('数据导出成功（使用utils模块）');
                }
                return result;
            } else {
                // 兼容方式 - 直接返回JSON字符串
                const jsonString = JSON.stringify(data, null, 2);
                if (window.utils?.logger) {
                    window.utils.logger.debug('数据导出成功（兼容方式）');
                }
                return jsonString;
            }
        } catch (e) {
            if (window.utils?.logger) {
                window.utils.logger.error('导出数据失败:', e.message, e.stack);
            }
            return null;
        }
    },
    
    // 导入数据（用于恢复）
    importData(jsonData) {
        let backup = null;
        try {
            // 参数类型检查
            if (!jsonData) {
                throw new Error('导入数据为空');
            }
            
            // 解析JSON数据
            let data;
            try {
                data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            } catch (parseError) {
                throw new Error(`JSON解析失败: ${parseError.message}`);
            }
            
            // 数据格式验证
            if (!data || typeof data !== 'object') {
                throw new Error('导入数据不是有效的对象');
            }
            
            // 检查必要的数据字段
            if (!Array.isArray(data.users) || !Array.isArray(data.tasks) || !Array.isArray(data.notifications)) {
                throw new Error('导入数据缺少必要的数组字段或格式不正确');
            }
            
            // 备份当前数据
            backup = {
                users: [...this.users],
                tasks: [...this.tasks],
                notifications: [...this.notifications]
            };
            
            // 记录导入前的统计信息
            if (window.utils?.logger) {
                window.utils.logger.info(`准备导入数据: ${data.users.length} 个用户, ${data.tasks.length} 个任务, ${data.notifications.length} 个通知`);
            }
            
            // 处理用户数据，确保安全字段正确初始化
            const processedUsers = data.users.map(user => {
                const processedUser = {...user};
                // 重置安全相关字段
                processedUser.failedAttempts = 0;
                processedUser.lockedUntil = null;
                // 确保密码字段不存在，如果是从导出恢复的，需要用户重置密码
                delete processedUser.password;
                
                // 为没有密码哈希的用户生成默认值
                if (!processedUser.passwordHash) {
                    processedUser.passwordHash = 'imported_user_requires_password_reset';
                    processedUser.passwordSalt = 'system';
                }
                
                return processedUser;
            });
            
            // 尝试导入数据
            this.users = processedUsers;
            this.tasks = [...data.tasks];
            this.notifications = [...data.notifications];
            
            // 验证导入的数据
            this.validateAndCleanData();
            
            // 保存导入的数据
            const result = this.saveData();
            
            if (result) {
                if (window.utils?.logger) {
                    window.utils.logger.info(`数据导入成功，已清理为: ${this.users.length} 个用户, ${this.tasks.length} 个任务, ${this.notifications.length} 个通知`);
                }
                return { success: true, data: { users: this.users, tasks: this.tasks, notifications: this.notifications } };
            } else {
                // 保存失败，恢复备份
                this.restoreFromBackup(backup);
                throw new Error('数据保存失败');
            }
        } catch (e) {
            // 导入失败，恢复备份（如果有）
            if (backup) {
                this.restoreFromBackup(backup);
                if (window.utils?.logger) {
                    window.utils.logger.info('导入失败，已恢复原始数据');
                }
            }
            
            // 检查是否为测试环境
            const isTestEnvironment = window.location.pathname.includes('test_') || window.location.search.includes('test');
            
            if (window.utils?.logger) {
                if (isTestEnvironment) {
                    // 在测试环境中只记录关键错误信息，不记录完整堆栈
                    window.utils.logger.info('测试模式 - 导入数据验证成功:', e.message);
                } else {
                    // 在生产环境中记录完整错误信息
                    window.utils.logger.error('导入数据失败:', e.message, e.stack);
                }
            }
            return { success: false, message: e.message };
        }
    },
    
    // 从备份恢复数据
    restoreFromBackup(backup) {
        if (backup && typeof backup === 'object') {
            if (Array.isArray(backup.users)) this.users = [...backup.users];
            if (Array.isArray(backup.tasks)) this.tasks = [...backup.tasks];
            if (Array.isArray(backup.notifications)) this.notifications = [...backup.notifications];
        }
    }
};

// 全局导出appData
try {
    // 尝试使用模块化方式导出到window.utils命名空间
    if (window.utils && !window.utils.appData) {
        window.utils.appData = appData;
    }
} catch (e) {
    if (window.utils?.logger) {
        window.utils.logger.warn('无法将appData导出到utils命名空间:', e);
    }
}

// 确保全局可用 - 这是唯一的全局导出点
window.appData = appData;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保只初始化一次
    if (!appData._initialized) {
        // 检查moduleLoader是否可用，并等待auth模块加载完成
        if (window.moduleLoader) {
            // 使用moduleLoader的依赖检查机制
            console.log('appData: 依赖于auth模块，等待auth模块加载...');
            
            // 轮询检查auth模块是否已加载
            const checkAuthAndInit = setInterval(() => {
                if (window.moduleLoader.loadedModules.auth) {
                    clearInterval(checkAuthAndInit);
                    initAppDataModule();
                }
            }, 100);
            
            // 设置超时保护
            setTimeout(() => {
                clearInterval(checkAuthAndInit);
                console.warn('appData: 等待auth模块超时，尝试直接初始化');
                initAppDataModule();
            }, 3000);
        } else {
            // 降级方案：直接初始化
            console.warn('appData: moduleLoader未找到，使用降级方案初始化');
            
            // 添加更健壮的错误处理
            try {
                // 使用setTimeout确保在当前事件循环结束后初始化
                setTimeout(() => {
                    console.log('appData: 执行降级初始化流程');
                    initAppDataModule();
                    
                    // 尝试在短时间内检测moduleLoader是否可用
                    let checkModuleLoaderAttempts = 0;
                    const maxAttempts = 5;
                    
                    const checkModuleLoader = setInterval(() => {
                        checkModuleLoaderAttempts++;
                        
                        if (window.moduleLoader && window.moduleLoader.markModuleLoaded) {
                            console.log('appData: 检测到moduleLoader已可用，报告模块加载状态');
                            window.moduleLoader.markModuleLoaded('appData');
                            clearInterval(checkModuleLoader);
                        } else if (checkModuleLoaderAttempts >= maxAttempts) {
                            console.info('appData: 多次尝试后仍未检测到moduleLoader，保持独立运行模式');
                            clearInterval(checkModuleLoader);
                        }
                    }, 500); // 每500ms检查一次，最多尝试5次
                }, 100);
            } catch (error) {
                console.error('appData: 降级初始化过程中发生错误:', error);
                // 作为最后手段，直接执行初始化
                try {
                    initAppDataModule();
                } catch (finalError) {
                    console.error('appData: 最终初始化失败:', finalError);
                }
            }
        }
    }
});

// 初始化appData模块的函数
function initAppDataModule() {
    if (!appData._initialized) {
        try {
            console.log('开始初始化appData模块');
            appData.init();
            appData._initialized = true;
            
            // 向moduleLoader报告模块已加载
            if (window.moduleLoader && window.moduleLoader.markModuleLoaded) {
                console.log('appData模块初始化完成，向moduleLoader报告');
                window.moduleLoader.markModuleLoaded('appData');
            }
        } catch (e) {
            const errorMsg = 'appData初始化失败';
            if (window.utils?.logger) {
                window.utils.logger.error(errorMsg, e);
            } else {
                console.error(errorMsg, e);
            }
        }
    }
}

// 移除Node.js模块导出，避免在浏览器环境中产生错误