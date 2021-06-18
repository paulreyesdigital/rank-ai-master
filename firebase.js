const firebase = require('firebase')
require('firebase/database')

var firebaseConfig = {
    apiKey: "AIzaSyCw75e8t76HXBV1FYLJ85uMijcU2F5KkzY",
    authDomain: "rank-ai.firebaseapp.com",
    projectId: "rank-ai",
    storageBucket: "rank-ai.appspot.com",
    messagingSenderId: "697779418847",
    appId: "1:697779418847:web:6c189a3490ca9efa78db6a"
};

firebase.initializeApp(firebaseConfig);

module.exports = firebase