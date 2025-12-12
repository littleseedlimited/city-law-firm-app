
// City Law Firm Virtual Office - JavaScript Application

// Initialize Telegram Web App
let tg;
try {
    tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
} catch (e) {
    console.warn('Telegram WebApp not available, using mock');
    // Mock tg for browser testing
    tg = {
        initDataUnsafe: { user: { id: 12345, first_name: "Test", last_name: "User" } },
        expand: () => { },
        ready: () => { },
        HapticFeedback: { impactOccurred: () => { } },
        showAlert: (msg) => alert(msg),
        showConfirm: (msg) => confirm(msg),
        close: () => console.log('App closed'),
        themeParams: {}
    };
}

// DEBUG: Global Error Handler to catch mobile errors
window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errorMsg = `Error: ${msg} \nLine: ${lineNo} \nURL: ${url} `;
    // alert(errorMsg); // Uncomment to see system alerts
    if (tg.showAlert) tg.showAlert(errorMsg);
    else alert(errorMsg);
    return false;
};

// API Configuration
const API_BASE_URL = 'https://tomoko-pericarditic-regretfully.ngrok-free.dev/api';
const USER_ID = tg.initDataUnsafe?.user?.id || 12345;

// Data storage
let userData = null;
let statsData = { activeCases: 0, courtDates: 0, billableHours: 0 };
let agendaData = [];
let casesData = [];
let notificationsData = [];
let staffData = [];

