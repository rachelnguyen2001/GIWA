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

/**
 * Set up Google API
 */
function initializeApp() {
  gapi.load('auth2', initializeGoogleSignIn());
};

/**
 * Set up Google signin
 */
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

/**
 * Detect when users signin
 *
 * @param element the element to which to attach the click handler
 * @link https://developers.google.com/identity/sign-in/web/reference
 */
function detectSignin(element) {
  auth2.attachClickHandler(element, {}, signInSucceed, signInFail);
};

/**
 * Show users' information on the web app when signin succeeds
 *
 * @param googleUser the signedin user
 */
function signInSucceed(googleUser) {
  var userInfo = getUserInfo(googleUser);
  document.getElementById('name').innerText = "Name: " + userInfo[0];
  document.getElementById('email').innerText = "Email: " + userInfo[1];
  document.getElementById('gSignInWrapper').style.display = 'none';
  document.getElementById('btnPanel').style.display = 'block';
};

/**
 * Get users' information from Google when signin succeeds
 *
 * @param googleUser the signedin user
 * @link https://developers.google.com/identity/sign-in/web/people
 */
function getUserInfo(googleUser) {
  return [googleUser.getBasicProfile().getName(), googleUser.getBasicProfile().getEmail()];
};

/**
 * Show errors to users when signin fails
 *
 * @param error the error which causes signin to fail
 */
function signInFail(error) {
  alert(JSON.stringify(error, undefined, 2));
};

/**
 * Show empty fields on the web app for users to fill in when they want to
 * create a new file in Google Drive
 *
 */
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

/**
 * Get data about the new file users want to create and save the file to Google Drive
 *
 */
function saveFileToDriveFromApp() {
  var fileName = document.getElementById('newFileName').value;
  var fileContent = document.getElementById('newFileContent').value;
  saveFileToDrive(fileName, fileContent);
}

/**
 * Create a new file in Google Drive
 *
 * @param {string} fileName name of the file to be created
 * @param {string} fileContent content of the file to be created
 * @link https://developers.google.com/drive/api/v3/manage-uploads
 */
function saveFileToDrive(fileName, fileContent) {
  // content of the file to be created
  var file = new Blob([fileContent], {type: 'text/plain'});

  // metadata of the file to be created
  var metadata = {
    'name': fileName,
    'mimeType': 'text/plain',
  };

  var accessToken = gapi.auth.getToken().access_token;

  // format the file's metadata and content
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
  });

};

/**
 * Show fileName's field to users so they can enter name of the file they want to open
 *
 */
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

/**
 * Show all files with the name which users have entered
 *
 */
function openFiles() {
  var openFilesDisplay = document.getElementById('openFilesDisplay');
  openFilesDisplay.style.display = 'block';
  openFilesDisplay.innerHTML = "";

  document.getElementById('foundFiles').style.display = 'block';

  document.getElementById('openedFileName').value = '';
  document.getElementById('openedFileContent').value = '';

  var fileName = document.getElementById('openFileName').value;

  loadFilesFromDrive(fileName);
}

/**
 * Show a file's name and content to users
 * @param {string} fileId Google Drive id of the file
 * @param {string} fileContent content of the file
 * @param {string} fileName name of the file
 */
function displayFileContent(fileId, fileContent, fileName) {
  // Remember open file info
  App.fileId = fileId;

  var content = document.getElementById('openedFileForm');
  content.style.display = 'block';

  document.getElementById('updateFileSucceed').style.display = 'none';
  document.getElementById('openedFileContent').value = fileContent;
  document.getElementById('openedFileName').value = fileName;
}

/**
 * Ensure a file is updated every time its according update button is clicked
 *
 */
function setUpUpdateBtn() {
  var updateBtn = document.getElementById('updateFileBtn');

  updateBtn.addEventListener("click", function() {
    updateFileToDriveFromApp(App.fileId);
  });

}

