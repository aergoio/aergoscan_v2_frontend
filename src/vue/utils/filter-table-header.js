export function openTableHeaderMenu (event) {
    event.target.closest('th.menu-th').classList.toggle('show');
    setTimeout(function () {
        document.addEventListener('click', closeTableHeaderMenu);
    }, 500);
}

export function closeTableHeaderMenu (event) {
    document.removeEventListener('click', closeTableHeaderMenu);
    var menuThEls = document.getElementsByClassName('menu-th');
    for (var i=0; i<menuThEls.length; i+=1) {
        menuThEls[i].classList.remove('show');
    }
}