// Fetch user profile
async function fetchUserProfile() {
    if (!USER_ID) return;
    try {
        const response = await fetch(`${API_BASE_URL} /user/${USER_ID} `, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
            const data = await response.json();
            userData = {
                name: data.full_name,
                position: data.position,
                department: data.departments,
                email: data.email,
                phone: data.phone,
                employeeId: `CLF - ${data.id} `,
                specialization: data.role, // Mapping role to specialization for now
                barNumber: "N/A", // Not in API yet
                joinDate: "N/A" // Not in API yet
            };
            return userData;
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }

    // Fallback Mock Data
    console.log("Using fallback profile data");
    userData = {
        name: "John Doe",
        position: "Senior Attorney",
        department: "Litigation",
        email: "john.doe@citylaw.com",
        phone: "+1 (555) 123-4567",
        employeeId: "CLF-1001",
        specialization: "Corporate Litigation",
        barNumber: "NY-12345",
        joinDate: "2020-03-15"
    };
    return userData;
}

// Fetch cases
async function fetchCases() {
    if (!USER_ID) return [];
    try {
        const response = await fetch(`${API_BASE_URL} /cases/${USER_ID} `, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
            const data = await response.json();
            casesData = (data.cases || []).map(c => ({
                id: c.id,
                caseNumber: c.case_number,
                title: c.title,
                client: c.client_name,
                type: c.case_type,
                status: c.status,
                priority: c.priority,
                nextCourtDate: c.next_court_date,
                deadline: c.deadline
            }));
            statsData.activeCases = casesData.filter(c => c.status === 'active').length;
            return casesData;
        }
    } catch (error) {
        console.error('Error fetching cases:', error);
    }

    // Fallback Mock Data
    console.log("Using fallback cases data");
    casesData = [
        { id: 1, caseNumber: 'CL-2025-001', title: 'Smith vs. Jones Corp', client: 'John Smith', type: 'Civil', status: 'active', priority: 'high', nextCourtDate: '2025-12-15T09:00:00', deadline: '2025-12-20T17:00:00' },
        { id: 2, caseNumber: 'CL-2025-002', title: 'State vs. Doe', client: 'Jane Doe', type: 'Criminal', status: 'pending', priority: 'urgent', nextCourtDate: null, deadline: '2025-12-10T17:00:00' },
        { id: 3, caseNumber: 'CL-2025-003', title: 'Real Estate Merger', client: 'Tech Properties', type: 'Corporate', status: 'active', priority: 'normal', nextCourtDate: null, deadline: '2026-01-15T17:00:00' },
        { id: 4, caseNumber: 'CL-2025-004', title: 'Family Trust Setup', client: 'Robert Wilson', type: 'Family', status: 'closed', priority: 'low', nextCourtDate: null, deadline: null }
    ];
    statsData.activeCases = casesData.filter(c => c.status === 'active').length;
    return casesData;
}

// Fetch agenda
async function fetchAgenda() {
    if (!USER_ID) return { court_dates: [], tasks: [], time_entries: [], total_hours: 0 };
    try {
        const response = await fetch(`${API_BASE_URL} /agenda/${USER_ID} `, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
            const data = await response.json();
            statsData.courtDates = data.court_dates?.length || 0;
            statsData.billableHours = data.total_hours || 0;

            // Map to agenda items for display
            agendaData = [];

            // Add court dates
            if (data.court_dates) {
                data.court_dates.forEach(cd => {
                    const date = new Date(cd.hearing_date);
                    agendaData.push({
                        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        title: "Court Appearance",
                        description: `${cd.court_name} - ${cd.purpose || 'Hearing'} `,
                        type: "court"
                    });
                });
            }

            // Add tasks
            if (data.tasks) {
                data.tasks.forEach(t => {
                    agendaData.push({
                        time: "Anytime",
                        title: "Task",
                        description: t.title,
                        type: "deadline"
                    });
                });
            }

            return data;
        }
    } catch (error) {
        console.error('Error fetching agenda:', error);
    }

    // Fallback Mock Data
    console.log("Using fallback agenda data");
    const mockAgenda = {
        court_dates: [
            { hearing_date: '2025-12-12T10:00:00', court_name: 'District Court', purpose: 'Preliminary Hearing' },
            { hearing_date: '2025-12-15T14:30:00', court_name: 'Superior Court', purpose: 'Case Management Conference' }
        ],
        tasks: [
            { title: 'Draft Motion to Dismiss (Smith vs. Jones)' },
            { title: 'Client Meeting: Tech Properties' }
        ],
        total_hours: 142.5
    };

    statsData.courtDates = mockAgenda.court_dates.length;
    statsData.billableHours = mockAgenda.total_hours;

    // Map to agenda items for display
    agendaData = [];
    if (mockAgenda.court_dates) {
        mockAgenda.court_dates.forEach(cd => {
            const date = new Date(cd.hearing_date);
            agendaData.push({
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: "Court Appearance",
                description: `${cd.court_name} - ${cd.purpose || 'Hearing'} `,
                type: "court"
            });
        });
    }
    if (mockAgenda.tasks) {
        mockAgenda.tasks.forEach(t => {
            agendaData.push({
                time: "Anytime",
                title: "Task",
                description: t.title,
                type: "deadline"
            });
        });
    }

    return mockAgenda;
}

// Fetch notifications
async function fetchNotifications() {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
            const data = await response.json();
            notificationsData = (data.notifications || []).map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: n.priority === 'urgent' ? 'alert' : 'info',
                icon: n.priority === 'urgent' ? '🚨' : '📢',
                urgent: n.priority === 'urgent'
            }));
            return notificationsData;
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
    return [];
}

// Fetch staff
async function fetchStaff() {
    try {
        const response = await fetch(`${API_BASE_URL}/staff`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (response.ok) {
            const data = await response.json();
            staffData = (data.staff || []).map(s => ({
                id: s.id,
                name: s.full_name,
                role: s.position,
                photo: s.photo_file_id ? `https://api.telegram.org/file/bot${tg.initDataUnsafe?.hash}/${s.photo_file_id}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=3b82f6&color=fff`,
                status: s.is_online ? 'online' : 'offline',
                location: s.latitude ? 'Location Shared' : 'Unknown',
                lastSeen: s.last_seen ? new Date(s.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'
            }));
            return staffData;
        }
    } catch (error) {
        console.error('Error fetching staff:', error);
    }

    // Fallback Mock Data
    console.log("Using fallback staff data");
    staffData = [
        { id: 1, name: 'Sarah Parker', role: 'Senior Partner', photo: 'https://ui-avatars.com/api/?name=Sarah+Parker&background=3b82f6&color=fff', status: 'online', location: 'Office 301', lastSeen: 'Just now' },
        { id: 2, name: 'James Wilson', role: 'Associate', photo: 'https://ui-avatars.com/api/?name=James+Wilson&background=10b981&color=fff', status: 'offline', location: 'Unknown', lastSeen: '15 mins ago' },
        { id: 3, name: 'Emily Chen', role: 'Paralegal', photo: 'https://ui-avatars.com/api/?name=Emily+Chen&background=f59e0b&color=fff', status: 'online', location: 'Court House', lastSeen: '5 mins ago' },
        { id: 4, name: 'Michael Ross', role: 'Junior Associate', photo: 'https://ui-avatars.com/api/?name=Michael+Ross&background=ef4444&color=fff', status: 'offline', location: 'Meeting Room 2', lastSeen: '1 hour ago' }
    ];
    return staffData;
}

// Mock data removed - using API data

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
        // Setup UI immediately
        setupEventListeners();
        renderInitialUI();
        // Then fetch data
        initializeApp();
    }, 100);
});

