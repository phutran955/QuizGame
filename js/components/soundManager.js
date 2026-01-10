const sounds = {
    click: new Audio("/assets/images/sounds/click.mp3"),
    correct: new Audio("/assets/images/sounds/correct.mp3"),
    wrong: new Audio("/assets/images/sounds/wrong.mp3"),
    gameover: new Audio("/assets/images/sounds/gameover.mp3"),
    win: new Audio("/assets/images/sounds/win.mp3"),
};

// cho phép chơi lại nhiều lần liên tục
Object.values(sounds).forEach((s) => {
    s.preload = "auto";
});

export function playSound(name) {
    const sound = sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch((e) => {
        console.log("Sound blocked:", name);
    });
}
