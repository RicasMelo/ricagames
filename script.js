import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

// All Firebase paths live under this root. Changing it creates a separate game namespace.
const GAME_NAME = "Game1";
const MIN_PASSWORD_LENGTH = 3;
const CHARACTER_PAGE = "character.html";
const LOBBY_PAGE = "lobby.html";

const firebaseConfig = {
  apiKey: "AIzaSyB6bbntbA1neFXQQgntP-rJUJK_bevSw2g",
  authDomain: "ricagames.firebaseapp.com",
  databaseURL: "https://ricagames-default-rtdb.firebaseio.com",
  projectId: "ricagames",
  storageBucket: "ricagames.firebasestorage.app",
  messagingSenderId: "892798133679",
  appId: "1:892798133679:web:164320be2bc582a3153b5a",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const authBox = document.getElementById("authBox");
const loadingBox = document.getElementById("loadingBox");
const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");
const authMessage = document.getElementById("authMessage");

const savedNickname = localStorage.getItem("username");
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

if (savedNickname && isLoggedIn) {
  routeLoggedInPlayer(savedNickname);
} else {
  loadingBox.classList.add("hidden");
  authBox.classList.remove("hidden");
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    authMessage.textContent = "";

    const nickname = cleanNickname(nicknameInput.value);
    const password = cleanPassword(passwordInput.value);
    const playerRef = ref(db, `${GAME_NAME}/Players/${nickname}`);
    const snapshot = await get(playerRef);

    if (!snapshot.exists()) {
      throw { code: "player-not-found" };
    }

    const player = snapshot.val();

    if (player.password !== password) {
      throw { code: "wrong-password" };
    }

    await update(playerRef, {
      lastLogin: serverTimestamp(),
    });

    rememberPlayer(nickname);
    await routeLoggedInPlayer(nickname);
  } catch (error) {
    showError(error);
  }
});

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    authMessage.textContent = "";

    const nickname = cleanNickname(nicknameInput.value);
    const password = cleanPassword(passwordInput.value);
    const playerRef = ref(db, `${GAME_NAME}/Players/${nickname}`);
    const snapshot = await get(playerRef);

    if (snapshot.exists() && snapshot.val()?.password) {
      throw { code: "player-already-exists" };
    }

    const playerData = {
      nickname,
      username: nickname,
      displayName: nickname,
      password,
      ready: false,
      score: 0,
      vote: 0,
      role: "waiting",
      level: 1,
      towerFloor: 1,
      discoveredWords: {},
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    if (snapshot.exists()) {
      await update(playerRef, {
        nickname,
        username: nickname,
        displayName: nickname,
        password,
        lastLogin: serverTimestamp(),
      });
    } else {
      await set(playerRef, playerData);
    }

    rememberPlayer(nickname);
    await routeLoggedInPlayer(nickname);
  } catch (error) {
    showError(error);
  }
});

async function routeLoggedInPlayer(nickname) {
  try {
    // Login/register only identifies the player. This decides whether they still
    // need character creation or can continue to the world lobby.
    const snapshot = await get(ref(db, `${GAME_NAME}/Players/${nickname}`));
    const player = snapshot.val();

    if (!snapshot.exists()) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("gameId");
      showError({ code: "player-not-found" });
      return;
    }

    if (player?.character?.name) {
      window.location.href = LOBBY_PAGE;
    } else {
      window.location.href = CHARACTER_PAGE;
    }
  } catch (error) {
    loadingBox.classList.add("hidden");
    authBox.classList.remove("hidden");
    showError(error);
  }
}

function cleanNickname(value) {
  const nickname = value.trim();

  if (!nickname) {
    throw { code: "missing-nickname" };
  }

  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(nickname)) {
    throw { code: "invalid-nickname" };
  }

  return nickname;
}

function cleanPassword(value) {
  if (!value) {
    throw { code: "missing-password" };
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    throw { code: "weak-password" };
  }

  return value;
}

function rememberPlayer(nickname) {
  // These localStorage values are the lightweight session used by every page.
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", nickname);
  localStorage.setItem("gameId", GAME_NAME);
}

function showError(error) {
  console.error("Realtime database login error:", error);
  authMessage.textContent = cleanError(error?.code);
}

function cleanError(code) {
  switch (code) {
    case "missing-nickname":
      return "Nickname required.";
    case "invalid-nickname":
      return "Use 3-20 letters, numbers, _ or -.";
    case "missing-password":
      return "Password required.";
    case "weak-password":
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "player-not-found":
      return "Nickname not registered.";
    case "player-already-exists":
      return "Nickname already registered.";
    case "wrong-password":
      return "Wrong nickname or password.";
    case "PERMISSION_DENIED":
    case "permission-denied":
      return "Firebase database permission denied.";
    default:
      return `Login failed: ${code || "unknown error"}.`;
  }
}
