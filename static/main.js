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
      // Request scopes in addition to 'profile' and 'email'
      //scope: 'additional_scope'
    });
    attachSignin(document.getElementById('customBtn'));
  });
};

function attachSignin(element) {
  console.log(element.id);
  auth2.attachClickHandler(element, {},
      function(googleUser) {
        document.getElementById('name').innerText = "Name: " +
            googleUser.getBasicProfile().getName();
        document.getElementById('email').innerText = "Email: " +
            googleUser.getBasicProfile().getEmail();
        document.getElementById('gSignInWrapper').style.display = 'none';
      }, function(error) {
        alert(JSON.stringify(error, undefined, 2));
      });
}
