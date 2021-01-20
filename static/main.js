window.addEventListener("load", function(event){
  App.start();
});

var App = {};
var googleUser = {};
App.start = initializeApp;

function initializeApp() {
  gapi.load('auth2', initializeGoogleSignIn());
};

function initializeGoogleSignIn() {
  auth2 = gapi.auth2.init({
    // Client ID retrieved from above
    client_id: '191815373223-e6gimsdlrqq6strtcsqstgmr426tjavj.apps.googleusercontent.com',
    cookiepolicy: 'single_host_origin',
    // Access files in the user's Google Drive
    scope: 'https://www.googleapis.com/auth/drive.file'
  });
  detectSignin(document.getElementById('customBtn'));
};

function detectSignin(element) {
  console.log(element.id);
  auth2.attachClickHandler(element, {}, signInSucceed, signInFail);
};

function signInFail(error) {
  alert(JSON.stringify(error, undefined, 2));
};

function signInSucceed(googleUser) {
  var userInfo = getUserInfo(googleUser);
  document.getElementById('name').innerText = "Name: " + userInfo[0];
  document.getElementById('email').innerText = "Email: " + userInfo[1];
  document.getElementById('gSignInWrapper').style.display = 'none';
  document.getElementById('btnPanel').style.display = 'block';
};

function getUserInfo(googleUser) {
  return [googleUser.getBasicProfile().getName(), googleUser.getBasicProfile().getEmail()];
};

function createFile() {
  document.getElementById('newFileForm').style.display = 'block';
};

function saveFileToDriveFromApp() {
  var fileName = document.getElementById('newFileName').value;
  var fileContent = document.getElementById('newFileContent').value;
  saveFileToDrive(fileName, fileContent);
}

function saveFileToDriveSucceed() {
  var savedFileMess = document.createTextNode("File is saved to your Google Drive!");
  document.getElementById("newFileForm").appendChild(document.createElement("br"));
  document.getElementById("newFileForm").appendChild(savedFileMess);
}

function saveFileToDrive(fileName, fileContent) {
  var file = new Blob([fileContent], {type: 'text/plain'});
  var metadata = {
    'name': fileName,
    'mimeType': 'text/plain',
  };

  var accessToken = gapi.auth.getToken().access_token;
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
    saveFileToDriveSucceed();
    console.log(val);
  });
};

function openFilesFormDisplay() {
  document.getElementById('openFilesForm').style.display = 'block';
};

function openFiles() {
  document.getElementById('openFilesDisplay').style.display = 'block';
  var fileName = document.getElementById('openFileName').value;
  loadFilesFromDrive(fileName);
}

function returnFileContent(fileContent) {
  // console.log(fileContent);
  return fileContent;
};

function loadFileContent(fileId, fileDisplayId) {
  gapi.load('client', function() {
    gapi.client.load('drive', 'v3', function() {
      var file = gapi.client.drive.files.get({ 'fileId': fileId, 'alt': 'media', });
      file.execute(function(res) {
        // console.log(res);
        // return res;
        // console.log(typeof(res));
        var fileContent = res.toString();
        // console.log(fileContent);
        // return fileContent;
        // console.log(fileContent);
        // return fileContent;
        // console.log(typeof(fileContent));
        // displayContentFile(fileContent);
        var currentFileContent = document.createTextNode(fileContent);
        var currentFileDisplay = document.getElementById(fileDisplayId);
        var openFilesDisplay = document.getElementById('openFilesDisplay');
        // console.log(currentFileContent.value);
        currentFileDisplay.appendChild(currentFileContent);
        openFilesDisplay.appendChild(currentFileDisplay);
      });
    });
  });
  // console.log(fileContent);
  // return fileContent;
};

function loadFilesFromDrive(fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((res) => {
    return res.json();
  }).then(function(val) {
    console.log(val);
    var openFilesDisplay = document.getElementById('openFilesDisplay');
    var numFiles = 0;

    for (i=0; i < val.files.length; i++) {
      if (fileName == val.files[i].name) {
        numFiles++;
        var currentFileDisplay = document.createElement("p");
        currentFileDisplay.id = numFiles;
        console.log(currentFileDisplay.id);
        // var currentFileContent = loadFileContent(val.files[i].id);
        // console.log(currentFileContent);
        // console.log(loadFileContent(val.files[i].id));
        // var currentFileNum = "File " + numFiles + " : ";
        var currentFileName = fileName + ": ";
        var currentFileNameDisplay = document.createTextNode(currentFileName);
        currentFileDisplay.appendChild(currentFileNameDisplay);
        openFilesDisplay.appendChild(currentFileDisplay);
        loadFileContent(val.files[i].id, currentFileDisplay.id);
      }
    }
  });
};


// function displayContentFile(fileContent) {
//   // console.log(fileContent);
//   var openFilesDisplay = document.getElementById('openFilesDisplay');
//   // console.log(openFilesDisplay);
//   var currentFileContent = document.createTextNode(fileContent);
//   // console.log(currentFileContent.nodeValue);
//   openFilesDisplay.appendChild(currentFileContent);
//   console.log(openFilesDisplay);
// };
