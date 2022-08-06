const inputElement = document.getElementById("audio-input")
const allowed_types = ["audio", "video"]
let audioElement = new Audio()

// change audio button
const changeAudioButton = document.querySelector("button#change-audio")

/**@type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas#audio-canvas")

// canvas context
/**@type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")

let current_audio_file = null

// analyser node for audio stats
/**@type {AnalyserNode} */
let analyser = null


window.addEventListener("DOMContentLoaded", e => {
    resizeCanvas()
    inputElement.addEventListener("change", e => {
        if (inputElement.files.length) {
            handleAdioFileChange(inputElement.files[0])
        }
    })
})

window.addEventListener("resize", resizeCanvas)

changeAudioButton.addEventListener("click", e => {
    current_audio_file = null
    inputElement.parentElement.classList.remove("hidden")
    changeAudioButton.parentElement.classList.add("hidden")
    audioElement.pause()
    audioElement.src = ""
})


function resizeCanvas() {
    w = window.innerWidth * window.devicePixelRatio
    h = window.innerHeight * window.devicePixelRatio
    canvas.width = w
    canvas.height = h

    // console.log(canvas.height, canvas.width, window.devicePixelRatio);
}

function handleAdioFileChange(audioFile) {
    audioElement = audioElement.cloneNode(true)
    if (audioElement.canPlayType(audioFile.type)) {
        audioElement.loop = true
        // set current playing audio to the selected one
        current_audio_file = audioFile
        // initialize audi visualization
        init()
    }
}



function init() {
    // hide the audio selector
    inputElement.parentElement.classList.add("hidden")
    audioElement.src = URL.createObjectURL(current_audio_file)
    changeAudioButton.parentElement.classList.remove("hidden")
    audioElement.play().then(r => {
        kickoff()
    }).catch(err => {
        alert("Can't play audio! " + err)
    })
}


/**
 * Starts a canvas animation
 */
function kickoff() {
    const audioContext = new AudioContext()
    const audioSource = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    audioSource.connect(analyser)
    analyser.connect(audioContext.destination)
    analyser.smoothingTimeConstant = .85
    analyser.fftSize = 512
    console.log("animating now!");
    requestAnimationFrame(animate)

}

// Reduce the framerate computations variables

let last_time = 0
let counter = 0


function animate(current_time) {
    // if (counter > 200) {
    //     return
    // }
    if (!current_audio_file) {
        // ctx.fillStyle = "white"
        return ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    if ((current_time - last_time) < 10) {
        // this will run once in given milliseconds
        counter = requestAnimatiownFrame(animate)
        return
    }

    const bytesCount = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bytesCount)

    analyser.getByteFrequencyData(dataArray)

    w = canvas.width / bytesCount
    y = canvas.height / 2
    x = canvas.width / 2
    r = 100

    // console.log({w, bytesCount, cvs: canvas.width});

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.beginPath()
    // ctx.arc(x, y, 40, 0, 2 * Math.PI)
    // ctx.fillStyle = "white"
    // ctx.fill()
    // ctx.closePath()
    // let fourth = dataArray.length / 4;
    ctx.strokeStyle = "white"
    // ctx.save()
    // const startX = 300 + Math.cos(.5 * Math.PI)+ (r * dataArray[0]/256)
    // const startY = 300 + Math.sin(.5 * Math.PI)+ (r * dataArray[0]/256)
    // ctx.beginPath()
    // ctx.lineTo(startX, startY)
    for (let i = 0; i < dataArray.length; i++) {
        let X = w * i
        let Y = -1 * ((dataArray[i] * 2)/4) * (100 / (255/4)) + y
    
        ctx.lineTo(X, Y)

        // let angle = (0.5 - (i * 1) / fourth) * Math.PI;
        // let newX = 300 + Math.cos(angle) * (r * dataArray[i]/fourth)
        // let newY = 300 + Math.sin(angle) * (r * dataArray[i]/fourth)
        
        // ctx.lineTo(newX, newY)
    }

    // ctx.fillStyle = "white"
    // ctx.fill()
    ctx.lineJoin = "round"
    ctx.stroke()
    ctx.closePath()
    ctx.font = "28px serif"
    ctx.strokeText(current_audio_file.name, canvas.width * 1/12, canvas.height * 1/8)
    counter = requestAnimationFrame(animate)
}
