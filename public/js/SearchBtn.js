function filterBySearch(){
    const inputSearch = document.getElementById('searchInput');
    const filter = inputSearch.value.toLowerCase();
    const cardprocess = document.getElementById('processCard');

    for (let i = 0; i < cardprocess.clientHeight; i++){
        const card = cardprocess[i];
        const cardContent = card.textContent || card.innerText;

        if(cardContent.toLowerCase().indexOf(filter) > -1)
            card.style.display = "";
        else
            card.style.display = "nenhum";
    }   
}