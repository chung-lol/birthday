/**
 * app.js — Khởi tạo ứng dụng, kết nối các module
 */

import {
  getAllPeople,
  addPerson,
  updatePerson,
  deletePerson,
  exportJSON,
  importJSON,
} from './store.js';

import {
  initUI,
  updatePeople,
  showToast,
  launchConfetti,
  updateStats,
} from './ui.js';

import {
  initModal,
  openAddModal,
  initDeleteModal,
} from './modal.js';

import {
  requestPermission,
  checkBirthdays,
  sendBirthdayNotifications,
  renderBanner,
} from './notifications.js';

import { daysUntilBirthday } from './utils.js';

/* ---- Khởi tạo App ---- */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Tải dữ liệu
  let people = getAllPeople();

  // 2. Khởi tạo UI
  initUI(people, handleDelete);

  // 3. Khởi tạo Modal thêm/sửa
  initModal(handleSave);
  initDeleteModal(() => {});

  // 4. FAB button
  document.getElementById('fab-add').addEventListener('click', openAddModal);

  // 5. Header "Thêm" button
  const headerAddBtn = document.getElementById('header-add-btn');
  if (headerAddBtn) headerAddBtn.addEventListener('click', openAddModal);

  // 6. Export / Import
  document.getElementById('btn-export').addEventListener('click', () => {
    exportJSON();
    showToast('Đã xuất dữ liệu thành công!', 'success');
  });

  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });

  document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await importJSON(file);
      people = getAllPeople();
      updatePeople(people);
      refreshNotifications(people);
      showToast(`Đã nhập ${result.imported} người mới! Tổng: ${result.total}`, 'success');
    } catch (err) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }

    // Reset input để có thể nhập lại cùng file
    e.target.value = '';
  });

  // 7. Close notification banner
  document.getElementById('banner-close').addEventListener('click', () => {
    document.getElementById('notification-banner').classList.remove('active');
  });

  // 8. Notifications
  refreshNotifications(people);

  // Xin quyền thông báo (delay nhẹ để UX tốt hơn)
  setTimeout(async () => {
    const perm = await requestPermission();
    if (perm === 'granted') {
      sendBirthdayNotifications(people);
    }
  }, 1500);

  // 9. Confetti nếu hôm nay có sinh nhật
  const hasToday = people.some(p => daysUntilBirthday(p.birthday) === 0);
  if (hasToday) {
    setTimeout(launchConfetti, 800);
  }

  // 10. Đăng ký Service Worker (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

/* ---- Handlers ---- */

function handleSave(person, isEdit) {
  if (isEdit) {
    updatePerson(person);
    showToast(`Đã cập nhật thông tin ${person.name}!`, 'success');
  } else {
    addPerson(person);
    showToast(`Đã thêm ${person.name}! 🎉`, 'success');
  }

  const people = getAllPeople();
  updatePeople(people);
  refreshNotifications(people);
}

function handleDelete(id) {
  const people_before = getAllPeople();
  const person = people_before.find(p => p.id === id);
  deletePerson(id);
  const people = getAllPeople();
  updatePeople(people);
  refreshNotifications(people);
  showToast(`Đã xóa ${person ? person.name : 'người này'}`, 'info');
}

function refreshNotifications(people) {
  const upcoming = checkBirthdays(people);
  renderBanner(upcoming);
  updateStats();
}
