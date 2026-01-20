// model.js (MODEL) - data + rules + story

// This is the "save file" of the game
var state = {};

// Reset everything to start a new game
function reset() {
  state = {
    player: {
      name: "Rookie",
      archetype: "",
      stats: { SHOOT: 0, HANDLE: 0, DEFENSE: 0, IQ: 0 },
    },
    game: {
      points: 0,
      assists: 0,
      fgMade: 0,
      fgAtt: 0,

      // Win condition (best-of-3)
      successes: 0,
      fails: 0,
      checksDone: 0,
    },
    lastCheck: null,
    lastPlay: "",
  };
}

// Let other files read the current state
function getState() {
  return state;
}

// Update parts of the state (simple beginner merge)
function setState(partial) {
  if (!partial) return;

  // Update player
  if (partial.player) {
    if (partial.player.name !== undefined) state.player.name = partial.player.name;
    if (partial.player.archetype !== undefined) state.player.archetype = partial.player.archetype;

    // Update stats
    if (partial.player.stats) { 
      var statsKeys = Object.keys(partial.player.stats);
      for (var i = 0; i < statsKeys.length; i++) {
        var key = statsKeys[i];
        state.player.stats[key] = partial.player.stats[key];
      }
    }
  }

  // Update game
  if (partial.game) {
    var gameKeys = Object.keys(partial.game);
    for (var j = 0; j < gameKeys.length; j++) {
      var gKey = gameKeys[j];
      state.game[gKey] = partial.game[gKey];
    }
  }

  // Update other top-level keys if needed
  var keys = Object.keys(partial);
  for (var k = 0; k < keys.length; k++) {
    var topKey = keys[k];
    if (topKey !== "player" && topKey !== "game") {
      state[topKey] = partial[topKey];
    }
  }
}

// Random number 1 to 10
function d10() {
  return Math.floor(Math.random() * 10) + 1;
}

// Stat check: SUCCESS if stat > roll
function statCheck(statKey) {
  var roll = d10();
  var statValue = state.player.stats[statKey];
  var success = false;

  if (statValue > roll) {
    success = true;
  } else {
    success = false;
  }

  state.lastCheck = {
    statKey: statKey,
    statValue: statValue,
    roll: roll,
    success: success,
  };

  return success;
}

// Track shots
function addShot(points) {
  state.game.fgAtt += 1;

  if (points > 0) {
    state.game.fgMade += 1;
    state.game.points += points;
  }
}

// Track assists
function addAssist() {
  state.game.assists += 1;
}

// Build the result screen text
function resultText() {
  var lc = state.lastCheck;

  if (!lc) {
    return "Result.";
  }

  var resultLine = "";
  if (lc.success) {
    resultLine = "SUCCESS ✅";
  } else {
    resultLine = "FAIL ❌";
  }

  return (
    "<b>" + resultLine + "</b><br><br>" +
    "Check: <b>" + lc.statKey + "</b><br>" +
    "Your stat: <b>" + lc.statValue + "</b><br>" +
    "D10 roll: <b>" + lc.roll + "</b><br><br>" +
    "<i>" + (state.lastPlay || "") + "</i><br><br>" +
    "<b>Progress:</b> " + state.game.successes + " success / " + state.game.fails + " fail"
  );
}

