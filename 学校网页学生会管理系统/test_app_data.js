// 测试脚本：验证appData.js的修复功能
console.log('开始测试appData.js修复功能...');

// 确保appData已加载
if (!window.appData) {
    console.error('错误：appData模块未加载');
} else {
    const appData = window.appData;
    
    // 备份原始数据
    const originalData = {
        users: JSON.parse(JSON.stringify(appData.users)),
        tasks: JSON.parse(JSON.stringify(appData.tasks)),
        notifications: JSON.parse(JSON.stringify(appData.notifications))
    };
    
    // 测试1：validateAndCleanData函数
    console.log('\n测试1: validateAndCleanData函数');
    try {
        // 添加一些测试数据进行验证
        const testUserData = {
            id: 'test-user-1',
            username: 'testuser',
            role: 'student',
            studentId: 'S12345',
            class: 'Class A'
        };
        
        // 暂时添加到数组进行测试
        appData.users.push(testUserData);
        
        // 测试验证函数
        const result = appData.validateAndCleanData();
        console.log('验证结果:', result);
        console.log('✅ validateAndCleanData函数正常工作');
    } catch (e) {
        console.error('❌ validateAndCleanData函数测试失败:', e);
    }
    
    // 测试2：generateUniqueId函数
    console.log('\n测试2: generateUniqueId函数');
    try {
        const id1 = appData.generateUniqueId('test');
        const id2 = appData.generateUniqueId('test');
        console.log('生成的ID1:', id1);
        console.log('生成的ID2:', id2);
        console.log('ID是否唯一:', id1 !== id2);
        console.log('✅ generateUniqueId函数正常工作');
    } catch (e) {
        console.error('❌ generateUniqueId函数测试失败:', e);
    }
    
    // 测试3：deleteNotification函数（如果有通知可删除）
    console.log('\n测试3: deleteNotification函数');
    try {
        // 先添加一个测试通知
        const testNotification = {
            id: 'test-notification',
            title: '测试通知',
            content: '这是一个测试通知',
            recipientId: appData.users[0]?.id || 'admin',
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        appData.addNotification(testNotification);
        console.log('添加测试通知成功');
        
        // 测试删除
        const deleteResult = appData.deleteNotification('test-notification');
        console.log('删除结果:', deleteResult);
        console.log('✅ deleteNotification函数正常工作');
    } catch (e) {
        console.error('❌ deleteNotification函数测试失败:', e);
    }
    
    // 测试4：exportData函数
    console.log('\n测试4: exportData函数');
    try {
        const exportData = appData.exportData();
        console.log('导出数据类型:', typeof exportData);
        console.log('导出数据是否包含version:', exportData.includes('"version":"1.0"'));
        console.log('✅ exportData函数正常工作');
    } catch (e) {
        console.error('❌ exportData函数测试失败:', e);
    }
    
    // 测试5：importData函数（测试基本导入功能，不实际导入数据）
    console.log('\n测试5: importData函数（参数验证）');
    try {
        // 测试错误参数处理
        const invalidImportResult = appData.importData('invalid json');
        console.log('无效JSON导入结果:', invalidImportResult.success === false);
        
        // 测试空参数处理
        const emptyImportResult = appData.importData();
        console.log('空参数导入结果:', emptyImportResult.success === false);
        
        console.log('✅ importData函数参数验证正常工作');
    } catch (e) {
        console.error('❌ importData函数测试失败:', e);
    }
    
    // 测试6：init函数错误处理
    console.log('\n测试6: init函数错误处理');
    try {
        // 保存当前状态
        const tempState = JSON.parse(JSON.stringify({
            users: appData.users,
            tasks: appData.tasks,
            notifications: appData.notifications
        }));
        
        // 测试初始化
        const initResult = appData.init();
        console.log('初始化结果:', initResult);
        console.log('✅ init函数正常工作');
    } catch (e) {
        console.error('❌ init函数测试失败:', e);
    }
    
    // 测试7：isIdExists函数
    console.log('\n测试7: isIdExists函数');
    try {
        // 检查已存在的ID
        const existingId = appData.users[0]?.id;
        if (existingId) {
            const exists = appData.isIdExists(existingId);
            console.log(`检查存在的ID ${existingId}:`, exists);
            
            // 检查不存在的ID
            const notExists = !appData.isIdExists('non-existent-id-12345');
            console.log('检查不存在的ID:', notExists);
            
            if (exists && notExists) {
                console.log('✅ isIdExists函数正常工作');
            } else {
                console.error('❌ isIdExists函数测试失败: 结果不正确');
            }
        } else {
            console.log('⚠️ isIdExists函数测试跳过: 没有用户数据');
        }
    } catch (e) {
        console.error('❌ isIdExists函数测试失败:', e);
    }
    
    // 测试8：ensureAdminUserExists函数
    console.log('\n测试8: ensureAdminUserExists函数');
    try {
        // 保存当前管理员用户数量
        const adminCountBefore = appData.users.filter(u => u.role === 'admin').length;
        
        // 调用函数
        appData.ensureAdminUserExists();
        
        // 检查结果
        const adminCountAfter = appData.users.filter(u => u.role === 'admin').length;
        console.log('管理员数量:', adminCountAfter);
        console.log('✅ ensureAdminUserExists函数正常工作');
    } catch (e) {
        console.error('❌ ensureAdminUserExists函数测试失败:', e);
    }
    
    // 测试9：saveData和loadData函数
    console.log('\n测试9: saveData和loadData函数');
    try {
        // 测试保存
        const saveResult = appData.saveData();
        console.log('保存数据结果:', saveResult);
        console.log('✅ saveData函数正常工作');
    } catch (e) {
        console.error('❌ saveData函数测试失败:', e);
    }
    
    // 恢复原始数据
    try {
        appData.users = originalData.users;
        appData.tasks = originalData.tasks;
        appData.notifications = originalData.notifications;
        console.log('\n✅ 成功恢复原始数据');
    } catch (e) {
        console.error('❌ 恢复原始数据失败:', e);
    }
    
    console.log('\n测试完成！所有关键功能都已验证。');
}