//     MDN: Element.getBoundingClientRect
// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

//     MND: Playbackrate
//https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate

//     MDN: Fullscreen API
// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API

//     MDN: Array.prototype.forEach
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach

//     MDN: String.prototype.padStart
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart

//     MDN: Touch events
// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events

const STEPS = [
    { time: 4,   title: "Preparation"},
    { time: 9,  title: "Separate the eggs"},
    { time: 14,  title: "Mix yolks in"},
    { time: 22,  title: "Whip the egg whites"},
    { time: 28, title: "Fold & bake"},
];

const TOTAL_DURATION = 130;

const INGREDIENTS = [
    { name: "Dark chocolate", qty: "100 g"   },
    { name: "Eggs",           qty: "3 large" },
];

/* ---- DOM references ---- */
const video          = document.querySelector("#custom-video-player");

/* Normal view controls */
const playPauseBtn   = document.querySelector("#play-pause-btn");
const playPauseImg   = document.querySelector("#play-pause-img");
const progressBar    = document.querySelector("#progress-bar");
const progressFill   = document.querySelector("#progress-bar-fill");
const scrubberWrap   = document.querySelector("#scrubber-wrapper");
const currentTimeEl  = document.querySelector("#current-time");
const totalDurEl     = document.querySelector("#total-duration");
const rewindBtn      = document.querySelector("#rewind-btn");
const forwardBtn     = document.querySelector("#forward-btn");
const speedBtn       = document.querySelector("#speed-btn");
const likeBtn        = document.querySelector("#like-btn");
const likeCountEl    = document.querySelector("#like-count");
const fullscreenBtn  = document.querySelector("#fullscreen-btn");

/* Fullscreen overlay controls */
const fsPlayBtn      = document.querySelector("#fs-play-btn");
const fsPlayImg      = document.querySelector("#fs-play-img");
const fsRewindBtn    = document.querySelector("#fs-rewind-btn");
const fsForwardBtn   = document.querySelector("#fs-forward-btn");
const fsSpeedBtn     = document.querySelector("#fs-speed-btn");
const fsProgressBar  = document.querySelector("#fs-progress-bar");
const fsProgressFill = document.querySelector("#fs-progress-fill");
const fsScrubberWrap = document.querySelector("#fs-scrubber-wrapper");
const fsCurrentTime  = document.querySelector("#fs-current-time");
const fsTotalDur     = document.querySelector("#fs-total-duration");

/* Recipe panel */
const panelSteps     = document.querySelector("#panel-steps");
const panelIngr      = document.querySelector("#panel-ingr");
const tabSteps       = document.querySelector("#tab-steps");
const tabIngr        = document.querySelector("#tab-ingr");
const stepCountEl    = document.querySelector("#step-count");
const ingrCountEl    = document.querySelector("#ingr-count");




/* ---- Default State ---- */
let liked      = false;
let likeCount  = 17;
let activeStep = 0;
let ingrDone   = 0;

const SPEEDS   = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIndex = 2; /* start at 1× */

/* =====================================================================
   SETUP
   ===================================================================== */

/* Remove browser default controls, if JS fails they reappear as fallback */
video.removeAttribute("controls");

buildStepList();
buildIngredientList();
setActiveStep(0);

/* =====================================================================
   BUILD STEP LIST  (createElement + appendChild)
   ===================================================================== */
function buildStepList() {
    const list = document.createElement("ol");
    list.classList.add("step-list");

    STEPS.forEach(function(step, index) {
        const item = document.createElement("li");
        item.classList.add("step-item");

        const dot = document.createElement("span");
        dot.classList.add("step-dot");
        dot.textContent = index + 1;

        const line = document.createElement("span");
        line.classList.add("step-line");

        const stepLeft = document.createElement("span");
        stepLeft.classList.add("step-left");

        stepLeft.appendChild(dot);
        stepLeft.appendChild(line);

        const stepBody = document.createElement("span");
        stepBody.classList.add("step-body");

        const title = document.createElement("p");
        title.classList.add("step-title");
        title.textContent = step.title;

        const timeLabel = document.createElement("time");
        timeLabel.classList.add("step-time");
        timeLabel.textContent = formatTime(step.time);

        stepBody.appendChild(title);
        stepBody.appendChild(timeLabel);
        item.appendChild(stepLeft);
        item.appendChild(stepBody);

        item.addEventListener("click", function() { jumpToStep(index); });

        list.appendChild(item);
    });

    panelSteps.appendChild(list);
}

