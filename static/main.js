window.addEventListener("load", function(event){
  App.start();
})

var App = {};
var googleUser = {};
App.start = function() {
    gapi.load('auth2', function(){
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    auth2 = gapi.auth2.init({
      client_id: '191815373223-e6gimsdlrqq6strtcsqstgmr426tjavj.apps.googleusercontent.com',
      cookiepolicy: 'single_host_origin',
      scope: 'https://www.googleapis.com/auth/drive.file'
    });
    attachSignin(document.getElementById('customBtn'));
  });
};

function attachSignin(element) {
  console.log(element.id);
  auth2.attachClickHandler(element, {},
      function(googleUser) {
        document.getElementById('name').innerText = "Name: " + googleUser.getBasicProfile().getName();
        document.getElementById('email').innerText = "Email: " + googleUser.getBasicProfile().getEmail();
        document.getElementById('gSignInWrapper').style.display = 'none';
        document.getElementById('btnPanel').style.display = 'block';
        // document.getElementById('newFileBtn').style.display = 'block';
        // saveFiles();
      }, function(error) {
        alert(JSON.stringify(error, undefined, 2));
      });
};

function createFiles() {
  document.getElementById('btnPanel').style.display = 'none';
  var createFilePanel = document.createElement("div");
  createFilePanel.setAttribute("id", "createFilePanel");
  var fileNameLabel = document.createTextNode("File name:");
  createFilePanel.appendChild(fileNameLabel);
  createFilePanel.appendChild(document.createElement("br"));
  var fileNameField = document.createElement("INPUT");
  fileNameField.setAttribute("type", "text");
  createFilePanel.appendChild(fileNameField);
  createFilePanel.appendChild(document.createElement("br"));
  var fileContentLabel = document.createTextNode("File content:");
  createFilePanel.appendChild(fileContentLabel);
  createFilePanel.appendChild(document.createElement("br"));
  var fileContentField = document.createElement("TEXTAREA");
  createFilePanel.appendChild(fileContentField);
  createFilePanel.appendChild(document.createElement("br"));
  var saveFileBtn = document.createElement("BUTTON");
  saveFileBtn.innerHTML = "Save file";
  createFilePanel.appendChild(saveFileBtn);
  saveFileBtn.onclick = function() {saveFiles(fileNameField.value, fileContentField.value)};
  var backBtn = document.createElement("BUTTON");
  backBtn.innerHTML = "Back";
  createFilePanel.appendChild(backBtn);
  document.body.appendChild(createFilePanel);
  backBtn.onclick = function() {backToMain()};
};

function backToMain() {
  document.getElementById("createFilePanel").style.display = 'none';
  document.getElementById("btnPanel").style.display = 'block';
};

function saveFiles(fileName, fileContent) {
  var file = new Blob([fileContent], {type: 'text/plain'});
  var metadata = {
    'name': fileName,
    'mimeType': 'text/plain',
  };

  var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
  var form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  }).then((res) => {
    return res.json();
  }).then(function(val) {
    var savedFileMess = document.createTextNode("File is saved to your Google Drive!");
    document.getElementById("createFilePanel").appendChild(document.createElement("br"));
    document.getElementById("createFilePanel").appendChild(savedFileMess);
    console.log(val);
  });
};
