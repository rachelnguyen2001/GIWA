window.addEventListener("load", function(event){
  App.start();
});

var App = {};
var googleUser = {};

App.start = function() {
	// Set up UI
	setUpUpdateBtn();

	// Set up Google API
	initializeApp();
};

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
  document.getElementById('newFileName').value = '';
  document.getElementById('newFileContent').value = '';
  document.getElementById('updateFileSucceed').style.display = 'none';
  document.getElementById('openFilesForm').style.display = 'none';
  document.getElementById('openedFileForm').style.display = 'none';
  document.getElementById('foundFiles').style.display = 'none';
  document.getElementById('openFilesDisplay').style.display = 'none';
};

function saveFileToDriveFromApp() {
  var fileName = document.getElementById('newFileName').value;
  var fileContent = document.getElementById('newFileContent').value;
  saveFileToDrive(fileName, fileContent);
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
  document.getElementById('saveFileSucceed').style.display = 'none';
  document.getElementById('newFileForm').style.display = 'none';
  document.getElementById('openFilesForm').style.display = 'block';
  document.getElementById('openFileName').value = '';
  document.getElementById('openFilesDisplay').style.display = 'none';
  document.getElementById('foundFiles').style.display = 'none';
  document.getElementById('openedFileForm').style.display = 'none';
  document.getElementById('updateFileSucceed').style.display = 'none';
};

function openFiles() {
  var openFilesDisplay = document.getElementById('openFilesDisplay');
  openFilesDisplay.style.display = 'block';
  openFilesDisplay.innerHTML = "";
  document.getElementById('foundFiles').style.display = 'block';
  var fileName = document.getElementById('openFileName').value;
  document.getElementById('openedFileName').value = '';
  document.getElementById('openedFileContent').value = '';
  loadFilesFromDrive(fileName);
}

function displayFileContent(fileId, fileContent, fileName) {
  // Remember open file info
  App.fileId = fileId;

  var content = document.getElementById('openedFileForm');
  content.style.display = 'block';
  document.getElementById('updateFileSucceed').style.display = 'none';
  document.getElementById('openedFileContent').value = fileContent;
  document.getElementById('openedFileName').value = fileName;
}

function setUpUpdateBtn() {
  var updateBtn = document.getElementById('updateFileBtn');
  updateBtn.addEventListener("click", function() {
    updateFileToDriveFromApp(App.fileId);
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
  var fileDisplayP = document.createElement("div");
  var fileNameText = fileName + " ";
  var fileNameDisplay = document.createTextNode(fileNameText);
  var fileOpenB = document.createElement("button");
  fileOpenB.innerHTML = 'Open';
  fileOpenB.addEventListener("click", function() {
    getFileContent(fileId, fileName);
  });
  var shareFileWithAnyoneReadB = document.createElement("button");
  shareFileWithAnyoneReadB.innerHTML = 'Share with anyone (read only)';
  shareFileWithAnyoneReadB.addEventListener("click", function() {
    shareFile(fileId, 'reader', 'anyone');
  });
  var shareFileWithAnyoneWriteB = document.createElement("button");
  shareFileWithAnyoneWriteB.innerHTML = 'Share with anyone (write)';
  shareFileWithAnyoneWriteB.addEventListener("click", function() {
    shareFile(fileId, 'writer', 'anyone');
  });
  var shareFileWithEmailReadB = document.createElement("button");
  shareFileWithEmailReadB.innerHTML = 'Share with a specific person (read only)';
  shareFileWithEmailReadB.addEventListener("click", function() {
    var emailToShareRead = prompt("Email address to share with:");
    shareFile(fileId, 'reader', 'user', emailToShareRead);
  });
  var shareFileWithEmailWriteB = document.createElement("button");
  shareFileWithEmailWriteB.innerHTML = 'Share with a specific person (write)';
  shareFileWithEmailWriteB.addEventListener("click", function() {
    var emailToShareWrite = prompt("Email address to share with:");
    shareFile(fileId, 'writer', 'user', emailToShareWrite);
  });
  var getLinkB = document.createElement("button");
  getLinkB.innerHTML = 'Get link';
  var linkToFileP = document.createElement("p");
  linkToFileP.id = 'link-to-file-' + fileId;
  getLinkB.addEventListener("click", function() {
    if (linkToFileP.innerHTML == '') {
      getLink(fileId);
    } else {
      linkToFileP.innerHTML = '';
    };
  });
  fileDisplayP.appendChild(fileNameDisplay);
  fileDisplayP.appendChild(fileOpenB);
  fileDisplayP.appendChild(shareFileWithAnyoneReadB);
  fileDisplayP.appendChild(shareFileWithAnyoneWriteB);
  fileDisplayP.appendChild(shareFileWithEmailReadB);
  fileDisplayP.appendChild(shareFileWithEmailWriteB);
  fileDisplayP.appendChild(getLinkB);
  fileDisplayP.appendChild(linkToFileP);
  document.getElementById('openFilesDisplay').appendChild(fileDisplayP);
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
  var file = new Blob([fileContent], {type: 'text/plain'});
  var metadata = { 'name': fileName, };

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
  document.getElementById('updateFileSucceed').style.display = 'block';
};

function saveFileToDriveSucceed() {
  document.getElementById('saveFileSucceed').style.display = 'block';
};

function openAllFiles() {
  document.getElementById('newFileForm').style.display = 'none';
  document.getElementById('openFilesForm').style.display = 'none';
  document.getElementById('saveFileSucceed').style.display = 'none';
  document.getElementById('openedFileForm').style.display = 'none';
  document.getElementById('updateFileSucceed').style.display = 'none';
  document.getElementById('foundFiles').style.display = 'block';
  var openFilesDisplay = document.getElementById('openFilesDisplay');
  openFilesDisplay.style.display = 'block';
  openFilesDisplay.innerHTML = "";
  openAllFilesFromDrive();
}

function openAllFilesFromDrive() {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    console.log(response);

    for (var i=0; i < response.files.length; i++) {
      loadFileFromDrive(response.files[i].id, response.files[i].name);
    }
  });
};

//https://developers.google.com/drive/api/v3/reference/permissions/create
function shareFile(fileId, role, type, email) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'/permissions', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken, "Content-Type": "application/json" }),
    body: JSON.stringify({"role": role, "type": type, "emailAddress": email}),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    console.log(response);
  });
};

function getLink(fileId) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'?fields=webViewLink', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    showLinkToFile(fileId, response.webViewLink);
  });
};

function showLinkToFile(fileId, link) {
  var linkToFileId = 'link-to-file-' + fileId;
  var linkToFileP = document.getElementById(linkToFileId);
  console.log(linkToFileP.innerHTML);
  linkToFileP.innerHTML = link;
};