/* =====================================================================
   BUILD INGREDIENT LIST  (createElement + appendChild)
   ===================================================================== */
function buildIngredientList() {
    const list = document.createElement("ul");
    list.classList.add("ingr-list");

    INGREDIENTS.forEach(function(ingr) {
        const item = document.createElement("li");
        item.classList.add("ingr-item");

        const dot  = document.createElement("span");
        dot.classList.add("ingr-dot");

        const name = document.createElement("b");
        name.classList.add("ingr-name");
        name.textContent = ingr.name;

        const qty  = document.createElement("data");
        qty.classList.add("ingr-qty");
        qty.value = ingr.qty;
        qty.textContent = ingr.qty;

        item.appendChild(dot);
        item.appendChild(name);
        item.appendChild(qty);

        item.addEventListener("click", function() {
            item.classList.toggle("done");
            ingrDone = document.querySelectorAll("li.ingr-item.done").length;
            ingrCountEl.textContent = "(" + ingrDone + "/" + INGREDIENTS.length + ")";
        });

        list.appendChild(item);
    });

    panelIngr.appendChild(list);
// reset function
    const resetBtn = document.createElement("button");
    resetBtn.classList.add("ingr-reset");
    resetBtn.textContent = "Reset all";
    resetBtn.addEventListener("click", function() {
        document.querySelectorAll("li.ingr-item").forEach(function(el) {
            el.classList.remove("done");
        });
        ingrDone = 0;
        ingrCountEl.textContent = "(0/" + INGREDIENTS.length + ")";
    });
    panelIngr.appendChild(resetBtn);
}

/* =====================================================================
   PLAY / PAUSE
   ===================================================================== */
function setPlayIcon(playing) {
    /* Updates both the normal and fullscreen play button images */
    const src = playing
        ? "https://img.icons8.com/ios-glyphs/30/pause--v1.png"
        : "https://img.icons8.com/ios-glyphs/30/play--v1.png";
    const alt = playing ? "Pause" : "Play";
    playPauseImg.src = src;  playPauseImg.alt = alt;
    fsPlayImg.src    = src;  fsPlayImg.alt    = alt;
}

function togglePlayPause() {
    if (video.paused || video.ended) {
        video.play();
        setPlayIcon(true);
    } else {
        video.pause();
        setPlayIcon(false);
    }
}

playPauseBtn.addEventListener("click", togglePlayPause);
fsPlayBtn.addEventListener("click", togglePlayPause);

/* =====================================================================
   SCRUBBER, progress bar update as video plays
   ===================================================================== */
video.addEventListener("timeupdate", function() {
    if (!video.duration) return;

    const pct = (video.currentTime / video.duration) * 100;

    /* Update both the normal and fullscreen progress bars */
    progressBar.value   = pct;
    fsProgressBar.value = pct;

    const formatted = formatTime(video.currentTime);
    currentTimeEl.textContent = formatted;
    fsCurrentTime.textContent = formatted;

    autoHighlightStep();
});

video.addEventListener("loadedmetadata", function() {
    const formatted = formatTime(video.duration);
    totalDurEl.textContent = formatted;
    fsTotalDur.textContent  = formatted;
});

/* =====================================================================
   SCRUBBER — click to seek
   ===================================================================== */
function seekFromClick(e, barElement) {
    const rect = barElement.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
}

scrubberWrap.addEventListener("click", function(e) {
    seekFromClick(e, progressBar);
});

fsScrubberWrap.addEventListener("click", function(e) {
    seekFromClick(e, fsProgressBar);
});

/* =====================================================================
   SCRUBBER — drag for real-time visual feedback
   The .dragging class makes the bar grow taller (via CSS) so the user
   can see they are interacting with it. The bar updates on every mousemove.
   ===================================================================== */
