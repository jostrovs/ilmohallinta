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
    },
    beforeCreate(){
        let self = this;
        self.loading++;
        database.ref('/ilmoittautuneet').once('value').then(function(joukkueet) {
            joukkueet.forEach(function(joukkue){
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
        }
    }
})