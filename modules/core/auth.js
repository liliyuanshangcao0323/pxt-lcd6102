// 认证模块 - 核心系统组件
const auth = {
    currentUser: null,
    isInitialized: false,
    
    // 初始化认证模块
    init() {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('认证模块已初始化，跳过重复初始化');
            return;
        }
        
        try {
            console.log('开始初始化认证模块');
            
            // 从localStorage加载用户会话
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    // 验证会话是否过期
                    if (this.isSessionExpired()) {
                        console.log('会话已过期，执行注销');
                        this.logout();
                    } else if (window.utils?.logger) {
                        window.utils.logger.info('用户会话已恢复:', { username: this.currentUser.username, role: this.currentUser.role });
                    }
                } catch (e) {
                    if (window.utils?.logger) {
                        window.utils.logger.error('加载用户会话失败:', e);
                    } else {
                        console.error('加载用户会话失败:', e);
                    }
                    this.logout();
                }
            } else if (window.utils?.logger) {
                window.utils.logger.info('无用户会话数据');
            }
            
            // 设置初始化完成标志
            this.isInitialized = true;
            console.log('认证模块初始化完成，设置isInitialized=true');
            
            // 向模块加载器报告模块已加载
            if (window.moduleLoader && window.moduleLoader.markModuleLoaded) {
                console.log('向模块加载器报告认证模块已加载');
                window.moduleLoader.markModuleLoaded('auth');
            } else {
                // 兼容方案：通过日志消息触发模块加载检测
                console.log('模块 auth 已初始化');
                
                // 额外的兼容性检查：延迟检查是否moduleLoader已可用
                setTimeout(() => {
                    if (window.moduleLoader && window.moduleLoader.markModuleLoaded && this.isInitialized) {
                        console.log('延迟报告认证模块已加载');
                        window.moduleLoader.markModuleLoaded('auth');
                    }
                }, 100);
            }
            
        } catch (e) {
            console.error('认证模块初始化异常:', e);
            if (window.utils?.logger) {
                window.utils.logger.error('认证模块初始化失败:', e);
            } else {
                console.error('认证模块初始化失败:', e);
            }
            this.isInitialized = false;
        }
    },
    
    // 用户登录
    login(username, password) {
        try {
            // 参数验证
            if (!username || !password) {
                return { success: false, message: '请输入用户名和密码' };
            }
            
            // 获取logger引用
            const logger = window.utils?.logger;
            
            // 记录登录尝试
            if (logger) {
                logger.info('用户登录尝试', { username });
            }
            
            // 模拟登录验证（实际应用中应调用API）
            const user = window.appData?.getUserByUsername(username);
            
            if (!user) {
                if (logger) {
                    logger.warn('用户名不存在', { username });
                }
                return { success: false, message: '用户名不存在' };
            }
            
            // 检查账户是否锁定
            if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
                const timeLeft = Math.ceil((new Date(user.lockedUntil) - new Date()) / 1000 / 60);
                if (logger) {
                    logger.warn('账户已被锁定', { username, lockedUntil: user.lockedUntil });
                }
                return { success: false, message: `账户已被锁定，请${timeLeft}分钟后再试` };
            }
            
            // 验证密码（这里假设使用明文密码进行演示）
            // 实际应用中应使用securityModule进行密码验证
            let passwordCorrect = false;
            if (window.securityModule && user.passwordHash && user.salt) {
                passwordCorrect = securityModule.verifyPassword(password, user.passwordHash, user.salt);
            } else {
                // 兼容旧的密码存储方式
                passwordCorrect = (user.password === password);
            }
            
            if (!passwordCorrect) {
                // 记录失败次数
                const failedAttempts = (user.failedAttempts || 0) + 1;
                const updatedUser = { ...user, failedAttempts };
                
                // 5次失败锁定30分钟
                if (failedAttempts >= 5) {
                    const lockedUntil = new Date();
                    lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);
                    updatedUser.lockedUntil = lockedUntil.toISOString();
                    if (logger) {
                        logger.warn('账户已被锁定（5次失败尝试）', { username, lockedUntil: lockedUntil.toISOString() });
                    }
                }
                
                window.appData?.updateUser(updatedUser);
                
                if (logger) {
                    logger.warn('密码错误', { username, failedAttempts });
                }
                return { success: false, message: '密码错误' };
            }
            
            // 登录成功，重置失败次数
            if (user.failedAttempts > 0 || user.lockedUntil) {
                const updatedUser = { ...user, failedAttempts: 0, lockedUntil: null };
                window.appData?.updateUser(updatedUser);
            }
            
            // 设置会话信息
            const sessionUser = {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                sessionStart: new Date().toISOString(),
                lastLoginTime: user.lastLoginTime || new Date().toISOString()
            };
            
            this.currentUser = sessionUser;
            
            // 使用utils模块存储数据
            if (window.utils?.storage) {
                window.utils.storage.set('currentUser', sessionUser);
            } else {
                localStorage.setItem('currentUser', JSON.stringify(sessionUser));
            }
            
            // 更新最后登录时间
            if (window.appData) {
                const updatedUser = { ...user, lastLoginTime: new Date().toISOString() };
                window.appData.updateUser(updatedUser);
            }
            
            if (logger) {
                logger.info('用户登录成功', { username, role: user.role });
            }
            
            return { success: true };
        } catch (e) {
            if (window.utils?.logger) {
                window.utils.logger.error('登录失败:', e);
            } else {
                console.error('登录失败:', e);
            }
            return { success: false, message: '登录过程中发生错误' };
        }
    },
    
    // 用户注销
    logout() {
        if (window.utils?.logger && this.currentUser) {
            window.utils.logger.info('用户注销', { username: this.currentUser.username });
        }
        
        this.currentUser = null;
        
        // 使用utils模块清除存储数据
        if (window.utils?.storage) {
            window.utils.storage.remove('currentUser');
        } else {
            localStorage.removeItem('currentUser');
        }
        
        // 显示注销成功提示
        if (window.utils?.showNotification) {
            window.utils.showNotification({
                type: 'success',
                title: '注销成功',
                message: '您已成功注销登录',
                duration: 3000
            });
        }
    },
    
    // 获取当前用户
    getCurrentUser() {
        // 再次验证会话是否过期
        if (this.currentUser && this.isSessionExpired()) {
            if (window.utils?.logger) {
                window.utils.logger.info('会话已过期，自动注销', { username: this.currentUser.username });
            }
            
            // 显示会话过期提示
            if (window.utils?.showNotification) {
                window.utils.showNotification({
                    type: 'warning',
                    title: '会话过期',
                    message: '您的会话已过期，请重新登录',
                    duration: 5000
                });
            }
            
            this.logout();
        }
        return this.currentUser;
    },
    
    // 检查会话是否过期（2小时过期）
    isSessionExpired() {
        if (!this.currentUser?.sessionStart) {
            return true;
        }
        
        const sessionStart = new Date(this.currentUser.sessionStart);
        const now = new Date();
        const sessionDuration = now - sessionStart;
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        
        return sessionDuration > twoHoursInMs;
    },
    
    // 刷新会话
    refreshSession() {
        if (this.currentUser) {
            this.currentUser.sessionStart = new Date().toISOString();
            
            if (window.utils?.storage) {
                window.utils.storage.set('currentUser', this.currentUser);
            } else {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
            
            if (window.utils?.logger) {
                window.utils.logger.debug('会话已刷新', { username: this.currentUser.username });
            }
        }
    },
    
    // 检查用户是否有权限
    hasPermission(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // admin角色拥有所有权限
        if (user.role === 'admin' || user.role === 'superadmin') return true;
        
        return user.role === requiredRole;
    },
    
    // 获取用户权限等级
    getUserPermissionLevel() {
        const user = this.getCurrentUser();
        if (!user) return 0;
        
        // 权限等级：superadmin > admin > teacher > student
        const roleLevels = {
            'superadmin': 4,
            'admin': 3,
            'teacher': 2,
            'student': 1
        };
        
        return roleLevels[user.role] || 0;
    },
    
    // 检查当前用户权限是否高于或等于指定角色
    hasHigherOrEqualPermission(role) {
        const userLevel = this.getUserPermissionLevel();
        const requiredLevel = {
            'superadmin': 4,
            'admin': 3,
            'teacher': 2,
            'student': 1
        }[role] || 0;
        
        return userLevel >= requiredLevel;
    }
};

// 导出模块
window.auth = auth;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一小段时间执行，确保moduleLoader已经准备好
    setTimeout(() => {
        console.log('DOM加载完成，执行认证模块初始化');
        auth.init();
    }, 50);
});

// 额外的安全机制：如果模块加载器检测时认证模块未被标记为已加载，
// 提供一个公开的方法供外部调用初始化
window.initAuthModule = function() {
    console.log('调用window.initAuthModule()，初始化认证模块');
    return auth.init();
}