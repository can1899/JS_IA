let word = "";
let guessedLetters = [];
let mistakes = 0;
let wins = 0;
let losses = 0;

const canvas = document.getElementById("hangmanCanvas");
const ctx = canvas.getContext("2d");
const letterButtonsContainer = document.getElementById("letter-buttons");

// ✅ Predefined Spanish words (No API failures)
const spanishWords = [
  "GATO",
  "PERRO",
  "COCHE",
  "CASA",
  "ARBOL",
  "FIESTA",
  "MONTAÑA",
  "NUBE",
  "ESTRELLA",
  "MARIPOSA",
  "JUEGO",
  "ESCUELA",
  "LIBRO",
  "VENTANA",
  "PUERTA",
  "COMIDA",
  "FAMILIA",
  "AMIGO",
  "PASTEL",
  "BEBIDA",
];

// ✅ Load scores from LocalStorage
function loadScores() {
  wins = parseInt(localStorage.getItem("wins")) || 0;
  losses = parseInt(localStorage.getItem("losses")) || 0;
  document.getElementById("wins").textContent = wins;
  document.getElementById("losses").textContent = losses;
}

// ✅ Clear Hangman drawing
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ✅ Draw Hangman parts
function drawHangman(step) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.beginPath();

  switch (step) {
    case 1:
      ctx.moveTo(50, 280);
      ctx.lineTo(250, 280);
      break;
    case 2:
      ctx.moveTo(100, 280);
      ctx.lineTo(100, 50);
      break;
    case 3:
      ctx.moveTo(100, 50);
      ctx.lineTo(200, 50);
      break;
    case 4:
      ctx.moveTo(200, 50);
      ctx.lineTo(200, 80);
      break;
    case 5:
      ctx.arc(200, 100, 20, 0, Math.PI * 2);
      break;
    case 6:
      ctx.moveTo(200, 120);
      ctx.lineTo(200, 180);
      break;
    case 7:
      ctx.moveTo(200, 130);
      ctx.lineTo(170, 160);
      break;
    case 8:
      ctx.moveTo(200, 130);
      ctx.lineTo(230, 160);
      break;
    case 9:
      ctx.moveTo(200, 180);
      ctx.lineTo(170, 230);
      break;
    case 10:
      ctx.moveTo(200, 180);
      ctx.lineTo(230, 230);
      break;
  }

  ctx.stroke();
}

// ✅ Fetch a new word (Spanish uses local list, English uses API)
async function fetchWord() {
  let language = document.getElementById("language").value;

  if (language === "ES") {
    // ✅ Pick a random Spanish word from the list
    word = spanishWords[Math.floor(Math.random() * spanishWords.length)];
  } else {
    // ✅ Fetch an English word from API
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?number=1"
      );
      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      word = data[0].toUpperCase();
    } catch (error) {
      console.error("Error fetching word:", error);
      document.getElementById("message").textContent =
        "Error fetching word, try again.";
      document.getElementById("message").style.color = "red";
      word = "ERROR";
    }
  }

  guessedLetters = Array(word.length).fill("_");
  document.getElementById("word-display").textContent =
    guessedLetters.join(" ");
  mistakes = 0;
  document.getElementById("message").textContent = "";

  clearCanvas();
  setupLetterButtons();
  loadScores();
  updateButtonText();
}

// ✅ Setup letter buttons and attach event listeners correctly
function setupLetterButtons() {
  letterButtonsContainer.innerHTML = ""; // ✅ Clear buttons

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  letters.split("").forEach((letter) => {
    let button = document.createElement("button");
    button.textContent = letter;
    button.classList.add("letter-button");
    button.onclick = function () {
      guessLetter(letter, button);
    };
    letterButtonsContainer.appendChild(button);
  });
}

// ✅ Guessing function
function guessLetter(letter, button) {
  if (!word) return;
  button.disabled = true;

  if (word.includes(letter)) {
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter) guessedLetters[i] = letter;
    }
  } else {
    mistakes++;
    drawHangman(mistakes);
  }

  document.getElementById("word-display").textContent =
    guessedLetters.join(" ");

  if (mistakes === 10) {
    document.getElementById(
      "message"
    ).textContent = `Game Over! The word was: ${word}`;
    losses++;
    localStorage.setItem("losses", losses);
    loadScores();
    disableAllButtons();
  } else if (guessedLetters.join("") === word) {
    document.getElementById("message").textContent = "You Win!";
    wins++;
    localStorage.setItem("wins", wins);
    loadScores();
    disableAllButtons();
  }
}

// ✅ Disable buttons when game is over
function disableAllButtons() {
  document.querySelectorAll(".letter-button").forEach((button) => {
    button.disabled = true;
  });
}

// ✅ Toggle Music
const music = new Audio(
  "https://www.bensound.com/bensound-music/bensound-clearday.mp3"
);
music.loop = true;

document.getElementById("music-button").addEventListener("click", function () {
  let language = document.getElementById("language").value;
  if (music.paused) {
    music
      .play()
      .catch((error) => console.error("Music playback blocked:", error));
    this.textContent = language === "ES" ? "Pausar Música" : "Pause Music";
  } else {
    music.pause();
    this.textContent = language === "ES" ? "Reproducir Música" : "Play Music";
  }
});

// ✅ Update button text based on language
function updateButtonText() {
  let language = document.getElementById("language").value;
  document.getElementById("restart-button").textContent =
    language === "ES" ? "Reiniciar Juego" : "Restart Game";
  document.getElementById("music-button").textContent =
    language === "ES" ? "Reproducir Música" : "Play Music";
}

// ✅ Fix Restart Button (Now Works 100%)
document
  .getElementById("restart-button")
  .addEventListener("click", function () {
    fetchWord();
    clearCanvas();
    document.getElementById("message").textContent = "";
    setupLetterButtons();
    updateButtonText();
  });

// ✅ Fix Language Switching (Now Works 100%)
document.getElementById("language").addEventListener("change", () => {
  fetchWord();
  clearCanvas();
  document.getElementById("message").textContent = "";
  setupLetterButtons();
  updateButtonText();
});

// ✅ Ensure game initializes properly
window.onload = function () {
  fetchWord();
  setupLetterButtons();
};
