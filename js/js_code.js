"use strict";

// ----------VARIABLE DECLARATIONS---------- //

const mainDocument = document.getElementById("main-document");
const infoDocument = document.getElementById("info-document");
const pokemonSelection = document.querySelector(".pokemon-selection");
const generationSelection = document.querySelector(".generation-selection");
const mainSection = document.querySelector(".main");
const loader = document.querySelector(".loader-container");
const errorMsg = document.querySelector(".error-msg");
const lastGen = document.querySelector(".generation-8");
const indicator = document.querySelector(".indicator");
const fragment = document.createDocumentFragment();
const sideMenuButton = document.querySelectorAll(".side-menu-button");
const changeThemeButton = document.querySelectorAll(".change-theme-button");

let currentGenPoke = 0;
let currentAllPoke = 1;

// ----------CREATES A NEW POKEMON ENTRY---------- //

const createEntry = async (currentName, currentImg) => {
    let pokeContainer = document.createElement("DIV");
    let pokeImg = document.createElement("IMG");
    let pokeName = document.createElement("DIV");
    let circle = document.createElement("DIV");

    pokeImg.setAttribute("src", currentImg);
    pokeName.textContent = currentName;

    pokeContainer.classList.add("poke-container");
    pokeImg.classList.add("poke-img");
    pokeName.classList.add("poke-name");
    circle.classList.add("circle");

    pokeImg.setAttribute("loading", "lazy");

    pokeContainer.appendChild(pokeImg);
    pokeContainer.appendChild(pokeName);
    pokeContainer.appendChild(circle);

    fragment.appendChild(pokeContainer);
    pokemonSelection.appendChild(fragment);
}

const clearEntries = () => {
    const entries = document.querySelectorAll(".poke-container");
    for (let i = 0; i < entries.length; i++) {
        pokemonSelection.removeChild(entries[i]);
    }
}

const checkGenLength = (gen, callback, click) => {
    return async () => {
        if (click) {
            clearEntries();
            currentGenPoke = 0;
            localStorage.setItem("currentGen", gen);

            // IF THE SCREEN IS LESS THAN 900PX WIDTH HIDES THE SIDE MENU WHEN A GENERATION IS SELECTED
            let screenWith = window.matchMedia("(max-width: 900px)");
            if (screenWith.matches) generationSelection.classList.add("hidden");
        }

        const entriesArray = await fetch(`https://pokeapi.co/api/v2/generation/${gen}/`);

     if (entriesArray.ok) {
            entriesArray.json()
            .then(response => {
                const arrayLength = response.pokemon_species.length;
                callback(gen, arrayLength, selectPokemon);
            })
            .catch(e => alert("Unexpected error requesting the gen array lenght, please refresh the page"));
        }
    }
}

const selectPokemon = async (pokeballContainer, gen) => {

    for (let i = 0; i < pokeballContainer.length; i++) {

        let valueImg = await pokeballContainer[i].children[0].src;
        let valueName = await pokeballContainer[i].children[1].textContent;

        let pokeData = [gen, valueName, valueImg, i];

        pokeballContainer[i].addEventListener("click", e => {
            localStorage.removeItem("dataKey");
            localStorage.setItem("dataKey", pokeData);

            window.open("info.html", "_self");
        })
    }
}

const observePoke = entries => {
    let entry = entries[0];

    let currentGen = localStorage.getItem("currentGen");
    if (entry.isIntersecting && currentGen == "all") {
        console.log(currentAllPoke);
        addAllPokemons(selectPokemon);
    } else if (entry.isIntersecting && currentGen !== "all") {
        let testVar = checkGenLength(currentGen, addGenPokemons, false);
        console.log(currentGenPoke);
        testVar();
    }
}

const pokeObserver = new IntersectionObserver(observePoke);

const addAllPokemons = async callback => {
    let maxPokemons = 1008;
    localStorage.setItem("currentGen", "all");
    console.clear();
    loader.removeAttribute("hidden");

    for (let i = 1; i < 20 && maxPokemons > currentAllPoke; i++) { // 1008 POKEMON ENTRIES IN TOTAL
        const currentRequest = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentAllPoke}`);
        currentAllPoke++;

        if (currentRequest.ok) {
            currentRequest.json()
            .then(response => {
                let currentName = response.name;
                let currentImg = response.sprites.front_default;

                    createEntry(currentName, currentImg);

                if (i == 19) {
                    let lastChild = pokemonSelection.lastElementChild;
                    pokeObserver.observe(lastChild);
                    i == 0;

                    const pokeballContainer = document.querySelectorAll(".poke-container");

                    callback(pokeballContainer, "all");

                    console.clear();
                }
            })
            .catch(e => {
                errorMsg.removeAttribute("hidden");

                errorMsg.textContent = "Error occured, one or more entries may not be displayed"
                setTimeout(() => errorMsg.toggleAttribute("hidden"), 5000);
            });
        }
        }
        loader.setAttribute("hidden", true);
}

const addGenPokemons = async (gen, genLength, callback) => {
    loader.removeAttribute("hidden");

    for (let i = 0; i < 20 && genLength > currentGenPoke; i++) {
    const currentGenRequest = await fetch(`https://pokeapi.co/api/v2/generation/${gen}/`);

    if (currentGenRequest.ok) {
        currentGenRequest.json()
        .then(response => {
            let currentName = response.pokemon_species[currentGenPoke].name;
            currentGenPoke++;
            const currentImgRequest = fetch(`https://pokeapi.co/api/v2/pokemon/${currentName}`);

                currentImgRequest.then(response => response.json())
                .then(response => {
                    let currentImg = response.sprites.front_default;

                    createEntry(currentName, currentImg);

                    if (i == 19) {
                        let lastChild = pokemonSelection.lastElementChild;
                        pokeObserver.observe(lastChild);
                        i == 0;

                        const pokeballContainer = document.querySelectorAll(".poke-container");

                        callback(pokeballContainer, gen);
                    }
                })
                .catch(e => console.log(e));
        })
        .catch(e => {
                errorMsg.removeAttribute("hidden");

                errorMsg.textContent = "Error occured, one or more entries may not be displayed"
                setTimeout(() => errorMsg.toggleAttribute("hidden"), 5000);
        });
    }
}
loader.setAttribute("hidden", true);
}

