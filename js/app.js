var mainData = JSON.parse(localStorage.getItem("mainData")) || {};

const firebaseConfig = {
  apiKey: "AIzaSyCGzQuG-y3Mj0defDsWnbfMot-Y3bBOU6U",
  authDomain: "counter-9a21b.firebaseapp.com",
  databaseURL: "https://counter-9a21b.firebaseio.com",
  projectId: "counter-9a21b",
  storageBucket: "counter-9a21b.appspot.com",
  messagingSenderId: "1047310142376",
  appId: "1:1047310142376:web:3b4045dccdbc2cb770ab9d"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

window.onload = e => {
  if (mainData.uid != undefined) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
    initUI();
  } else {
    var ins = M.Modal.init(document.querySelector("#loginScreen"), {
      opacity: 1,
      dismissible: false
    });
    ins.open();
  }
};

const login = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(function(result) {
      var token = result.credential.accessToken;
      var user = result.user;
      var ins = M.Modal.init(document.querySelector("#loginScreen"), {
        opacity: 1,
        dismissible: false
      });
      db.collection("User")
        .doc(user.uid)
        .get()
        .then(doc => {
          if (!doc.exists) {
            db.collection("Users")
              .doc(user.uid)
              .set({
                email: user.email,
                name: user.displayName
              })
              .then(() => {
                mainData = {
                  uid: user.uid,
                  email: user.email,
                  name: user.displayName
                };
                localStorage.setItem("mainData", JSON.stringify(mainData));
                ins.close();
                initUI();
              });
          } else {
            mainData = {
              uid: user.uid,
              email: user.email,
              name: user.displayName
            };
            localStorage.setItem("mainData", JSON.stringify(mainData));
            ins.close();
            initUI();
          }
        });
    });
};

const initUI = () => {
  document.querySelectorAll("header")[0].classList.remove("hide");
  document.querySelectorAll("main")[0].classList.remove("hide");
  document.querySelectorAll("footer")[0].classList.remove("hide");
  updateList();
  M.Modal.init(document.querySelectorAll(".modal"), {});
};

const updateList = () => {
  db.collection("Users")
    .doc(mainData.uid)
    .collection("list")
    .onSnapshot(snap => {
      let html = "";
      snap.forEach(doc => {
        let list = doc.data();
        html += `
      <div class="card">
            <div class="input-field center flow-text valign-wrapper">
              <div class="col s6 m6 l6 center">${list.name}</div>
              <div class="col s2 m2 l2 center">
                <button
                  class="btn-floating btn-small blue"
                  onclick="subCount('${doc.id}')"
                >
                  <i class="material-icons">${
                    list.count == 0 ? "delete" : "remove"
                  }</i>
                </button>
              </div>
              <div class="col s2 m2 l2 center card white-text blue">
                ${list.count}
              </div>
              <div class="col s2 m2 l2 center">
                <button
                  class="btn-floating btn-small  blue"
                  onclick="addCount('${doc.id}')"
                >
                  <i class="material-icons">add</i>
                </button>
              </div>
            </div>
          </div>
      `;
      });
      document.getElementById("namesList").innerHTML = html;
    });
};
const addCount = id => {
  let tr = db
    .collection("Users")
    .doc(mainData.uid)
    .collection("list")
    .doc(id);
  db.runTransaction(trans => {
    return tr.get().then(doc => {
      let cnt = doc.data().count + 1;
      trans.update(tr, { count: cnt });
    });
  });
};
const subCount = id => {
  let tr = db
    .collection("Users")
    .doc(mainData.uid)
    .collection("list")
    .doc(id);
  db.runTransaction(trans => {
    return tr.get().then(doc => {
      let cnt = doc.data().count - 1;
      if (cnt > -1) {
        trans.update(tr, { count: cnt });
      } else {
        tr.delete().then(() => {
          alert("User Deleted");
        });
      }
    });
  });
};
const addElement = () => {
  let name = document.getElementById("elemName").value;
  if (name.length > 3) {
    let tr = db
      .collection("Users")
      .doc(mainData.uid)
      .collection("list")
      .add({
        name: name,
        count: 0
      });
    M.Modal.getInstance(document.querySelector("#addElement")).close();
  } else {
    alert("Please Enter Name");
  }
};
