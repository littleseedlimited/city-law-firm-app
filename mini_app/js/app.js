// City Law Firm Virtual Office - JavaScript Application

// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Sample data - in production, this would come from API
const userData = {
    name: "John Doe",
    position: "Associate Attorney",
    department: "Litigation Department",
    email: "john.doe@citylawfirm.com",
    phone: "+1 (555) 123-4567",
    employeeId: "CLF-2025-042",
    specialization: "Civil Litigation",
    barNumber: "NY-123456",
    joinDate: "January 15, 2023"
};

const statsData = {
    activeCases: 12,
    courtDates: 3,
    billableHours: 142.5
};

const agendaData = [
    {
        time: "09:00 AM",
        title: "Case Review Meeting",
        description: "Johnson vs. Smith - Strategy discussion",
        type: "meeting"
    },
    {
        time: "11:30 AM",
        title: "Court Appearance",
        description: "Manhattan District Court - Motion hearing",
        type: "court"
    },
    {
        time: "02:00 PM",
        title: "Client Consultation",
        description: "Initial consultation - Estate planning",
        type: "client"
    },
    {
        time: "04:30 PM",
        title: "Deadline: Filing",
        description: "Submit discovery documents - Case #CL-2025-089",
        type: "deadline"
    }
];

const notificationsData = [
    {
        title: "New Case Assignment",
        message: "You've been assigned to Case #CL-2025-156 (Corporate Merger)",
        time: "10 minutes ago",
        urgent: false
    },
    {
        title: "Court Date Reminder",
        message: "Court appearance tomorrow at 11:30 AM - Manhattan District Court",
        time: "2 hours ago",
        urgent: true
    },
    {
        title: "Department Meeting",
        message: "Litigation team weekly sync - Friday 3:00 PM",
        time: "5 hours ago",
        urgent: false
    }
];

const casesData = [
    {
        id: 1,
        caseNumber: "CL-2025-089",
        title: "Johnson vs. Smith",
        client: "Michael Johnson",
        type: "Litigation",
        status: "active",
        priority: "high",
        nextCourtDate: "2025-11-15",
        deadline: "2025-11-11"
    },
    {
        id: 2,
        caseNumber: "CL-2025-156",
        title: "Corporate Merger - TechCorp",
        client: "TechCorp Inc.",
        type: "Corporate",
        status: "open",
        priority: "urgent",
        nextCourtDate: null,
        deadline: "2025-11-20"
    },
    {
        id: 3,
        caseNumber: "CL-2025-034",
        title: "Estate Planning - Roberts",
        client: "Sarah Roberts",
        type: "Family",
        status: "active",
        priority: "normal",
        nextCourtDate: null,
        deadline: "2025-11-30"
    },
    {
        id: 4,
        caseNumber: "CL-2025-123",
        title: "Criminal Defense - Williams",
        client: "James Williams",
        type: "Criminal",
        status: "pending",
        priority: "urgent",
        nextCourtDate: "2025-11-18",
        deadline: "2025-11-12"
    }
];

const departmentsData = [
    {
        name: "Partners & Management",
        icon: "👔",
        members: 3,
        maxMembers: 3,
        channels: ["#partners-only"]
    },
    {
        name: "Litigation Department",
        icon: "⚖️",
        members: 8,
        maxMembers: 8,
        channels: ["#litigation-general", "#case-discussions"]
    },
    {
        name: "Corporate Law",
        icon: "🏢",
        members: 6,
        maxMembers: 6,
        channels: ["#corporate-deals", "#mergers"]
    },
    {
        name: "Family Law",
        icon: "👨‍👩‍👧",
        members: 4,
        maxMembers: 4,
        channels: ["#family-cases"]
    },
    {
        name: "Criminal Defense",
        icon: "🔒",
        members: 5,
        maxMembers: 5,
        channels: ["#criminal-cases"]
    },
    {
        name: "Administration & HR",
        icon: "📋",
        members: 4,
        maxMembers: 4,
        channels: ["#admin-general", "#hr-announcements", "#admin-facilities"]
    }
];

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    // Add loading state
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
        initializeApp();
    }, 100);
});

function initializeApp() {
    // Set user data with animation
    setTimeout(() => {
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userRole').textContent = `${userData.position} - ${userData.department}`;
    }, 200);

    // Animate stats with counting effect
    animateValue('activeCases', 0, statsData.activeCases, 1000);
    animateValue('courtDates', 0, statsData.courtDates, 1000);
    animateValue('billableHours', 0, statsData.billableHours, 1000, true);

    // Render sections
    renderAgenda();
    renderNotifications();
    renderCases();
    renderDepartments();
    renderProfile();

    // Setup tab navigation
    setupTabNavigation();

    // Setup Telegram theme
    applyTelegramTheme();

    // Add scroll animations
    setupScrollAnimations();
}