// ---------------- STORY NODES ----------------
var textNodes = [
{
  id: 0,
  text:
    "<b>HOW TO PLAY 🏀</b><br><br>" +
    "1) Pick an <b>archetype</b><br>" +
    "2) Choose a play (SHOOT / HANDLE / DEFENSE / IQ)<br>" +
    "3) (STAT check) = D10 roll (1–10)<br>" +
    "4) You win if your stat is higher<br><br>" +
    "<b>Goal:</b> Get 2 successes to make the team.<br><br>" +
    "Click <b>Start</b>.",
  options: [{ text: "Start", nextText: 7 }]
},


  {
    id: 1,
    text: "WELCOME TO <b>HOOPS LEGACY</b> 🏀<br><br>Choose your archetype:",
    options: [
      {
        text: "Sharpshooter (shooting focus)",
        setState: {
          player: {
            archetype: "Sharpshooter",
            stats: { SHOOT: 8, HANDLE: 5, DEFENSE: 4, IQ: 6 },
          },
        },
        nextText: 2,
      },
      {
        text: "Defender (lockdown focus)",
        setState: {
          player: {
            archetype: "Defender",
            stats: { SHOOT: 5, HANDLE: 6, DEFENSE: 8, IQ: 5 },
          },
        },
        nextText: 2,
      },
      {
        text: "Playmaker (smart + handle)",
        setState: {
          player: {
            archetype: "Playmaker",
            stats: { SHOOT: 5, HANDLE: 8, DEFENSE: 5, IQ: 7 },
          },
        },
        nextText: 2,
      },
      {
        text: "Two-Way (balanced)",
        setState: {
          player: {
            archetype: "Two-Way",
            stats: { SHOOT: 6, HANDLE: 6, DEFENSE: 6, IQ: 6 },
          },
        },
        nextText: 2,
      },
    ],
  },

  {
    id: 2,
    text: function (s) {
return (
  "Name: <b>" + s.player.name + "</b><br>" +
  "You picked: <b>" + s.player.archetype + "</b><br>" +
  "Stats: SHOOT " + s.player.stats.SHOOT +
  " | HANDLE " + s.player.stats.HANDLE +
  " | DEFENSE " + s.player.stats.DEFENSE +
  " | IQ " + s.player.stats.IQ +
  "<br><br>Coach: \"Tryouts start now. Prove yourself.\""
);

    },
    options: [
      { text: "Start tryout", nextText: 3 },
      { text: "Restart", nextText: -1 },
    ],
  },

  {
    id: 3,
    text: "<b>TRYOUT:</b> Defender is in front of you.<br>Coach is watching. What do you do?",
    options: [
      {
        text: "Drive (HANDLE check)",
        check: {
          stat: "HANDLE",
          success: 10,
          fail: 11,
          onSuccess: function () {
            state.lastPlay = "You blow by him and score! (2 pts)";
            addShot(2);
          },
          onFail: function () {
            state.lastPlay = "You try to drive... stripped. Turnover.";
          },
        },
      },
      {
        text: "Pass (IQ check)",
        check: {
          stat: "IQ",
          success: 12,
          fail: 13,
          onSuccess: function () {
            state.lastPlay = "You spot a cutter and hit him. Easy bucket! (Assist)";
            addAssist();
          },
          onFail: function () {
            state.lastPlay = "Bad read. Pass gets stolen.";
          },
        },
      },
      {
        text: "Shoot (SHOOT check)",
        check: {
          stat: "SHOOT",
          success: 14,
          fail: 15,
          onSuccess: function () {
            state.lastPlay = "Quick jumper... SWISH! (2 pts)";
            addShot(2);
          },
          onFail: function () {
            state.lastPlay = "You shoot... CLANK. Missed.";
            addShot(0);
          },
        },
      },
    ],
  },

  // Tryout results
  { id: 10, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },
  { id: 11, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },
  { id: 12, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },
  { id: 13, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },
  { id: 14, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },
  { id: 15, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 4 }] },

  {
    id: 4,
    text: "Coach blows the whistle.<br><br>\"Good. You’re in for the <b>Rookie Showcase</b> tonight.\"",
    options: [{ text: "Go to showcase", nextText: 5 }],
  },

  {
    id: 5,
    text: "<b>SHOWCASE:</b> Opponent star is heating up.<br><br>Coach points at you: “Guard him.”",
    options: [
      {
        text: "Clamp him (DEFENSE check)",
        check: {
          stat: "DEFENSE",
          success: 20,
          fail: 21,
          onSuccess: function () {
            state.lastPlay = "You stay in front and force a bad shot. Big stop!";
          },
          onFail: function () {
            state.lastPlay = "He cooks you with a stepback. Bucket.";
          },
        },
      },
      {
        text: "Read the play (IQ check)",
        check: {
          stat: "IQ",
          success: 22,
          fail: 23,
          onSuccess: function () {
            state.lastPlay = "You call the screen early and blow up the play.";
          },
          onFail: function () {
            state.lastPlay = "Late read. They get an easy layup.";
          },
        },
      },
    ],
  },

  // Defense results
  { id: 20, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 6 }] },
  { id: 21, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 6 }] },
  { id: 22, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 6 }] },
  { id: 23, text: function () { return resultText(); }, options: [{ text: "Next", nextText: 6 }] },

  {
    id: 6,
    text: "<b>FINAL PLAY:</b> Tie game. Last possession.<br><br>You get the ball. What’s the move?",
    options: [
      {
        text: "Shoot a 3 (SHOOT check)",
        check: {
          stat: "SHOOT",
          success: 30,
          fail: 31,
          onSuccess: function () {
            state.lastPlay = "You rise up... BANG! (3 pts)";
            addShot(3);
          },
          onFail: function () {
            state.lastPlay = "You launch... off the rim. Miss.";
            addShot(0);
          },
        },
      },
      {
        text: "Attack rim (HANDLE check)",
        check: {
          stat: "HANDLE",
          success: 32,
          fail: 33,
          onSuccess: function () {
            state.lastPlay = "You get downhill and finish! (2 pts)";
            addShot(2);
          },
          onFail: function () {
            state.lastPlay = "You try to split defenders... stripped!";
          },
        },
      },
      {
        text: "Drive & kick (IQ check)",
        check: {
          stat: "IQ",
          success: 34,
          fail: 35,
          onSuccess: function () {
            state.lastPlay = "You draw help and drop it off. Teammate scores! (Assist)";
            addAssist();
          },
          onFail: function () {
            state.lastPlay = "You hesitate and force a pass. Turnover.";
          },
        },
      },
    ],
  },
  {
  id: 7,
  text:
    "<b>ENTER YOUR NAME</b><br><br>" +
    "<input id='nameInput' type='text' placeholder='Your name...' maxlength='15' style='padding:10px; width:80%; border-radius:8px;'><br><br>",
  options: [
    {
      text: "Continue",
      nextText: 1,
      onClick: function () {
        var inp = document.getElementById("nameInput");
        var name = inp ? inp.value.trim() : "";

        if (name === "") name = "Rookie";

        setState({ player: { name: name } });
      }
    }
  ]
},


  // Clutch results -> end
  { id: 30, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },
  { id: 31, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },
  { id: 32, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },
  { id: 33, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },
  { id: 34, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },
  { id: 35, text: function () { return resultText(); }, options: [{ text: "See results", nextText: 8 }] },

  // Dramatic ending (win if successes >= 2)
  {
    id: 8,
    text: function (s) {
      var g = s.game;
      var win = false;

      if (g.successes >= 2) {
        win = true;
      } else {
        win = false;
      }

      if (win) {
        return (
          "<b>🏆 YOU MADE THE TEAM!</b><br><br>" +
          "Coach stares for a second... then nods.<br>" +
          "<b>Coach:</b> \"Good work. You earned it.\"<br><br>" +
          "<b>Key Moments:</b> " + g.successes + "/3 successes (need 2/3)<br><br>" +
          "<b>Stats this game:</b><br>" +
          g.points + " Points<br>" +
          g.assists + " Assists<br>" +
          g.fgMade + "/" + g.fgAtt + " Field Goals<br><br>" +
          "Archetype: <b>" + s.player.archetype + "</b><br>" +
          "SHOOT " + s.player.stats.SHOOT +
          " | HANDLE " + s.player.stats.HANDLE +
          " | DEFENSE " + s.player.stats.DEFENSE +
          " | IQ " + s.player.stats.IQ
        );
      } else {
        return (
          "<b>❌ YOU GOT CUT.</b><br><br>" +
          "The gym goes quiet. Coach writes something down.<br>" +
          "<b>Coach:</b> \"Not today. Come back stronger.\"<br><br>" +
          "<b>Key Moments:</b> " + g.successes + "/3 successes (need 2/3)<br><br>" +
          "<b>Stats this game:</b><br>" +
          g.points + " Points<br>" +
          g.assists + " Assists<br>" +
          g.fgMade + "/" + g.fgAtt + " Field Goals<br><br>" +
          "Archetype: <b>" + s.player.archetype + "</b><br>" +
          "SHOOT " + s.player.stats.SHOOT +
          " | HANDLE " + s.player.stats.HANDLE +
          " | DEFENSE " + s.player.stats.DEFENSE +
          " | IQ " + s.player.stats.IQ
        );
      }
    },
    options: [{ text: "Restart", nextText: -1 }],
  },
];

// Get a node by id
function getTextNode(id) {
  for (var i = 0; i < textNodes.length; i++) {
    if (textNodes[i].id === id) {
      return textNodes[i];
    }
  }
  return null;
}
