/**
 * 通用工具函数模块
 * 提供各类辅助功能，增强代码可维护性和可复用性
 */
const utils = {
    /**
     * DOM操作工具
     */
    dom: {
        // 选择器工具函数
        $: (selector, context = document) => {
            if (typeof selector !== 'string') return selector;
            
            // 快速选择器
            if (selector.startsWith('#')) {
                return context.getElementById(selector.slice(1));
            }
            if (selector.startsWith('.')) {
                return context.getElementsByClassName(selector.slice(1));
            }
            
            // 通用选择器
            return context.querySelectorAll(selector);
        },
        
        // 批量操作类名
        toggleClass: (element, className, force) => {
            if (!element || typeof className !== 'string') return;
            element.classList.toggle(className, force);
        },
        
        addClass: (element, className) => {
            if (!element || typeof className !== 'string') return;
            element.classList.add(className);
        },
        
        removeClass: (element, className) => {
            if (!element || typeof className !== 'string') return;
            element.classList.remove(className);
        },
        
        hasClass: (element, className) => {
            if (!element || typeof className !== 'string') return false;
            return element.classList.contains(className);
        },
        
        // 安全地设置元素内容
        setText: (element, text) => {
            if (!element) return;
            element.textContent = text;
        },
        
        setHtml: (element, html) => {
            if (!element) return;
            element.innerHTML = html;
        },
        
        // 安全地获取元素值
        getValue: (element) => {
            if (!element || !element.value) return '';
            return element.value.trim();
        },
        
        // 事件委托
        delegate: (parent, selector, event, handler) => {
            if (!parent) return;
            
            parent.addEventListener(event, function(e) {
                const target = e.target.closest(selector);
                if (target && this.contains(target)) {
                    handler.call(target, e);
                }
            });
        }
    },
    
    /**
     * 表单验证工具
     */
    validation: {
        // 非空验证
        isEmpty: (value) => {
            return value === undefined || value === null || value.trim() === '';
        },
        
        // 最小长度验证
        minLength: (value, min) => {
            return value && value.length >= min;
        },
        
        // 最大长度验证
        maxLength: (value, max) => {
            return value && value.length <= max;
        },
        
        // 用户名验证（字母数字下划线，3-20位）
        isValidUsername: (username) => {
            return /^[a-zA-Z0-9_]{3,20}$/.test(username);
        },
        
        // 表单验证帮助函数
        validateForm: (form, rules) => {
            const errors = {};
            let isValid = true;
            
            Object.keys(rules).forEach(fieldName => {
                const field = form.querySelector(`[name="${fieldName}"]`);
                if (!field) return;
                
                const value = field.value;
                const fieldRules = rules[fieldName];
                
                // 应用验证规则
                for (const rule of fieldRules) {
                    let error = null;
                    
                    switch (rule.type) {
                        case 'required':
                            if (utils.validation.isEmpty(value)) {
                                error = rule.message || `${fieldName}不能为空`;
                            }
                            break;
                        case 'minLength':
                            if (!utils.validation.minLength(value, rule.length)) {
                                error = rule.message || `${fieldName}长度不能小于${rule.length}位`;
                            }
                            break;
                        case 'maxLength':
                            if (!utils.validation.maxLength(value, rule.length)) {
                                error = rule.message || `${fieldName}长度不能大于${rule.length}位`;
                            }
                            break;
                        case 'pattern':
                            if (rule.pattern && !rule.pattern.test(value)) {
                                error = rule.message || `${fieldName}格式不正确`;
                            }
                            break;
                        case 'custom':
                            if (rule.validator && !rule.validator(value)) {
                                error = rule.message || `${fieldName}验证失败`;
                            }
                            break;
                    }
                    
                    if (error) {
                        errors[fieldName] = error;
                        isValid = false;
                        break;
                    }
                }
            });
            
            return { isValid, errors };
        }
    },
    
    /**
     * 数据处理工具
     */
    data: {
        // 深拷贝
        deepClone: (obj) => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => utils.data.deepClone(item));
            
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = utils.data.deepClone(obj[key]);
                }
            }
            return clonedObj;
        },
        
        // 合并对象
        merge: (target, ...sources) => {
            if (!sources.length) return target;
            const source = sources.shift();
            
            if (target && typeof target === 'object' && source && typeof source === 'object') {
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                            if (!target[key]) Object.assign(target, { [key]: {} });
                            utils.data.merge(target[key], source[key]);
                        } else {
                            Object.assign(target, { [key]: source[key] });
                        }
                    }
                }
            }
            
            return utils.data.merge(target, ...sources);
        },
        
        // 格式化日期
        formatDate: (date, format = 'YYYY-MM-DD') => {
            if (!date) return '';
            
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day)
                .replace('HH', hours)
                .replace('mm', minutes)
                .replace('ss', seconds);
        }
    },
    
    /**
     * 缓存工具
     */
    cache: {
        // 设置本地缓存
        setLocal: (key, value, expiryInMinutes = null) => {
            try {
                const item = {
                    value,
                    timestamp: Date.now(),
                    expiry: expiryInMinutes ? Date.now() + expiryInMinutes * 60 * 1000 : null
                };
                localStorage.setItem(key, JSON.stringify(item));
            } catch (e) {
                console.error('Local storage error:', e);
            }
        },
        
        // 获取本地缓存
        getLocal: (key) => {
            try {
                const itemStr = localStorage.getItem(key);
                if (!itemStr) return null;
                
                const item = JSON.parse(itemStr);
                
                // 检查是否过期
                if (item.expiry && Date.now() > item.expiry) {
                    localStorage.removeItem(key);
                    return null;
                }
                
                return item.value;
            } catch (e) {
                console.error('Local storage error:', e);
                return null;
            }
        },
        
        // 移除本地缓存
        removeLocal: (key) => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Local storage error:', e);
            }
        },
        
        // 清空所有本地缓存
        clearLocal: () => {
            try {
                localStorage.clear();
            } catch (e) {
                console.error('Local storage error:', e);
            }
        }
    },
    
    /**
     * 日志工具
     */
    logger: {
        // 日志级别
        levels: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            FATAL: 4
        },
        
        // 当前日志级别
        currentLevel: 0, // 默认DEBUG
        
        // 设置日志级别
        setLevel: (level) => {
            if (typeof level === 'string') {
                utils.logger.currentLevel = utils.logger.levels[level.toUpperCase()] || 0;
            } else if (typeof level === 'number') {
                utils.logger.currentLevel = level;
            }
        },
        
        // 调试日志
        debug: (...args) => {
            if (utils.logger.currentLevel <= utils.logger.levels.DEBUG) {
                console.log('%c[DEBUG]', 'color: blue; font-weight: bold;', ...args);
            }
        },
        
        // 信息日志
        info: (...args) => {
            if (utils.logger.currentLevel <= utils.logger.levels.INFO) {
                console.log('%c[INFO]', 'color: green; font-weight: bold;', ...args);
            }
        },
        
        // 警告日志
        warn: (...args) => {
            if (utils.logger.currentLevel <= utils.logger.levels.WARN) {
                console.warn('%c[WARN]', 'color: orange; font-weight: bold;', ...args);
            }
        },
        
        // 错误日志
        error: (...args) => {
            if (utils.logger.currentLevel <= utils.logger.levels.ERROR) {
                console.error('%c[ERROR]', 'color: red; font-weight: bold;', ...args);
            }
        },
        
        // 致命错误日志
        fatal: (...args) => {
            if (utils.logger.currentLevel <= utils.logger.levels.FATAL) {
                console.error('%c[FATAL]', 'color: purple; font-weight: bold;', ...args);
                // 可以在这里添加发送错误报告的逻辑
            }
        }
    },
    
    /**
     * 网络请求工具
     */
    http: {
        // 基本请求函数
        request: async (url, options = {}) => {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // 包含cookies
            };
            
            const finalOptions = utils.data.merge(defaultOptions, options);
            
            // 添加用户认证token（如果存在）
            if (window.auth?.getToken) {
                const token = window.auth.getToken();
                if (token) {
                    finalOptions.headers['Authorization'] = `Bearer ${token}`;
                }
            }
            
            try {
                utils.logger.debug(`HTTP ${finalOptions.method} ${url}`, finalOptions.body);
                
                const response = await fetch(url, finalOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                utils.logger.debug(`HTTP Response:`, data);
                
                return data;
            } catch (error) {
                utils.logger.error(`HTTP Request Error:`, error);
                throw error;
            }
        },
        
        // GET请求
        get: (url, params = {}) => {
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            
            return utils.http.request(fullUrl);
        },
        
        // POST请求
        post: (url, data = {}) => {
            return utils.http.request(url, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        
        // PUT请求
        put: (url, data = {}) => {
            return utils.http.request(url, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },
        
        // DELETE请求
        delete: (url) => {
            return utils.http.request(url, {
                method: 'DELETE'
            });
        }
    },
    
    /**
     * 性能监控工具
     */
    performance: {
        // 开始计时
        startTime: (id) => {
            window._performanceTimers = window._performanceTimers || {};
            window._performanceTimers[id] = performance.now();
        },
        
        // 结束计时并返回时间差（毫秒）
        endTime: (id) => {
            if (!window._performanceTimers || !window._performanceTimers[id]) {
                return 0;
            }
            
            const duration = performance.now() - window._performanceTimers[id];
            delete window._performanceTimers[id];
            
            return duration;
        },
        
        // 测量代码执行时间
        measure: (id, fn) => {
            utils.performance.startTime(id);
            
            try {
                return fn();
            } finally {
                const duration = utils.performance.endTime(id);
                utils.logger.info(`Performance [${id}]: ${duration.toFixed(2)}ms`);
            }
        }
    },
    
    /**
     * 事件总线
     */
    eventBus: {
        // 事件存储
        _events: {},
        
        // 注册事件监听器
        on: (event, callback) => {
            if (!utils.eventBus._events[event]) {
                utils.eventBus._events[event] = [];
            }
            utils.eventBus._events[event].push(callback);
        },
        
        // 注销事件监听器
        off: (event, callback) => {
            if (!utils.eventBus._events[event]) return;
            
            if (callback) {
                // 移除特定回调
                utils.eventBus._events[event] = utils.eventBus._events[event].filter(cb => cb !== callback);
            } else {
                // 移除所有该事件的回调
                delete utils.eventBus._events[event];
            }
        },
        
        // 触发事件
        emit: (event, ...args) => {
            if (!utils.eventBus._events[event]) return;
            
            utils.eventBus._events[event].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    utils.logger.error(`Event callback error for ${event}:`, error);
                }
            });
        },
        
        // 仅触发一次
        once: (event, callback) => {
            const onceCallback = (...args) => {
                utils.eventBus.off(event, onceCallback);
                callback(...args);
            };
            utils.eventBus.on(event, onceCallback);
        }
    },
    
    /**
     * 模块加载辅助函数
     */
    module: {
        // 检查模块是否已加载
        isLoaded: (moduleName) => {
            return window[moduleName] !== undefined;
        },
        
        // 等待模块加载完成
        waitForModule: (moduleName, timeout = 5000) => {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                
                const checkModule = () => {
                    if (window[moduleName]) {
                        resolve(window[moduleName]);
                        return;
                    }
                    
                    if (Date.now() - startTime > timeout) {
                        reject(new Error(`Module ${moduleName} loading timeout`));
                        return;
                    }
                    
                    setTimeout(checkModule, 50);
                };
                
                checkModule();
            });
        },
        
        // 安全地调用模块方法
        safeCall: (moduleName, methodName, ...args) => {
            try {
                const module = window[moduleName];
                if (!module || !module[methodName] || typeof module[methodName] !== 'function') {
                    throw new Error(`Module ${moduleName} method ${methodName} not found`);
                }
                
                return module[methodName](...args);
            } catch (error) {
                utils.logger.error(`Error calling ${moduleName}.${methodName}:`, error);
                return null;
            }
        }
    }
};

// 暴露工具模块到全局
window.utils = utils;

// 设置初始化标记
utils.isInitialized = true;

// 确保DOM加载完成后再记录日志
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            utils.logger.info('Utils module loaded and DOM ready');
        });
    } else {
        // 如果DOM已经加载完成，直接记录日志
        setTimeout(() => {
            utils.logger.info('Utils module loaded successfully');
        }, 0);
    }
} else {
    // 在非浏览器环境中也记录日志
    utils.logger.info('Utils module loaded in non-browser environment');
}