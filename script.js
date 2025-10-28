// ========================================
// DOM Elements
// ========================================
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const weekButtons = document.querySelectorAll('.week-btn');
const weekContents = document.querySelectorAll('.week-content');
const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
const scoreInputs = document.querySelectorAll('.score-input');

// ========================================
// Navigation System
// ========================================
function initNavigation() {
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');

            // Remove active class from all buttons and sections
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked button and target section
            button.classList.add('active');
            document.getElementById(targetSection).classList.add('active');

            // Save current section to localStorage
            localStorage.setItem('currentSection', targetSection);

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Load saved section on page load
    const savedSection = localStorage.getItem('currentSection');
    if (savedSection) {
        const targetButton = document.querySelector(`[data-section="${savedSection}"]`);
        const targetSection = document.getElementById(savedSection);

        if (targetButton && targetSection) {
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            targetButton.classList.add('active');
            targetSection.classList.add('active');
        }
    }
}

// ========================================
// Week Selector System (Phase 1)
// ========================================
function initWeekSelector() {
    weekButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetWeek = button.getAttribute('data-week');

            // Remove active class from all week buttons and contents
            weekButtons.forEach(btn => btn.classList.remove('active'));
            weekContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and target content
            button.classList.add('active');
            document.getElementById(`week-${targetWeek}`).classList.add('active');

            // Save current week to localStorage
            localStorage.setItem('currentWeek', targetWeek);
        });
    });

    // Load saved week on page load
    const savedWeek = localStorage.getItem('currentWeek');
    if (savedWeek) {
        const targetButton = document.querySelector(`[data-week="${savedWeek}"]`);
        const targetContent = document.getElementById(`week-${savedWeek}`);

        if (targetButton && targetContent) {
            weekButtons.forEach(btn => btn.classList.remove('active'));
            weekContents.forEach(content => content.classList.remove('active'));

            targetButton.classList.add('active');
            targetContent.classList.add('active');
        }
    }
}

// ========================================
// Daily Checklist System
// ========================================
function initChecklist() {
    // Load checklist state from localStorage
    loadChecklistState();

    // Add event listeners to checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', saveChecklistState);
    });

    // Check if it's a new day and reset checklist
    checkAndResetDaily();
}

function saveChecklistState() {
    const checklistState = {};
    checkboxes.forEach(checkbox => {
        checklistState[checkbox.id] = checkbox.checked;
    });

    localStorage.setItem('checklistState', JSON.stringify(checklistState));
    localStorage.setItem('checklistDate', new Date().toDateString());
}

function loadChecklistState() {
    const savedState = localStorage.getItem('checklistState');
    if (savedState) {
        const checklistState = JSON.parse(savedState);
        checkboxes.forEach(checkbox => {
            if (checklistState[checkbox.id] !== undefined) {
                checkbox.checked = checklistState[checkbox.id];
            }
        });
    }
}

function checkAndResetDaily() {
    const savedDate = localStorage.getItem('checklistDate');
    const currentDate = new Date().toDateString();

    // If it's a new day, reset checklist
    if (savedDate !== currentDate) {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        saveChecklistState();
    }
}

function resetChecklist() {
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    saveChecklistState();

    // Show confirmation
    showNotification('✅ Checklist ได้ถูกรีเซ็ตเรียบร้อยแล้ว!');
}

// ========================================
// Progress Tracker System
// ========================================
function initProgressTracker() {
    // Load progress data
    loadProgressData();

    // Add event listeners to score inputs
    scoreInputs.forEach(input => {
        input.addEventListener('change', () => {
            // Ensure value is between 1-10
            if (input.value < 1) input.value = 1;
            if (input.value > 10) input.value = 10;
        });
    });
}

function loadProgressData() {
    const savedProgress = localStorage.getItem('progressData');
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        scoreInputs.forEach(input => {
            const week = input.getAttribute('data-week');
            if (progressData[`week${week}`] !== undefined) {
                input.value = progressData[`week${week}`];
            }
        });
    }
}

function saveProgress() {
    const progressData = {};
    let allFilled = true;

    scoreInputs.forEach(input => {
        const week = input.getAttribute('data-week');
        const value = input.value;

        if (value) {
            progressData[`week${week}`] = value;
        } else {
            allFilled = false;
        }
    });

    localStorage.setItem('progressData', JSON.stringify(progressData));

    // Calculate average score
    const scores = Object.values(progressData).map(Number);
    const average = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;

    // Show success message with stats
    showNotification(`✅ บันทึกความก้าวหน้าเรียบร้อย!\n📊 คะแนนเฉลี่ย: ${average}/10\n📝 สัปดาห์ที่บันทึก: ${scores.length}/12`);
}

// ========================================
// Notification System
// ========================================
function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        white-space: pre-line;
        font-weight: 600;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========================================
// Smooth Scroll for Internal Links
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Progress Statistics
// ========================================
function calculateStats() {
    const savedProgress = localStorage.getItem('progressData');
    if (!savedProgress) return null;

    const progressData = JSON.parse(savedProgress);
    const scores = Object.values(progressData).map(Number);

    if (scores.length === 0) return null;

    const sum = scores.reduce((a, b) => a + b, 0);
    const average = (sum / scores.length).toFixed(1);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    return {
        average,
        max,
        min,
        completed: scores.length,
        total: 12
    };
}

// ========================================
// Keyboard Shortcuts
// ========================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + number keys to switch sections
        if (e.altKey && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            const index = parseInt(e.key) - 1;
            const buttons = Array.from(navButtons);
            if (buttons[index]) {
                buttons[index].click();
            }
        }

        // Alt + R to reset checklist
        if (e.altKey && e.key.toLowerCase() === 'r') {
            e.preventDefault();
            resetChecklist();
        }

        // Alt + S to save progress
        if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveProgress();
        }
    });
}

