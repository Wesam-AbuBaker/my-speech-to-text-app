const resultElement = document.getElementById("result");
const languageSelect = document.getElementById("languageSelect");
const headerText = document.getElementById("headerText");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const toggleModeButton = document.getElementById("toggleMode");
const copyButton = document.getElementById("copyButton");
const copyHint = document.getElementById("copyHint");
let recognition;

function startConverting() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        setupRecognition(recognition);
        recognition.start();
        startButton.classList.add('recording');
    } else {
        alert("متصفحك لا يدعم التعرف على الصوت.");
    }
}

function setupRecognition(recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageSelect.value;
    recognition.onresult = (event) => {
        const { finalTranscript, interTranscript } = processResult(event.results);
        resultElement.innerHTML = finalTranscript + interTranscript;
    };
    recognition.onerror = handleError;
    recognition.onend = () => {
        startButton.classList.remove('recording');
    };
}

function processResult(results) {
    let finalTranscript = '';
    let interTranscript = '';
    for (let i = 0; i < results.length; i++) {
        const transcript = results[i][0].transcript.replace("\n", "<br>");
        if (results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interTranscript += transcript;
        }
    }
    return { finalTranscript, interTranscript };
}

function stopConverting() {
    if (recognition) {
        recognition.stop();
        startButton.classList.remove('recording');
    }
}

function handleError(event) {
    const errorMessages = {
        'not-allowed': 'يرجى تمكين إذن الميكروفون.',
        'network': 'هناك مشكلة في الشبكة. يرجى المحاولة لاحقًا.',
        'no-speech': 'لم يتم الكشف عن أي صوت. يرجى المحاولة مجددًا.'
    };
    alert(errorMessages[event.error] || 'حدث خطأ غير متوقع.');
}

function copyText() {
    const text = resultElement.textContent;
    navigator.clipboard.writeText(text).then(showCopyHint);
}

function showCopyHint() {
    copyHint.style.display = 'block';
    setTimeout(() => {
        copyHint.style.display = 'none';
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    requestMicrophonePermission();
    setupLanguageChangeListener();
});

function requestMicrophonePermission() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(showPermissionInstructions);
}

function showPermissionInstructions() {
    const instructionDiv = document.createElement('div');
    instructionDiv.style.position = 'fixed';
    instructionDiv.style.bottom = '20px';
    instructionDiv.style.left = '20px';
    instructionDiv.style.backgroundColor = '#FF5722';
    instructionDiv.style.color = '#FFF';
    instructionDiv.style.padding = '15px';
    instructionDiv.style.borderRadius = '8px';
    instructionDiv.style.zIndex = '1000';
    instructionDiv.innerHTML = `
        <p>يرجى تمكين إذن الميكروفون في إعدادات المتصفح الخاصة بك.</p>
    `;
    document.body.appendChild(instructionDiv);
    setTimeout(() => instructionDiv.remove(), 7000);
}

function setupLanguageChangeListener() {
    languageSelect.addEventListener('change', () => {
        if (recognition && recognition.start) {
            recognition.stop();
            setupRecognition(recognition);
        }
        updateLanguage();
    });
    updateLanguage();
}

function updateLanguage() {
    const selectedLanguage = languageSelect.value;
    headerText.textContent = selectedLanguage === 'ar-AR' ? 'محول الكلام إلى نص' : 'Speech to Text Converter';
    document.body.style.direction = selectedLanguage === 'ar-AR' ? 'rtl' : 'ltr';
}

toggleModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleModeButton.innerHTML = `<i class="fa ${document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'}"></i>`;
});
