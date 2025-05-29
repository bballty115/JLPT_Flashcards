let cardData = []
let mode = ""
let cardIndex = 0
let cardSide = "front"

// When a card is clicked, flip its side
document.getElementById('cardContainer').addEventListener('click', () => {
    if (cardSide == "front") cardSide = "back"
    else cardSide = "front"
    // Load the card once flipped
    loadCard()
})

// Load a card with the current mode from cardData at the given index
function loadCard() {
    // If the cardIndex is out of bounds, don't do anything and print error
    if (cardIndex < 0 || cardIndex >= cardData.length){
        console.error('Index is out of bounds for possible cards to load.')
        return
    }
    // When attempting to load a card, cancel any outsanding audio
    audio = document.getElementById('cardSpoken')
    if (audio){
        audio.remove()
    }
    // Get reference to the index card
    const card = document.getElementById('cardContainer');
    // Generate the text for an image, text, and sound
    const cardImg = `<img id="cardImg" src="${cardData[cardIndex]['img']}"><div id="cardMeaning">${cardData[cardIndex]['meaning']}</div>`
    const cardWritten = `<div id="cardWritten">${cardData[cardIndex]['word']}</div>`
    const cardSpoken = `<audio id="cardSpoken" autoplay><source src=${cardData[cardIndex]['audio']} type="audio/mpeg"></audio><div id="cardReading">${cardData[cardIndex]['reading']}</div>`
    // Load a write / read card
    if(mode ==  "write") {
        // Front should show image
        if(cardSide == "front") card.innerHTML = cardImg
        // Back should show written
        else card.innerHTML = cardWritten
    }
    else if(mode ==  "speak") {
        // Front should show image
        if (cardSide == "front") card.innerHTML = cardImg
        // Back should show spoken
        else card.innerHTML = cardSpoken
    }
    // Load a listen card
    else if(mode ==  "listen") {
        // Front should show spoken
        if (cardSide == "front") card.innerHTML = cardSpoken
        // Back should show img
        else card.innerHTML = cardImg
    }
    // Load a reading comp card
    else if(mode == "readComp") {
        // Front should show written
        if(cardSide == "front") card.innerHTML = cardWritten
        // Back should show img
        else card.innerHTML = cardImg
    }
    // Loop once after a delay if audio element is added
    audio = document.getElementById('cardSpoken')
    // TODO - Add back audio loop if I feel like it
    // if (audio){
    //     const loopDelayMs = 2000 // Delay of 3 seconds
    //     replayed = false
    //     audio.addEventListener('ended', () => {
    //         // Replay once if not replayed yet
    //         if (!replayed){
    //             setTimeout(() => {
    //                 if (audio)
    //                 audio.currentTime = 0;
    //                 audio.play();
    //                 // TODO - Determine if I want forever loop
    //                 //        or single loop
    //                 //replayed = true
    //             }, loopDelayMs);
    //         }
    //     })
    // }
}

// Handle incrementing the index based on param input
function incrementIndex(val) {
    // Increment val and ensure index is within bounds
    cardIndex = cardIndex + val
    if (cardIndex < 0) cardIndex = cardData.length - 1
    while (cardIndex >= cardData.length) cardIndex = 0
    // Set card to front side
    cardSide = "front"
    // Load card after incrementing
    loadCard()
}
document.getElementById('nextCard').addEventListener('click', () => {
    incrementIndex(1)
})
document.getElementById('prevCard').addEventListener('click', () => {
    incrementIndex(-1)
})

// Randomize the data locations
function randomizeData() {
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    for (var i = cardData.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cardData[i];
        cardData[i] = cardData[j];
        cardData[j] = temp;
    }
    // Load card after randomizing
    loadCard()
}
document.getElementById('randomCards').addEventListener('click', () => {
    randomizeData()
})

// Handle setting the mode for each button
function setMode(modeName) {
    // Set the mode name
    mode = modeName
    // Mode swap should set card to front side
    cardSide = "front"
    // Load the card
    loadCard()
}
document.getElementById('write').addEventListener('click', () => {
    setMode('write')
})
document.getElementById('speak').addEventListener('click', () => {
    setMode('speak')
})
document.getElementById('listen').addEventListener('click', () => {
    setMode('listen')
})
document.getElementById('readComp').addEventListener('click', () => {
    setMode('readComp')
})

// Load the list of all dataset names
fetch('data/index.json')
    // Load as json
    .then(res => res.json())
    // Using the file list as json
    .then(fileList => {
        // Reference to the checkbox container div
        let container = document.getElementById('checkboxContainer')
        // For each file in the file list
        fileList.forEach(filename => {
            // Generate a label and checkbox for this file
            const label = document.createElement('label')
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.value = filename

            // Combine the checkbox and label, and then add both to the container
            label.appendChild(checkbox)
            label.appendChild(document.createTextNode(" " + filename.split('\\').pop().split('.')[0]))
            container.appendChild(label)
        })
    })
    .then(_ => {
        // For now, just load all checkbox data
        // TODO - Add default behavior, or a user profile to save this info and load on page load
        // Get all checkboxes in the item with the id checkboxContainer that are checked
        const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]')
        // Unpack the file names from the checkboxes
        const filesToLoad = Array.from(checkboxes).map(cb => cb.value)
        // Load the cards from the selected files
        loadCardFromFiles(filesToLoad)
    })
    // Print any errors with loading the index file
    .catch(err => console.error('Failed to load index.json: ', err))

function loadCardFromFiles(filesToLoad){
    // Generate a list of promises to resolve for loading the data
    const fetchPromises = filesToLoad.map(filename =>
        fetch(filename).then(res => res.json())
    )

    // Resolve all the promises for loading data
    Promise.all(fetchPromises)
        .then(contents => {
            // Flatten the array into a single array of data and store as card data
            cardData = contents.flat()

        })
        // Output any errors encountered
        .catch(err => console.error('Error loading files:', err))
}

// Add function to load the selected files when the import button is pressed
document.getElementById('importBtn').addEventListener('click', () => {
    // Get all checkboxes in the item with the id checkboxContainer that are checked
    const checkboxes = document.querySelectorAll('#checkboxContainer input[type="checkbox"]:checked')
    // Unpack the file names from the checkboxes
    const filesToLoad = Array.from(checkboxes).map(cb => cb.value)
    // Load the cards from the selected files
    loadCardFromFiles(filesToLoad)
})