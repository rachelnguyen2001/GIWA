# GIWA
A Google Drive integrated web app

## Setup
### Server setup
1. Set up local server:
```python3
python3 -m http.server 8080
```
2. Quit local server: `Ctrl + c`

### Google authorization for signin
1. Go to [Credentials page](https://console.developers.google.com/apis/credentials)
2. Click `Create Credentials` &rightarrow; `Create OAuth client ID`
3. Select `Web application` in `Application type`
4. Add name of the web application (i.e. `GIWA`) in `Name`
5. Add `http://localhost:8080` in `Authorized Javascript origins`
6. Add `http://localhost:8080` in `Authorized redirect URIs`
7. Click `Create` and save the `Client ID` as well as `Client secret` for future access
8. Set up Google authorization in `main.js`: 
```javascript
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
```
9. Detect signin in `main.js`:
```javascript
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
};

function getUserInfo(googleUser) {
  return [googleUser.getBasicProfile().getName(), googleUser.getBasicProfile().getEmail()];
};
```

### Adding testing users
1. Go to [OAuth consent screen page](https://console.developers.google.com/apis/credentials/consent?project=giwa-021269)
2. Click `Add users` in `Test users`
3. Enter the user's Gmail address and click `Save`

### Saving a file to Google Drive
1. Save a file to Google Drive in `main.js`:
```javascript
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
    console.log(val);
  });
};
```

### Opening a file from Google Drive 
1. Get all files with the given name from Google in `main.js`:
```javascript
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
```
2. Load individual file from Google Drive with the `trashed` field to see whether the file has been trashed:
```javascript
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
```
3. Get the file content:
```javascript
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
```
### Sharing a file in Google Drive
1. Currently, `role` can be `reader` or `writer` depending on the type of a permission. For sharing, define `type` as `anyone`:
```javascript
function shareFile(fileId, role, type) {
  var accessToken = gapi.auth.getToken().access_token;

  fetch('https://www.googleapis.com/drive/v3/files/'+fileId+'/permissions', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken, "Content-Type": "application/json" }),
    body: JSON.stringify({"role": role, "type": type}),
  }).then((response) => {
    return response.json();
  }).then(function(response) {
    console.log(response);
  });
};
```
