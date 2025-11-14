// 统计模块
const statisticsModule = {
    // 初始化统计页面
    init() {
        this.initTabs();
        this.updateOverviewStats();
        this.renderAllCharts();
    },
    
    // 初始化标签页
    initTabs() {
        document.getElementById('tab-overview').addEventListener('click', () => this.switchTab('overview'));
        document.getElementById('tab-tasks').addEventListener('click', () => this.switchTab('tasks'));
        document.getElementById('tab-students').addEventListener('click', () => this.switchTab('students'));
    },
    
    // 切换标签页
    switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },
    
    // 更新概览统计数据
    updateOverviewStats() {
        const students = appData.getAllStudents();
        const tasks = appData.getAllTasks();
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        
        // 计算平均完成率
        let totalCompletionRate = 0;
        let studentCount = 0;
        
        students.forEach(student => {
            const studentTasks = appData.getTasksByStudentId(student.id);
            if (studentTasks.length > 0) {
                const studentCompleted = studentTasks.filter(task => task.status === 'completed').length;
                totalCompletionRate += (studentCompleted / studentTasks.length) * 100;
                studentCount++;
            }
        });
        
        const avgCompletionRate = studentCount > 0 ? Math.round(totalCompletionRate / studentCount) : 0;
        
        // 更新显示
        document.getElementById('total-students').textContent = students.length;
        document.getElementById('total-tasks').textContent = tasks.length;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('avg-completion-rate').textContent = `${avgCompletionRate}%`;
    },
    
    // 渲染所有图表
    renderAllCharts() {
        this.renderTaskCompletionTrend();
        this.renderTaskStatusDistribution();
        this.renderTasksCompletionChart();
        this.renderTaskPriorityChart();
        this.renderOverdueTasksChart();
        this.renderStudentRankingChart();
        this.renderClassComparisonChart();
        this.renderStudentActivityChart();
    },
    
    // 任务完成趋势图
    renderTaskCompletionTrend() {
        const ctx = document.getElementById('taskCompletionTrend').getContext('2d');
        const tasks = appData.getAllTasks();
        
        // 获取最近7天的数据
        const labels = [];
        const completedData = [];
        const pendingData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(dateStr);
            
            // 计算当天的任务完成情况
            const dayTasks = tasks.filter(task => task.createDate.startsWith(dateStr));
            const completed = dayTasks.filter(task => task.status === 'completed').length;
            const pending = dayTasks.filter(task => task.status === 'pending').length;
            
            completedData.push(completed);
            pendingData.push(pending);
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '已完成',
                        data: completedData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: '待完成',
                        data: pendingData,
                        borderColor: '#FFC107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    // 任务状态分布图
    renderTaskStatusDistribution() {
        const ctx = document.getElementById('taskStatusDistribution').getContext('2d');
        const tasks = appData.getAllTasks();
        
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const overdueTasks = tasks.filter(task => this.isOverdue(task.deadline, task.status)).length;
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['已完成', '待完成', '逾期'],
                datasets: [{
                    data: [completedTasks, pendingTasks, overdueTasks],
                    backgroundColor: [
                        '#4CAF50',
                        '#FFC107',
                        '#F44336'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    },
    
    // 任务完成情况图表
    renderTasksCompletionChart() {
        const ctx = document.getElementById('tasksCompletionChart').getContext('2d');
        const students = appData.getAllStudents();
        
        const labels = [];
        const data = [];
        
        students.forEach(student => {
            const studentTasks = appData.getTasksByStudentId(student.id);
            if (studentTasks.length > 0) {
                const completed = studentTasks.filter(task => task.status === 'completed').length;
                const rate = Math.round((completed / studentTasks.length) * 100);
                
                labels.push(student.name);
                data.push(rate);
            }
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '任务完成率 (%)',
                    data: data,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '完成率 (%)'
                        }
                    }
                }
            }
        });
    },
    
    // 任务优先级分布
    renderTaskPriorityChart() {
        const ctx = document.getElementById('taskPriorityChart').getContext('2d');
        const tasks = appData.getAllTasks();
        
        const high = tasks.filter(task => task.priority === 'high').length;
        const medium = tasks.filter(task => task.priority === 'medium').length;
        const low = tasks.filter(task => task.priority === 'low').length;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['高优先级', '中优先级', '低优先级'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: [
                        '#F44336',
                        '#FF9800',
                        '#2196F3'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    },
    
    // 逾期任务统计
    renderOverdueTasksChart() {
        const ctx = document.getElementById('overdueTasksChart').getContext('2d');
        const tasks = appData.getAllTasks();
        
        // 按班级统计逾期任务
        const classOverdueMap = {};
        
        tasks.forEach(task => {
            if (this.isOverdue(task.deadline, task.status)) {
                const student = appData.getStudentById(task.assigneeId);
                if (student && student.className) {
                    classOverdueMap[student.className] = (classOverdueMap[student.className] || 0) + 1;
                }
            }
        });
        
        const labels = Object.keys(classOverdueMap);
        const data = Object.values(classOverdueMap);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '逾期任务数',
                    data: data,
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: '#F44336',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    // 学生任务完成率排名
    renderStudentRankingChart() {
        const ctx = document.getElementById('studentRankingChart').getContext('2d');
        const students = appData.getAllStudents();
        
        const studentStats = [];
        
        students.forEach(student => {
            const studentTasks = appData.getTasksByStudentId(student.id);
            if (studentTasks.length > 0) {
                const completed = studentTasks.filter(task => task.status === 'completed').length;
                const rate = Math.round((completed / studentTasks.length) * 100);
                
                studentStats.push({
                    name: student.name,
                    rate: rate
                });
            }
        });
        
        // 排序
        studentStats.sort((a, b) => b.rate - a.rate);
        
        // 只取前10名
        const topStudents = studentStats.slice(0, 10);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topStudents.map(s => s.name),
                datasets: [{
                    label: '任务完成率 (%)',
                    data: topStudents.map(s => s.rate),
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: '#2196F3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '完成率 (%)'
                        }
                    }
                }
            }
        });
    },
    
    // 班级任务完成对比
    renderClassComparisonChart() {
        const ctx = document.getElementById('classComparisonChart').getContext('2d');
        const students = appData.getAllStudents();
        const tasks = appData.getAllTasks();
        
        const classStats = {};
        
        // 初始化班级统计
        students.forEach(student => {
            if (student.className && !classStats[student.className]) {
                classStats[student.className] = {
                    total: 0,
                    completed: 0
                };
            }
        });
        
        // 统计每个班级的任务完成情况
        tasks.forEach(task => {
            const student = appData.getStudentById(task.assigneeId);
            if (student && student.className && classStats[student.className]) {
                classStats[student.className].total++;
                if (task.status === 'completed') {
                    classStats[student.className].completed++;
                }
            }
        });
        
        const labels = Object.keys(classStats);
        const completionRates = labels.map(className => {
            const stats = classStats[className];
            return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        });
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '班级任务完成率 (%)',
                    data: completionRates,
                    backgroundColor: 'rgba(156, 39, 176, 0.2)',
                    borderColor: '#9C27B0',
                    pointBackgroundColor: '#9C27B0',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#9C27B0'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    },
    
    // 学生活跃度图表
    renderStudentActivityChart() {
        const ctx = document.getElementById('studentActivityChart').getContext('2d');
        const students = appData.getAllStudents();
        
        // 模拟学生活跃度数据（基于完成任务数量）
        const activeData = [];
        const inactiveData = [];
        const labels = ['高度活跃', '中度活跃', '低度活跃', '不活跃'];
        
        students.forEach(student => {
            const tasks = appData.getTasksByStudentId(student.id);
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            
            if (completedTasks > 10) {
                activeData[0] = (activeData[0] || 0) + 1;
            } else if (completedTasks > 5) {
                activeData[1] = (activeData[1] || 0) + 1;
            } else if (completedTasks > 0) {
                activeData[2] = (activeData[2] || 0) + 1;
            } else {
                activeData[3] = (activeData[3] || 0) + 1;
            }
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '学生数量',
                    data: activeData,
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(255, 193, 7, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(244, 67, 54, 0.7)'
                    ],
                    borderColor: [
                        '#4CAF50',
                        '#FFC107',
                        '#FF9800',
                        '#F44336'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },
    
    // 检查任务是否逾期
    isOverdue(deadline, status) {
        if (status === 'completed') return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDeadline = new Date(deadline);
        taskDeadline.setHours(0, 0, 0, 0);
        
        return taskDeadline < today;
    }
};

// 导出统计模块
window.statisticsModule = statisticsModule;