function renderInitialUI() {
    renderProfile();
    renderStats();
    renderAgenda();
    renderCases();
    renderDepartments();
    renderStaff();
    renderNotifications();
}

// Initialize app
async function initializeApp() {
    // Show loading state
    document.body.style.opacity = '0.7';

    // Fetches happen in background now
    try {
        await Promise.all([
            fetchUserProfile(),
            fetchCases(),
            fetchAgenda()
        ]);

        // Re-render with real data if fetch succeeds
        renderInitialUI();
    } catch (e) {
        console.log("Using mock data due to error", e);
    }

    // Check URL parameters for specific views (moved from bottom)
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');

    if (view === 'newcase') {
        const casesTab = document.querySelector('[data-tab="cases"]');
        if (casesTab) casesTab.click(); // Trigger click to switch

        setTimeout(() => openNewCase(), 500);
    }

    // Apply theme
    applyTelegramTheme();

    // Add scroll animations
    setupScrollAnimations();

    // Hide loading state
    document.body.style.opacity = '1';
}


function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    // Get broadcast from URL
    const urlParams = new URLSearchParams(window.location.search);
    const broadcastMsg = urlParams.get('broadcast');
    const broadcastTime = urlParams.get('time');

    let notifications = [...notificationsData];

    // Add broadcast if exists and not already in list (simple check)
    if (broadcastMsg) {
        notifications.unshift({
            id: 'broadcast',
            title: '📢 System Broadcast',
            message: decodeURIComponent(broadcastMsg),
            time: broadcastTime || 'Just now',
            type: 'urgent',
            icon: '📢'
        });
    }

    if (notifications.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No new notifications</p>';
        return;
    }

    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.type}">
            <div class="notification-icon">${n.icon}</div>
            <div class="notification-content">
                <div class="notification-header">
                    <span class="notification-title">${n.title}</span>
                    <span class="notification-time">${n.time}</span>
                </div>
                <p class="notification-message">${n.message}</p>
            </div>
        </div>
    `).join('');
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

function setupEventListeners() {
    // Setup tab navigation
    setupTabNavigation();

    // Add any other event listeners here

    // Close modal when clicking outside
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}

function showModal(title, content) {
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalBody && modalOverlay) {
        // Add header to content if not present in content string
        let finalContent = content;
        if (!content.includes('<h3>')) {
            finalContent = `<h3>${title}</h3>` + content;
        }
        modalBody.innerHTML = finalContent;
        modalOverlay.classList.add('active');
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
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

// Duplicate renderNotifications removed


function renderStaff() {
    const container = document.getElementById('staffList');
    container.innerHTML = staffData.map(staff => `
        <div class="staff-card">
            <div class="staff-photo-container">
                <img src="${staff.photo}" alt="${staff.name}" class="staff-photo ${staff.status === 'online' ? 'online' : ''}">
                <div class="status-indicator ${staff.status === 'online' ? 'online' : ''}"></div>
            </div>
            <div class="staff-name">${staff.name}</div>
            <div class="staff-role">${staff.role}</div>
            <div class="staff-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${staff.location}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary); margin-top: 0.5rem;">
                Last seen: ${staff.lastSeen}
            </div>
        </div>
    `).join('');
}

function refreshStaff() {
    tg.HapticFeedback.impactOccurred('light');
    // Simulate refresh
    const btn = document.querySelector('#staff .btn-small');
    const originalText = btn.textContent;
    btn.textContent = 'Refreshing...';

    setTimeout(() => {
        // Randomly toggle some statuses for demo
        staffData.forEach(staff => {
            if (Math.random() > 0.7) {
                staff.status = staff.status === 'online' ? 'offline' : 'online';
                staff.lastSeen = staff.status === 'online' ? 'Just now' : '10 mins ago';
            }
        });
        renderStaff();
        btn.textContent = originalText;
    }, 1000);
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

function renderStats() {
    animateValue('activeCases', 0, statsData.activeCases || 0, 1000);
    animateValue('courtDates', 0, statsData.courtDates || 0, 1000);
    animateValue('billableHours', 0, statsData.billableHours || 0, 1000, true);
}

function renderDepartments() {
    const departmentsList = document.getElementById('departmentsList');

    departmentsList.innerHTML = departmentsData.map(dept => `
        < div class="department-card" onclick = "viewDepartment('${dept.name}')" >
            <div class="department-icon">${dept.icon}</div>
            <h3 class="department-name">${dept.name}</h3>
            <div class="department-members">${dept.members}/${dept.maxMembers} members</div>
            <div class="department-channels">
                ${dept.channels.map(channel => `
                    <span class="channel-tag">${channel}</span>
                `).join('')}
            </div>
        </div >
        `).join('');
}

function renderProfile() {
    if (!userData) {
        // Fallback or loading state
        document.getElementById('profileName').textContent = "Loading...";
        return;
    }
    document.getElementById('profileName').textContent = userData.name || 'User';
    document.getElementById('profilePosition').textContent = userData.position || 'N/A';
    document.getElementById('profileEmail').textContent = userData.email || 'N/A';
    document.getElementById('profilePhone').textContent = userData.phone || 'N/A';
    document.getElementById('profileDepartment').textContent = userData.department || 'N/A';
    document.getElementById('profileEmployeeId').textContent = userData.employeeId || 'N/A';
    document.getElementById('profileSpecialization').textContent = userData.specialization || 'N/A';
    document.getElementById('profileBarNumber').textContent = userData.barNumber || 'N/A';
    document.getElementById('profileJoinDate').textContent = userData.joinDate || 'N/A';
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
        case_type: form.querySelectorAll('select')[0].value,
        department: form.querySelectorAll('select')[1].value,
        priority: form.querySelectorAll('select')[2].value,
        assigned_to: form.querySelector('input[placeholder="Attorney Name"]').value
    };
    tg.sendData(JSON.stringify(data));
    tg.close();
}

// ... existing code ...

function openNewCase() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Register New Case', `
        < form onsubmit = "submitNewCase(event)" style = "display: flex; flex-direction: column; gap: 1rem;" >
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
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Department</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    <option>Litigation Department</option>
                    <option>Corporate Law</option>
                    <option>Family Law</option>
                    <option>Criminal Defense</option>
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
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Responsible Person</label>
                <input required type="text" placeholder="Attorney Name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Create Case</button>
        </form >
        `);
}

function openTimeEntry() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Log Billable Time', `
        < form onsubmit = "submitTimeEntry(event)" style = "display: flex; flex-direction: column; gap: 1rem;" >
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
        </form >
        `);
}

function openLeaveRequest() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Request Time Off', `
        < form onsubmit = "submitLeaveRequest(event)" style = "display: flex; flex-direction: column; gap: 1rem;" >
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
        </form >
        `);
}

function openAddAgenda() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Add to Agenda', `
        < div style = "display: flex; gap: 0.5rem; margin-bottom: 1rem;" >
            <button type="button" class="btn-small active" id="btnCourtDate" onclick="toggleAgendaType('court')" style="flex: 1; background: var(--primary-color); color: white;">Court Date</button>
            <button type="button" class="btn-small" id="btnTask" onclick="toggleAgendaType('task')" style="flex: 1; background: var(--background); color: var(--text-primary); border: 1px solid var(--border-color);">Task</button>
        </div >

        <form onsubmit="submitAgendaItem(event)" id="agendaForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="hidden" name="type" id="agendaType" value="court">

                <div id="courtFields">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Case Number</label>
                        <input required type="text" name="case_number" placeholder="CL-2025-XXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Court Name</label>
                        <input required type="text" name="court_name" placeholder="Supreme Court" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date & Time</label>
                        <input required type="datetime-local" name="date_time" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Purpose</label>
                        <input required type="text" name="purpose" placeholder="Hearing, Trial, etc." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                </div>

                <div id="taskFields" style="display: none;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Task Title</label>
                        <input type="text" name="title" placeholder="Review documents" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Deadline</label>
                        <input type="date" name="deadline" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Priority</label>
                        <select name="priority" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Add to Agenda</button>
        </form>
    `);
}

function toggleAgendaType(type) {
    const btnCourt = document.getElementById('btnCourtDate');
    const btnTask = document.getElementById('btnTask');
    const courtFields = document.getElementById('courtFields');
    const taskFields = document.getElementById('taskFields');
    const agendaType = document.getElementById('agendaType');
    const form = document.getElementById('agendaForm');

    agendaType.value = type;

    if (type === 'court') {
        btnCourt.style.background = 'var(--primary-color)';
        btnCourt.style.color = 'white';
        btnCourt.style.border = 'none';

        btnTask.style.background = 'var(--background)';
        btnTask.style.color = 'var(--text-primary)';
        btnTask.style.border = '1px solid var(--border-color)';

        courtFields.style.display = 'block';
        taskFields.style.display = 'none';

        // Update required attributes
        form.querySelector('input[name="case_number"]').required = true;
        form.querySelector('input[name="court_name"]').required = true;
        form.querySelector('input[name="date_time"]').required = true;
        form.querySelector('input[name="purpose"]').required = true;

        form.querySelector('input[name="title"]').required = false;
        form.querySelector('input[name="deadline"]').required = false;

    } else {
        btnTask.style.background = 'var(--primary-color)';
        btnTask.style.color = 'white';
        btnTask.style.border = 'none';

        btnCourt.style.background = 'var(--background)';
        btnCourt.style.color = 'var(--text-primary)';
        btnCourt.style.border = '1px solid var(--border-color)';

        courtFields.style.display = 'none';
        taskFields.style.display = 'block';

        // Update required attributes
        form.querySelector('input[name="case_number"]').required = false;
        form.querySelector('input[name="court_name"]').required = false;
        form.querySelector('input[name="date_time"]').required = false;
        form.querySelector('input[name="purpose"]').required = false;

        form.querySelector('input[name="title"]').required = true;
        form.querySelector('input[name="deadline"]').required = true;
    }
}

function submitAgendaItem(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.querySelector('#agendaType').value;

    let data = {
        action: 'new_agenda_item',
        type: type
    };

    if (type === 'court') {
        data.case_number = form.querySelector('input[name="case_number"]').value;
        data.court_name = form.querySelector('input[name="court_name"]').value;
        data.date_time = form.querySelector('input[name="date_time"]').value;
        data.purpose = form.querySelector('input[name="purpose"]').value;
    } else {
        data.title = form.querySelector('input[name="title"]').value;
        data.deadline = form.querySelector('input[name="deadline"]').value;
        data.priority = form.querySelector('select[name="priority"]').value;
    }

    tg.sendData(JSON.stringify(data));
    tg.close();
}

function openAddAgenda() {
    tg.HapticFeedback.impactOccurred('medium');
    showModal('Add to Agenda', `
        < div style = "display: flex; gap: 0.5rem; margin-bottom: 1rem;" >
            <button type="button" class="btn-small active" id="btnCourtDate" onclick="toggleAgendaType('court')" style="flex: 1; background: var(--primary-color); color: white;">Court Date</button>
            <button type="button" class="btn-small" id="btnTask" onclick="toggleAgendaType('task')" style="flex: 1; background: var(--background); color: var(--text-primary); border: 1px solid var(--border-color);">Task</button>
        </div >

        <form onsubmit="submitAgendaItem(event)" id="agendaForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="hidden" name="type" id="agendaType" value="court">

                <div id="courtFields">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Case Number</label>
                        <input required type="text" name="case_number" placeholder="CL-2025-XXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Court Name</label>
                        <input required type="text" name="court_name" placeholder="Supreme Court" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date & Time</label>
                        <input required type="datetime-local" name="date_time" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Purpose</label>
                        <input required type="text" name="purpose" placeholder="Hearing, Trial, etc." style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                </div>

                <div id="taskFields" style="display: none;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Task Title</label>
                        <input type="text" name="title" placeholder="Review documents" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Deadline</label>
                        <input type="date" name="deadline" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Priority</label>
                        <select name="priority" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem;">
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>

                <button type="submit" class="btn-primary" style="margin-top: 0.5rem;">Add to Agenda</button>
        </form>
    `);
}

function toggleAgendaType(type) {
    const btnCourt = document.getElementById('btnCourtDate');
    const btnTask = document.getElementById('btnTask');
    const courtFields = document.getElementById('courtFields');
    const taskFields = document.getElementById('taskFields');
    const agendaType = document.getElementById('agendaType');
    const form = document.getElementById('agendaForm');

    agendaType.value = type;

    if (type === 'court') {
        btnCourt.style.background = 'var(--primary-color)';
        btnCourt.style.color = 'white';
        btnCourt.style.border = 'none';

        btnTask.style.background = 'var(--background)';
        btnTask.style.color = 'var(--text-primary)';
        btnTask.style.border = '1px solid var(--border-color)';

        courtFields.style.display = 'block';
        taskFields.style.display = 'none';

        // Update required attributes
        form.querySelector('input[name="case_number"]').required = true;
        form.querySelector('input[name="court_name"]').required = true;
        form.querySelector('input[name="date_time"]').required = true;
        form.querySelector('input[name="purpose"]').required = true;

        form.querySelector('input[name="title"]').required = false;
        form.querySelector('input[name="deadline"]').required = false;

    } else {
        btnTask.style.background = 'var(--primary-color)';
        btnTask.style.color = 'white';
        btnTask.style.border = 'none';

        btnCourt.style.background = 'var(--background)';
        btnCourt.style.color = 'var(--text-primary)';
        btnCourt.style.border = '1px solid var(--border-color)';

        courtFields.style.display = 'none';
        taskFields.style.display = 'block';

        // Update required attributes
        form.querySelector('input[name="case_number"]').required = false;
        form.querySelector('input[name="court_name"]').required = false;
        form.querySelector('input[name="date_time"]').required = false;
        form.querySelector('input[name="purpose"]').required = false;

        form.querySelector('input[name="title"]').required = true;
        form.querySelector('input[name="deadline"]').required = true;
    }
}

function submitAgendaItem(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.querySelector('#agendaType').value;

    let data = {
        action: 'new_agenda_item',
        type: type
    };

    if (type === 'court') {
        data.case_number = form.querySelector('input[name="case_number"]').value;
        data.court_name = form.querySelector('input[name="court_name"]').value;
        data.date_time = form.querySelector('input[name="date_time"]').value;
        data.purpose = form.querySelector('input[name="purpose"]').value;
    } else {
        data.title = form.querySelector('input[name="title"]').value;
        data.deadline = form.querySelector('input[name="deadline"]').value;
        data.priority = form.querySelector('select[name="priority"]').value;
    }

    tg.sendData(JSON.stringify(data));
    tg.close();
}

// ... existing viewCaseDetails ...

function viewCaseDetails(caseId) {
    tg.HapticFeedback.impactOccurred('light');
    const caseItem = casesData.find(c => c.id === caseId);
    if (!caseItem) return;

    showModal(caseItem.caseNumber, `
        < div style = "display: flex; flex-direction: column; gap: 1rem;" >
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
        </div >
        `);
}

// ... rest of existing code ...

function viewDepartment(deptName) {
    tg.HapticFeedback.impactOccurred('light');
    const dept = departmentsData.find(d => d.name === deptName);
    if (!dept) return;

    showModal(dept.name, `
        < div style = "display: flex; flex-direction: column; gap: 1rem;" >
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
        </div >
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