const loopMultiTheme = callback => {
    return () => {
        const multiThemeElements = document.querySelectorAll(".multi-theme");

        for (let i = 0; i < multiThemeElements.length; i++) {
    
            callback(multiThemeElements[i]);
        }
    
        let header = document.getElementById("header-id");
        let theme = header.classList.item(1);
    
        localStorage.removeItem("currentTheme");
        localStorage.setItem("currentTheme", theme);
    }
}

const changeTheme = multiThemeElement => {

    if (multiThemeElement.classList.contains("dark-theme")) multiThemeElement.classList.replace("dark-theme", "light-theme");
    else if (multiThemeElement.classList.contains("light-theme")) multiThemeElement.classList.replace("light-theme", "dark-theme");
} 

const checkTheme = multiThemeElement => {
    let currentTheme = localStorage.getItem("currentTheme");

    if (currentTheme == "light-theme" || currentTheme == null) {
        multiThemeElement.classList.add("light-theme");
    }
    else {
        multiThemeElement.classList.add("dark-theme");
    }
}

const Gen1 = document.querySelector(".generation-1");
const Gen2 = document.querySelector(".generation-2");
const Gen3 = document.querySelector(".generation-3");
const Gen4 = document.querySelector(".generation-4");
const Gen5 = document.querySelector(".generation-5");
const Gen6 = document.querySelector(".generation-6");
const Gen7 = document.querySelector(".generation-7");
const Gen8 = document.querySelector(".generation-8");

// ----------HIDE INDICATOR---------- //

const observeLastGen = entries => {
    let entry = entries[0];
    if (entry.isIntersecting) indicator.setAttribute("hidden", "true");
    else indicator.removeAttribute("hidden");
}

//|| ----------INFO CARD CODE---------- ||//

const loadCardInfo = async () => {

    const cardName = document.querySelector(".poke-name");
    const cardImg = document.querySelector(".poke-img");
    const cardTypes = document.querySelector(".poke-type");
    const sideData = document.querySelectorAll(".data");

    let dataString = localStorage.getItem("dataKey");
    let dataArray = dataString.split(",");

    let pokeCardName = dataArray[1];
    let pokeCardImg = dataArray[2];

    cardName.textContent = pokeCardName;
    cardImg.src = pokeCardImg;

    const cardInfoRequest = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeCardName}/`);

    if (cardInfoRequest.ok) {
        cardInfoRequest.json()
        .then(response => {
            let typeArray = response.types;
            let pokeOrder = response.order;
            let pokeHeight = response.height / 10; // DECIMETRES TRANSFORMED INTO CENTIMETERS
            let pokeWeight = response.weight / 10; // HECTOGRAMS TRANSFORMED INTO KILOGRAMS

            typeArray.map(e => {
                let pokeType = e.type.name;
                cardTypes.innerHTML += `<br/>${pokeType}`;
            })

            sideData[0].textContent = `Pokedex number: ${pokeOrder}`;
            sideData[1].textContent = `Pokemon's height: ${pokeHeight} m`;
            sideData[2].textContent = `Pokemon's weight: ${pokeWeight} kg`;
            
            console.log(response);
        })
    }
    else {}
}

// ----------EXECUTIONS---------- //

const exeCheckTheme = loopMultiTheme(checkTheme);
exeCheckTheme();

// CHANGE-THEME-BUTTON FUNCTIONALITY (DESKTOP)
changeThemeButton[0].addEventListener("click", loopMultiTheme(changeTheme));

if (mainDocument !== null) { // INDEX EXECUTIONS

    addAllPokemons(selectPokemon);

    Gen1.addEventListener("click", checkGenLength("1", addGenPokemons, true));
    Gen2.addEventListener("click", checkGenLength("2", addGenPokemons, true));
    Gen3.addEventListener("click", checkGenLength("3", addGenPokemons, true));
    Gen4.addEventListener("click", checkGenLength("4", addGenPokemons, true));
    Gen5.addEventListener("click", checkGenLength("5", addGenPokemons, true));
    Gen6.addEventListener("click", checkGenLength("6", addGenPokemons, true));
    Gen7.addEventListener("click", checkGenLength("7", addGenPokemons, true));
    Gen8.addEventListener("click", checkGenLength("8", addGenPokemons, true));

    const observer = new IntersectionObserver(observeLastGen);
    
    observer.observe(lastGen);

    // ----------SHOW INDICATOR---------- //

    generationSelection.addEventListener("mouseout", () => indicator.style.opacity = 0);
    generationSelection.addEventListener("mouseover", () => indicator.style.opacity = 1);

    // CHANGE-THEME-BUTTON FUNCTIONALITY (MOVILE)
    changeThemeButton[1].addEventListener("click", loopMultiTheme(changeTheme));

    // SIDE MENU BUTTON FUNCTIONALITY (MOVILE) (INSIDE AND OUTSIDE THE SIDE MENU)
    sideMenuButton[0].addEventListener("click", () => generationSelection.classList.remove("hidden"));
    sideMenuButton[1].addEventListener("click", () => generationSelection.classList.add("hidden"));
}
else if (infoDocument !== null) { // INFOCARD EXECUTIONS
    loadCardInfo();
}