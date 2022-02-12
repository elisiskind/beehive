const extractAnswers = () => {
  const prefix = "window.gameData = ";
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const content = scripts[i].textContent;
    if (content.indexOf(prefix) !== -1) {
      const today = JSON.parse(content.substr(prefix.length))?.today;
      return {
        words: today?.answers,
        expiration: today?.expiration
      }
    }
  }
};

const sendGuesses = () => {
  const currentState = localStorage.getItem("sb-today");
  if (currentState) {
    chrome.runtime.sendMessage({
      guesses: JSON.parse(currentState).words,
    });
  }
};

const listenForRequests = () => {
  console.log('listening for requests!')
  chrome.runtime.onMessage.addListener((message) => {
    console.log('Message! ', message)
    if (message.type === "answers-request") {
      const message = { answers: extractAnswers() };
    console.log('Answers request! Responding with: ', message)
      chrome.runtime.sendMessage(message);
      sendGuesses();
    }
  });
};

const listenForUserInput = () => {
  window.onkeyup = (e) => {
    if (e.key === "Enter") {
      setTimeout(() => sendGuesses(), 100);
    }
  };

  document.getElementsByClassName("hive-action__submit")[0].onclick = () => {
    setTimeout(() => sendGuesses(), 100);
  };
}

listenForUserInput();
listenForRequests();
