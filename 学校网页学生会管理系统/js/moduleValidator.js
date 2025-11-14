// 模块验证测试脚本
const moduleValidator = {
    // 需要验证的核心模块列表
    requiredModules: [
        'auth',
        'appData',
        'securityModule',
        'notificationModule',
        'moduleLoader',
        'teacherModule',
        'studentModule',
        'adminModule'
    ],
    
    // 模块功能测试用例
    testCases: {
        auth: {
            tests: [
                { name: '验证模块存在', test: () => window.auth !== undefined },
                { name: '验证login方法存在', test: () => typeof window.auth?.login === 'function' },
                { name: '验证logout方法存在', test: () => typeof window.auth?.logout === 'function' },
                { name: '验证getCurrentUser方法存在', test: () => typeof window.auth?.getCurrentUser === 'function' },
                { name: '验证hasPermission方法存在', test: () => typeof window.auth?.hasPermission === 'function' }
            ]
        },
        appData: {
            tests: [
                { name: '验证模块存在', test: () => window.appData !== undefined },
                { name: '验证getUsers方法存在', test: () => typeof window.appData?.getUsers === 'function' },
                { name: '验证getTasks方法存在', test: () => typeof window.appData?.getTasks === 'function' },
                { name: '验证saveData方法存在', test: () => typeof window.appData?.saveData === 'function' }
            ]
        },
        securityModule: {
            tests: [
                { name: '验证模块存在', test: () => window.securityModule !== undefined },
                { name: '验证hashPassword方法存在', test: () => typeof window.securityModule?.hashPassword === 'function' },
                { name: '验证sanitizeInput方法存在', test: () => typeof window.securityModule?.sanitizeInput === 'function' },
                { name: '验证logSecurityEvent方法存在', test: () => typeof window.securityModule?.logSecurityEvent === 'function' }
            ]
        },
        notificationModule: {
            tests: [
                { name: '验证模块存在', test: () => window.notificationModule !== undefined },
                { name: '验证sendNotification方法存在', test: () => typeof window.notificationModule?.sendNotification === 'function' }
            ]
        },
        moduleLoader: {
            tests: [
                { name: '验证模块存在', test: () => window.moduleLoader !== undefined },
                { name: '验证onReady方法存在', test: () => typeof window.moduleLoader?.onReady === 'function' },
                { name: '验证getLoadingStatus方法存在', test: () => typeof window.moduleLoader?.getLoadingStatus === 'function' }
            ]
        },
        teacherModule: {
            tests: [
                { name: '验证模块存在', test: () => window.teacherModule !== undefined },
                { name: '验证initStudentManagement方法存在', test: () => typeof window.teacherModule?.initStudentManagement === 'function' },
                { name: '验证initTaskManagement方法存在', test: () => typeof window.teacherModule?.initTaskManagement === 'function' }
            ]
        },
        studentModule: {
            tests: [
                { name: '验证模块存在', test: () => window.studentModule !== undefined },
                { name: '验证init方法存在', test: () => typeof window.studentModule?.init === 'function' }
            ]
        },
        adminModule: {
            tests: [
                { name: '验证模块存在', test: () => window.adminModule !== undefined },
                { name: '验证initUserManagement方法存在', test: () => typeof window.adminModule?.initUserManagement === 'function' },
                { name: '验证initTaskManagement方法存在', test: () => typeof window.adminModule?.initTaskManagement === 'function' }
            ]
        }
    },
    
    // 运行验证测试
    validate() {
        console.log('========================================');
        console.log('开始模块加载验证测试...');
        console.log('========================================');
        
        const results = {
            loaded: [],
            missing: [],
            testResults: {}
        };
        
        // 检查模块是否加载
        this.requiredModules.forEach(moduleName => {
            if (window[moduleName]) {
                results.loaded.push(moduleName);
                console.log(`✅ ${moduleName} 模块已加载`);
            } else {
                results.missing.push(moduleName);
                console.log(`❌ ${moduleName} 模块未加载`);
            }
        });
        
        console.log('\n========================================');
        console.log('模块功能测试结果:');
        console.log('========================================');
        
        // 运行功能测试
        let allTestsPassed = true;
        
        for (const moduleName in this.testCases) {
            if (window[moduleName]) {
                console.log(`\n🔍 ${moduleName} 功能测试:`);
                const moduleResults = { passed: [], failed: [] };
                
                this.testCases[moduleName].tests.forEach(testCase => {
                    try {
                        const result = testCase.test();
                        if (result) {
                            moduleResults.passed.push(testCase.name);
                            console.log(`  ✅ ${testCase.name}`);
                        } else {
                            moduleResults.failed.push(testCase.name);
                            console.log(`  ❌ ${testCase.name}`);
                            allTestsPassed = false;
                        }
                    } catch (error) {
                        moduleResults.failed.push(`${testCase.name} (错误: ${error.message})`);
                        console.log(`  ❌ ${testCase.name} (错误: ${error.message})`);
                        allTestsPassed = false;
                    }
                });
                
                results.testResults[moduleName] = moduleResults;
            }
        }
        
        console.log('\n========================================');
        console.log('验证测试总结:');
        console.log('========================================');
        console.log(`模块加载状态: ${results.loaded.length}/${this.requiredModules.length} 已加载`);
        
        if (results.missing.length > 0) {
            console.log(`缺失模块: ${results.missing.join(', ')}`);
        }
        
        // 计算测试通过率
        let totalTests = 0;
        let passedTests = 0;
        
        for (const moduleName in results.testResults) {
            const module = results.testResults[moduleName];
            totalTests += module.passed.length + module.failed.length;
            passedTests += module.passed.length;
        }
        
        const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        console.log(`功能测试通过率: ${passedTests}/${totalTests} (${passRate}%)`);
        
        if (results.missing.length === 0 && allTestsPassed) {
            console.log('\n🎉 所有模块验证通过！');
        } else {
            console.log('\n⚠️  部分模块未通过验证，请检查');
        }
        
        // 显示依赖关系检查
        console.log('\n========================================');
        console.log('模块依赖关系检查:');
        console.log('========================================');
        
        this.checkDependencies(results);
        
        return results;
    },
    
    // 检查模块依赖关系
    checkDependencies(results) {
        const dependencies = {
            appData: ['auth'],
            notificationModule: ['auth', 'appData'],
            teacherModule: ['auth', 'appData', 'securityModule'],
            studentModule: ['auth', 'appData', 'securityModule'],
            adminModule: ['auth', 'appData', 'securityModule']
        };
        
        let dependencyIssues = false;
        
        for (const moduleName in dependencies) {
            if (results.loaded.includes(moduleName)) {
                const missingDeps = dependencies[moduleName].filter(dep => !results.loaded.includes(dep));
                
                if (missingDeps.length > 0) {
                    console.log(`❌ ${moduleName} 缺少依赖: ${missingDeps.join(', ')}`);
                    dependencyIssues = true;
                } else {
                    console.log(`✅ ${moduleName} 依赖关系正确`);
                }
            }
        }
        
        if (!dependencyIssues) {
            console.log('\n✅ 所有模块依赖关系正确');
        }
    },
    
    // 创建简单的UI来显示验证结果
    createValidationUI() {
        // 检查是否已经存在结果UI
        let resultsDiv = document.getElementById('module-validation-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'module-validation-results';
            resultsDiv.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                background: white;
                border-radius: 8px;
                padding: 20px;
                overflow-y: auto;
                z-index: 9999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                font-family: 'Consolas', 'Monaco', monospace;
                line-height: 1.6;
            `;
            
            // 添加关闭按钮
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '关闭';
            closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 8px 16px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            closeBtn.onclick = () => resultsDiv.remove();
            resultsDiv.appendChild(closeBtn);
            
            // 添加标题
            const title = document.createElement('h2');
            title.textContent = '模块验证结果';
            title.style.marginTop = '0';
            resultsDiv.appendChild(title);
            
            // 添加结果容器
            const resultsContainer = document.createElement('pre');
            resultsContainer.id = 'validation-output';
            resultsContainer.style.marginTop = '20px';
            resultsDiv.appendChild(resultsContainer);
            
            document.body.appendChild(resultsDiv);
        }
        
        // 运行验证并显示结果
        const results = this.validate();
        
        // 格式化结果文本
        let output = '';
        output += '========================================\n';
        output += '模块加载验证测试结果\n';
        output += '========================================\n\n';
        
        output += `模块加载状态: ${results.loaded.length}/${this.requiredModules.length} 已加载\n`;
        if (results.missing.length > 0) {
            output += `缺失模块: ${results.missing.join(', ')}\n`;
        }
        
        output += '\n已加载模块:\n';
        results.loaded.forEach(module => {
            output += `✅ ${module}\n`;
        });
        
        if (results.missing.length > 0) {
            output += '\n缺失模块:\n';
            results.missing.forEach(module => {
                output += `❌ ${module}\n`;
            });
        }
        
        document.getElementById('validation-output').textContent = output;
    }
};

// 导出到全局作用域
window.moduleValidator = moduleValidator;

// 自动运行验证（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    // 等待页面加载完成
    window.addEventListener('load', () => {
        // 延迟执行以确保所有模块都有时间加载
        setTimeout(() => {
            console.log('自动运行模块验证测试...');
            moduleValidator.validate();
        }, 2000);
    });
}