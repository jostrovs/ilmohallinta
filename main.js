// Initialize Firebase
var config = {
  apiKey: "AIzaSyBkuwgWfzafFfgrHJfzVCNFfOT8J6bsaNc",
  authDomain: "my-awesome-project-6abd3.firebaseapp.com",
  databaseURL: "https://my-awesome-project-6abd3.firebaseio.com",
  projectId: "my-awesome-project-6abd3",
  storageBucket: "my-awesome-project-6abd3.appspot.com",
  messagingSenderId: "1052167742236"
};
firebase.initializeApp(config);
var database = firebase.database();

// Auth
var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });

Vue.component('vue-hello', {
    template:` 
    <p id="hello">jesjes {{greet}}</p>                                                                                         
    `,
    props: ['greet'],
    data: function(){
        return {
            greet: this.greet,
        }
    },
    mounted: function(){
        $("#hello").css("border", "1px solid red");
    }
});


new Vue({
    el: '#app',
    data: {
        sarjat: [],
        ilmoittautuneet: [],
        title: "Ilmohallinta",
        loading: 2,
        editor: false,
        next_id: 0,

        add_nimi: "",
        add_sarja: "",
    },
    beforeCreate(){
        let self = this;
        self.loading++;
        database.ref('/ilmoittautuneet').once('value').then(function(joukkueet) {
            joukkueet.forEach(function(joukkue){
                let key = parseInt(joukkue.key, 10);
                if(key >= self.next_id){
                     self.next_id = key+1;
                     console.log("Next id asetettu " + self.next_id);
                }
                
                let val = joukkue.val();
                console.log("Lisätään joukkue " + val.nimi + " sarjaan " + val.sarja);
                self.ilmoittautuneet.push(val);
            });
            self.loading--;
        });

        self.loading++;
        database.ref('/sarjat').once('value').then(function(sarjat) {
            sarjat.forEach(function(sarja){
                self.sarjat.push(sarja.val());
            });
            self.loading--;
        });

    },
    computed: {
        ilmosarjat(){
            let ret = [];
            for(let sarja of this.sarjat){
                let joukkiot = this.ilmoittautuneet.filter((item)=>{ return item.sarja == sarja.id});
                ret.push(
                { 
                    nimi: sarja.nimi,
                    joukkueet: joukkiot,
                });
            }
            return ret;
        },

        add_disabled(){
            return this.add_nimi.length < 1 || this.add_sarja.length < 1;
        }
    },

    methods: {
        adder(){
            firebase.database().ref('ilmoittautuneet/' + this.next_id++).set({
                nimi: this.add_nimi,
                sarja: this.add_sarja,
            });           
            this.editor = false;
            location.reload();
        }
    }
})