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

function displayFileContent(fileContent, fileName) {
  var content = document.getElementById('newFileForm');
  content.style.display = 'block';
  document.getElementById('newFileContent').value = fileContent;
  document.getElementById('newFileName').value = fileName;
}

function getFileContent(fileId, fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?alt=media', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
	  return response.text();
  }).then(function(fileContent) {
    displayFileContent(fileContent, fileName);
  });
};

// function openFileInApp(fileId, fileName) {
//   var accessToken = gapi.auth.getToken().access_token;
//
//   fetch('https://www.googleapis.com/drive/v3/files/'+fileID, {
//     method: 'GET',
//     headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
//   }).then((response) => {
//
//   }
  // gapi.load('client', function() {
  //   gapi.client.load('drive', 'v3', function() {
  //     var file = gapi.client.drive.files.get({ 'fileId': fileId, 'alt': 'media' });
  //     file.execute(function(response) {
	// 	console.log(fileId, response);
  //       //getFileContent(response.webContentLink, fileName);
	// 	getFileContent(fileId);
  //     });
  //   });
  // });
// };

function displayFileForOpen(fileId, fileOrder, fileName) {
  var fileDisplayP = document.createElement("p");
  var fileOrderText = "File " + fileOrder + " ";
  var fileOrderDisplay = document.createTextNode(fileOrderText);
  var fileOpenB = document.createElement("button");
  fileOpenB.innerHTML = 'Open this file';
  fileOpenB.addEventListener("click", function() {
    getFileContent(fileId, fileName);
  });
  fileDisplayP.appendChild(fileOrderDisplay);
  fileDisplayP.appendChild(fileOpenB);
  document.body.appendChild(fileDisplayP);
};

function loadFileFromDrive(fileId, fileOrder, fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?fields=trashed', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    if (response.trashed == false) {
      displayFileForOpen(fileId, fileOrder, fileName);
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
    var numFiles = 0;

    for (var i=0; i < response.files.length; i++) {
      if (fileName == response.files[i].name) {
        numFiles++;
        loadFileFromDrive(response.files[i].id, numFiles, fileName);
      }
    }
  });
};
