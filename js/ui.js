/**
 * ui.js — Render UI, filter, sort, toast, confetti
 */

import {
  daysUntilBirthday,
  formatBirthday,
  calcAge,
  calcNextAge,
  getGroupInfo,
  searchFilter,
  groupFilter,
  timeFilter,
  sortByUpcoming,
  debounce,
  getZodiac,
} from './utils.js';

import { openEditModal, openDeleteModal } from './modal.js';

// State bộ lọc hiện tại
const state = {
  search:    '',
  group:     'all',
  time:      'all',
};

let allPeople = [];
let onDeleteFn = null;

/**
 * Khởi tạo UI
 */
export function initUI(people, onDelete) {
  allPeople  = people;
  onDeleteFn = onDelete;

  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', debounce((e) => {
    state.search = e.target.value;
    renderPeople();
  }, 250));

  // Group filter chips
  document.querySelectorAll('[data-group]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-group]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.group = chip.dataset.group;
      renderPeople();
    });
  });

  // Time filter chips
  document.querySelectorAll('[data-time]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-time]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.time = chip.dataset.time;
      renderPeople();
    });
  });

  renderPeople();
  updateStats();
}

/**
 * Cập nhật danh sách và re-render
 */
export function updatePeople(people) {
  allPeople = people;
  renderPeople();
  updateStats();
}

/**
 * Áp dụng filter và render cards
 */
export function renderPeople() {
  let filtered = allPeople;
  filtered = searchFilter(filtered, state.search);
  filtered = groupFilter(filtered, state.group);
  filtered = timeFilter(filtered, state.time);
  filtered = sortByUpcoming(filtered);

  const grid = document.getElementById('people-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">🔍</span>
        <p class="empty-state__title">Không tìm thấy ai</p>
        <p class="empty-state__desc">Thử thay đổi bộ lọc hoặc thêm người mới!</p>
      </div>
    `;
    return;
  }

  filtered.forEach((person, index) => {
    const card = createPersonCard(person, index);
    grid.appendChild(card);
  });
}

/**
 * Tạo person card element
 */
function createPersonCard(person, index) {
  const days     = daysUntilBirthday(person.birthday);
  const groupInfo = getGroupInfo(person.group);
  const age       = calcAge(person.birthday);
  const nextAge   = calcNextAge(person.birthday);
  const zodiac    = getZodiac(person.birthday);

  const isToday    = days === 0;
  const isTomorrow = days === 1;
  const isSoon     = days <= 7 && days > 1;

  let cardClass = 'person-card anim-card-in';
  if (isToday)    cardClass += ' is-today';
  else if (isSoon || isTomorrow) cardClass += ' is-soon';

  let countdownBadgeClass = 'normal';
  let countdownNum        = days;
  let countdownLabel      = 'ngày nữa';

  if (isToday) {
    countdownBadgeClass = 'today';
    countdownNum        = '🎉';
    countdownLabel      = 'Hôm nay!';
  } else if (isTomorrow) {
    countdownBadgeClass = 'tomorrow';
    countdownNum        = '1';
    countdownLabel      = 'ngày nữa';
  } else if (isSoon) {
    countdownBadgeClass = 'soon';
  }

  const ageText = nextAge ? `${nextAge} tuổi` : '';
  const formattedBD = formatBirthday(person.birthday);

  const card = document.createElement('div');
  card.className = cardClass;
  card.style.animationDelay = `${index * 0.05}s`;
  card.dataset.id = person.id;

  card.innerHTML = `
    <div class="card-top">
      <div class="card-avatar">${person.emoji || '🎂'}</div>
      <div class="card-info">
        <div class="card-name">${escapeHtml(person.name)}</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">
          <span class="card-group group-${person.group}" style="margin-top: 0;">
            ${groupInfo.icon} ${groupInfo.label}
          </span>
          <span class="card-group group-zodiac" style="margin-top: 0;">
            ${zodiac.emoji} ${zodiac.name}
          </span>
        </div>
      </div>
      <div class="card-countdown">
        <div class="countdown-badge ${countdownBadgeClass}">
          <span class="countdown-badge__num">${countdownNum}</span>
          <span class="countdown-badge__label">${countdownLabel}</span>
        </div>
      </div>
    </div>

    <div class="card-details">
      <div class="card-detail-row">
        <span class="icon">🎂</span>
        <span>${formattedBD}${ageText ? ` · <strong>${ageText}</strong>` : ''}</span>
      </div>
      ${person.note ? `<div class="card-note">📝 ${escapeHtml(person.note)}</div>` : ''}
    </div>

    <div class="card-actions">
      <button class="btn-card edit" data-id="${person.id}">✏️ Sửa</button>
      <button class="btn-card delete" data-id="${person.id}">🗑️ Xóa</button>
    </div>
  `;

  // Edit button
  card.querySelector('.btn-card.edit').addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(person);
  });

  // Delete button
  card.querySelector('.btn-card.delete').addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteModal(person, () => {
      if (onDeleteFn) {
        // Animate out
        card.classList.add('deleting');
        setTimeout(() => onDeleteFn(person.id), 350);
      }
    });
  });

  return card;
}

/**
 * Cập nhật stats bar
 */
export function updateStats() {
  const total   = allPeople.length;
  const today   = allPeople.filter(p => daysUntilBirthday(p.birthday) === 0).length;
  const week    = allPeople.filter(p => daysUntilBirthday(p.birthday) <= 7).length;
  const month   = allPeople.filter(p => daysUntilBirthday(p.birthday) <= 30).length;

  setStatText('stat-total',  total);
  setStatText('stat-today',  today);
  setStatText('stat-week',   week);
  setStatText('stat-month',  month);

  // Update badge trong title
  const badge = document.getElementById('header-badge');
  if (badge) {
    if (week > 0) {
      badge.textContent = week;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function setStatText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ---- Toast Notification ---- */

export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast__msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ---- Confetti ---- */

export function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#FF6B9D','#9B5DE5','#FFD166','#06D6A0','#00BBF9','#FF9A3C'];
  const pieces = [];

  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      r: Math.random() * 10 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 4 + 2,
      spin:  Math.random() * 0.3 - 0.15,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of pieces) {
      p.y     += p.speed;
      p.angle += p.spin;
      p.x     += Math.sin(p.angle) * 1.5;

      if (p.y < canvas.height + 20) alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      }
      ctx.restore();
    }

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();

  // Tự dọn sau 5 giây
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

/* ---- Helper ---- */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
