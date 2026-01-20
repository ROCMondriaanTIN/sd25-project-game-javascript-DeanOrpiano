function startGame() {
  reset();
  showTextNode(0);
}

function showTextNode(textNodeIndex) {
  var node = getTextNode(textNodeIndex);
  var s = getState();

  let text;

  if (typeof node.text === "function") {
    text = node.text(s);
  } else {
    text = node.text;
  }

  setText(text);
  clearOptions();

  for (var i = 0; i < node.options.length; i++) {
    let option = node.options[i];

    if (showOption(option)) {
      addOptionButton(option.text, function () {
        selectOption(option);
      });
    }
  }
}

// Show option if no requiredState 
function showOption(option) {
  return true;
}



function selectOption(option) {
  // Apply state changes (like choosing archetype)
  if (option.setState) {
    setState(option.setState);
  }

  // Stat check options
  if (option.check) {
    var ok = statCheck(option.check.stat);

    // Update win counters (best-of-3)
    var s = getState();
    if (ok) {
      s.game.successes += 1;
    } else {
      s.game.fails += 1;
    }
    s.game.checksDone += 1;

    // Run extra effects
    if (ok && option.check.onSuccess) {
      option.check.onSuccess();
    }
    if (!ok && option.check.onFail) {
      option.check.onFail();
    }

    // Go to correct node
    if (ok) {
      showTextNode(option.check.success);
    } else {
      showTextNode(option.check.fail);
    }
    return;
  }

  
  var nextTextNodeId = option.nextText;

  //Reset the game if lower than 0
  if (nextTextNodeId <= 0) {
    startGame();
    return;
  }

  showTextNode(nextTextNodeId);
}

// Start game when page loads
startGame();
