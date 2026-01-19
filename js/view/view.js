var textElement = document.querySelector("#text");
var optionsButtonsElement = document.querySelector("#option-buttons");

function setText(html) {
  textElement.innerHTML = html;
}

function clearOptions() {
  while (optionsButtonsElement.firstChild) {
    optionsButtonsElement.removeChild(optionsButtonsElement.firstChild);
  }
}

function addOptionButton(text, onClick) {
  var button = document.createElement("button");
  button.innerText = text;
  button.classList.add("btn");
  button.addEventListener("click", onClick);
  optionsButtonsElement.appendChild(button);
}
