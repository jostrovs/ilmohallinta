new Vue({
    el: '#app',
    data: {
        sarjat: [],
        ilmoittautuneet: [],
        title: "Ilmohallinta",
        loading: 0,
        editor: false,
        next_id: 0,
        updated: "-",

        add_nimi: "",
        add_sarja: "",

        snackbar: false,
        snackbar_text: "",

        // Firebase jutut
        database: {},
        firebaseUi: {},
        
        user: {},
        signed_in: false,
    },
    created(){
        let self = this;

        self.initFirebase();
        self.initFirebaseUi();

        self.loading++;
        this.database.ref('/ilmoittautuneet').once('value').then(function(joukkueet) {
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
        this.database.ref('/sarjat').once('value').then(function(sarjat) {
            sarjat.forEach(function(sarja){
                self.sarjat.push(sarja.val());
            });
            self.loading--;
        });

        self.loading++;
        this.database.ref('/updated').once('value').then(function(updated) {
            self.updated = updated.val();
            self.loading--;
        });

    },
    mounted: function(){
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
            let self = this;
            firebase.database().ref('ilmoittautuneet/' + this.next_id++).set({
                nimi: this.add_nimi,
                sarja: this.add_sarja,
            })
            .then(function(){
                var d = new Date();
                
                var dd = d.toLocaleDateString();
                var tt = d.toLocaleTimeString();

                firebase.database().ref('/updated').set(dd + " klo " + tt);

                self.editor = false;
                location.reload();
            })
            .catch(function(error){
                self.snackbar_text = "Tallennus epäonnistui: " + error;
                self.snackbar = true;
            });           
        },

        initFirebase(){
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
            this.database = firebase.database();
        },

        initFirebaseUi(){
            let self = this;

            let uiConfig = {
                signInSuccessUrl: '', //'<url-to-redirect-to-on-success>',
                signInOptions: [
                    // Leave the lines as is for the providers you want to offer your users.
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                ],
                // Terms of service url.
                tosUrl: '<your-tos-url>'
            };
          
            this.firebaseUi = new firebaseui.auth.AuthUI(firebase.auth());
        
            // The start method will wait until the DOM is loaded.
            this.firebaseUi.start('#firebaseui-auth-container', uiConfig);  
            
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    
                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var uid = user.uid;
                    var phoneNumber = user.phoneNumber;
                    var providerData = user.providerData;
                    user.getIdToken().then(function(accessToken) {
                        self.user = user;
                        self.signed_in = true;
                        
                        // document.getElementById('sign-in-status').textContent = 'Signed in';
                        // document.getElementById('sign-in').textContent = 'Sign out';
                    });
                } else {
                    // User is signed out.
                    self.signed_in = false;
                    self.user = {};
                    // document.getElementById('sign-in-status').textContent = 'Signed out';
                    // document.getElementById('sign-in').textContent = 'Sign in';
                    // document.getElementById('account-details').textContent = 'null';
                }
            }, function(error) {
                console.log(error);
            });
        },

        sign_out(){
            let self = this;
            firebase.auth().signOut().then(function(){location.reload()});
        }
    }
})