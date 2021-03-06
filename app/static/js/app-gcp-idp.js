
// Changes
// - 1. add config object with google key/values.
// - 2. add configureFirebaseLogin function.
// - 3. add configureFirebaseLoginWidget function.
// - 4. comment out sign-in button - redundant to firebaseUI.
// - 5. update sign-out function to exit firebase.

$( document ).ready(function() {
    let host_endpoint = 'http://127.0.0.1:5000/'
    var app_url = document.location.href;
    let data_object = 'mushrooms';

    // 1. JS object w/google key/values.
    // Copy your config from Identity Platform to here
    // var config = {
    //     apiKey: "",
    //     authDomain: "",
    // };
    

    // 2.  add function
    function configureFirebaseLogin() {

        firebase.initializeApp(config);
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            var name = user.displayName;
    
            var welcomeName = name ? name : user.email;
            sessionStorage.setItem('welcomeName', welcomeName);
    
            user.getIdToken().then(function(idToken) {
                token.userIdToken = idToken;
            });
          }
        });
      }


    // 3. add function
    function configureFirebaseLoginWidget() {
        var uiConfig = {
            signInSuccessUrl: app_url,
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.GithubAuthProvider.PROVIDER_ID,
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
                firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            ],
            // Terms of service url/callback.
            tosUrl: '<your-tos-url>',
            // Privacy policy url/callback.
            privacyPolicyUrl: function() {
                window.location.assign('<your-privacy-policy-url>');
            }
        };

        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        if ( $('#content-auth').length ) {
            ui.start('#content-auth', uiConfig);
        }
        // console.info("STARTED");
    }


    // 4. Remove sign-in button.
    // $('#signin').click(signin);
    document.getElementById('signin').style.display = "none";

    $('#signout').click(signout);

    set_ui_display();

    // $('#app_title').html (app_name);

    $.ajaxSetup({
        // Auto-includes the header key/values are always included in all calls.
        headers: { 'Authorization': 'Bearer ' + token.userIdToken }
    });

    function load_content() {
        $.ajax({
            url: host_endpoint + data_object,
            contentType: 'application/json',
        }).done(function(data){
            array_data = JSON.parse(data); // to array

            display_data = "<table class='table table-hover table-bordered '><tbody>"
            for (i in array_data){
                display_data = display_data.concat("<tr>", "<td>", array_data[i].name, "</td>", "</tr>")
            }
            display_data = display_data.concat("</tbody><table>")

            $('#data-display').html (display_data);
            $('#timestamp').html(calcTime(6));
        }).fail(function(data, status){
            console.warn('Uh oh, ' + status);
            $('#data-display').html ('Uh oh, ' + status);
            $('#timestamp').html("Error");
        }).always(function(){
            document.title = data_object
            $('#data_title').html (sentenceCase(data_object));
        });
    }

    configureFirebaseLogin();
    configureFirebaseLoginWidget();

    load_content();
});

function set_ui_display(){
    // If user signed in (authenticated) then display username, sign-out button, and data content.
    // else, display sign-in button & hide the rest.
    try {
        if ( !!token.userIdToken ) {
            // signed-in
            document.getElementById('content-data').style.visibility = 'block';
            document.getElementById('content-auth').style.display = 'none';
            document.getElementById('username').style.visibility = 'visible';
            // document.getElementById('username').innerHTML = 'test@domain.com';
            // 6. Update username display.
            document.getElementById('username').innerHTML = sessionStorage.getItem('welcomeName');
            document.getElementById('signin').style.display = 'none';
            document.getElementById('signout').style.visibility = 'visible';
        } else {
            // signed-out
            document.getElementById('content-data').style.display = 'none';
            document.getElementById('content-auth').style.visibility = 'block';
            document.getElementById('username').style.visibility = 'hidden';
            document.getElementById('username').innerHTML = '';
            document.getElementById('signin').style.visibility = 'visible';
            document.getElementById('signout').style.visibility = 'hidden';
        }
    }
    catch (err) {
        console.warn("Error detail: " + err.message);
    }
    
}


// *****************************************************************************************
// * Auth functions & placeholders below.
// *****************************************************************************************

// This is passed into the backend to authenticate the user.
var token = {
    value: '',
    get userIdToken(){
        value = typeof(sessionStorage.getItem("token")) !== null ? sessionStorage.getItem("token") : '';
        return value;
    },
    set userIdToken(value){
        sessionStorage.setItem("token", value);
        if (value.length > 1) {
            console.info('userIdToken has chanaged value to ' + value);
        } else {
            console.info('userIdToken is cleared.');
        }
    }
}

function signin(){
    token.userIdToken = "no-auth";
}

function signout(){
    // 5. sign-out of firebase.
    firebase.auth().signOut().then(function() {
        token.userIdToken = "";
      }, function(error) {
        console.warn(error);
      });
}


// *****************************************************************************************
// * Helper functions below.
// *****************************************************************************************

function sentenceCase (str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
   return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function calcTime(offset) {
    d = new Date();
    // convert to msec, add local time zone offset, get UTC time in msec
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // create new Date object for different city using supplied offset
    nd = new Date(utc + (3600000*offset));
    // return time as a string
    return nd.toLocaleString();
}