// ========================================
// Print Preparation
// ========================================
function initPrintPrep() {
    window.addEventListener('beforeprint', () => {
        // Show all sections for printing
        sections.forEach(section => {
            section.style.display = 'block';
        });
    });

    window.addEventListener('afterprint', () => {
        // Restore original display
        sections.forEach(section => {
            if (!section.classList.contains('active')) {
                section.style.display = 'none';
            }
        });
    });
}

// ========================================
// Local Storage Management
// ========================================
function clearAllData() {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        localStorage.clear();
        location.reload();
    }
}

// ========================================
// Export Data Function
// ========================================
function exportData() {
    const data = {
        checklist: JSON.parse(localStorage.getItem('checklistState') || '{}'),
        progress: JSON.parse(localStorage.getItem('progressData') || '{}'),
        currentSection: localStorage.getItem('currentSection'),
        currentWeek: localStorage.getItem('currentWeek'),
        checklistDate: localStorage.getItem('checklistDate'),
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `english-practice-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showNotification('✅ ส่งออกข้อมูลเรียบร้อยแล้ว!');
}

// ========================================
// Import Data Function
// ========================================
function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (data.checklist) {
                localStorage.setItem('checklistState', JSON.stringify(data.checklist));
            }
            if (data.progress) {
                localStorage.setItem('progressData', JSON.stringify(data.progress));
            }
            if (data.currentSection) {
                localStorage.setItem('currentSection', data.currentSection);
            }
            if (data.currentWeek) {
                localStorage.setItem('currentWeek', data.currentWeek);
            }
            if (data.checklistDate) {
                localStorage.setItem('checklistDate', data.checklistDate);
            }

            showNotification('✅ นำเข้าข้อมูลเรียบร้อยแล้ว!');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            showNotification('❌ เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
        }
    };
    reader.readAsText(file);
}

// ========================================
// Dark Mode Toggle (Bonus Feature)
// ========================================
function initDarkMode() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    showNotification(isDark ? '🌙 เปิดโหมดมืด' : '☀️ ปิดโหมดมืด');
}

// ========================================
// Initialize Everything
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWeekSelector();
    initChecklist();
    initProgressTracker();
    initSmoothScroll();
    initKeyboardShortcuts();
    initPrintPrep();
    initDarkMode();

    // Show welcome message on first visit
    if (!localStorage.getItem('hasVisited')) {
        setTimeout(() => {
            showNotification('👋 ยินดีต้อนรับสู่ตารางฝึกภาษาอังกฤษ 12 สัปดาห์!\n\n💡 เคล็ดลับ: ใช้ Alt+1-6 เพื่อสลับหน้า');
            localStorage.setItem('hasVisited', 'true');
        }, 1000);
    }
});

// ========================================
// Share Website Function
// ========================================
async function shareWebsite() {
    const shareData = {
        title: 'ตารางฝึกภาษาอังกฤษแบบเข้มข้น 12 สัปดาห์',
        text: 'โปรแกรมฝึกภาษาอังกฤษแบบเข้มข้น 12 สัปดาห์ ครอบคลุมทักษะทั้ง 4 ด้าน ฟรี!',
        url: 'https://bowornpem.github.io/EnglishPractics/'
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showNotification('✅ แชร์สำเร็จแล้ว!');
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(shareData.url);
            showNotification('📋 คัดลอกลิงก์แล้ว!\n' + shareData.url);
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                showNotification('📋 คัดลอกลิงก์แล้ว!\n' + shareData.url);
            } catch (clipboardErr) {
                showNotification('❌ ไม่สามารถแชร์ได้');
            }
        }
    }
}

// ========================================
// Handle Import File Function
// ========================================
function handleImportFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            // Validate data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }

            // Import data
            if (data.checklist) {
                localStorage.setItem('checklistState', JSON.stringify(data.checklist));
            }
            if (data.progress) {
                localStorage.setItem('progressData', JSON.stringify(data.progress));
            }
            if (data.currentSection) {
                localStorage.setItem('currentSection', data.currentSection);
            }
            if (data.currentWeek) {
                localStorage.setItem('currentWeek', data.currentWeek);
            }
            if (data.checklistDate) {
                localStorage.setItem('checklistDate', data.checklistDate);
            }

            showNotification('✅ นำเข้าข้อมูลสำเร็จ!\nกำลังโหลดหน้าใหม่...');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error('Import error:', error);
            showNotification('❌ ไฟล์ไม่ถูกต้อง!\nกรุณาเลือกไฟล์ backup ที่ถูกต้อง');
        }
    };

    reader.onerror = () => {
        showNotification('❌ ไม่สามารถอ่านไฟล์ได้');
    };

    reader.readAsText(file);
}

// ========================================
// Install PWA Prompt
// ========================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install notification after 10 seconds
    setTimeout(() => {
        showNotification('💡 ติดตั้งแอปนี้บนอุปกรณ์ของคุณได้!\nคลิกที่ปุ่ม "ติดตั้ง" ในเบราว์เซอร์');
    }, 10000);
});

window.addEventListener('appinstalled', () => {
    showNotification('✅ ติดตั้งแอปสำเร็จ!\nตอนนี้คุณสามารถใช้งานแบบออฟไลน์ได้');
    deferredPrompt = null;
});

// ========================================
// Expose Functions to Global Scope
// ========================================
window.resetChecklist = resetChecklist;
window.saveProgress = saveProgress;
window.clearAllData = clearAllData;
window.exportData = exportData;
window.importData = importData;
window.toggleDarkMode = toggleDarkMode;
window.calculateStats = calculateStats;
window.shareWebsite = shareWebsite;
window.handleImportFile = handleImportFile;
