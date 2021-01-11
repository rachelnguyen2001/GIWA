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
    // document.getElementById('newFileBtn').style.display = 'none';
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
        document.getElementById('newFileBtn').style.display = 'block';
        // document.getElementById('newFileBtn').style.display = 'block';
        // saveFiles();
      }, function(error) {
        alert(JSON.stringify(error, undefined, 2));
      });
};

function createFiles() {
  var saveFileBtn = document.createElement("BUTTON");
  saveFileBtn.innerHTML = "Save file";
  saveFileBtn.addEventListener("click", saveFiles);
  document.body.appendChild(saveFileBtn);
};

function saveFiles() {
  console.log('saveFiles() is called');
  var fileContent = 'sample text';
  var file = new Blob([fileContent], {type: 'text/plain'});
  var metadata = {
    'name': 'sampleName',
    'mimeType': 'text/plain',
    // 'parents': ['16M-iwIcquv7znE0XT6nellIQM6lFWXon'],
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
    console.log(val);
  });
};
