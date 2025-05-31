/**
 * Основной JavaScript файл для Jade Mandarin
 * Содержит общую логику для всех страниц
 * Для использования в других модулях import { formatDate, fetchWithToken } from './main.js';
 */

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
const API_URL = 'https://api.jademandarin.com/v1';
const USER_TOKEN = localStorage.getItem('authToken');

// ===== DOM-ЭЛЕМЕНТЫ =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');
const logoutBtn = document.querySelector('.logout-btn');

// ===== ОБЩИЕ ФУНКЦИИ =====

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
  if (!mobileMenuBtn) return;

  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });
}

/**
 * Выход из системы
 */
function handleLogout() {
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${USER_TOKEN}`
          }
        });
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }
}

/**
 * Загрузка данных пользователя
 */
async function loadUserData() {
  if (!USER_TOKEN) return;

  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateUserUI(data);
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

/**
 * Обновление интерфейса пользователя
 */
function updateUserUI(userData) {
  const avatarElements = document.querySelectorAll('.user-avatar');
  const nameElements = document.querySelectorAll('.user-name');

  // Обновляем аватар и имя
  avatarElements.forEach(el => {
    el.textContent = userData.initials || 'JD';
    if (userData.avatarUrl) {
      el.style.backgroundImage = `url(${userData.avatarUrl})`;
    }
  });

  nameElements.forEach(el => {
    el.textContent = userData.fullName || 'Пользователь';
  });
}

/**
 * Показ уведомлений
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    notification.addEventListener('animationend', () => {
      notification.remove();
    });
  }, 3000);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====

// Закрытие мобильного меню при клике вне его
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
    sidebar.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  }
});

// Плавная прокрутка для внутренних ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
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

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  handleLogout();
  loadUserData();

  // Анимация загрузки
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 300);
});

// ===== УТИЛИТЫ =====
export function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
}

export async function fetchWithToken(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${USER_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}