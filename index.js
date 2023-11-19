const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const timerDiv = document.createElement('div');
document.body.appendChild(timerDiv);
let timeRunning = true;
timerDiv.id = 'timer';
const bestTime = localStorage.getItem('bestTime') || 0;
const asteroids = [];
const crashSound = new Audio('crash.wav');
const speed = 2;

let startTime = null;
let elapsedTime = 0;

//metoda koja na svakih 100 milisekundi stvara asteroide na nasumičnim mjestima i s nasumičnim brzinama i smjerovima
window.setInterval(() => {
    //nasumično odabire stranu ekrana s koje će asteroid doći
    let side = Math.floor(Math.random() * 4);
    let x, y;
    //nasumično odabire veličinu asteroida između 20 i 70 piksela
    let size = 50 * Math.random() + 20;
    let velocityX, velocityY;
    switch (side) {
        case 0: // lijevo
        x = 0 - size;
        y = Math.random() * canvas.height;
        velocityX = 1 * Math.random();
        velocityY = 2 * Math.random() - 1;
        break;
        case 1: // desno
        x = canvas.width + size;
        y = Math.random() * canvas.height;
        velocityX = -1 * Math.random();
        velocityY = 2 * Math.random()-1;
        break;
        case 2: // gore
        x = Math.random() * canvas.width;
        y = 0 - size;
        velocityX = 2* Math.random() - 1;
        velocityY = 1 * Math.random();
        break;
        case 3: // dolje
        x = Math.random() * canvas.width;
        y = canvas.height + size;
        velocityX = 2* Math.random() - 1;
        velocityY = -1 * Math.random();
    }
    //stvaranje asteroida i dodavanje u listu asteroida
    asteroids.push(new Asteroid({
        position: {
        x: x,
        y: y,
    }, 
    velocity: {
        x: velocityX,
        y: velocityY,
    },
    size
})
)
}, 100);

//Klasa igrača, njegova pozicija i brzina
class Player {
    constructor({position,  velocity}) {
        this.position = position
        this.velocity = velocity
    }
    //metoda koja crta igrača, njegovu boju i sjenu na osnovu njegove trenutne pozicije
    draw() {
        ctx.fillStyle = 'red';
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.fillRect(this.position.x - 12, this.position.y - 7, 24, 14);
    }
    //metoda koja ažurira poziciju igrača na osnovu njegove brzine
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        if (this.position.x > screenWidth) {
            this.position.x = 0 - 12; // Set to left edge
        } else if (this.position.x + 12 < 0) {
            this.position.x = screenWidth; // Set to right edge
        }

        if (this.position.y > screenHeight) {
            this.position.y = 0 - 7; // Set to top edge
        } else if (this.position.y + 7 < 0) {
            this.position.y = screenHeight; // Set to bottom edge
        }
    }
}
//kreiranje igrača i postavljanje ga u sredinu ekrana
const player = new Player({
    position: {x: canvas.width / 2, y: canvas.height / 2},
    velocity: {x: 0, y: 0}
});

//Klasa asteroida, njegova pozicija, brzina i veličina
class Asteroid {
    constructor({position, velocity, size}) {
        this.position = position
        this.velocity = velocity
        this.size = size;
    }
    //metoda koja crta asteroide, njihovu boju i sjenu na osnovu njihove trenutne pozicije
    draw() {
        //cxcmidvndivn
        ctx.fillStyle = 'grey';
        ctx.shadowColor = "white";
        ctx.shadowBlur = 10;
        ctx.fillRect(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
    }
    //metoda koja ažurira poziciju asteroida na osnovu njegove brzine
    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

}

//metode koje na osnovu pritiska i otpuštanja tipki mijenjaju brzinu igrača
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            player.velocity.y = -1*speed;
            break;
        case 'ArrowDown':
            player.velocity.y = 1*speed;
            break;
        case 'ArrowLeft':
            player.velocity.x = -1*speed;
            break;
        case 'ArrowRight':
            player.velocity.x = 1*speed;
            break;
    }
});
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            player.velocity.y = 0;
            break;
        case 'ArrowDown':
            player.velocity.y = 0;
            break;
        case 'ArrowLeft':
            player.velocity.x = 0;
            break;
        case 'ArrowRight':
            player.velocity.x = 0;
            break;
    }
});

//metoda koja animira igru, crta igrača i asteroide, te provjerava je li došlo do sudara
function animate() {
    const animationId = window.requestAnimationFrame(animate);
    updateScreen();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    player.update();
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.update();
        if (collisionDetection(asteroid, player)) {
            console.log('collision');
            window.cancelAnimationFrame(animationId);
            crashSound.play();
            if (elapsedTime > bestTime) {
                //ako je vrijeme igre bolje od najboljeg vremena, onda se najbolje vrijeme u local storage postavlja na vrijeme igre
                localStorage.setItem('bestTime', elapsedTime);
              }
            timeRunning = false;
            console.log(elapsedTime)
            
        }

        //asteroid kad izađe izvan ekrana se briše iz liste
        if (asteroid.position.x + asteroid.size < 0 ||
            asteroid.position.x - asteroid.size > canvas.width ||
            asteroid.position.y + asteroid.size < 0 ||
            asteroid.position.y - asteroid.size > canvas.height) {
            asteroids.splice(i, 1);
            }
    }
}

//metoda koja prikazuje vrijeme igre i najbolje vrijeme na ekranu
function displayElapsedTime(elapsedTime) {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor(elapsedTime % 1000);
  
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    const bestTime = localStorage.getItem('bestTime') || Infinity;

    const bestMinutes = Math.floor(bestTime / 60000);
    const bestSeconds = Math.floor((bestTime % 60000) / 1000);
    const bestMilliseconds = Math.floor(bestTime % 1000);

    const formattedBestTime = `${String(bestMinutes).padStart(2, '0')}:${String(bestSeconds).padStart(2, '0')}.${String(bestMilliseconds).padStart(3, '0')}`;

    timerDiv.textContent = `Vrijeme: ${formattedTime} | Najbolje vrijeme: ${formattedBestTime}`;
}

//metoda koja računa vrijeme igre i zove metodu za prikaz vremena
function updateScreen() {
    if (startTime == null) {
        startTime = new Date();
    }
    if (timeRunning) {
    // Calculate the elapsed time
        const currentTime = new Date();
        elapsedTime = currentTime - startTime;
        // Update the screen with the elapsed time (you need to implement this part)
        displayElapsedTime(elapsedTime);
        // Continue the animation loop
        requestAnimationFrame(updateScreen);
    }
  }

//metoda koja provjerava je li došlo do sudara između asteroida i igrača u trenutku animacije
function collisionDetection(asteroid, player) {
    pL = player.position.x - 12;
    pR = player.position.x + 12;
    pT = player.position.y - 7;
    pB = player.position.y + 7;
    aL = asteroid.position.x - asteroid.size / 2;
    aR = asteroid.position.x + asteroid.size / 2;
    aT = asteroid.position.y - asteroid.size / 2;
    aB = asteroid.position.y + asteroid.size / 2;
    return(
    pL <= aR &&
    pR >= aL &&
    pT <= aB &&
    pB >= aT
    );
}
player.update();
animate();