
let tabHeaders = document.querySelectorAll('.tabheader__item'),
    tabContents = document.querySelectorAll('.tabcontent'),
    tabParent = document.querySelector('.tabheader__items');

function hideTabContent() {

    tabContents.forEach(item => {
        item.classList.add('hide');
        item.classList.remove('show', 'fade');
    });

    tabHeaders.forEach(item => {
        item.classList.remove('tabheader__item_active');
    });
}

function showTabContent(i = 0) {
    tabContents[i].classList.add('show', 'fade');
    tabContents[i].classList.remove('hide');
    tabHeaders[i].classList.add('tabheader__item_active');
}

hideTabContent();
showTabContent();

tabParent.addEventListener('click', function (event) {
    const target = event.target;
    if (target && target.classList.contains('tabheader__item')) {
        tabHeaders.forEach((item, i) => {
            if (target === item) {
                hideTabContent();
                showTabContent(i);
            }
        });
    }
});