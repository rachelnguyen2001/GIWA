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
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    saveFileToDriveSucceed();
    console.log(response);
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

function displayFileContent(fileId, fileContent, fileName) {
  var content = document.getElementById('openedFileForm');
  content.style.display = 'block';
  document.getElementById('openedFileContent').value = fileContent;
  document.getElementById('openedFileName').value = fileName;
  var updateBtn = document.getElementById('updateFileBtn');
  updateBtn.addEventListener("click", function() {
    updateFileToDriveFromApp(fileId);
  });
}

function getFileContent(fileId, fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?alt=media', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
	  return response.text();
  }).then(function(fileContent) {
    displayFileContent(fileId, fileContent, fileName);
  });
};

function displayFileForOpen(fileId, fileName) {
  var fileDisplayP = document.createElement("p");
  var fileNameText = fileName + " ";
  var fileNameDisplay = document.createTextNode(fileNameText);
  var fileOpenB = document.createElement("button");
  fileOpenB.innerHTML = 'Open this file';
  fileOpenB.addEventListener("click", function() {
    getFileContent(fileId, fileName);
  });
  fileDisplayP.appendChild(fileNameDisplay);
  fileDisplayP.appendChild(fileOpenB);
  document.body.appendChild(fileDisplayP);
};

function loadFileFromDrive(fileId, fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?fields=trashed', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    if (response.trashed == false) {
      displayFileForOpen(fileId, fileName);
    }
  });

};

function loadFilesFromDrive(fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    console.log(response);
    document.getElementById("foundFiles").style.display = 'block';
    var openFilesDisplay = document.getElementById('openFilesDisplay');
    openFilesDisplay.innerHTML = '';

    for (var i=0; i < response.files.length; i++) {
      if (fileName == response.files[i].name) {
        loadFileFromDrive(response.files[i].id, fileName);
      }
    }
  });
};

function updateFileToDriveFromApp(fileId) {
  var fileName = document.getElementById('openedFileName').value;
  var fileContent = document.getElementById('openedFileContent').value;
  updateFileToDrive(fileId, fileName, fileContent);
};

function updateFileToDrive(fileId, fileName, fileContent) {
  // console.log(fileId);
  // console.log(fileName);
  // console.log(fileContent);
  var file = new Blob([fileContent], {type: 'text/plain'});
  var metadata = {
     'name': fileName,
     'mimeType': 'text/plain',
   };

  var accessToken = gapi.auth.getToken().access_token;
  var form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  fetch('https://www.googleapis.com/upload/drive/v3/files/'+fileId+'?uploadType=multipart', {
    method: 'PATCH',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: form,
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    console.log(response);
    updateFileToDriveSucceed();
  });
};

function updateFileToDriveSucceed() {
  var updatedFileMess = document.createTextNode("File is updated in your Google Drive!");
  document.getElementById("openedFileForm").appendChild(document.createElement("br"));
  document.getElementById("openedFileForm").appendChild(updatedFileMess);
}

// function updateFileToDriveFromApp(fileId) {
//   var fileName = document.getElementById('fileName').value;
//   var fileContent = document.getElementById('fileContent').value;
//   updateFileToDrive(fileId, fileName, fileContent);
// };

// function updateFileToDrive(fileName, fileContent) {
//   var accessToken = gapi.auth.getToken().access_token;
//
// };
