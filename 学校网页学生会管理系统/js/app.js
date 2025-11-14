// 主应用模块 - 作为系统入口
const app = {
    // 初始化应用
    init() {
        this.initRouter();
        this.initLoginForm();
        this.initLogoutButton();
        this.showMessage('应用初始化完成', 'info'); // 增加初始化反馈
    },

    // 初始化路由（优化：增加路由白名单、防重复执行）
    initRouter() {
        let lastHash = ''; // 记录上一次路由，避免重复处理
        this.handleRoute();

        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash;
            if (currentHash === lastHash) return; // 跳过重复路由
            lastHash = currentHash;
            this.handleRoute();
        });
    },

    // 处理路由（优化：拆分权限逻辑、增加默认路由）
    handleRoute() {
        const hash = window.location.hash || '#login'; // 无hash时默认跳登录
        const user = window.auth?.getCurrentUser() || null; // 增加可选链防止auth未定义

        // 隐藏所有页面与导航
        this.hideAllPages();
        this.hideAllNavs();

        // 路由白名单：无需登录即可访问的页面
        const publicRoutes = ['#login'];
        if (publicRoutes.includes(hash) && !user) {
            const loginPage = document.getElementById('login-page');
            if (loginPage) loginPage.classList.remove('hidden');
            return;
        }

        // 未登录且访问非白名单页面 → 强制跳登录
        if (!user) {
            window.location.hash = '#login';
            this.showMessage('请先登录', 'error');
            return;
        }

        // 已登录：按角色处理路由
        this.handleAuthenticatedRoute(hash, user);
    },

    // 处理已登录用户的路由（拆分逻辑，提升可读性）
    handleAuthenticatedRoute(hash, user) {
        // 显示主内容与对应角色导航
        const mainContent = document.getElementById('main-content');
        const navMenu = document.getElementById('nav-menu');
        if (mainContent) mainContent.classList.remove('hidden');
        if (navMenu) navMenu.classList.remove('hidden');
        this.showRoleNav(user.role);

        // 角色路由匹配
        const roleRoutes = {
            admin: {
                base: '#admin-',
                default: '#admin-dashboard',
                redirect: { '#admin-users': '#admin-dashboard' },
                content: (target) => {
                    const element = document.getElementById(target);
                    if (element) element.classList.remove('hidden');
                }
            },
            teacher: {
                base: '#teacher-',
                default: '#teacher-students',
                content: (target) => {
                    const element = document.getElementById(target);
                    if (element) element.classList.remove('hidden');
                    // 使用moduleLoader确保模块加载完成后再初始化
                    if (target === 'teacher-students-content' && window.teacherModule?.init) {
                        window.teacherModule.init();
                    }
                    if (target === 'teacher-tasks-content' && window.teacherModule?.init) {
                        window.teacherModule.init();
                    }
                }
            },
            student: {
                base: '#student-',
                default: '#student-tasks',
                content: (target) => {
                    const element = document.getElementById(target);
                    if (element) element.classList.remove('hidden');
                    // 使用moduleLoader确保模块加载完成后再初始化
                    if (target.startsWith('student-') && window.studentModule?.init) {
                        window.studentModule.init();
                    }
                    if (target === 'task-details' && typeof this.initTaskDetails === 'function') {
                        this.initTaskDetails(); // 补充任务详情初始化
                    }
                }
            }
        };

        const roleConfig = roleRoutes[user.role];
        if (!roleConfig) {
            console.error('未知角色:', user.role);
            return;
        }
        
        // 路由重定向
        if (roleConfig.redirect?.[hash]) {
            window.location.hash = roleConfig.redirect[hash];
            return;
        }
        // 匹配角色路由或跳默认页
        if (hash.startsWith(roleConfig.base)) {
            const contentId = `${hash.slice(1)}-content`; // 拼接内容ID
            roleConfig.content(contentId);
        } else {
            window.location.hash = roleConfig.default;
        }
    },

    // 初始化登录表单
    initLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                // 表单验证
                if (!username || !password) {
                    this.showMessage('请输入用户名和密码', 'error');
                    return;
                }
                
                // 调用认证模块进行登录
                if (window.auth?.login) {
                    try {
                        const success = window.auth.login(username, password);
                        if (success) {
                            this.showMessage('登录成功', 'success');
                            // 登录成功后根据用户角色跳转
                            const user = window.auth.getCurrentUser();
                            if (user) {
                                switch (user.role) {
                                    case 'admin':
                                        window.location.hash = '#admin-dashboard';
                                        break;
                                    case 'teacher':
                                        window.location.hash = '#teacher-students';
                                        break;
                                    case 'student':
                                        window.location.hash = '#student-tasks';
                                        break;
                                    default:
                                        window.location.hash = '#login';
                                }
                            }
                        }
                    } catch (error) {
                        this.showMessage(error.message || '登录失败', 'error');
                    }
                } else {
                    this.showMessage('认证模块未加载', 'error');
                }
            });
        }
    },

    // 初始化登出按钮
    initLogoutButton() {
        const logoutButtons = document.querySelectorAll('.logout-button');
        logoutButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (window.auth?.logout) {
                    window.auth.logout();
                    this.showMessage('已成功登出', 'info');
                    window.location.hash = '#login';
                }
            });
        });
    },

    // 显示对应角色的导航菜单
    showRoleNav(role) {
        // 隐藏所有角色导航
        document.querySelectorAll('.role-nav').forEach(nav => {
            nav.classList.add('hidden');
        });
        
        // 显示当前角色导航
        const roleNav = document.getElementById(`${role}-nav`);
        if (roleNav) {
            roleNav.classList.remove('hidden');
        }
    },

    // 隐藏所有页面
    hideAllPages() {
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
        });
    },

    // 隐藏所有导航
    hideAllNavs() {
        document.querySelectorAll('.nav-container').forEach(nav => {
            nav.classList.add('hidden');
        });
    },

    // 初始化任务详情页面
    initTaskDetails() {
        // 这里可以添加任务详情页面的初始化逻辑
        console.log('任务详情页面初始化');
    },

    // 显示消息提示
    showMessage(text, type = 'info') {
        // 检查notificationModule是否已加载
        if (window.notificationModule?.showNotificationBar) {
            window.notificationModule.showNotificationBar({
                title: type === 'error' ? '错误' : type === 'success' ? '成功' : '提示',
                message: text,
                type: type,
                duration: 3000
            });
        } else {
            // 降级方案：使用简单的alert
            alert(text);
            
            // 同时在控制台显示详细信息
            switch (type) {
                case 'error':
                    console.error(text);
                    break;
                case 'success':
                    console.log('%c' + text, 'color: green; font-weight: bold;');
                    break;
                case 'info':
                    console.info(text);
                    break;
                case 'warning':
                    console.warn(text);
                    break;
                default:
                    console.log(text);
            }
        }
    }
};

// 当DOM加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // 如果DOM已经加载完成，则直接初始化
    setTimeout(initApp, 0); // 使用setTimeout确保异步执行
}

function initApp() {
    // 等待核心模块加载完成
    if (window.moduleLoader?.onReady) {
        window.moduleLoader.onReady(() => {
            console.log('核心模块加载完成，开始初始化应用');
            app.init();
        });
    } else {
        // 降级方案：直接初始化应用
        console.warn('模块加载器未找到，直接初始化应用');
        setTimeout(() => {
            app.init();
        }, 1000);
    }
}

// 暴露app对象到全局
window.app = app;
console.log('app对象已暴露到全局window.app');
