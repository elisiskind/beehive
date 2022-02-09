const extractTodaysWords = () => {
  const prefix = "window.gameData = ";
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const content = scripts[i].textContent;
    if (content.indexOf(prefix) !== -1) {
      return JSON.parse(content.substr(prefix.length))?.today?.answers;
    }
  }
};

const sendCurrentState = () => {
  const currentState = localStorage.getItem("sb-today");
  if (currentState) {
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(
      {
        words: JSON.parse(currentState).words,
        answers: extractTodaysWords(),
      },
      (resp) => {
        console.log(resp);
      }
    );
  }
};

const sendWithDelay = () => setTimeout(() => sendCurrentState(), 100);
sendWithDelay();

window.onkeyup = (e) => {
  if (e.key === "Enter") {
    sendWithDelay();
  }
};

document.getElementsByClassName("hive-action__submit")[0].onclick = () => {
  sendWithDelay();
};
