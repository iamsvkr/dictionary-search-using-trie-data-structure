const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const firebase = require("firebase-admin");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serviceAccount = require("./dic.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://dictionary-5444b.firebaseio.com"
});

app.get('/', (req, res)=>{
    res.sendFile(__dirname+"/home.html");
});

app.post('/insert', (req,res)=>{
    var word = req.body.word;
    var meaning = req.body.meaning;
    var ref = firebase.database().ref();
    for(var i=0; i<word.length; i++){
        ref = ref.child(word[i]);
        if(i==word.length-1){
            ref.update({
                "isEnd": true,
                "meaning": meaning,
            }).then(()=>{
                res.redirect('/');
            });
        }else{
            ref.update({
                "isEnd": false,
                "meaning": null,
            });
        }
    }
});

app.post('/search', (req,res)=>{
    var ref = firebase.database().ref();
    var word = req.body.word;
    for(var i=0; i<word.length; i++){
        ref = ref.child(word[i]);
        if(i==word.length-1){
            ref.once('value').then((snapshot)=>{
                if(snapshot.exists){
                    if(snapshot.val().meaning!=null){
                        res.send(snapshot.val().meaning);
                    }else{
                        res.redirect('/');
                    }
                }else{
                    res.redirect('/');
                }
            });
        }
    }
});

app.listen(3000);