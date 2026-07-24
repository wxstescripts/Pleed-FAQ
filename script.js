const elements = document.querySelectorAll(
    ".card, .stat, .cta"
);


const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add("show");

            }

        });

    },
    {
        threshold: 0.15
    }
);



elements.forEach(element => {

    element.classList.add("hidden");

    observer.observe(element);

});
