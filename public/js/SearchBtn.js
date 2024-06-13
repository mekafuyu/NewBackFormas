function filterBySearch(){
    const inputSearch = document.getElementById('searchInput');
    const filter = inputSearch.value.toLowerCase();
    const cardprocess = document.getElementsByClassName('card');

    for (let i = 0; i < cardprocess.length; i++){
        const card = cardprocess[i];
        const cardContent = card.textContent || card.innerText;
        const words = cardContent.toLowerCase().split(/\s+/);

        let match = false;
        for (let j = 0; j < words.length; j++) {
            if (words[j].indexOf(filter) > -1) {
                match = true;
                break;
            }
        }

        if(match)
            card.style.display = "";
        else
            card.style.display = "none";
    }   
}
