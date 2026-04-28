document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const nav_elements = document.querySelectorAll('.nav-link');
    nav_elements.forEach(e => {
        if(pathname == e.getAttribute('href')) {
            e.classList.add('active');
        }
    })

    const logo = document.querySelectorAll('.logo');

    logo.forEach(logo => {
        logo.addEventListener('mouseover', () => {
            logo.style.animation = 'rotate 2s infinite linear';
        })

        logo.addEventListener('mouseout', () => {
            setTimeout(() => {
                logo.style.animation = "";
            }, 500);
        })
    })    
})


