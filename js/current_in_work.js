window.addEventListener('DOMContentLoaded', function () {

    // Tabs

    let tabs = document.querySelectorAll('.tabheader__item'),
        tabContents = document.querySelectorAll('.tabcontent'),
        tabContainer = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabContents.forEach(content => {
            content.classList.add('hide');
            content.classList.remove('show', 'fade');
        });

        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(index = 0) {
        tabContents[index].classList.add('show', 'fade');
        tabContents[index].classList.remove('hide');
        tabs[index].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabContainer.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((tab, i) => {
                if (target === tab) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    // Timer

    const deadline = '2025-01-11';

    function getTimeRemaining(endtime) {
        const total = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(total / (1000 * 60 * 60 * 24)),
            hours = Math.floor((total / (1000 * 60 * 60)) % 24),
            minutes = Math.floor((total / 1000 / 60) % 60),
            seconds = Math.floor((total / 1000) % 60);

        return {
            total,
            days,
            hours,
            minutes,
            seconds
        };
    }

    function addLeadingZero(num) {
        return num < 10 ? '0' + num : num;
    }

    function initializeClock(selector, endtime) {
        const clock = document.querySelector(selector),
            daysSpan = clock.querySelector('#days'),
            hoursSpan = clock.querySelector('#hours'),
            minutesSpan = clock.querySelector('#minutes'),
            secondsSpan = clock.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        function updateClock() {
            const time = getTimeRemaining(endtime);

            daysSpan.innerHTML = addLeadingZero(time.days);
            hoursSpan.innerHTML = addLeadingZero(time.hours);
            minutesSpan.innerHTML = addLeadingZero(time.minutes);
            secondsSpan.innerHTML = addLeadingZero(time.seconds);

            if (time.total <= 0) {
                clearInterval(timeInterval);
            }
        }

        updateClock();
    }

    initializeClock('.timer', deadline);

    // Modal

    const modalTriggers = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == "") {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 300000);

    function showModalOnScroll() {
        if (window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalOnScroll);
        }
    }

    window.addEventListener('scroll', showModalOnScroll);
}