// Animate number counting
function animateValue(id, start, end, duration, isDecimal = false) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    }, 16);
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.section-card, .case-card, .department-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active to clicked
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Haptic feedback
            tg.HapticFeedback.impactOccurred('light');
        });
    });
}

function renderAgenda() {
    const agendaList = document.getElementById('agendaList');

    if (agendaData.length === 0) {
        agendaList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No items scheduled for today</p>';
        return;
    }

    agendaList.innerHTML = agendaData.map(item => `
        <div class="agenda-item">
            <div class="agenda-time">${item.time}</div>
            <div class="agenda-details">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>
    `).join('');
}

function renderNotifications() {
    const notificationsList = document.getElementById('notificationsList');

    notificationsList.innerHTML = notificationsData.map(notif => `
        <div class="notification-item ${notif.urgent ? 'urgent' : ''}">
            <div class="notification-icon">
                ${notif.urgent ? '🚨' : '📢'}
            </div>
            <div class="notification-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <div class="notification-time">${notif.time}</div>
            </div>
        </div>
    `).join('');
}

function renderCases() {
    const casesList = document.getElementById('casesList');

    const casesHTML = casesData.map(caseItem => {
        const statusBadge = getStatusBadge(caseItem.status);
        const priorityBadge = getPriorityBadge(caseItem.priority);

        return `
            <div class="case-card" onclick="viewCaseDetails(${caseItem.id})">
                <div class="case-header">
                    <div>
                        <div class="case-number">${caseItem.caseNumber}</div>
                        <h3 class="case-title">${caseItem.title}</h3>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-direction: column; align-items: flex-end;">
                        ${statusBadge}
                        ${priorityBadge}
                    </div>
                </div>
                <div class="case-client">Client: ${caseItem.client}</div>
                <div class="case-meta">
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        </svg>
                        ${caseItem.type}
                    </span>
                    ${caseItem.nextCourtDate ? `
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Court: ${formatDate(caseItem.nextCourtDate)}
                    </span>
                    ` : ''}
                    <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Due: ${formatDate(caseItem.deadline)}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    casesList.innerHTML = casesHTML;
}

function renderDepartments() {
    const departmentsList = document.getElementById('departmentsList');

    departmentsList.innerHTML = departmentsData.map(dept => `
        <div class="department-card" onclick="viewDepartment('${dept.name}')">
            <div class="department-icon">${dept.icon}</div>
            <h3 class="department-name">${dept.name}</h3>
            <div class="department-members">${dept.members}/${dept.maxMembers} members</div>
            <div class="department-channels">
                ${dept.channels.map(channel => `
                    <span class="channel-tag">${channel}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderProfile() {
    document.getElementById('profileName').textContent = userData.name;
    document.getElementById('profilePosition').textContent = userData.position;
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('profilePhone').textContent = userData.phone;
    document.getElementById('profileDepartment').textContent = userData.department;
    document.getElementById('profileEmployeeId').textContent = userData.employeeId;
    document.getElementById('profileSpecialization').textContent = userData.specialization;
    document.getElementById('profileBarNumber').textContent = userData.barNumber;
    document.getElementById('profileJoinDate').textContent = userData.joinDate;
}

// Helper functions
function getStatusBadge(status) {
    const badges = {
        'open': '<span class="badge badge-primary">Open</span>',
        'active': '<span class="badge badge-success">Active</span>',
        'pending': '<span class="badge badge-warning">Pending</span>',
        'closed': '<span class="badge" style="background: #e5e7eb; color: #6b7280;">Closed</span>'
    };
    return badges[status] || '';
}

function getPriorityBadge(priority) {
    const badges = {
        'urgent': '<span class="badge badge-danger">Urgent</span>',
        'high': '<span class="badge badge-warning">High</span>',
        'normal': '<span class="badge badge-primary">Normal</span>',
        'low': '<span class="badge" style="background: #e5e7eb; color: #6b7280;">Low</span>'
    };
    return badges[priority] || '';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function applyTelegramTheme() {
    // Apply Telegram's color scheme if available
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
    }
}

// Action functions
function refreshAgenda() {
    tg.HapticFeedback.notificationOccurred('success');
    tg.showAlert('Agenda refreshed!');
    // In production, fetch fresh data from API
    renderAgenda();
}

// Submission functions
function submitNewCase(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
        action: 'new_case',
        case_number: form.querySelector('input[placeholder="CL-2025-XXX"]').value,
        client_name: form.querySelector('input[placeholder="Full name"]').value,
        case_type: form.querySelector('select').value,
        priority: form.querySelectorAll('select')[1].value
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

function submitTimeEntry(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
        action: 'log_time',
        case_id: form.querySelector('select').value,
        duration: form.querySelector('input[type="number"]').value,
        activity_type: form.querySelectorAll('select')[1].value,
        description: form.querySelector('textarea').value
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

function submitLeaveRequest(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
        action: 'leave_request',
        leave_type: form.querySelector('select').value,
        start_date: form.querySelector('input[type="date"]').value,
        end_date: form.querySelectorAll('input[type="date"]')[1].value,
        reason: form.querySelector('textarea').value
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

// Update open functions to attach listeners
function openNewCase() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Register New Case', `
        <form onsubmit="submitNewCase(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Case Number</label>
                <input required type="text" placeholder="CL-2025-XXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Client Name</label>
                <input required type="text" placeholder="Full name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Case Type</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    <option>Litigation</option>
                    <option>Corporate</option>
                    <option>Family</option>
                    <option>Criminal</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Priority</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                    <option>Low</option>
                </select>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Create Case</button>
        </form>
    `);
}

function openTimeEntry() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Log Billable Time', `
        <form onsubmit="submitTimeEntry(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Case</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    ${casesData.map(c => `<option value="${c.id}">${c.caseNumber} - ${c.title}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Duration (hours)</label>
                <input required type="number" step="0.25" placeholder="1.5" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Activity Type</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    <option>Research</option>
                    <option>Court Appearance</option>
                    <option>Client Meeting</option>
                    <option>Document Drafting</option>
                    <option>Case Preparation</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Description</label>
                <textarea required rows="3" placeholder="Brief description of work performed..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit;"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Log Time</button>
        </form>
    `);
}

function openLeaveRequest() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Request Time Off', `
        <form onsubmit="submitLeaveRequest(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Leave Type</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    <option>Vacation</option>
                    <option>Sick Leave</option>
                    <option>Personal Leave</option>
                    <option>Emergency Leave</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Start Date</label>
                <input required type="date" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">End Date</label>
                <input required type="date" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Reason (Optional)</label>
                <textarea rows="3" placeholder="Brief explanation..." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; font-family: inherit;"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Submit Request</button>
        </form>
    `);
}

// ... existing viewCaseDetails ...

function viewCaseDetails(caseId) {
    tg.HapticFeedback.impactOccurred('light');
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;

    showModal(caseItem.caseNumber, `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem;">${caseItem.title}</h3>
            <div style="display: flex; gap: 0.5rem;">
                ${getStatusBadge(caseItem.status)}
                ${getPriorityBadge(caseItem.priority)}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; background: var(--background); border-radius: 0.5rem;">
                <div><strong>Client:</strong> ${caseItem.client}</div>
                <div><strong>Type:</strong> ${caseItem.type}</div>
                ${caseItem.nextCourtDate ? `<div><strong>Next Court Date:</strong> ${formatDate(caseItem.nextCourtDate)}</div>` : ''}
                <div><strong>Deadline:</strong> ${formatDate(caseItem.deadline)}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;">
                <button class="btn-primary" onclick="closeModal(); openTimeEntry();">Log Time</button>
                <button class="btn-small">View Documents</button>
            </div>
        </div>
    `);
}

// ... rest of existing code ...

function viewDepartment(deptName) {
    tg.HapticFeedback.impactOccurred('light');
    const dept = departmentsData.find(d => d.name === deptName);
    if (!dept) return;

    showModal(dept.name, `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="font-size: 3rem; text-align: center;">${dept.icon}</div>
            <div style="text-align: center; color: var(--text-secondary);">
                ${dept.members}/${dept.maxMembers} members
            </div>
            <div>
                <h4 style="margin-bottom: 0.75rem;">Channels</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${dept.channels.map(channel => `
                        <div style="padding: 0.75rem; background: var(--background); border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--primary-color);">#</span>
                            ${channel.replace('#', '')}
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 0.5rem;">View Team Directory</button>
        </div>
    `);
}

function editProfile() {
    tg.HapticFeedback.impactOccurred('medium');
    tg.showAlert('Profile editing will be available in the next update!');
}

// Modal functions
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Filter and search functions
function filterCases() {
    const statusFilter = document.getElementById('caseStatusFilter').value;
    const priorityFilter = document.getElementById('casePriorityFilter').value;

    // Filter logic here
    tg.HapticFeedback.impactOccurred('light');
    renderCases(); // Re-render with filters
}

function searchCases() {
    const searchTerm = document.getElementById('caseSearch').value.toLowerCase();
    // Search logic here
    // In production, filter casesData based on searchTerm
}

// Listen for theme changes
tg.onEvent('themeChanged', () => {
    applyTelegramTheme();
});

// Close app on back button
tg.BackButton.onClick(() => {
    tg.close();
});

console.log('City Law Firm Virtual Office initialized successfully!');

