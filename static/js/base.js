document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const nav_elements = document.querySelectorAll('.nav-link');
    nav_elements.forEach(e => {
        if(pathname == e.getAttribute('href')) {
            e.classList.add('active');
        }
    })
})


/*logica spin logo: da fare
const logo = document.getElementById('logo');
logo.addEventListener('mouseover', () => {
    spinLogo();
})*/