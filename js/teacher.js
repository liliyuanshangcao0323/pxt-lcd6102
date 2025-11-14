// 老师端功能模块
const teacherModule = {
    currentGroup: 'all', // 当前分组筛选
    
    // 初始化学生管理页面
    initStudentManagement() {
        this.renderStudentList(appData.getStudents());
        this.initStudentSearch();
        this.initAddStudentButton();
        this.initStudentGroupFilter();
        this.initBatchActions();
    },
    
    // 渲染学生列表
    renderStudentList(students) {
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = '';
        
        // 应用分组筛选
        let filteredStudents = students;
        if (this.currentGroup !== 'all') {
            filteredStudents = students.filter(student => student.class === this.currentGroup);
        }
        
        if (filteredStudents.length === 0) {
            studentList.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">暂无学生数据</td></tr>';
            return;
        }
        
        filteredStudents.forEach(student => {
            // 计算学生任务完成情况
            const tasks = appData.getTasks().filter(task => task.assignee === student.id);
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="student-checkbox" data-id="${student.id}"></td>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.position}</td>
                <td>${student.contact}</td>
                <td>
                    <div class="task-completion-rate">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${taskCompletionRate}%"></div>
                        </div>
                        <span>${taskCompletionRate}%</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" data-id="${student.id}">详情</button>
                        <button class="edit-btn" data-id="${student.id}">编辑</button>
                        <button class="delete-btn" data-id="${student.id}">删除</button>
                    </div>
                </td>
            `;
            studentList.appendChild(row);
        });
        
        // 添加编辑和删除事件监听
        this.initStudentActionButtons();
    },
    
    // 初始化学生操作按钮
    initStudentActionButtons() {
        // 详情按钮事件
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const studentId = button.getAttribute('data-id');
                this.showStudentDetails(studentId);
            });
        });
        
        // 编辑按钮事件
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const studentId = button.getAttribute('data-id');
                this.showEditStudentModal(studentId);
            });
        });
        
        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const studentId = button.getAttribute('data-id');
                if (confirm('确定要删除这个学生吗？相关任务也会被移除！')) {
                    const success = appData.deleteStudent(studentId);
                    if (success) {
                        this.renderStudentList(appData.getStudents());
                        this.showMessage('学生删除成功！', 'success');
                    } else {
                        this.showMessage('学生删除失败！', 'error');
                    }
                }
            });
        });
        
        // 复选框事件
        document.querySelectorAll('.student-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBatchActionsState();
            });
        });
    },
    
    // 初始化学生分组筛选
    initStudentGroupFilter() {
        const filterContainer = document.getElementById('student-filters') || 
                               document.querySelector('.student-management-section');
        
        // 如果没有筛选容器，创建一个
        if (!document.getElementById('student-filters')) {
            const filtersDiv = document.createElement('div');
            filtersDiv.id = 'student-filters';
            filtersDiv.className = 'filters';
            filtersDiv.innerHTML = `
                <div class="filter-group">
                    <label>按班级筛选：</label>
                    <select id="class-filter">
                        <option value="all">全部班级</option>
                        <option value="高一(1)班">高一(1)班</option>
                        <option value="高一(2)班">高一(2)班</option>
                        <option value="高二(1)班">高二(1)班</option>
                        <option value="高二(2)班">高二(2)班</option>
                        <option value="高三(1)班">高三(1)班</option>
                        <option value="高三(2)班">高三(2)班</option>
                    </select>
                </div>
            `;
            
            // 插入到搜索框前面
            const searchDiv = document.getElementById('student-search-container');
            if (searchDiv) {
                searchDiv.parentNode.insertBefore(filtersDiv, searchDiv);
            } else if (filterContainer) {
                filterContainer.appendChild(filtersDiv);
            }
        }
        
        // 添加筛选事件
        document.getElementById('class-filter').addEventListener('change', (e) => {
            this.currentGroup = e.target.value;
            this.renderStudentList(appData.getStudents());
        });
    },
    
    // 初始化批量操作
    initBatchActions() {
        const actionsContainer = document.getElementById('batch-actions') || 
                               document.querySelector('.student-management-section');
        
        // 如果没有批量操作容器，创建一个
        if (!document.getElementById('batch-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.id = 'batch-actions';
            actionsDiv.className = 'batch-actions';
            actionsDiv.innerHTML = `
                <div class="actions-header">
                    <label>
                        <input type="checkbox" id="select-all-students"> 全选
                    </label>
                </div>
                <div class="actions-buttons">
                    <button id="batch-delete-btn" disabled>批量删除</button>
                    <button id="batch-export-btn" disabled>导出选中</button>
                </div>
            `;
            
            // 插入到搜索框下方
            const searchDiv = document.getElementById('student-search-container');
            if (searchDiv) {
                searchDiv.parentNode.insertBefore(actionsDiv, searchDiv.nextSibling);
            } else if (actionsContainer) {
                actionsContainer.appendChild(actionsDiv);
            }
        }
        
        // 全选/取消全选
        document.getElementById('select-all-students').addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.querySelectorAll('.student-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            this.updateBatchActionsState();
        });
        
        // 批量删除
        document.getElementById('batch-delete-btn').addEventListener('click', () => {
            if (confirm('确定要删除选中的学生吗？相关任务也会被移除！')) {
                const selectedIds = this.getSelectedStudentIds();
                selectedIds.forEach(id => appData.deleteStudent(id));
                this.renderStudentList(appData.getStudents());
                this.showMessage(`成功删除 ${selectedIds.length} 名学生！`, 'success');
            }
        });
        
        // 批量导出
        document.getElementById('batch-export-btn').addEventListener('click', () => {
            const selectedIds = this.getSelectedStudentIds();
            this.exportStudentData(selectedIds);
        });
    },
    
    // 获取选中的学生ID
    getSelectedStudentIds() {
        const ids = [];
        document.querySelectorAll('.student-checkbox:checked').forEach(checkbox => {
            ids.push(checkbox.getAttribute('data-id'));
        });
        return ids;
    },
    
    // 更新批量操作按钮状态
    updateBatchActionsState() {
        const selectedCount = this.getSelectedStudentIds().length;
        const deleteBtn = document.getElementById('batch-delete-btn');
        const exportBtn = document.getElementById('batch-export-btn');
        
        deleteBtn.disabled = selectedCount === 0;
        exportBtn.disabled = selectedCount === 0;
        
        // 更新全选框状态
        const allChecked = document.querySelectorAll('.student-checkbox').length > 0 && 
                          document.querySelectorAll('.student-checkbox:not(:checked)').length === 0;
        document.getElementById('select-all-students').checked = allChecked;
    },
    
    // 导出学生数据
    exportStudentData(studentIds) {
        const students = appData.getStudents().filter(s => studentIds.includes(s.id));
        const csvContent = [
            ['ID', '姓名', '班级', '职位', '联系方式'].join(','),
            ...students.map(s => [s.id, s.name, s.class, s.position, s.contact].join(','))
        ].join('\n');
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `学生数据_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('数据导出成功！', 'success');
    },
    
    // 显示学生详情
    showStudentDetails(studentId) {
        const student = appData.getStudents().find(s => s.id === studentId);
        if (!student) return;
        
        // 获取学生的任务情况
        const tasks = appData.getTasks().filter(task => task.assignee === studentId);
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>学生详情</h3>
            <div class="student-details">
                <div class="detail-section">
                    <h4>基本信息</h4>
                    <div class="detail-item">
                        <label>ID：</label>
                        <span>${student.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>姓名：</label>
                        <span>${student.name}</span>
                    </div>
                    <div class="detail-item">
                        <label>班级：</label>
                        <span>${student.class}</span>
                    </div>
                    <div class="detail-item">
                        <label>职位：</label>
                        <span>${student.position}</span>
                    </div>
                    <div class="detail-item">
                        <label>联系方式：</label>
                        <span>${student.contact}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>任务完成情况</h4>
                    <div class="task-stats">
                        <div class="stat-item">
                            <span class="stat-label">总任务数：</span>
                            <span class="stat-value">${tasks.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">已完成：</span>
                            <span class="stat-value completed">${completedTasks.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">待完成：</span>
                            <span class="stat-value pending">${pendingTasks.length}</span>
                        </div>
                        <div class="completion-rate">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${taskCompletionRate}%"></div>
                            </div>
                            <span>${taskCompletionRate}% 完成率</span>
                        </div>
                    </div>
                    
                    <h4>最近任务</h4>
                    <div class="recent-tasks">
                        ${tasks.slice(0, 3).map(task => `
                            <div class="task-item ${task.status}">
                                <h5>${task.title}</h5>
                                <p>${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</p>
                                <div class="task-meta">
                                    <span>截止日期：${task.deadline}</span>
                                    <span class="status">${task.status === 'completed' ? '已完成' : '待完成'}</span>
                                </div>
                            </div>
                        `).join('') || '<p>暂无任务</p>'}
                    </div>
                </div>
            </div>
        `;
        
        this.showModal();
    },
    
    // 初始化学生搜索
    initStudentSearch() {
        const searchInput = document.getElementById('student-search');
        const searchButton = document.getElementById('search-student-btn');
        
        const performSearch = () => {
            const keyword = searchInput.value.trim();
            const results = appData.searchStudents(keyword);
            this.renderStudentList(results);
        };
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    },
    
    // 初始化添加学生按钮
    initAddStudentButton() {
        document.getElementById('add-student-btn').addEventListener('click', () => {
            this.showAddStudentModal();
        });
    },
    
    // 显示添加学生模态框
    showAddStudentModal() {
        const modalBody = document.getElementById('modal-body');
        const positionsHtml = appData.positions.map(pos => 
            `<option value="${pos}">${pos}</option>`
        ).join('');
        
        modalBody.innerHTML = `
            <h3>添加学生</h3>
            <form id="add-student-form">
                <div class="form-group">
                    <label for="new-name">姓名</label>
                    <input type="text" id="new-name" required placeholder="请输入姓名">
                </div>
                <div class="form-group">
                    <label for="new-class">班级</label>
                    <input type="text" id="new-class" required placeholder="请输入班级">
                </div>
                <div class="form-group">
                    <label for="new-position">职位</label>
                    <select id="new-position" required>
                        ${positionsHtml}
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-contact">联系方式</label>
                    <input type="tel" id="new-contact" required placeholder="请输入联系方式">
                </div>
                <button type="submit" class="btn-primary">添加</button>
            </form>
        `;
        
        this.showModal();
        
        document.getElementById('add-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const student = {
                name: document.getElementById('new-name').value,
                class: document.getElementById('new-class').value,
                position: document.getElementById('new-position').value,
                contact: document.getElementById('new-contact').value
            };
            
            appData.addStudent(student);
            this.renderStudentList(appData.getStudents());
            this.hideModal();
            this.showMessage('学生添加成功！', 'success');
        });
    },
    
    // 显示编辑学生模态框
    showEditStudentModal(studentId) {
        const student = appData.getStudentById(studentId);
        if (!student) return;
        
        const modalBody = document.getElementById('modal-body');
        const positionsHtml = appData.positions.map(pos => 
            `<option value="${pos}" ${pos === student.position ? 'selected' : ''}>${pos}</option>`
        ).join('');
        
        modalBody.innerHTML = `
            <h3>编辑学生</h3>
            <form id="edit-student-form">
                <div class="form-group">
                    <label for="edit-id">学号</label>
                    <input type="text" id="edit-id" value="${student.id}" disabled>
                </div>
                <div class="form-group">
                    <label for="edit-name">姓名</label>
                    <input type="text" id="edit-name" value="${student.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-class">班级</label>
                    <input type="text" id="edit-class" value="${student.class}" required>
                </div>
                <div class="form-group">
                    <label for="edit-position">职位</label>
                    <select id="edit-position" required>
                        ${positionsHtml}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-contact">联系方式</label>
                    <input type="tel" id="edit-contact" value="${student.contact}" required>
                </div>
                <button type="submit" class="btn-primary">保存</button>
            </form>
        `;
        
        this.showModal();
        
        document.getElementById('edit-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                name: document.getElementById('edit-name').value,
                class: document.getElementById('edit-class').value,
                position: document.getElementById('edit-position').value,
                contact: document.getElementById('edit-contact').value
            };
            
            appData.updateStudent(studentId, updates);
            this.renderStudentList(appData.getStudents());
            this.hideModal();
            this.showMessage('学生信息更新成功！', 'success');
        });
    },
    
    // 初始化任务管理页面
    initTaskManagement() {
        this.renderTaskList(appData.getTasks());
        this.initTaskSearch();
        this.initAddTaskButton();
        this.initTaskFilters();
        this.renderTaskStatistics();
    },
    
    // 渲染任务列表
    renderTaskList(tasks) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">暂无任务数据</td></tr>';
            return;
        }
        
        tasks.forEach(task => {
            const student = appData.getStudentById(task.assignee);
            const assigneeName = student ? student.name : '未分配';
            const statusClass = task.status === 'completed' ? 'completed' : 'pending';
            const statusText = task.status === 'completed' ? '已完成' : '待完成';
            
            // 检查是否逾期
            const isOverdue = task.status === 'pending' && new Date(task.deadline) < new Date();
            const rowClass = isOverdue ? 'overdue' : '';
            
            // 获取任务标签
            const tags = task.tags || [];
            const tagsHtml = tags.length > 0 ? 
                tags.map(tag => `<span class="task-tag">${tag}</span>`).join(' ') : 
                '<span class="no-tags">无标签</span>';
            
            const row = document.createElement('tr');
            row.className = rowClass;
            row.innerHTML = `
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.description.length > 30 ? task.description.substring(0, 30) + '...' : task.description}</td>
                <td>${tagsHtml}</td>
                <td>${assigneeName}</td>
                <td>${task.deadline}</td>
                <td>
                    <span class="task-status ${statusClass}">${statusText}</span>
                    ${isOverdue ? '<span class="overdue-badge">已逾期</span>' : ''}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="view-btn" data-id="${task.id}">详情</button>
                        <button class="edit-btn" data-id="${task.id}">编辑</button>
                        <button class="assign-btn" data-id="${task.id}">分配</button>
                        <button class="delete-btn" data-id="${task.id}">删除</button>
                    </div>
                </td>
            `;
            taskList.appendChild(row);
        });
        
        // 添加编辑、分配和删除事件监听
        this.initTaskActionButtons();
    },
    
    // 初始化任务操作按钮
    initTaskActionButtons() {
        // 详情按钮事件
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                this.showTaskDetails(taskId);
            });
        });
        
        // 编辑按钮事件
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                this.showEditTaskModal(taskId);
            });
        });
        
        // 分配按钮事件
        document.querySelectorAll('.assign-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                this.showAssignTaskModal(taskId);
            });
        });
        
        // 删除按钮事件
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const taskId = button.getAttribute('data-id');
                if (confirm('确定要删除这个任务吗？')) {
                    const success = appData.deleteTask(taskId);
                    if (success) {
                        this.renderTaskList(appData.getTasks());
                        this.renderTaskStatistics(); // 更新统计信息
                        this.showMessage('任务删除成功！', 'success');
                    } else {
                        this.showMessage('任务删除失败！', 'error');
                    }
                }
            });
        });
    },
    
    // 初始化任务筛选
    initTaskFilters() {
        const filterContainer = document.getElementById('task-filters') || 
                               document.querySelector('.task-management-section');
        
        // 如果没有筛选容器，创建一个
        if (!document.getElementById('task-filters')) {
            const filtersDiv = document.createElement('div');
            filtersDiv.id = 'task-filters';
            filtersDiv.className = 'filters';
            filtersDiv.innerHTML = `
                <div class="filter-group">
                    <label>按状态筛选：</label>
                    <select id="task-status-filter">
                        <option value="all">全部</option>
                        <option value="pending">待完成</option>
                        <option value="completed">已完成</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>按班级筛选：</label>
                    <select id="task-class-filter">
                        <option value="all">全部班级</option>
                        <option value="高一(1)班">高一(1)班</option>
                        <option value="高一(2)班">高一(2)班</option>
                        <option value="高二(1)班">高二(1)班</option>
                        <option value="高二(2)班">高二(2)班</option>
                        <option value="高三(1)班">高三(1)班</option>
                        <option value="高三(2)班">高三(2)班</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>按标签筛选：</label>
                    <select id="task-tag-filter">
                        <option value="all">全部标签</option>
                        <option value="紧急">紧急</option>
                        <option value="重要">重要</option>
                        <option value="常规">常规</option>
                        <option value="会议">会议</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>
                        <input type="checkbox" id="show-overdue-only"> 仅显示逾期任务
                    </label>
                </div>
            `;
            
            // 插入到搜索框前面
            const searchDiv = document.getElementById('task-search-container');
            if (searchDiv) {
                searchDiv.parentNode.insertBefore(filtersDiv, searchDiv);
            } else if (filterContainer) {
                filterContainer.appendChild(filtersDiv);
            }
        }
        
        // 添加筛选事件
        const applyFilters = () => {
            const statusFilter = document.getElementById('task-status-filter').value;
            const classFilter = document.getElementById('task-class-filter').value;
            const tagFilter = document.getElementById('task-tag-filter').value;
            const showOverdueOnly = document.getElementById('show-overdue-only').checked;
            
            let filteredTasks = appData.getTasks();
            
            // 应用状态筛选
            if (statusFilter !== 'all') {
                filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
            }
            
            // 应用班级筛选
            if (classFilter !== 'all') {
                filteredTasks = filteredTasks.filter(task => {
                    const student = appData.getStudentById(task.assignee);
                    return student && student.class === classFilter;
                });
            }
            
            // 应用标签筛选
            if (tagFilter !== 'all') {
                filteredTasks = filteredTasks.filter(task => 
                    task.tags && task.tags.includes(tagFilter)
                );
            }
            
            // 应用逾期筛选
            if (showOverdueOnly) {
                filteredTasks = filteredTasks.filter(task => 
                    task.status === 'pending' && new Date(task.deadline) < new Date()
                );
            }
            
            this.renderTaskList(filteredTasks);
        };
        
        document.getElementById('task-status-filter').addEventListener('change', applyFilters);
        document.getElementById('task-class-filter').addEventListener('change', applyFilters);
        document.getElementById('task-tag-filter').addEventListener('change', applyFilters);
        document.getElementById('show-overdue-only').addEventListener('change', applyFilters);
    },
    
    // 渲染任务统计信息
    renderTaskStatistics() {
        const tasks = appData.getTasks();
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        const overdueTasks = tasks.filter(task => 
            task.status === 'pending' && new Date(task.deadline) < new Date()
        );
        
        const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
        
        const statsContainer = document.getElementById('task-statistics') || 
                              document.querySelector('.task-management-section');
        
        // 如果没有统计容器，创建一个
        if (!document.getElementById('task-statistics')) {
            const statsDiv = document.createElement('div');
            statsDiv.id = 'task-statistics';
            statsDiv.className = 'statistics';
            statsDiv.innerHTML = `
                <h3>任务统计</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${tasks.length}</div>
                        <div class="stat-label">总任务数</div>
                    </div>
                    <div class="stat-card completed">
                        <div class="stat-number">${completedTasks.length}</div>
                        <div class="stat-label">已完成</div>
                    </div>
                    <div class="stat-card pending">
                        <div class="stat-number">${pendingTasks.length}</div>
                        <div class="stat-label">待完成</div>
                    </div>
                    <div class="stat-card overdue">
                        <div class="stat-number">${overdueTasks.length}</div>
                        <div class="stat-label">已逾期</div>
                    </div>
                </div>
                <div class="overall-progress">
                    <div class="progress-header">
                        <span>整体完成率</span>
                        <span>${completionRate}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionRate}%"></div>
                    </div>
                </div>
            `;
            
            // 插入到筛选器前面
            const filtersDiv = document.getElementById('task-filters');
            if (filtersDiv) {
                filtersDiv.parentNode.insertBefore(statsDiv, filtersDiv);
            } else if (statsContainer) {
                statsContainer.insertBefore(statsDiv, statsContainer.firstChild);
            }
        } else {
            // 更新现有统计数据
            const statsDiv = document.getElementById('task-statistics');
            statsDiv.querySelector('.stats-grid .stat-card:nth-child(1) .stat-number').textContent = tasks.length;
            statsDiv.querySelector('.stats-grid .stat-card:nth-child(2) .stat-number').textContent = completedTasks.length;
            statsDiv.querySelector('.stats-grid .stat-card:nth-child(3) .stat-number').textContent = pendingTasks.length;
            statsDiv.querySelector('.stats-grid .stat-card:nth-child(4) .stat-number').textContent = overdueTasks.length;
            statsDiv.querySelector('.overall-progress .progress-header span:last-child').textContent = `${completionRate}%`;
            statsDiv.querySelector('.overall-progress .progress-bar .progress-fill').style.width = `${completionRate}%`;
        }
    },
    
    // 显示任务详情
    showTaskDetails(taskId) {
        const task = appData.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const student = appData.getStudentById(task.assignee);
        const assigneeName = student ? student.name : '未分配';
        const assigneeClass = student ? student.class : '未分配';
        const statusText = task.status === 'completed' ? '已完成' : '待完成';
        
        // 检查是否逾期
        const isOverdue = task.status === 'pending' && new Date(task.deadline) < new Date();
        const tags = task.tags || [];
        const tagsHtml = tags.length > 0 ? 
            tags.map(tag => `<span class="task-tag">${tag}</span>`).join(' ') : 
            '<span class="no-tags">无标签</span>';
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>任务详情</h3>
            <div class="task-details">
                <div class="detail-section">
                    <h4>基本信息</h4>
                    <div class="detail-item">
                        <label>任务ID：</label>
                        <span>${task.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>任务名称：</label>
                        <span>${task.title}</span>
                    </div>
                    <div class="detail-item">
                        <label>任务描述：</label>
                        <div class="description">${task.description}</div>
                    </div>
                    <div class="detail-item">
                        <label>截止日期：</label>
                        <span class="${isOverdue ? 'overdue' : ''}">${task.deadline}</span>
                        ${isOverdue ? '<span class="overdue-badge">已逾期</span>' : ''}
                    </div>
                    <div class="detail-item">
                        <label>状态：</label>
                        <span class="task-status ${task.status}">${statusText}</span>
                    </div>
                    <div class="detail-item">
                        <label>标签：</label>
                        <div class="tags">${tagsHtml}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>负责人信息</h4>
                    ${student ? `
                        <div class="detail-item">
                            <label>姓名：</label>
                            <span>${assigneeName}</span>
                        </div>
                        <div class="detail-item">
                            <label>班级：</label>
                            <span>${assigneeClass}</span>
                        </div>
                        <div class="detail-item">
                            <label>联系方式：</label>
                            <span>${student.contact}</span>
                        </div>
                    ` : '<p>任务尚未分配给任何学生</p>'}
                    
                    <div class="action-buttons">
                        <button id="quick-edit-task" data-id="${task.id}">快速编辑</button>
                        <button id="quick-assign-task" data-id="${task.id}">重新分配</button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal();
        
        // 添加快速操作按钮事件
        document.getElementById('quick-edit-task').addEventListener('click', () => {
            this.hideModal();
            setTimeout(() => this.showEditTaskModal(taskId), 300);
        });
        
        document.getElementById('quick-assign-task').addEventListener('click', () => {
            this.hideModal();
            setTimeout(() => this.showAssignTaskModal(taskId), 300);
        });
    },
    
    // 初始化任务搜索
    initTaskSearch() {
        const searchInput = document.getElementById('task-search');
        const searchButton = document.getElementById('search-task-btn');
        
        const performSearch = () => {
            const keyword = searchInput.value.trim();
            const results = appData.searchTasks(keyword);
            this.renderTaskList(results);
        };
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    },
    
    // 初始化添加任务按钮
    initAddTaskButton() {
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.showAddTaskModal();
        });
    },
    
    // 显示添加任务模态框
    showAddTaskModal() {
        const modalBody = document.getElementById('modal-body');
        const studentsHtml = appData.getStudents().map(student => 
            `<option value="${student.id}">${student.name} (${student.class})</option>`
        ).join('');
        
        modalBody.innerHTML = `
            <h3>发布任务</h3>
            <form id="add-task-form">
                <div class="form-group">
                    <label for="new-task-title">任务名称</label>
                    <input type="text" id="new-task-title" required placeholder="请输入任务名称">
                </div>
                <div class="form-group">
                    <label for="new-task-description">任务描述</label>
                    <textarea id="new-task-description" rows="4" required placeholder="请输入任务描述"></textarea>
                </div>
                <div class="form-group">
                    <label for="new-task-assignee">负责人</label>
                    <select id="new-task-assignee">
                        <option value="">请选择负责人（可选）</option>
                        ${studentsHtml}
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-task-deadline">截止日期</label>
                    <input type="date" id="new-task-deadline" required>
                </div>
                <div class="form-group">
                    <label>任务标签</label>
                    <div class="tags-input">
                        <div id="selected-tags"></div>
                        <select id="tag-selector">
                            <option value="">选择标签</option>
                            <option value="紧急">紧急</option>
                            <option value="重要">重要</option>
                            <option value="常规">常规</option>
                            <option value="会议">会议</option>
                        </select>
                        <button type="button" id="add-tag-btn">添加</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="notify-student"> 发布后通知负责人
                    </label>
                </div>
                <button type="submit" class="btn-primary">发布</button>
            </form>
        `;
        
        this.showModal();
        
        // 标签管理功能
        const selectedTags = [];
        const selectedTagsContainer = document.getElementById('selected-tags');
        
        const updateSelectedTagsDisplay = () => {
            selectedTagsContainer.innerHTML = '';
            selectedTags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'task-tag';
                tagElement.innerHTML = `${tag} <button type="button" class="remove-tag" data-tag="${tag}">×</button>`;
                selectedTagsContainer.appendChild(tagElement);
            });
            
            // 添加删除标签事件
            document.querySelectorAll('.remove-tag').forEach(button => {
                button.addEventListener('click', () => {
                    const tag = button.getAttribute('data-tag');
                    const index = selectedTags.indexOf(tag);
                    if (index > -1) {
                        selectedTags.splice(index, 1);
                        updateSelectedTagsDisplay();
                    }
                });
            });
        };
        
        document.getElementById('add-tag-btn').addEventListener('click', () => {
            const tagSelector = document.getElementById('tag-selector');
            const tag = tagSelector.value;
            if (tag && !selectedTags.includes(tag)) {
                selectedTags.push(tag);
                updateSelectedTagsDisplay();
                tagSelector.value = '';
            }
        });
        
        document.getElementById('add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const task = {
                title: document.getElementById('new-task-title').value,
                description: document.getElementById('new-task-description').value,
                assignee: document.getElementById('new-task-assignee').value,
                deadline: document.getElementById('new-task-deadline').value,
                status: 'pending',
                tags: selectedTags.length > 0 ? selectedTags : []
            };
            
            const notifyStudent = document.getElementById('notify-student').checked;
            
            appData.addTask(task);
            this.renderTaskList(appData.getTasks());
            this.renderTaskStatistics(); // 更新统计信息
            this.hideModal();
            
            this.showMessage('任务发布成功！', 'success');
            
            // 如果需要通知学生
            if (notifyStudent && task.assignee) {
                const student = appData.getStudentById(task.assignee);
                if (student) {
                    // 这里可以添加实际的通知逻辑，例如发送消息或邮件
                    this.showMessage(`已通知学生 ${student.name} 新任务`, 'info');
                }
            }
        });
    },
    
    // 显示编辑任务模态框
    showEditTaskModal(taskId) {
        const task = appData.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const modalBody = document.getElementById('modal-body');
        const studentsHtml = appData.getStudents().map(student => 
            `<option value="${student.id}" ${student.id === task.assignee ? 'selected' : ''}>${student.name} (${student.class})</option>`
        ).join('');
        
        // 准备标签数据
        const selectedTags = task.tags || [];
        const availableTags = ['紧急', '重要', '常规', '会议'];
        
        modalBody.innerHTML = `
            <h3>编辑任务</h3>
            <form id="edit-task-form">
                <div class="form-group">
                    <label for="edit-task-id">任务ID</label>
                    <input type="text" id="edit-task-id" value="${task.id}" disabled>
                </div>
                <div class="form-group">
                    <label for="edit-task-title">任务名称</label>
                    <input type="text" id="edit-task-title" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-task-description">任务描述</label>
                    <textarea id="edit-task-description" rows="4" required>${task.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-task-assignee">负责人</label>
                    <select id="edit-task-assignee">
                        <option value="">请选择负责人（可选）</option>
                        ${studentsHtml}
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-task-deadline">截止日期</label>
                    <input type="date" id="edit-task-deadline" value="${task.deadline}" required>
                </div>
                <div class="form-group">
                    <label for="edit-task-status">状态</label>
                    <select id="edit-task-status" required>
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待完成</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>任务标签</label>
                    <div class="tags-input">
                        <div id="edit-selected-tags">
                            ${selectedTags.map(tag => 
                                `<span class="task-tag">${tag} <button type="button" class="remove-tag" data-tag="${tag}">×</button></span>`
                            ).join(' ')}
                        </div>
                        <select id="edit-tag-selector">
                            <option value="">选择标签</option>
                            ${availableTags.filter(tag => !selectedTags.includes(tag)).map(tag => 
                                `<option value="${tag}">${tag}</option>`
                            ).join('')}
                        </select>
                        <button type="button" id="edit-add-tag-btn">添加</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-notify-student"> 更新后通知负责人
                    </label>
                </div>
                <button type="submit" class="btn-primary">保存</button>
            </form>
        `;
        
        this.showModal();
        
        // 标签管理功能
        const editSelectedTags = [...selectedTags];
        const editSelectedTagsContainer = document.getElementById('edit-selected-tags');
        const editTagSelector = document.getElementById('edit-tag-selector');
        
        const updateEditSelectedTagsDisplay = () => {
            editSelectedTagsContainer.innerHTML = '';
            editSelectedTags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'task-tag';
                tagElement.innerHTML = `${tag} <button type="button" class="remove-tag" data-tag="${tag}">×</button>`;
                editSelectedTagsContainer.appendChild(tagElement);
            });
            
            // 更新标签选择器选项
            const availableOptions = availableTags.filter(tag => !editSelectedTags.includes(tag));
            editTagSelector.innerHTML = '<option value="">选择标签</option>';
            availableOptions.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag;
                option.textContent = tag;
                editTagSelector.appendChild(option);
            });
            
            // 添加删除标签事件
            document.querySelectorAll('.remove-tag').forEach(button => {
                button.addEventListener('click', () => {
                    const tag = button.getAttribute('data-tag');
                    const index = editSelectedTags.indexOf(tag);
                    if (index > -1) {
                        editSelectedTags.splice(index, 1);
                        updateEditSelectedTagsDisplay();
                    }
                });
            });
        };
        
        document.getElementById('edit-add-tag-btn').addEventListener('click', () => {
            const tag = editTagSelector.value;
            if (tag && !editSelectedTags.includes(tag)) {
                editSelectedTags.push(tag);
                updateEditSelectedTagsDisplay();
            }
        });
        
        document.getElementById('edit-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updates = {
                title: document.getElementById('edit-task-title').value,
                description: document.getElementById('edit-task-description').value,
                assignee: document.getElementById('edit-task-assignee').value,
                deadline: document.getElementById('edit-task-deadline').value,
                status: document.getElementById('edit-task-status').value,
                tags: editSelectedTags
            };
            
            const notifyStudent = document.getElementById('edit-notify-student').checked;
            const oldAssignee = task.assignee;
            const newAssignee = updates.assignee;
            
            appData.updateTask(taskId, updates);
            this.renderTaskList(appData.getTasks());
            this.renderTaskStatistics(); // 更新统计信息
            this.hideModal();
            this.showMessage('任务信息更新成功！', 'success');
            
            // 如果需要通知学生（负责人变更或任务更新）
            if (notifyStudent && (oldAssignee !== newAssignee || oldAssignee === newAssignee)) {
                if (newAssignee) {
                    const student = appData.getStudentById(newAssignee);
                    if (student) {
                        this.showMessage(`已通知学生 ${student.name} 任务更新`, 'info');
                    }
                }
            }
        });
    },
    
    // 显示分配任务模态框
    showAssignTaskModal(taskId) {
        const task = appData.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        const modalBody = document.getElementById('modal-body');
        const studentsHtml = appData.getStudents().map(student => 
            `<option value="${student.id}" ${student.id === task.assignee ? 'selected' : ''}>${student.name} (${student.position})</option>`
        ).join('');
        
        modalBody.innerHTML = `
            <h3>分配任务</h3>
            <form id="assign-task-form">
                <div class="form-group">
                    <label>任务名称</label>
                    <input type="text" value="${task.title}" disabled>
                </div>
                <div class="form-group">
                    <label for="assign-student">分配给</label>
                    <select id="assign-student" required>
                        <option value="">请选择学生</option>
                        ${studentsHtml}
                    </select>
                </div>
                <button type="submit" class="btn-primary">分配</button>
            </form>
        `;
        
        this.showModal();
        
        document.getElementById('assign-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const assignee = document.getElementById('assign-student').value;
            
            appData.updateTask(taskId, { assignee });
            this.renderTaskList(appData.getTasks());
            this.hideModal();
            this.showMessage('任务分配成功！', 'success');
        });
    },
    
    // 显示模态框
    showModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'flex';
        
        // 点击关闭按钮
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal();
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    },
    
    // 隐藏模态框
    hideModal() {
        document.getElementById('modal').style.display = 'none';
    },
    
    // 显示消息
    showMessage(text, type) {
        // 创建临时消息元素
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.position = 'fixed';
        message.style.top = '20px';
        message.style.right = '20px';
        message.style.zIndex = '1001';
        message.style.minWidth = '250px';
        
        document.body.appendChild(message);
        
        // 3秒后移除消息
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 500);
        }, 3000);
    }
};

// 将teacherModule暴露给全局window对象
window.teacherModule = teacherModule;