function addDragBehaviour(wrapperEl, barEl) {
    let dragging = false;

    wrapperEl.addEventListener("mousedown", function(e) {
        dragging = true;
        wrapperEl.classList.add("dragging");
        seekFromClick(e, barEl);
    });

    /* Listen on document so dragging outside the bar still works */
    document.addEventListener("mousemove", function(e) {
        if (!dragging) return;
        seekFromClick(e, barEl);
    });

    document.addEventListener("mouseup", function() {
        if (!dragging) return;
        dragging = false;
        wrapperEl.classList.remove("dragging");
    });

    /* Touch support */
    wrapperEl.addEventListener("touchstart", function(e) {
        dragging = true;
        wrapperEl.classList.add("dragging");
        seekFromClick(e.touches[0], barEl);
    });

    document.addEventListener("touchmove", function(e) {
        if (!dragging) return;
        seekFromClick(e.touches[0], barEl);
    });

    document.addEventListener("touchend", function() {
        dragging = false;
        wrapperEl.classList.remove("dragging");
    });
}

addDragBehaviour(scrubberWrap,   progressBar);
addDragBehaviour(fsScrubberWrap, fsProgressBar);

/* =====================================================================
   SKIP ±15 SECONDS
   ===================================================================== */
function skip(seconds) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
}

rewindBtn.addEventListener("click",   function() { skip(-15); });
forwardBtn.addEventListener("click",  function() { skip(+15); });
fsRewindBtn.addEventListener("click", function() { skip(-15); });
fsForwardBtn.addEventListener("click",function() { skip(+15); });

/* =====================================================================
   PLAYBACK SPEED  (shared between normal and fullscreen pills)
   ===================================================================== */
function cycleSpeed() {
    speedIndex = (speedIndex + 1) % SPEEDS.length;
    video.playbackRate = SPEEDS[speedIndex];
    const label = SPEEDS[speedIndex] + "×";
    speedBtn.textContent   = label;
    fsSpeedBtn.textContent = label;
}

speedBtn.addEventListener("click",   cycleSpeed);
fsSpeedBtn.addEventListener("click", cycleSpeed);

/* =====================================================================
   LIKE BUTTON
   ===================================================================== */
likeBtn.addEventListener("click", function() {
    liked = !liked;
    likeCount += liked ? 1 : -1;
    likeBtn.classList.toggle("liked", liked);
    likeCountEl.textContent = likeCount;
});

/* =====================================================================
   FULLSCREEN
   I make the <figure class="video-wrapper"> fullscreen (not just the
   <video>) so our overlay controls are included.
   listen for the fullscreenchange event to add/remove .is-fullscreen
   on <body>, which CSS uses to show the overlay.
   ===================================================================== */
fullscreenBtn.addEventListener("click", function() {
    const wrapper = document.querySelector(".video-wrapper");
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange", function() {
    if (document.fullscreenElement) {
        document.body.classList.add("is-fullscreen");
    } else {
        document.body.classList.remove("is-fullscreen");
    }
});

/* =====================================================================
   TABS
   ===================================================================== */
tabSteps.addEventListener("click", function() {
    tabSteps.classList.add("active");
    tabIngr.classList.remove("active");
    panelSteps.style.display = "block";
    panelIngr.style.display  = "none";
});

tabIngr.addEventListener("click", function() {
    tabIngr.classList.add("active");
    tabSteps.classList.remove("active");
    panelIngr.style.display  = "flex";
    panelIngr.style.flexDirection = "column";
    panelSteps.style.display = "none";
});



/* =====================================================================
   STEP JUMP
    I searched some webpages and asked Claude to finish step list part, this part is a bit tricky for me.
   ===================================================================== */
function jumpToStep(index) {
    video.currentTime = STEPS[index].time;
    if (video.paused) {
        video.play();
        setPlayIcon(true);
    }
    setActiveStep(index);
}

/* =====================================================================
   AUTO-HIGHLIGHT STEP as video plays
   ===================================================================== */
function autoHighlightStep() {
    let newActive = 0;
    for (let i = 0; i < STEPS.length; i++) {
        if (video.currentTime >= STEPS[i].time) newActive = i;
    }
    if (newActive !== activeStep) setActiveStep(newActive);
}

function setActiveStep(index) {
    activeStep = index;
    document.querySelectorAll("li.step-item").forEach(function(el) {
        el.classList.remove("active");
    });
    const all = document.querySelectorAll("li.step-item");
    if (all[index]) all[index].classList.add("active");
    stepCountEl.textContent = "(" + (index + 1) + "/" + STEPS.length + ")";
}

/* =====================================================================
    FORMAT TIME
   ===================================================================== */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + secs.toString().padStart(2, "0");
}