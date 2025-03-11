const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses span");
const remainingText = document.querySelector(".remaining span");
const keyboard = document.querySelector(".keyboard");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = document.querySelector(".play-again");
const hintText = document.querySelector(".hint span");
const keySound = document.getElementById("keySound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const muteButton = document.querySelector(".mute-button");
const volumeSlider = document.querySelector(".volume-slider");
const exitButton = document.querySelector(".exit-button");
const themeButton = document.querySelector(".theme-button");
let isMuted = false;
let currentTheme = localStorage.getItem("theme") || "light";

// Banco de palavras com dicas
const words = [
    // Países
    { word: "brasil", hint: "País da América do Sul" },
    { word: "japao", hint: "País conhecido por sushi e anime" },
    { word: "egito", hint: "País das pirâmides" },
    { word: "frança", hint: "País da Torre Eiffel" },
    { word: "italia", hint: "País conhecido pela pizza" },
    
    // Animais
    { word: "elefante", hint: "Maior mamífero terrestre" },
    { word: "girafa", hint: "Animal de pescoço longo" },
    { word: "pinguim", hint: "Ave que não voa, vive no frio" },
    { word: "baleia", hint: "Maior animal do mundo" },
    { word: "leopardo", hint: "Felino com manchas" },
    
    // Comidas
    { word: "chocolate", hint: "Doce feito de cacau" },
    { word: "lasanha", hint: "Massa em camadas" },
    { word: "feijoada", hint: "Prato típico brasileiro" },
    { word: "pamonha", hint: "Comida típica de milho" },
    { word: "brigadeiro", hint: "Doce brasileiro de chocolate" },
    
    // Tecnologia
    { word: "javascript", hint: "Linguagem de programação popular" },
    { word: "computador", hint: "Máquina eletrônica de processamento" },
    { word: "internet", hint: "Rede mundial de computadores" },
    { word: "celular", hint: "Dispositivo móvel de comunicação" },
    { word: "bluetooth", hint: "Tecnologia de conexão sem fio" },
    
    // Esportes
    { word: "futebol", hint: "Esporte mais popular do Brasil" },
    { word: "voleibol", hint: "Esporte com rede e seis jogadores por time" },
    { word: "natacao", hint: "Esporte praticado na água" },
    { word: "atletismo", hint: "Esporte com corrida e saltos" },
    { word: "ciclismo", hint: "Esporte com bicicleta" },
    
    // Profissões
    { word: "professor", hint: "Profissional do ensino" },
    { word: "medico", hint: "Profissional da saúde" },
    { word: "advogado", hint: "Profissional do direito" },
    { word: "bombeiro", hint: "Profissional que combate incêndios" },
    { word: "arquiteto", hint: "Profissional que projeta construções" },
    
    // Instrumentos Musicais
    { word: "guitarra", hint: "Instrumento musical de cordas" },
    { word: "violino", hint: "Instrumento de cordas tocado com arco" },
    { word: "bateria", hint: "Instrumento de percussão com pratos" },
    { word: "saxofone", hint: "Instrumento de sopro do jazz" },
    { word: "acordeao", hint: "Instrumento musical de fole" },
    
    // Frutas
    { word: "abacaxi", hint: "Fruta tropical com coroa" },
    { word: "morango", hint: "Fruta vermelha pequena" },
    { word: "banana", hint: "Fruta amarela comprida" },
    { word: "manga", hint: "Fruta tropical amarela ou verde" },
    { word: "maracuja", hint: "Fruta usada para fazer suco calmante" },
    
    // Objetos
    { word: "telefone", hint: "Aparelho de comunicação" },
    { word: "cadeira", hint: "Móvel para sentar" },
    { word: "chuveiro", hint: "Objeto para tomar banho" },
    { word: "tesoura", hint: "Objeto para cortar" },
    { word: "carteira", hint: "Objeto para guardar dinheiro" }
];

let currentWord, correctLetters, wrongGuesses, remainingGuesses;
const maxGuesses = 6;

// Função para normalizar texto (remover acentos)
const normalizeText = (text) => {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const resetGame = () => {
    correctLetters = [];
    wrongGuesses = [];
    remainingGuesses = maxGuesses;
    
    const randomWord = words[Math.floor(Math.random() * words.length)];
    currentWord = randomWord.word.toLowerCase();
    
    hintText.innerText = randomWord.hint;
    remainingText.innerText = remainingGuesses;
    guessesText.innerText = "";
    
    wordDisplay.innerHTML = currentWord.split("").map(() => `<div class="letter"></div>`).join("");
    gameModal.classList.remove("show");
    
    // Reseta apenas as partes do corpo, mantendo a forca
    document.querySelectorAll(".hangman-piece.body-part").forEach(piece => {
        if (!piece.classList.contains("hidden")) {
            piece.classList.add("hidden");
        }
    });
    
    keyboard.querySelectorAll("button").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("disabled");
    });
};

// Função para atualizar o ícone do botão mudo
const updateMuteButton = () => {
    const icon = muteButton.querySelector("i");
    if (isMuted || volumeSlider.value === "0") {
        icon.className = "fas fa-volume-mute";
    } else if (volumeSlider.value < 50) {
        icon.className = "fas fa-volume-down";
    } else {
        icon.className = "fas fa-volume-up";
    }
};

// Função para atualizar o volume de todos os sons
const updateVolume = () => {
    const volume = isMuted ? 0 : volumeSlider.value / 100;
    [keySound, winSound, loseSound].forEach(sound => {
        sound.volume = volume;
    });
    updateMuteButton();
};

// Função para alternar mudo
const toggleMute = () => {
    isMuted = !isMuted;
    updateVolume();
};

