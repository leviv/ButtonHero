let users = undefined;
let turn = undefined;
let seek = undefined;
let addedUsername = false;

// Audio playing variables
let canPlay = true;
var sound = new Howl({
  src: ['song1.mp3']
});

const fade = 1000;
const duration = 2000;

(function () {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBP323vkXAiymVIJj_APcoT92sDw-NOqqA",
    authDomain: "instrument-71113.firebaseapp.com",
    databaseURL: "https://instrument-71113.firebaseio.com",
    projectId: "instrument-71113",
    storageBucket: "instrument-71113.appspot.com",
    messagingSenderId: "698031967313",
    appId: "1:698031967313:web:c772e7051a9b4cdd5cfc70"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Get a reference to the database
  let dbRef = firebase.database().ref();

  dbRef.on('value', function(snapshot) {
    console.log(snapshot.val());
    users = snapshot.val().users;
    turn = snapshot.val().turn;
    seek = snapshot.val().seek;

    const username = document.getElementById("username-input").value;
    if (turn !== "") {
      document.getElementById("whose-turn").innerHTML = turn;
    } else {
      document.getElementById("whose-turn").innerHTML = "no one";
    }


    // Check if it is our users turn
    if (username !== "" && turn === username){
      document.getElementById("button").classList.add('on');
      canPlay = true;
    } else {
      document.getElementById("button").classList.remove('on');
      canPlay = false;
    }
  });
}());

// Function that is called whenever the button is clicked/tapped
function clickButton() {
  let username = document.getElementById("username-input").value;

  if (username !== turn || !addedUsername) {
    return;
  }

  if (canPlay) {
    sound.seek(seek);

    // Check if the sound is still playing
    if (!sound.playing()) {
      sound.play();
    }

    sound.volume(1);

    canPlay = false;
    document.getElementById("button").classList.remove('on');

    setTimeout(function(){
      sound.fade(1, 0, fade);

      let updates = {};
      let newTurn = users[Math.floor(Math.random() * users.length)]

      // Update the new turn
      updates['/turn/'] = newTurn;

      // Set the time
      updates['/seek/'] = sound.seek() +  (fade / 1000 / 2);
      firebase.database().ref().update(updates);

      username = document.getElementById("username-input").value;
      if (newTurn === username) {
        canPlay = true;
        document.getElementById("button").classList.add('on');
      }

      setTimeout(function(){
        if (canPlay) {
          sound.pause();
        }
      }, fade);
    }, duration);
  }
}

function addUsername() {
  const username = document.getElementById("username-input").value;

  // Check that username is filled out
  if (username == "") {
    alert("Username must be filled in");
    return;
  // Check if the username already exists
  } else if (users !== undefined && users.includes(username)) {
    alert("Username is taken");
    return;
  }

  if (users === undefined) {
    users = [];
  }

  // Update the new username array
  let updates = {};
  users.push(username);
  updates['/users/'] = users;

  // Update the new turn
  updates['/turn/'] = users[Math.floor(Math.random() * users.length)];

  // Reset the time
  updates['/seek/'] = 0.0;

  addedUsername = true;
  return firebase.database().ref().update(updates);
}

function reset() {
  let updates = {};
  updates['/users/'] = [];
  updates['/turn/'] = "";
  updates['/seek/'] = 0.0;
  addedUsername = false;
  return firebase.database().ref().update(updates);
}
