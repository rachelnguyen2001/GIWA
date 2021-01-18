# GIWA
A Google Drive integrated web app

## Setup
### Google authorization for login
1. Go to [Credentials page](https://console.developers.google.com/apis/credentials)
2. Click `Create Credentials` &rightarrow; `Create OAuth client ID`
3. Select `Web application` in `Application type`
4. Add name of the web application (i.e. `GIWA`) in `Name`
5. Add `http://localhost:8080` in `Authorized Javascript origins`
6. Add `http://localhost:8080` in `Authorized redirect URIs`
7. Click `Create` and save the `Client ID` as well as `Client secret` for future access
8. Setting up Google authorization in `main.js`: 
```javascript
window.addEventListener("load", function(event){
  App.start();
})

var App = {};
var googleUser = {};
App.start = initializeApp();

function initializeApp() {
  gapi.load('auth2', initializeGoogleSignIn());
};

function initializeGoogleSignIn() {
  auth2 = gapi.auth2.init({
    // Client ID retrieved from above
    client_id = `191815373223-e6gimsdlrqq6strtcsqstgmr426tjavj.apps.googleusercontent.com`, 
    cookiepolicy = 'single_host_origin',
    // Access files in the user's Google Drive
    scope = 'https://www.googleapis.com/auth/drive.file'
  });
};
```