/**
 * Get a file's content from Google Drive
 *
 * @param {string} fileId Google Drive id of the file
 * @param {string} fileName name of the file
 * @link https://developers.google.com/drive/api/v3/reference/files/get
 * @link https://developers.google.com/drive/api/v3/manage-downloads#node.js
 */
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

/**
 * Show a file's name and buttons that allow users to interact with the according file
 * @param {string} fileId Google Drive id of the file
 * @param {string} fileName name of the file
 *
 */
function displayFileForOpen(fileId, fileName) {
  // div element for the current file
  var fileDisplayP = document.createElement("div");
  fileDisplayP.id = 'file-display-p' + fileId;

  // show the file's name to users
  var fileNameText = fileName + " ";
  var fileNameDisplay = document.createTextNode(fileNameText);

  // a button to open the file
  var fileOpenB = document.createElement("button");
  fileOpenB.innerHTML = 'Open';
  fileOpenB.addEventListener("click", function() {
    getFileContent(fileId, fileName);
  });

  // a button to share the file with anyone (read only)
  var shareFileWithAnyoneReadB = document.createElement("button");
  shareFileWithAnyoneReadB.innerHTML = 'Share with anyone (read only)';
  shareFileWithAnyoneReadB.addEventListener("click", function() {
    shareFile(fileId, 'reader', 'anyone');
  });

  // a button to share the file with anyone (write)
  var shareFileWithAnyoneWriteB = document.createElement("button");
  shareFileWithAnyoneWriteB.innerHTML = 'Share with anyone (write)';
  shareFileWithAnyoneWriteB.addEventListener("click", function() {
    shareFile(fileId, 'writer', 'anyone');
  });

  // a button to share the file with a specific person (read only)
  var shareFileWithEmailReadB = document.createElement("button");
  shareFileWithEmailReadB.innerHTML = 'Share with a specific person (read only)';
  shareFileWithEmailReadB.addEventListener("click", function() {
    var emailToShareRead = prompt("Email address to share with:");
    shareFile(fileId, 'reader', 'user', emailToShareRead);
  });

  // a button to share the file with a specific person (write)
  var shareFileWithEmailWriteB = document.createElement("button");
  shareFileWithEmailWriteB.innerHTML = 'Share with a specific person (write)';
  shareFileWithEmailWriteB.addEventListener("click", function() {
    var emailToShareWrite = prompt("Email address to share with:");
    shareFile(fileId, 'writer', 'user', emailToShareWrite);
  });

  // a button to get a Google Drive link to the file
  var getLinkB = document.createElement("button");
  getLinkB.innerHTML = 'Get link';
  var linkToFileP = document.createElement("p");
  linkToFileP.id = 'link-to-file-' + fileId;
  getLinkB.addEventListener("click", function() {
    if (linkToFileP.innerHTML === '') {
      getLink(fileId);
    } else {
      linkToFileP.innerHTML = '';
    };
  });

  // a button to delete the file
  var deleteB = document.createElement("button");
  deleteB.innerHTML = 'Delete';
  deleteB.addEventListener("click", function() {
    deleteFile(fileId);
  });

  // a button to show all saved versions of the file
  var showVersionDl = document.createElement("dl");
  showVersionDl.id = 'show-version-dl' + fileId;
  var showVersionB = document.createElement("button");
  showVersionB.innerHTML = 'Show all version(s)';
  showVersionB.addEventListener("click", function() {
    if (showVersionDl.innerHTML === '') {
      getAllVersionsFromDrive(fileId);
    } else {
      showVersionDl.innerHTML = '';
    };
  });

  fileDisplayP.appendChild(fileNameDisplay);
  fileDisplayP.appendChild(fileOpenB);
  fileDisplayP.appendChild(shareFileWithAnyoneReadB);
  fileDisplayP.appendChild(shareFileWithAnyoneWriteB);
  fileDisplayP.appendChild(shareFileWithEmailReadB);
  fileDisplayP.appendChild(shareFileWithEmailWriteB);
  fileDisplayP.appendChild(getLinkB);
  fileDisplayP.appendChild(deleteB);
  fileDisplayP.appendChild(showVersionB);
  fileDisplayP.appendChild(showVersionDl);
  fileDisplayP.appendChild(linkToFileP);

  document.getElementById('openFilesDisplay').appendChild(fileDisplayP);
};

