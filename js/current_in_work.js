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

    // Using classes to create menu cards

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 1;
            this.convertToUSD();
        }

        convertToUSD() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Price:</div>
                    <div class="menu__item-total"><span>${this.price}</span> $</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    fetch('http://localhost:3000/server.php?type=menu')
        .then(response => response.json())
        .then(data => {
            data.forEach(({img, altimg, title, descr, price}) => {
                new MenuCard(img, altimg, title, descr, price, ".menu .container").render();
            });
        });

    // Forms

    const forms = document.querySelectorAll('form');
    const messages = {
        loading: 'img/form/spinner.svg',
        success: 'Thank you! We will contact you soon',
        failure: 'Something went wrong...'
    };

    forms.forEach(form => {
        bindFormSubmission(form);
    });

    const postData = async (url, data) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        return await response.json();
    };

    async function fetchResource(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Could not fetch ${url}, status: ${response.status}`);
        }

        return await response.json();
    }

    function bindFormSubmission(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = messages.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);

            const formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/server.php', json)
                .then(data => {
                    console.log(data);
                    showThanksModal(messages.success);
                    statusMessage.remove();
                }).catch(() => {
                showThanksModal(messages.failure);
            }).finally(() => {
                form.reset();
            });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    // Slider

    let offset = 0;
    let slideIndex = 1;

    const slides = document.querySelectorAll('.offer__slide'),
        slider = document.querySelector('.offer__slider'),
        prev = document.querySelector('.offer__slider-prev'),
        next = document.querySelector('.offer__slider-next'),
        total = document.querySelector('#total'),
        current = document.querySelector('#current'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        width = window.getComputedStyle(slidesWrapper).width,
        slidesField = document.querySelector('.offer__slider-inner');

    if (slides.length < 10) {
        total.textContent = `0${slides.length}`;
        current.textContent = `0${slideIndex}`;
    } else {
        total.textContent = slides.length;
        current.textContent = slideIndex;
    }

    slidesField.style.width = 100 * slides.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s all';

    slidesWrapper.style.overflow = 'hidden';

    slides.forEach(slide => {
        slide.style.width = width;
    });

    slider.style.position = 'relative';

    const indicators = document.createElement('ol'),
        dots = [];
    indicators.classList.add('carousel-indicators');
    indicators.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;
    slider.append(indicators);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;
        if (i === 0) {
            dot.style.opacity = 1;
        }
        indicators.append(dot);
        dots.push(dot);
    }

    next.addEventListener('click', () => {
        if (offset === (parseWidth(width) * (slides.length - 1))) {
            offset = 0;
        } else {
            offset += parseWidth(width);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex === slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        updateSliderCounter();
        updateDots();
    });

    prev.addEventListener('click', () => {
        if (offset === 0) {
            offset = parseWidth(width) * (slides.length - 1);
        } else {
            offset -= parseWidth(width);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex === 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }

        updateSliderCounter();
        updateDots();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = parseWidth(width) * (slideTo - 1);

            slidesField.style.transform = `translateX(-${offset}px)`;

            updateSliderCounter();
            updateDots();
        });
    });

    function parseWidth(str) {
        return +str.replace(/\D/g, '');
    }

    function updateSliderCounter() {
        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    }

    function updateDots() {
        dots.forEach(dot => dot.style.opacity = ".5");
        dots[slideIndex - 1].style.opacity = 1;
    }

    // Calculator

    const result = document.querySelector('.calculating__result span');

    let gender, height, weight, age, activityRatio;

    if (localStorage.getItem('gender')) {
        gender = localStorage.getItem('gender');
    } else {
        gender = 'female';
        localStorage.setItem('gender', 'female');
    }

    if (localStorage.getItem('activityRatio')) {
        activityRatio = localStorage.getItem('activityRatio');
    } else {
        activityRatio = 1.375;
        localStorage.setItem('activityRatio', 1.375);
    }

    function calculateTotal() {
        if (!gender || !height || !weight || !age || !activityRatio) {
            result.textContent = '____';
            return;
        }
        if (gender === 'female') {
            result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * activityRatio);
        } else {
            result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * activityRatio);
        }
    }

    calculateTotal();

    function initializeLocalSettings(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            element.classList.remove(activeClass);
            if (element.getAttribute('id') === localStorage.getItem('gender')) {
                element.classList.add(activeClass);
            }
            if (element.getAttribute('data-ratio') === localStorage.getItem('activityRatio')) {
                element.classList.add(activeClass);
            }
        });
    }

    initializeLocalSettings('#gender div', 'calculating__choose-item_active');
    initializeLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

    function handleStaticInformation(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            element.addEventListener('click', (e) => {
                if (e.target.getAttribute('data-ratio')) {
                    activityRatio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('activityRatio', +e.target.getAttribute('data-ratio'));
                } else {
                    gender = e.target.getAttribute('id');
                    localStorage.setItem('gender', e.target.getAttribute('id'));
                }

                elements.forEach(elem => elem.classList.remove(activeClass));
                e.target.classList.add(activeClass);

                calculateTotal();
            });
        });
    }

    handleStaticInformation('#gender div', 'calculating__choose-item_active');
    handleStaticInformation('.calculating__choose_big div', 'calculating__choose-item_active');

    function handleDynamicInformation(selector) {
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {
            if (input.value.match(/\D/g)) {
                input.style.border = "1px solid red";
            } else {
                input.style.border = 'none';
            }

            switch (input.getAttribute('id')) {
                case "height":
                    height = +input.value;
                    break;
                case "weight":
                    weight = +input.value;
                    break;
                case "age":
                    age = +input.value;
                    break;
            }

            calculateTotal();
        });
    }

    handleDynamicInformation('#height');
    handleDynamicInformation('#weight');
    handleDynamicInformation('#age');

});
