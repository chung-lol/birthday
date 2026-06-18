/**
 * modal.js — Modal thêm / sửa liên hệ + confirm xóa
 */

import { generateId }  from './utils.js';
import { showToast }   from './ui.js';

const EMOJIS = [
  '👩','👨','👧','👦','👵','👴','👶','🧑','👩‍💼','👨‍💼',
  '👩‍🍳','👨‍🍳','👩‍🎨','👨‍🎨','👩‍💻','👨‍💻','🧑‍🎓','🧑‍🏫',
  '🐱','🐶','🐼','🐨','🦄','🐸','🐙','🐬','🐻','🦊',
  '🌟','💫','⭐','🌈','🎵','🎸','⚽','🏆','🎮','📚',
];

let onSave   = null;
let editMode = false;
let editId   = null;

/**
 * Khởi tạo modal
 */
export function initModal(onSaveCallback) {
  onSave = onSaveCallback;

  // Form submit
  document.getElementById('person-form').addEventListener('submit', handleFormSubmit);

  // Close buttons
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

  // Backdrop click
  document.getElementById('person-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('person-modal')) closeModal();
  });

  // Emoji picker
  renderEmojiPicker();
}

/**
 * Render emoji picker
 */
function renderEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  if (!picker) return;
  picker.innerHTML = '';

  EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-option';
    btn.textContent = emoji;
    btn.setAttribute('data-emoji', emoji);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('selected-emoji').value = emoji;
    });
    picker.appendChild(btn);
  });
}

/**
 * Mở modal thêm mới
 */
export function openAddModal() {
  editMode = false;
  editId   = null;

  document.getElementById('modal-title').textContent   = 'Thêm người mới';
  document.getElementById('modal-header-icon').textContent = '🎂';
  document.getElementById('person-form').reset();
  document.getElementById('selected-emoji').value = '🎂';

  // Reset emoji selection
  document.querySelectorAll('.emoji-option').forEach(b => b.classList.remove('selected'));
  const firstEmoji = document.querySelector('.emoji-option');
  if (firstEmoji) firstEmoji.classList.add('selected');

  document.getElementById('person-modal').classList.add('open');
  setTimeout(() => document.getElementById('field-name').focus(), 100);
}

/**
 * Mở modal sửa
 */
export function openEditModal(person) {
  editMode = true;
  editId   = person.id;

  document.getElementById('modal-title').textContent   = 'Chỉnh sửa';
  document.getElementById('modal-header-icon').textContent = '✏️';

  // Điền dữ liệu vào form
  document.getElementById('field-name').value     = person.name     || '';
  document.getElementById('field-birthday').value = person.birthday || '';
  document.getElementById('field-group').value    = person.group    || 'friend';
  document.getElementById('field-note').value     = person.note     || '';
  document.getElementById('selected-emoji').value = person.emoji    || '🎂';

  // Highlight emoji
  document.querySelectorAll('.emoji-option').forEach(b => {
    b.classList.toggle('selected', b.dataset.emoji === person.emoji);
  });

  document.getElementById('person-modal').classList.add('open');
  setTimeout(() => document.getElementById('field-name').focus(), 100);
}

/**
 * Đóng modal
 */
export function closeModal() {
  document.getElementById('person-modal').classList.remove('open');
}

/**
 * Xử lý submit form
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const name     = document.getElementById('field-name').value.trim();
  const birthday = document.getElementById('field-birthday').value;
  const group    = document.getElementById('field-group').value;
  const note     = document.getElementById('field-note').value.trim();
  const emoji    = document.getElementById('selected-emoji').value || '🎂';

  if (!name) {
    showToast('Vui lòng nhập tên!', 'error');
    document.getElementById('field-name').focus();
    return;
  }

  if (!birthday) {
    showToast('Vui lòng chọn ngày sinh!', 'error');
    document.getElementById('field-birthday').focus();
    return;
  }

  const person = {
    id:       editMode ? editId : generateId(),
    name,
    birthday,
    group,
    note,
    emoji,
    createdAt: editMode ? undefined : new Date().toISOString(),
  };

  if (!editMode) delete person.createdAt;
  if (!editMode) person.createdAt = new Date().toISOString();

  closeModal();

  if (onSave) onSave(person, editMode);
}

/* -------- Delete Confirm Modal -------- */

let onConfirmDelete = null;

export function initDeleteModal(onConfirmCallback) {
  onConfirmDelete = onConfirmCallback;

  document.getElementById('confirm-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (onConfirmDelete) onConfirmDelete();
    closeDeleteModal();
  });

  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('confirm-modal')) closeDeleteModal();
  });
}

export function openDeleteModal(person, onConfirm) {
  onConfirmDelete = onConfirm;
  document.getElementById('confirm-name').textContent = person.name;
  document.getElementById('confirm-modal').classList.add('open');
}

export function closeDeleteModal() {
  document.getElementById('confirm-modal').classList.remove('open');
}