// Função para tocar som
const playSound = (audioElement) => {
    if (!isMuted && volumeSlider.value > 0) {
        audioElement.currentTime = 0;
        audioElement.play().catch(error => {
            console.log("Erro ao tocar o som:", error);
        });
    }
};

const showGameOver = (isVictory) => {
    const modalTitle = gameModal.querySelector(".modal-title");
    const modalWord = gameModal.querySelector(".modal-word");
    modalTitle.textContent = isVictory ? "Parabéns!" : "Game Over!";
    modalWord.textContent = `A palavra era: ${currentWord}`;
    gameModal.classList.add("show");
    
    // Toca o som apropriado
    if (isVictory) {
        playSound(winSound);
    } else {
        playSound(loseSound);
    }
};

const initGame = (button, clickedLetter) => {
    if (button.disabled) return;

    playSound(keySound);

    const normalizedWord = normalizeText(currentWord);
    const normalizedLetter = normalizeText(clickedLetter);

    if (normalizedWord.includes(normalizedLetter)) {
        currentWord.split("").forEach((letter, index) => {
            if (normalizeText(letter) === normalizedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll(".letter")[index].textContent = letter;
            }
        });
    } else {
        if (!wrongGuesses.includes(clickedLetter)) {
            wrongGuesses.push(clickedLetter);
            remainingGuesses--;
            
            // Atualiza apenas as partes do corpo
            const bodyParts = document.querySelectorAll(".hangman-piece.body-part.hidden");
            const partToShow = bodyParts[0];
            if (partToShow) {
                partToShow.classList.remove("hidden");
            }
        }
    }

    button.disabled = true;
    button.classList.add("disabled");
    remainingText.innerText = remainingGuesses;
    guessesText.innerText = wrongGuesses.join(", ");

    const uniqueLettersInWord = new Set(normalizedWord.split('')).size;
    const uniqueCorrectLetters = new Set(correctLetters.map(l => normalizeText(l))).size;

    if (remainingGuesses === 0) {
        showGameOver(false);
    } else if (uniqueCorrectLetters >= uniqueLettersInWord) {
        showGameOver(true);
    }
};

// Criar teclado virtual
for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.innerText = String.fromCharCode(i);
    keyboard.appendChild(button);
    button.addEventListener("click", e => initGame(e.target, String.fromCharCode(i)));
}

playAgainBtn.addEventListener("click", resetGame);
resetGame();

// Event listeners para os controles de som
muteButton.addEventListener("click", toggleMute);
volumeSlider.addEventListener("input", updateVolume);

// Inicialização do volume
updateVolume();

// Adicione tratamento de erro para os sons
[keySound, winSound, loseSound].forEach(sound => {
    sound.addEventListener('error', (e) => {
        console.log(`Erro ao carregar o som: ${e.target.src}`);
    });
});

// Adicione o HTML do modal de confirmação após a última div do container
document.querySelector(".container").insertAdjacentHTML('beforeend', `
    <div class="exit-modal">
        <div class="exit-modal-content">
            <h2>Deseja realmente sair?</h2>
            <p>Todo o progresso será perdido.</p>
            <div class="exit-modal-buttons">
                <button class="cancel-exit">Cancelar</button>
                <button class="confirm-exit">Sair</button>
            </div>
        </div>
    </div>
`);

const exitModal = document.querySelector(".exit-modal");
const confirmExitBtn = document.querySelector(".confirm-exit");
const cancelExitBtn = document.querySelector(".cancel-exit");

// Função para mostrar o modal de confirmação
const showExitConfirmation = () => {
    exitModal.classList.add("show");
    playSound(keySound);
};

// Função para esconder o modal de confirmação
const hideExitConfirmation = () => {
    exitModal.classList.remove("show");
    playSound(keySound);
};

// Função para sair do jogo
const exitGame = () => {
    playSound(loseSound);
    window.location.href = "about:blank"; // Ou redirecione para outra página
};

// Event listeners para os botões de sair
exitButton.addEventListener("click", showExitConfirmation);
confirmExitBtn.addEventListener("click", exitGame);
cancelExitBtn.addEventListener("click", hideExitConfirmation);

// Fechar o modal se clicar fora dele
exitModal.addEventListener("click", (e) => {
    if (e.target === exitModal) {
        hideExitConfirmation();
    }
});

// Adicione esta função após as outras constantes
const updateFavicon = (theme) => {
    const faviconSVG = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
            <path stroke='${theme === "dark" ? "#fff" : "#000"}' stroke-width='4' fill='none' 
                d='M10 90h80M30 90V10M30 10h50M80 10v20'/>
            <circle cx='80' cy='40' r='10' stroke='${theme === "dark" ? "#fff" : "#000"}' 
                stroke-width='4' fill='none'/>
            <path stroke='${theme === "dark" ? "#fff" : "#000"}' stroke-width='4' fill='none' 
                d='M80 50v30M80 60l-15 15M80 60l15 15'/>
        </svg>
    `;

    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
        favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSVG)}`;
    }
};

// Modifique a função toggleTheme para incluir a atualização do favicon
const toggleTheme = () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
    
    // Atualiza o ícone do botão
    const icon = themeButton.querySelector("i");
    icon.className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";
    
    // Atualiza o favicon
    updateFavicon(currentTheme);
    
    // Toca o som
    playSound(keySound);
};

// Inicializa o tema
document.documentElement.setAttribute("data-theme", currentTheme);
themeButton.querySelector("i").className = currentTheme === "light" ? "fas fa-moon" : "fas fa-sun";

// Adicione esta linha após a inicialização do tema
updateFavicon(currentTheme);

// Event listener para o botão de tema
themeButton.addEventListener("click", toggleTheme); 