/**
 * Load a file from Google Drive
 * @param {string} fileId Google Drive id of the file
 * @param {string} fileName name of the file
 * @link https://developers.google.com/drive/api/v3/reference/files/get
 *
 */
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
    };

  });

};

/**
 * Load all files of a given from Google Drive
 * @param {string} fileName name of the file
 * @link https://developers.google.com/drive/api/v3/reference/files/list
 */
function loadFilesFromDrive(fileName) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'GET',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
    return response.json();
  }).then(function(response) {

    for (var i=0; i < response.files.length; i++) {
      if (fileName == response.files[i].name) {
        loadFileFromDrive(response.files[i].id, fileName);
      }
    };

  });
};

/**
 * Get a file's updated name and content from users
 * @param {string} fileId Google Drive id of the file
 *
 */
function updateFileToDriveFromApp(fileId) {
  var fileName = document.getElementById('openedFileName').value;
  var fileContent = document.getElementById('openedFileContent').value;
  updateFileToDrive(fileId, fileName, fileContent);
};

/**
 * Update a file's name and content to Google Drive
 * @param {string} fileId Google Drive id of the file
 * @param {string} fileName name of the file
 * @param {string} fileContent content of the file
 * @link https://developers.google.com/drive/api/v3/reference/files/update
 */
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
    updateFileToDriveSucceed();
  });
};


/**
 * Inform users when a file is successfully updated
 *
 */
function updateFileToDriveSucceed() {
  document.getElementById('updateFileSucceed').style.display = 'block';
};

/**
 * Inform users when a file is successfully created
 *
 */
function saveFileToDriveSucceed() {
  document.getElementById('saveFileSucceed').style.display = 'block';
};

/**
 * Show all files in users' app-specific folder on the web app
 *
 */
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

/**
 * Get all files from Google Drive
 * @link https://developers.google.com/drive/api/v3/reference/files/list
 *
 */
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

/**
 * Update a file's permission
 * @param {string} fileId Google Drive id of the file
 * @param {string} role read/write permission
 * @param {string} type anyone/a specific user permission
 * @param {string} email email of the person with which the file is shared
 * @link https://developers.google.com/drive/api/v3/reference/permissions/create
 *
 */
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

// https://developers.google.com/drive/api/v3/reference/files/delete
function deleteFile(fileId) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId, {
      method: 'DELETE',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
      return response.text();
  }).then(function(response) {
      makeFileDisappear(fileId, response);
  });
};

function makeFileDisappear(fileId, response) {
  if (response === "") {
    var fileDisplayId = 'file-display-p' + fileId;
    var fileDisplayP = document.getElementById(fileDisplayId);
    fileDisplayP.remove();
  }
};

// https://developers.google.com/drive/api/v3/reference/revisions/list#try-it
function getAllVersionsFromDrive(fileId) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'/revisions', {
      method: 'GET',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
  }).then((response) => {
      return response.json();
  }).then(function(response) {
      showAllVersions(fileId, response.revisions);
  });
};

function showAllVersions(fileId, revisions) {
  var showVersionId = 'show-version-dl' + fileId;
  var showVersionDl = document.getElementById(showVersionId);
  var showVersion = '';

  for (var i = 0; i < revisions.length; i++) {
    var currentVersionOrder = "<dt> Version " + i  + "</dt>";
    var currentVersionModTime = "<dd> Last modified time: " + revisions[i].modifiedTime + "</dd>";
    showVersion += currentVersionOrder;
    showVersion += currentVersionModTime;
  };

  showVersionDl.innerHTML = showVersion;
};
