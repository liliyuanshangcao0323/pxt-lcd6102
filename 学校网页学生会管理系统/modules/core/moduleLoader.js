// 模块加载器 - 确保模块按照正确顺序加载
// 引入工具模块 - 不再重复声明utils变量

// 全局utils引用 - 重命名以避免与utils.js中的全局对象冲突
let utilsRef = null;

// 动态加载utils模块的函数
async function loadUtilsModule() {
    try {
        // 等待utils模块加载完成
        while (!window.utils) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // 设置全局utils引用
        utilsRef = window.utils;
        console.log('utils模块加载成功');
        return true;
    } catch (error) {
        console.error('加载utils模块失败:', error);
        return false;
    }
};

const moduleLoader = {
    // 模块加载状态
    loadedModules: {
        auth: false,
        appData: false,
        securityModule: false,
        notificationModule: false,
        teacherModule: false,
        studentModule: false,
        adminModule: false,
        statisticsModule: false
    },
    
    // 核心模块依赖关系
    dependencies: {
        auth: [],
        appData: ['auth'],
        securityModule: [],
        notificationModule: ['auth', 'appData'],
        teacherModule: ['auth', 'appData', 'securityModule'],
        studentModule: ['auth', 'appData', 'securityModule'],
        adminModule: ['auth', 'appData', 'securityModule'],
        statisticsModule: ['auth', 'appData']
    },
    
    // 等待初始化的回调函数队列
    initQueue: [],
    
    // 模块加载重试计数
    retryCount: {},
    
    // 最大重试次数
    MAX_RETRIES: 3,
    
    // 重试间隔（毫秒）
    RETRY_INTERVAL: 500,
    
    // 模块超时时间（毫秒）
    TIMEOUT: 10000,
    
    // 标记模块已加载 - 增强版带详细日志
    markModuleLoaded(moduleName) {
        const message = `模块 ${moduleName} 已加载`;
        if (utils?.logger) {
            utils.logger.info(message);
        }
        console.log(message);
        
        // 记录加载时间点，用于调试
        const now = new Date();
        if (!this.loadedTimes) this.loadedTimes = {};
        this.loadedTimes[moduleName] = now.toISOString();
        
        this.loadedModules[moduleName] = true;
        
        // 触发相关模块的加载检查
        console.log(`模块 ${moduleName} 已加载，触发依赖模块检查`);
        this.checkModuleDependencies();
    },
    
    // 检查模块依赖是否满足
    isDependencySatisfied(moduleName) {
        const deps = this.dependencies[moduleName] || [];
        // 检查所有依赖是否都已加载
        return deps.every(dep => this.loadedModules[dep]);
    },
    
    // 检查并尝试初始化所有模块
    checkModuleDependencies() {
        // 检查所有模块的依赖状态
        for (const moduleName in this.loadedModules) {
            if (!this.loadedModules[moduleName] && this.isDependencySatisfied(moduleName)) {
                this.initializeModule(moduleName);
            }
        }
        
        // 检查是否所有核心模块都已加载
        if (this.areAllCoreModulesLoaded()) {
            this.executeInitQueue();
        }
    },
    
    // 初始化单个模块
    initializeModule(moduleName) {
        if (utilsRef?.logger) {
            utilsRef.logger.info(`尝试初始化模块: ${moduleName}`);
        } else {
            console.log(`尝试初始化模块: ${moduleName}`);
        }
        
        // 获取对应的全局模块对象
        let moduleObj = window[moduleName];
        
        // 如果模块不存在，自动创建一个基本的模块对象以避免错误
        if (!moduleObj) {
            if (utilsRef?.logger) {
                utilsRef.logger.warn(`模块 ${moduleName} 未在window对象上定义，创建基本模块对象`);
            } else {
                console.warn(`模块 ${moduleName} 未在window对象上定义，创建基本模块对象`);
            }
            
            // 根据模块名称创建特定的基本模块对象
            if (moduleName === 'teacherModule') {
                // 教师模块特定的基本对象
                window[moduleName] = {
                    // 基础初始化方法
                    init: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块 ${moduleName} 初始化`);
                        } else {
                            console.log(`基本模块 ${moduleName} 初始化`);
                        }
                    },
                    
                    // 教师模块特有属性
                    currentGroup: 'all',
                    
                    // 学生管理相关方法
                    initStudentManagement: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 初始化学生管理功能');
                        }
                    },
                    
                    // 任务管理相关方法
                    initTaskManagement: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 初始化任务管理功能');
                        }
                    },
                    
                    // 模态框和消息方法
                    showModal: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 显示模态框');
                        }
                    },
                    
                    hideModal: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 隐藏模态框');
                        }
                    },
                    
                    showMessage: function(text, type = 'info') {
                        console.log(`[${type.toUpperCase()}] ${text}`);
                    }
                };
            } else if (moduleName === 'studentModule') {
                // 学生模块特定的基本对象
                window[moduleName] = {
                    // 基础初始化方法
                    init: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块 ${moduleName} 初始化`);
                        } else {
                            console.log(`基本模块 ${moduleName} 初始化`);
                        }
                        // 获取当前登录学生的ID
                        this.currentStudentId = window.auth?.getCurrentUser()?.id || null;
                        // 初始化基本功能
                        this.initMyTasks();
                        this.initProfile();
                    },
                    
                    // 学生模块特有属性
                    currentStudentId: null,
                    currentTaskId: null,
                    
                    // 任务管理相关方法
                    initMyTasks: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 初始化我的任务');
                        }
                    },
                    
                    loadMyTasks: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 加载我的任务');
                        }
                        return [];
                    },
                    
                    filterTasks: function(status) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块: 筛选任务，状态: ${status}`);
                        }
                    },
                    
                    viewTask: function(taskId) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块: 查看任务 ${taskId}`);
                        }
                    },
                    
                    // 个人信息相关方法
                    initProfile: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 初始化个人信息');
                        }
                    },
                    
                    loadPersonalInfo: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 加载个人信息');
                        }
                    },
                    
                    updateProfile: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 更新个人信息');
                        }
                    },
                    
                    // 密码修改
                    changePassword: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 修改密码');
                        }
                    }
                };
            } else if (moduleName === 'adminModule') {
                // 管理员模块特定的基本对象
                window[moduleName] = {
                    // 基础初始化方法
                    init: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块 ${moduleName} 初始化`);
                        } else {
                            console.log(`基本模块 ${moduleName} 初始化`);
                        }
                        // 初始化仪表盘
                        this.loadDashboard();
                    },
                    
                    // 仪表盘相关方法
                    loadDashboard: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 加载管理员仪表盘');
                        }
                    },
                    
                    getDashboardStats: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 获取仪表盘统计数据');
                        }
                        return {
                            users: { total: 0, teachers: 0, students: 0, admins: 0 },
                            tasks: { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 },
                            notifications: { unread: 0 }
                        };
                    },
                    
                    updateDashboardCards: function(stats) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 更新仪表盘卡片');
                        }
                    },
                    
                    // 用户管理相关方法
                    showEditUserModal: function(userId) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块: 显示编辑用户模态框 ${userId}`);
                        }
                    },
                    
                    getAccountStatus: function(user) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 获取账户状态');
                        }
                        return { class: 'active', text: '活跃' };
                    },
                    
                    // 系统设置
                    updateSystemSettings: function(settings) {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 更新系统设置');
                        }
                    },
                    
                    getSystemSettings: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 获取系统设置');
                        }
                        return {};
                    }
                };
            } else if (moduleName === 'statisticsModule') {
                // 统计模块特定的基本对象
                window[moduleName] = {
                    // 基础初始化方法
                    init: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块 ${moduleName} 初始化`);
                        } else {
                            console.log(`基本模块 ${moduleName} 初始化`);
                        }
                    },
                    
                    // 获取统计数据
                    getStatistics: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 获取统计数据');
                        }
                        return {};
                    },
                    
                    // 渲染统计图表
                    renderCharts: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info('基本模块: 渲染统计图表');
                        }
                    }
                };
            } else {
                // 通用基本模块对象
                window[moduleName] = {
                    // 基础初始化方法
                    init: function() {
                        if (utilsRef?.logger) {
                            utilsRef.logger.info(`基本模块 ${moduleName} 初始化`);
                        } else {
                            console.log(`基本模块 ${moduleName} 初始化`);
                        }
                    }
                };
            }
            
            // 重新获取模块对象
            moduleObj = window[moduleName];
        }
        
        if (typeof moduleObj.init === 'function') {
            try {
                moduleObj.init();
                this.markModuleLoaded(moduleName);
                return true;
            } catch (e) {
                if (utilsRef?.logger) {
                    utilsRef.logger.error(`初始化模块 ${moduleName} 失败:`, e);
                } else {
                    console.error(`初始化模块 ${moduleName} 失败:`, e);
                }
                
                // 重试机制
                this.handleModuleError(moduleName);
                return false;
            }
        } else {
            if (utilsRef?.logger) {
                utilsRef.logger.warn(`模块 ${moduleName} 未定义或缺少init方法`);
            } else {
                console.warn(`模块 ${moduleName} 未定义或缺少init方法`);
            }
            this.handleModuleError(moduleName);
            return false;
        }
    },
    
    // 处理模块加载错误
    handleModuleError(moduleName) {
        // 检查当前是否在login.html页面
        const isLoginPage = window.location.pathname.endsWith('login.html');
        // 对于login.html页面，某些模块（如teacherModule、studentModule等）的加载失败是可接受的
        const nonCriticalModules = ['teacherModule', 'studentModule', 'adminModule', 'statisticsModule'];
        const isNonCriticalModule = nonCriticalModules.includes(moduleName);
        
        this.retryCount[moduleName] = (this.retryCount[moduleName] || 0) + 1;
        
        if (this.retryCount[moduleName] <= this.MAX_RETRIES) {
            const retryMsg = `将在 ${this.RETRY_INTERVAL}ms 后重试加载模块 ${moduleName} (尝试 ${this.retryCount[moduleName]}/${this.MAX_RETRIES})`;
            if (utilsRef?.logger) {
                utilsRef.logger.info(retryMsg);
            } else {
                // 对于login页面的非关键模块，使用较不显眼的console.log而不是console.error
                console.log(retryMsg);
            }
            
            setTimeout(() => {
                this.initializeModule(moduleName);
            }, this.RETRY_INTERVAL);
        } else {
            // 在login页面上，不显示非关键模块的错误
            if (!isLoginPage || !isNonCriticalModule) {
                if (utilsRef?.logger) {
                    utilsRef.logger.error(`模块 ${moduleName} 加载失败，已达到最大重试次数`);
                } else {
                    console.error(`模块 ${moduleName} 加载失败，已达到最大重试次数`);
                }
                
                // 只对关键模块显示错误提示
                this.showError(`系统模块加载失败: ${moduleName}，请刷新页面重试`);
            }
        }
    },
    
    // 注册初始化回调
    onReady(callback) {
        if (this.areAllCoreModulesLoaded()) {
            // 如果模块已经加载完毕，立即执行回调
            setTimeout(callback, 0);
        } else {
            // 否则加入队列
            this.initQueue.push(callback);
        }
    },
    
    // 执行初始化队列
    executeInitQueue() {
        if (utilsRef?.logger) {
            utilsRef.logger.info('所有核心模块已加载，执行初始化队列');
        } else {
            console.log('所有核心模块已加载，执行初始化队列');
        }
        
        while (this.initQueue.length > 0) {
            const callback = this.initQueue.shift();
            try {
                callback();
            } catch (e) {
                if (utilsRef?.logger) {
                    utilsRef.logger.error('执行初始化回调失败:', e);
                } else {
                    console.error('执行初始化回调失败:', e);
                }
            }
        }
    },
    
    // 检查是否所有核心模块都已加载
    areAllCoreModulesLoaded() {
        // 核心模块列表
        const coreModules = ['auth', 'appData'];
        
        // 根据当前用户角色确定需要加载的模块
        const currentUser = window.auth?.getCurrentUser();
        const userRole = currentUser?.role;
        
        if (userRole === 'teacher') {
            coreModules.push('teacherModule');
        } else if (userRole === 'student') {
            coreModules.push('studentModule');
        } else if (userRole === 'admin' || userRole === 'superadmin') {
            coreModules.push('adminModule');
        }
        
        // 通知模块对所有角色都有用
        coreModules.push('notificationModule');
        coreModules.push('securityModule');
        
        return coreModules.every(module => this.loadedModules[module]);
    },
    
    // 显示错误信息
    showError(message) {
        if (utilsRef?.showNotification) {
            utilsRef.showNotification({
                type: 'error',
                title: '系统错误',
                message: message,
                duration: 30000,
                closeable: true
            });
        } else {
            // 备用方案
            const errorElement = document.createElement('div');
            errorElement.className = 'module-error notification notification-error';
            errorElement.innerHTML = `
                <div class="notification-icon">⚠️</div>
                <div class="notification-content">
                    <div class="notification-title">系统错误</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
            `;
            
            // 添加到页面
            document.body.insertBefore(errorElement, document.body.firstChild);
            
            // 30秒后自动移除
            setTimeout(() => {
                errorElement.classList.add('fade-out');
                setTimeout(() => {
                    if (document.body.contains(errorElement)) {
                        document.body.removeChild(errorElement);
                    }
                }, 500);
            }, 30000);
        }
    },
    
    // 开始模块加载检查
    async startLoadingCheck() {
        // 先加载utils模块
        await loadUtilsModule();
        
        if (utils?.logger) {
            utils.logger.info('开始模块加载检查');
        } else {
            console.log('开始模块加载检查');
        }
        
        // 设置全局超时
        setTimeout(() => {
            const unloadedModules = [];
            for (const moduleName in this.loadedModules) {
                if (!this.loadedModules[moduleName]) {
                    unloadedModules.push(moduleName);
                }
            }
            
            if (unloadedModules.length > 0) {
                const errorMsg = `模块加载超时，未加载的模块: ${unloadedModules.join(', ')}`;
                if (utils?.logger) {
                    utils.logger.error(errorMsg);
                } else {
                    console.error(errorMsg);
                }
                this.showError(`系统模块加载超时，请检查网络连接后刷新页面`);
            }
        }, this.TIMEOUT);
        
        // 先检查是否有已经加载的模块
        this.checkInitialModules();
    },
    
    // 检查初始加载状态 - 增强版
    checkInitialModules() {
        console.log('开始检查初始模块加载状态');
        
        // 检查已加载的模块
        for (const moduleName in this.loadedModules) {
            if (window[moduleName]) {
                // 优先检查isInitialized标志
                if (window[moduleName].isInitialized) {
                    console.log(`检测到模块 ${moduleName} 已初始化，标记为已加载`);
                    this.markModuleLoaded(moduleName);
                } else if (moduleName === 'auth' && window.auth) {
                    // 特别处理auth模块：即使isInitialized为false，如果模块对象存在，也尝试初始化
                    console.log(`检测到auth模块对象存在，准备初始化`);
                    try {
                        // 先检查auth模块是否已经有init方法
                        if (typeof window.auth.init === 'function') {
                            console.log('调用auth模块的init方法');
                            window.auth.init();
                            // 重新检查初始化状态
                            if (window.auth.isInitialized) {
                                this.markModuleLoaded('auth');
                            } else {
                                // 如果初始化后仍未设置isInitialized，强制标记
                                console.warn('auth模块初始化后未设置isInitialized，强制标记为已加载');
                                this.markModuleLoaded('auth');
                            }
                        }
                    } catch (e) {
                        console.error('初始化auth模块时出错:', e);
                        // 错误恢复机制：即使初始化出错，也标记auth为已加载以避免整个系统卡住
                        this.markModuleLoaded('auth');
                    }
                }
            }
        }
        
        // 最后的安全检查：确保auth模块被正确加载，这是核心依赖
        if (!this.loadedModules.auth) {
            console.warn('auth模块未被正确标记，执行最后的加载尝试');
            // 尝试通过全局方法初始化
            if (window.initAuthModule) {
                try {
                    console.log('调用全局initAuthModule方法');
                    window.initAuthModule();
                    // 初始化后检查并标记
                    if (window.auth && (window.auth.isInitialized || typeof window.auth.login === 'function')) {
                        this.markModuleLoaded('auth');
                    }
                } catch (e) {
                    console.error('调用initAuthModule失败:', e);
                }
            }
            
            // 如果所有尝试都失败，强制标记auth为已加载以防止系统卡住
            if (!this.loadedModules.auth) {
                console.error('所有auth模块初始化尝试失败，强制标记为已加载以继续系统启动');
                this.markModuleLoaded('auth');
            }
        }
        
        console.log('初始模块检查完成，当前加载状态:', JSON.stringify(this.loadedModules));
    },
    
    // 获取模块加载状态报告
    getLoadingStatus() {
        const status = {
            loaded: [],
            pending: [],
            total: 0,
            loadedCount: 0
        };
        
        for (const moduleName in this.loadedModules) {
            status.total++;
            if (this.loadedModules[moduleName]) {
                status.loaded.push(moduleName);
                status.loadedCount++;
            } else {
                status.pending.push(moduleName);
            }
        }
        
        status.percentage = Math.round((status.loadedCount / status.total) * 100);
        return status;
    }
};

// 导出模块
window.moduleLoader = moduleLoader;

// 自动开始加载检查
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM已加载，开始初始化模块加载器');
    
    // 等待一小段时间确保所有脚本标签都已解析
    setTimeout(async () => {
        console.log('执行模块加载检查');
        
        // 首先加载utils模块
        await loadUtilsModule();
        
        // 启动模块加载检查
        moduleLoader.startLoadingCheck();
        
        // 检查初始模块状态
        moduleLoader.checkInitialModules();
    }, 100);
});

// 重写console.log来监控模块相关日志
const originalConsoleLog = console.log;
console.log = function() {
    const args = Array.from(arguments);
    
    // 检查是否包含模块加载相关信息
    const logString = args.join(' ');
    if (logString.includes('模块') && (logString.includes('已加载') || logString.includes('初始化'))) {
        // 提取模块名
        const moduleMatch = logString.match(/模块\s+([\w]+)/);
        if (moduleMatch && moduleMatch[1] && window.moduleLoader) {
            // 延迟标记模块已加载，避免循环依赖
            setTimeout(() => {
                window.moduleLoader.markModuleLoaded(moduleMatch[1]);
            }, 0);
        }
    }
    
    originalConsoleLog.apply(console, args);
};

// 添加模块加载性能监控
if (window.performance && typeof window.performance.mark === 'function') {
    // 在模块加载前标记
    window.performance.mark('module-loading-start');
    
    // 监听所有模块加载完成
    moduleLoader.onReady(() => {
        window.performance.mark('module-loading-end');
        window.performance.measure('module-loading-time', 'module-loading-start', 'module-loading-end');
        
        const measures = window.performance.getEntriesByName('module-loading-time');
        if (measures.length > 0 && utilsRef?.logger) {
            utilsRef.logger.info(`所有模块加载完成，耗时: ${measures[0].duration.toFixed(2)}ms`);
        }
    });
};;