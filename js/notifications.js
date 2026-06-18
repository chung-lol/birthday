/**
 * notifications.js — Browser Notification API + Banner nội app
 */

import { daysUntilBirthday } from './utils.js';

/**
 * Xin quyền thông báo
 */
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  const perm = await Notification.requestPermission();
  return perm;
}

/**
 * Gửi thông báo trình duyệt
 */
export function sendBrowserNotification(title, body, icon = '🎂') {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: 'assets/icons/icon-192.png',
      badge: 'assets/icons/icon-192.png',
      tag: 'birthday-reminder',
    });
  } catch {}
}

/**
 * Kiểm tra và hiển thị thông báo sinh nhật
 * @param {Array} people
 * @returns {Array} danh sách sinh nhật sắp tới (7 ngày)
 */
export function checkBirthdays(people) {
  const upcoming = [];

  for (const person of people) {
    const days = daysUntilBirthday(person.birthday);
    if (days <= 7) {
      upcoming.push({ ...person, daysLeft: days });
    }
  }

  // Sắp xếp: gần nhất trước
  upcoming.sort((a, b) => a.daysLeft - b.daysLeft);
  return upcoming;
}

/**
 * Gửi thông báo trình duyệt cho sinh nhật hôm nay / ngày mai
 */
export function sendBirthdayNotifications(people) {
  const today    = people.filter(p => daysUntilBirthday(p.birthday) === 0);
  const tomorrow = people.filter(p => daysUntilBirthday(p.birthday) === 1);

  for (const p of today) {
    sendBrowserNotification(
      `🎂 Hôm nay là sinh nhật ${p.name}!`,
      `Đừng quên gửi lời chúc mừng sinh nhật đến ${p.name} nhé! 🎉`
    );
  }

  for (const p of tomorrow) {
    sendBrowserNotification(
      `⏰ Ngày mai sinh nhật ${p.name}`,
      `Chuẩn bị lời chúc mừng sinh nhật cho ${p.name} nhé!`
    );
  }
}

/**
 * Render notification banner trong app
 */
export function renderBanner(upcoming) {
  const banner = document.getElementById('notification-banner');
  const list   = document.getElementById('notification-list');
  if (!banner || !list) return;

  if (upcoming.length === 0) {
    banner.classList.remove('active');
    return;
  }

  list.innerHTML = '';

  for (const person of upcoming.slice(0, 5)) {
    const li = document.createElement('li');
    li.className = 'notification-banner__item';

    let badgeClass = 'badge-soon';
    let badgeText  = `Còn ${person.daysLeft} ngày`;

    if (person.daysLeft === 0) {
      badgeClass = 'badge-today';
      badgeText  = 'Hôm nay! 🎉';
    } else if (person.daysLeft === 1) {
      badgeClass = 'badge-tomorrow';
      badgeText  = 'Ngày mai';
    }

    li.innerHTML = `
      <span>${person.emoji || '🎂'}</span>
      <span>${person.name}</span>
      <span class="badge ${badgeClass}">${badgeText}</span>
    `;
    list.appendChild(li);
  }

  if (upcoming.length > 5) {
    const li = document.createElement('li');
    li.className = 'notification-banner__item';
    li.style.color = 'var(--text-muted)';
    li.textContent = `... và ${upcoming.length - 5} người khác`;
    list.appendChild(li);
  }

  banner.classList.add('active');
}
