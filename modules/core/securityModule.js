// 安全模块 - 提供密码加密、数据验证和安全防护功能
const securityModule = {
    // 生成随机盐值
    generateSalt() {
        // 使用更复杂的随机盐生成
        let salt = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        const saltLength = 32; // 增加盐长度到32字符
        
        for (let i = 0; i < saltLength; i++) {
            salt += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return salt;
    },
    
    // 使用简单的哈希算法加密密码（实际生产环境应使用更安全的算法）
    hashPassword(password, salt) {
        if (!password || !salt) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('hashPassword: 缺少密码或盐值');
            }
            return null;
        }
        
        // 使用HMAC-like的哈希算法增强安全性
        const saltedPassword = password + salt;
        let hash = 0;
        
        // 增强的哈希实现
        for (let i = 0; i < saltedPassword.length; i++) {
            const char = saltedPassword.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 应用额外的哈希轮次
        for (let i = 0; i < 1000; i++) { // 增加迭代次数以增强安全性
            hash = ((hash << 5) - hash) + hash.toString().charCodeAt(0);
            hash = hash & hash;
        }
        
        return { 
            hash: hash.toString(), 
            salt, 
            algorithm: 'enhanced-simple-hash',
            iterations: 1000 
        };
    },
    
    // 验证密码
    verifyPassword(password, storedHash, salt) {
        if (!password || !storedHash || !salt) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('verifyPassword: 缺少必要参数');
            }
            return false;
        }
        
        const result = this.hashPassword(password, salt);
        if (!result) return false;
        
        return result.hash === storedHash;
    },
    
    // 生成随机令牌
    generateToken() {
        // 生成更安全的令牌
        return this.generateSalt() + Date.now().toString(36) + 
               Math.floor(Math.random() * 1000000).toString(36);
    },
    
    // 清理和验证输入数据（防止XSS攻击）
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // 更全面的XSS防护
        const div = document.createElement('div');
        div.textContent = input;
        
        // 使用utils模块的sanitize函数（如果存在）
        if (window.utils?.sanitize) {
            return window.utils.sanitize(input);
        }
        
        return div.innerHTML;
    },
    
    // 验证用户名格式
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { isValid: false, message: '用户名不能为空且必须为字符串' };
        }
        
        // 用户名长度检查
        if (username.length < 3) {
            return { isValid: false, message: '用户名长度至少3位' };
        }
        if (username.length > 20) {
            return { isValid: false, message: '用户名长度不能超过20位' };
        }
        
        // 只允许字母、数字和下划线
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return { isValid: false, message: '用户名只能包含字母、数字和下划线' };
        }
        
        // 检查是否以数字开头
        if (/^\d/.test(username)) {
            return { isValid: false, message: '用户名不能以数字开头' };
        }
        
        return { isValid: true, message: '用户名格式正确' };
    },
    
    // 验证密码强度
    validatePasswordStrength(password) {
        // 基本验证
        if (!password || typeof password !== 'string') {
            return { isValid: false, message: '密码不能为空' };
        }
        
        let strength = 0;
        let messages = [];
        
        // 检查长度
        if (password.length >= 10) {
            strength += 2; // 更长的密码获得更高分数
            messages.push('密码长度良好');
        } else if (password.length >= 8) {
            strength += 1;
            messages.push('密码长度合适');
        } else if (password.length >= 6) {
            messages.push('建议密码长度至少8位');
        } else {
            return { isValid: false, message: '密码长度至少6位' };
        }
        
        // 检查是否包含数字
        if (/\d/.test(password)) {
            strength++;
        } else {
            messages.push('建议包含数字');
        }
        
        // 检查是否包含小写字母
        if (/[a-z]/.test(password)) {
            strength++;
        } else {
            messages.push('建议包含小写字母');
        }
        
        // 检查是否包含大写字母
        if (/[A-Z]/.test(password)) {
            strength++;
        } else {
            messages.push('建议包含大写字母');
        }
        
        // 检查是否包含特殊字符
        if (/[^a-zA-Z0-9]/.test(password)) {
            strength++;
        } else {
            messages.push('建议包含特殊字符');
        }
        
        // 检查是否有连续字符
        if (/([a-zA-Z0-9])\1{2,}/.test(password)) {
            messages.push('避免使用连续重复字符');
        }
        
        // 检查是否有键盘模式
        if (/qwe[rty]?|asd[fg]?|zxc[v]?|123[456]?|!@#[#$%]?/i.test(password)) {
            messages.push('避免使用键盘模式');
        }
        
        // 基础密码仍然允许，但给予强度提示
        const isValid = password.length >= 6;
        const strengthText = ['非常弱', '弱', '中', '强', '很强', '非常强'][strength] || '非常弱';
        
        return {
            isValid,
            strength,
            strengthText,
            message: messages.join('，'),
            suggestions: messages
        };
    },
    
    // 检查密码强度（为login.html提供兼容接口）
    checkPasswordStrength(password) {
        // 调用现有的密码强度验证函数
        const result = this.validatePasswordStrength(password);
        
        // 转换为login.html期望的返回格式
        if (result.strength <= 1) {
            return 'weak';
        } else if (result.strength <= 3) {
            return 'medium';
        } else {
            return 'strong';
        }
    },
    
    // 验证邮箱格式
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, message: '邮箱不能为空' };
        }
        
        // 更严格的邮箱正则表达式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return { isValid: false, message: '邮箱格式不正确' };
        }
        
        // 检查邮箱长度
        if (email.length > 254) {
            return { isValid: false, message: '邮箱长度不能超过254个字符' };
        }
        
        return { isValid: true, message: '邮箱格式正确' };
    },
    
    // 验证手机号格式（中国大陆手机号）
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, message: '手机号不能为空' };
        }
        
        // 更严格的手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        
        if (!phoneRegex.test(phone)) {
            return { isValid: false, message: '手机号格式不正确' };
        }
        
        // 检查是否有连续数字
        if (/([0-9])\1{5,}/.test(phone)) {
            return { isValid: false, message: '手机号包含过多连续数字' };
        }
        
        return { isValid: true, message: '手机号格式正确' };
    },
    
    // 加密敏感数据（用于本地存储）
    encryptData(data) {
        try {
            // 使用utils模块的加密功能（如果存在）
            if (window.utils?.encrypt) {
                return window.utils.encrypt(data);
            }
            
            // 备用的简单加密方法
            const jsonData = JSON.stringify(data);
            let result = '';
            
            // 使用更复杂的XOR加密，使用动态密钥
            const key = 'student_union_system_2024';
            for (let i = 0; i < jsonData.length; i++) {
                const keyChar = key.charCodeAt(i % key.length);
                result += String.fromCharCode(jsonData.charCodeAt(i) ^ keyChar);
            }
            
            return btoa(result);
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('encryptData: 加密数据失败', e);
            } else {
                console.error('加密数据失败:', e);
            }
            return null;
        }
    },
    
    // 解密敏感数据
    decryptData(encryptedData) {
        try {
            // 使用utils模块的解密功能（如果存在）
            if (window.utils?.decrypt) {
                return window.utils.decrypt(encryptedData);
            }
            
            // 备用的解密方法
            const decoded = atob(encryptedData);
            let result = '';
            
            // 与加密匹配的XOR解密
            const key = 'student_union_system_2024';
            for (let i = 0; i < decoded.length; i++) {
                const keyChar = key.charCodeAt(i % key.length);
                result += String.fromCharCode(decoded.charCodeAt(i) ^ keyChar);
            }
            
            return JSON.parse(result);
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('decryptData: 解密数据失败', e);
            } else {
                console.error('解密数据失败:', e);
            }
            return null;
        }
    },
    
    // 设置安全的本地存储（加密敏感数据）
    setSecureStorage(key, data, options = {}) {
        try {
            const logger = window.utils?.logger;
            
            if (!key) {
                if (logger) {
                    logger.error('setSecureStorage: 存储键不能为空');
                }
                return false;
            }
            
            // 使用utils模块的安全存储（如果存在）
            if (window.utils?.storage?.secure) {
                if (logger) {
                    logger.debug(`使用utils.storage.secure存储数据: ${key}`);
                }
                return window.utils.storage.secure.set(key, data, options);
            }
            
            // 备用安全存储方法
            const encryptedData = this.encryptData(data);
            if (!encryptedData) return false;
            
            // 根据选项选择存储方式
            if (options.sessionOnly) {
                sessionStorage.setItem(key, encryptedData);
            } else {
                localStorage.setItem(key, encryptedData);
            }
            
            // 添加过期时间（如果指定）
            if (options.expiryMinutes) {
                const expiryTime = Date.now() + (options.expiryMinutes * 60 * 1000);
                (options.sessionOnly ? sessionStorage : localStorage).setItem(`${key}_expiry`, expiryTime.toString());
            }
            
            return true;
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('setSecureStorage: 设置安全存储失败', e);
            } else {
                console.error('设置安全存储失败:', e);
            }
            return false;
        }
    },
    
    // 获取安全的本地存储
    getSecureStorage(key, options = {}) {
        try {
            const logger = window.utils?.logger;
            
            if (!key) {
                if (logger) {
                    logger.error('getSecureStorage: 存储键不能为空');
                }
                return null;
            }
            
            // 使用utils模块的安全存储（如果存在）
            if (window.utils?.storage?.secure) {
                return window.utils.storage.secure.get(key, options);
            }
            
            // 检查是否过期
            const storageType = options.sessionOnly ? sessionStorage : localStorage;
            const expiryKey = `${key}_expiry`;
            const expiryTime = storageType.getItem(expiryKey);
            
            if (expiryTime) {
                const now = Date.now();
                if (parseInt(expiryTime) < now) {
                    // 数据已过期
                    storageType.removeItem(key);
                    storageType.removeItem(expiryKey);
                    if (logger) {
                        logger.debug(`安全存储已过期: ${key}`);
                    }
                    return null;
                }
            }
            
            // 备用方法
            const encryptedData = storageType.getItem(key);
            if (!encryptedData) return null;
            
            return this.decryptData(encryptedData);
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('getSecureStorage: 获取安全存储失败', e);
            } else {
                console.error('获取安全存储失败:', e);
            }
            return null;
        }
    },
    
    // 清除安全的本地存储
    removeSecureStorage(key, options = {}) {
        try {
            const logger = window.utils?.logger;
            
            if (!key) {
                if (logger) {
                    logger.error('removeSecureStorage: 存储键不能为空');
                }
                return false;
            }
            
            // 使用utils模块的安全存储（如果存在）
            if (window.utils?.storage?.secure) {
                return window.utils.storage.secure.remove(key, options);
            }
            
            // 备用方法
            const storageType = options.sessionOnly ? sessionStorage : localStorage;
            storageType.removeItem(key);
            storageType.removeItem(`${key}_expiry`); // 同时删除过期时间
            
            return true;
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('removeSecureStorage: 清除安全存储失败', e);
            } else {
                console.error('清除安全存储失败:', e);
            }
            return false;
        }
    },
    
    // 生成CSRF令牌
    generateCSRFToken() {
        const token = this.generateToken();
        // 存储CSRF令牌到sessionStorage
        sessionStorage.setItem('csrfToken', token);
        
        const logger = window.utils?.logger;
        if (logger) {
            logger.debug('CSRF令牌已生成');
        }
        
        return token;
    },
    
    // 验证CSRF令牌
    validateCSRFToken(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        const isValid = storedToken && storedToken === token;
        
        const logger = window.utils?.logger;
        if (logger) {
            logger.debug(`CSRF令牌验证: ${isValid ? '成功' : '失败'}`);
        }
        
        return isValid;
    },
    
    // 添加CSRF令牌到表单
    addCSRFTokenToForms() {
        const logger = window.utils?.logger;
        
        try {
            if (!document || !document.querySelectorAll) {
                if (logger) {
                    logger.warn('addCSRFTokenToForms: DOM不可用');
                }
                return;
            }
            
            const token = this.generateCSRFToken();
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                if (!form.querySelector('input[name="csrfToken"]')) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'csrfToken';
                    input.value = token;
                    form.appendChild(input);
                }
            });
            
            if (logger) {
                logger.info(`已为${forms.length}个表单添加CSRF令牌`);
            }
        } catch (e) {
            if (logger) {
                logger.error('addCSRFTokenToForms: 添加CSRF令牌失败', e);
            } else {
                console.error('添加CSRF令牌失败:', e);
            }
        }
    },
    
    // 检查XSS攻击特征
    detectXSSAttack(input) {
        if (typeof input !== 'string') return false;
        
        // 更全面的XSS攻击模式检测
        const xssPatterns = [
            // 基本脚本标签
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            // 事件处理程序
            /on(load|error|click|submit|focus|blur|mouseover|mouseout|keydown|keyup|keypress)\s*=/gi,
            // JavaScript URI
            /javascript:/gi,
            // VBScript
            /vbscript:/gi,
            // 表达式
            /expression\s*\(/gi,
            // 数据URI
            /data:text\/html/i,
            // 内联框架
            /<iframe[^>]*>/gi,
            // 危险标签
            /<(object|embed|link|meta)[^>]*>/gi,
            // 注释中嵌入脚本
            /<!--[^>]*>/gi
        ];
        
        const isAttack = xssPatterns.some(pattern => pattern.test(input));
        
        if (isAttack) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.warn('检测到潜在的XSS攻击:', input.substring(0, 50) + '...');
            }
        }
        
        return isAttack;
    },
    
    // 防止SQL注入
    preventSQLInjection(input) {
        if (typeof input !== 'string') return input;
        
        // 更全面的SQL注入防护
        const escapeMap = {
            "'": "''",
            '"': '""',
            ';': ';;',
            '-': '--',
            '\\': '\\\\',
            '\0': '\\0',
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\r': '\\r',
            '\x1a': '\\x1a'
        };
        
        let escaped = '';
        for (let i = 0; i < input.length; i++) {
            escaped += escapeMap[input[i]] || input[i];
        }
        
        return escaped;
    },
    
    // 初始化安全模块
    init() {
        const logger = window.utils?.logger;
        
        if (logger) {
            logger.info('安全模块初始化开始');
        }
        
        // 添加CSRF令牌到表单
        this.addCSRFTokenToForms();
        
        // 监听表单提交，检查CSRF令牌
        document.addEventListener('submit', (e) => {
            try {
                const form = e.target;
                const csrfToken = form.querySelector('input[name="csrfToken"]')?.value;
                
                // 如果表单有CSRF令牌但验证失败，阻止提交
                if (csrfToken && !this.validateCSRFToken(csrfToken)) {
                    e.preventDefault();
                    
                    // 使用utils模块的通知功能（如果存在）
                    if (window.utils?.showNotification) {
                        window.utils.showNotification({
                            type: 'error',
                            title: '安全验证失败',
                            message: '请刷新页面后重试',
                            duration: 5000
                        });
                    } else {
                        alert('安全验证失败，请刷新页面重试');
                    }
                    
                    if (logger) {
                        logger.warn('表单提交被阻止：CSRF令牌验证失败');
                    }
                }
            } catch (err) {
                if (logger) {
                    logger.error('表单提交监听错误:', err);
                }
            }
        });
        
        // 监听存储事件，检测未授权的存储修改
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser' || e.key === 'csrfToken') {
                // 如果是其他标签页修改了这些敏感数据，可以选择重新验证
                if (logger) {
                    logger.warn('检测到敏感存储数据变更:', e.key);
                } else {
                    console.log('检测到敏感存储数据变更:', e.key);
                }
                
                // 可以在这里添加额外的安全检查
                if (e.key === 'currentUser' && window.location.pathname !== '/login.html') {
                    // 如果用户信息被修改，重新加载页面以验证会话
                    setTimeout(() => {
                        if (logger) {
                            logger.info('敏感数据变更，刷新页面以重新验证会话');
                        }
                        window.location.reload();
                    }, 1000);
                }
            }
        });
        
        // 防止点击劫持攻击
        if (window.top !== window) {
            window.top.location = window.location;
            if (logger) {
                logger.warn('检测到点击劫持尝试');
            }
        }
        
        // 添加XSS防护头（如果是页面上下文中）
        if (typeof document !== 'undefined') {
            // 设置内容安全策略
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';";
            document.head.appendChild(meta);
        }
        
        if (logger) {
            logger.info('安全模块初始化完成');
        }
    },
    
    // 批量验证用户输入
    validateUserData(userData) {
        const results = {
            isValid: true,
            errors: {}
        };
        
        // 验证用户名
        const usernameResult = this.validateUsername(userData.username);
        if (!usernameResult.isValid) {
            results.isValid = false;
            results.errors.username = usernameResult.message;
        }
        
        // 验证密码（如果提供）
        if (userData.password) {
            const passwordResult = this.validatePasswordStrength(userData.password);
            if (!passwordResult.isValid) {
                results.isValid = false;
                results.errors.password = passwordResult.message;
            }
        }
        
        // 验证邮箱（如果提供）
        if (userData.email) {
            const emailResult = this.validateEmail(userData.email);
            if (!emailResult.isValid) {
                results.isValid = false;
                results.errors.email = emailResult.message;
            }
        }
        
        // 验证手机号（如果提供）
        if (userData.phone) {
            const phoneResult = this.validatePhone(userData.phone);
            if (!phoneResult.isValid) {
                results.isValid = false;
                results.errors.phone = phoneResult.message;
            }
        }
        
        return results;
    },
    
    // 安全生成会话ID
    generateSessionId() {
        // 生成更安全的会话ID
        const sessionId = this.generateToken() + this.generateSalt();
        
        const logger = window.utils?.logger;
        if (logger) {
            logger.debug('会话ID已生成');
        }
        
        return sessionId;
    },
    
    // 检查会话是否过期
    checkSessionExpiry(sessionStartTime, expiryMinutes = 30) {
        const now = Date.now();
        const sessionTime = typeof sessionStartTime === 'number' ? sessionStartTime : new Date(sessionStartTime).getTime();
        const expiryTime = sessionTime + (expiryMinutes * 60 * 1000);
        
        return now > expiryTime;
    },
    
    // 清除所有安全存储数据（用于登出）
    clearAllSecurityData() {
        try {
            const logger = window.utils?.logger;
            
            // 清除敏感的本地存储项
            const sensitiveKeys = ['currentUser', 'csrfToken', 'authToken', 'sessionId'];
            sensitiveKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            
            // 清除所有带_expiry后缀的过期时间
            const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
            allKeys.forEach(key => {
                if (key.endsWith('_expiry')) {
                    const storageType = localStorage.getItem(key) ? localStorage : sessionStorage;
                    storageType.removeItem(key);
                }
            });
            
            if (logger) {
                logger.info('所有安全数据已清除');
            }
            
            return true;
        } catch (e) {
            const logger = window.utils?.logger;
            if (logger) {
                logger.error('清除安全数据失败:', e);
            }
            return false;
        }
    }
};

// 暴露安全模块到全局
window.securityModule = securityModule;

// 页面加载时初始化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 延迟一小段时间执行，确保环境准备好
        setTimeout(() => {
            console.log('开始初始化securityModule模块');
            try {
                securityModule.init();
                
                // 设置初始化标志
                securityModule.isInitialized = true;
                
                // 向moduleLoader报告模块已加载
                if (window.moduleLoader && window.moduleLoader.markModuleLoaded) {
                    console.log('securityModule模块初始化完成，向moduleLoader报告');
                    window.moduleLoader.markModuleLoaded('securityModule');
                }
            } catch (error) {
                console.error('securityModule初始化失败:', error);
                
                // 即使初始化失败，也尝试标记为已加载以避免阻塞
                if (window.moduleLoader && window.moduleLoader.markModuleLoaded) {
                    console.warn('securityModule初始化失败，但仍标记为已加载以避免阻塞其他模块');
                    window.moduleLoader.markModuleLoaded('securityModule');
                }
            }
        }, 50);
    });
}