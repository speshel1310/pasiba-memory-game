/**
 * Класс игры "Найди пару"
 * Реализует основную логику игры, управление карточками и проверку совпадений
 */
class MemoryGame {
    constructor() {
        // Инициализация основных элементов интерфейса
        this.gameBoard = document.querySelector('.game-board');
        this.restartBtn = document.getElementById('restart-btn');
        this.winMessage = document.getElementById('win-message');
        
        // Инициализация переменных состояния игры
        this.cards = [];               // Массив для хранения карточек
        this.flippedCards = [];        // Массив для хранения перевернутых карточек
        this.isLocked = false;         // Блокировка взаимодействия во время анимации
        this.matchedPairs = 0;         // Счетчик найденных пар
        
        // Пути к изображениям карточек
        this.cardValues = [
            'images/card1.webp',
            'images/card2.webp',
            'images/card3.webp',
            'images/card4.webp',
            'images/card5.webp',
            'images/card6.webp',
            'images/card7.webp',
            'images/card8.webp'
        ];
        
        // Инициализация игры и настройка копирования промокода
        this.init();
        this.setupPromoCodeCopy();
    }
    
    /**
     * Метод инициализации игры
     * Создает карточки и настраивает обработчики событий
     */
    init() {
        this.matchedPairs = 0;
        this.createCards();
        this.setupEventListeners();
    }
    
    /**
     * Создает и размещает карточки на игровом поле
     * Генерирует парные карточки с перемешиванием
     */
    createCards() {
        // Очищаем игровое поле
        this.gameBoard.innerHTML = '';
        this.cards = [];
        
        // Создаем пары карточек
        const values = [...this.cardValues, ...this.cardValues];
        
        // Перемешиваем карточки с помощью алгоритма Фишера-Йетса
        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }
        
        // Создаем элементы карточек и добавляем их на игровое поле
        values.forEach((value, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.value = value;
            card.dataset.index = index;
            
            // Создаем элемент изображения внутри карточки
            const img = document.createElement('img');
            img.src = value;
            img.alt = 'Карточка суши';
            img.loading = 'lazy'; // Оптимизация загрузки изображений
            card.appendChild(img);
            
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        });
    }
    
    /**
     * Настраивает обработчики событий для элементов игры
     */
    setupEventListeners() {
        // Добавляем обработчики нажатия на карточки
        this.cards.forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
        
        // Добавляем обработчик для кнопки перезапуска игры
        this.restartBtn.addEventListener('click', () => this.restart());
    }
    
    /**
     * Настраивает функциональность копирования промокода
     * Позволяет скопировать промокод в буфер обмена при клике
     */
    setupPromoCodeCopy() {
        const promoCode = document.getElementById('promo-code');
        const notification = document.getElementById('copy-notification');
        
        if (promoCode) {
            promoCode.addEventListener('click', () => {
                const textToCopy = promoCode.textContent;
                
                // Копируем текст в буфер обмена
                navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        // Показываем уведомление об успешном копировании
                        notification.classList.add('show');
                        
                        // Скрываем уведомление через 2 секунды
                        setTimeout(() => {
                            notification.classList.remove('show');
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Не удалось скопировать текст: ', err);
                    });
            });
        }
    }
    
    /**
     * Обрабатывает нажатие на карточку
     * @param {HTMLElement} card - Элемент карточки
     */
    flipCard(card) {
        // Проверяем, можно ли перевернуть карточку
        if (this.isLocked || 
            this.flippedCards.length === 2 || 
            card.classList.contains('flipped') ||
            card.classList.contains('matched')) {
            return;
        }
        
        // Переворачиваем карточку и добавляем в массив перевернутых
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        // Если перевернуто 2 карточки, проверяем совпадение
        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }
    
    /**
     * Проверяет совпадение двух перевернутых карточек
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.value === card2.dataset.value;
        
        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }
    
    /**
     * Обрабатывает ситуацию совпадения карточек
     * @param {HTMLElement} card1 - Первая карточка
     * @param {HTMLElement} card2 - Вторая карточка
     */
    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedPairs++;
        this.flippedCards = [];
        
        // Проверяем, все ли пары найдены
        if (this.matchedPairs === this.cardValues.length) {
            this.winMessage.classList.remove('hidden');
        }
    }
    
    /**
     * Обрабатывает ситуацию несовпадения карточек
     * @param {HTMLElement} card1 - Первая карточка
     * @param {HTMLElement} card2 - Вторая карточка
     */
    handleMismatch(card1, card2) {
        this.isLocked = true;
        
        // Через 1 секунду переворачиваем карточки обратно
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.isLocked = false;
            this.flippedCards = [];
        }, 1000);
    }
    
    /**
     * Перезапускает игру, сбрасывая состояние
     */
    restart() {
        // Скрываем сообщение о победе
        this.winMessage.classList.add('hidden');
        
        // Инициализируем игру заново
        this.init();
    }
}

// Запускаем игру при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