// Action button handlers
function openNewCase() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        < h3 >📝 Register New Case</h3 >
            <form id="newCaseForm" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Case Number</label>
                        <input type="text" id="caseNumber" placeholder="CL-2025-XXX" required>
                    </div>
                    <div class="form-group">
                        <label>Case Type</label>
                        <select id="caseType" required>
                            <option value="">Select type</option>
                            <option value="civil">Civil Law</option>
                            <option value="criminal">Criminal Law</option>
                            <option value="corporate">Corporate Law</option>
                            <option value="family">Family Law</option>
                            <option value="property">Property Law</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Client Name</label>
                    <input type="text" id="clientName" placeholder="Enter full client name" required>
                </div>
                <div class="form-group">
                    <label>Case Description</label>
                    <textarea id="caseDescription" rows="4" placeholder="Provide a brief description of the case..."></textarea>
                </div>
                <button type="submit" class="btn-primary"><span>Register Case</span></button>
            </form>
    `;

    document.getElementById('modalOverlay').classList.add('active');

    document.getElementById('newCaseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert('Case registered successfully!');
        closeModal();
    });

    tg.HapticFeedback.impactOccurred('medium');
}

function openTimeEntry() {
    const modalBody = document.getElementById('modalBody');
    const today = new Date().toISOString().split('T')[0];
    modalBody.innerHTML = `
        < h3 >⏱️ Log Billable Hours</h3 >
            <form id="timeEntryForm" class="modal-form">
                <div class="form-group">
                    <label>Case Number</label>
                    <input type="text" id="timeCaseNumber" placeholder="CL-2025-XXX" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Hours Worked</label>
                        <input type="number" id="hours" step="0.25" min="0.25" max="24" placeholder="2.5" required>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="timeDate" value="${today}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Work Description</label>
                    <textarea id="timeDescription" rows="4" placeholder="Describe the work performed..." required></textarea>
                </div>
                <button type="submit" class="btn-primary"><span>Log Time Entry</span></button>
            </form>
    `;

    document.getElementById('modalOverlay').classList.add('active');

    document.getElementById('timeEntryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert('Time logged successfully!');
        closeModal();
    });

    tg.HapticFeedback.impactOccurred('medium');
}

function openLeaveRequest() {
    const modalBody = document.getElementById('modalBody');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    modalBody.innerHTML = `
        < h3 >📅 Request Leave</h3 >
            <form id="leaveRequestForm" class="modal-form">
                <div class="form-group">
                    <label>Leave Type</label>
                    <select id="leaveType" required>
                        <option value="">Select leave type</option>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="leaveStartDate" min="${minDate}" required>
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="date" id="leaveEndDate" min="${minDate}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Reason for Leave</label>
                    <textarea id="leaveReason" rows="4" placeholder="Please provide a reason for your leave request..." required></textarea>
                </div>
                <button type="submit" class="btn-primary"><span>Submit Leave Request</span></button>
            </form>
    `;

    document.getElementById('modalOverlay').classList.add('active');

    document.getElementById('leaveRequestForm').addEventListener('submit', (e) => {
        e.preventDefault();
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert('Leave request submitted!');
        closeModal();
    });

    tg.HapticFeedback.impactOccurred('medium');
}

function openAddAgenda() {
    const modalBody = document.getElementById('modalBody');
    const today = new Date().toISOString().split('T')[0];

    modalBody.innerHTML = `
        < h3 >📋 Add to Agenda</h3 >
            <form id="addAgendaForm" class="modal-form">
                <div class="form-group">
                    <label>Item Type</label>
                    <select id="agendaType" required>
                        <option value="">Select item type</option>
                        <option value="court_date">⚖️ Court Date</option>
                        <option value="meeting">🤝 Client Meeting</option>
                        <option value="deadline">⏰ Deadline</option>
                        <option value="task">✅ Task</option>
                        <option value="hearing">🎯 Hearing</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="agendaTitle" placeholder="e.g., Client Consultation" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="agendaDate" min="${today}" required>
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" id="agendaTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Additional Notes</label>
                    <textarea id="agendaNotes" rows="3" placeholder="Add any relevant notes or details..."></textarea>
                </div>
                <button type="submit" class="btn-primary"><span>Add to Agenda</span></button>
            </form>
    `;

    document.getElementById('modalOverlay').classList.add('active');

    document.getElementById('addAgendaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert('Added to agenda!');
        closeModal();
    });

    tg.HapticFeedback.impactOccurred('medium');
}

console.log('City Law Firm Virtual Office initialized successfully!');
