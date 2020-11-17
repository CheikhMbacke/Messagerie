
const xml2js = require("xml2js");
const fs = require('fs');
const { resolve, parse } = require("path");
const parser = xml2js.Parser({ attrkey: "ATTR" });


function getUserById(idContact, data){
    return new Promise((resolve, reject) =>{
        parser.parseString(data, (err, result) =>{
            if(result === null) console.log(err);
            else{
                let contacts = result['messagerie'];
                for (let index = 0; index < contacts['contacts'][0]['contact'].length; index++) {
                    if(contacts['contacts'][0]['contact'][index]['ATTR']['idContact'] === idContact){
                        resolve(contacts['contacts'][0]['contact'][index]);
                    }
                }
                reject('Not Found')
            }
        });
    })
    
}

function getGroupeById(idGroupe, data){
    parser.parseString(data, (err, result) =>{
        if(result === null) console.log(err);
        else{
            let groupes = result['messagerie'];
            groupes['groupes'][0]['groupe'].forEach(groupe => {
                if(groupe['ATTR']['idGroupe'] === idGroupe){
                   return groupe;
                }
                else return null;
            });
        }
    });
}

function getGroupesOfUser(idContact, data){
    let grps = [];
    parser.parseString(data, (err, result) =>{
        if(result === null) console.log(err);
        else{
            let groupes = result['messagerie'];
            groupes['groupes'][0]['groupe'].forEach(groupe => {
               let participant = groupe['participant'];
               participant.forEach(element => {
                   if(element['ATTR']['idref'] === idContact){
                    grps.push(groupe);
                   }
               });
               
            });
        }
    });
    if(data.length > 0) return grps;
    else return null;
}

 function receivedMessages(id, data){
    let receivedMsg = {
        from: String,
        telephone: String,
        msg: String
    };
   
   return new Promise((resolve, reject) =>{
    msg = []
    parser.parseString(data, (err, result) =>{
        if(result === null) console.log(err);
        else{
            let messages = result['messagerie'];
             const run = async () =>{
                for (let index = 0; index < messages['messages'][0]['message'].length; index++) {
                    if(messages['messages'][0]['message'][index]['ATTR']['destination'] === id){
                        fromUserId = messages['messages'][0]['message'][index]['ATTR']['expediteur'];
                        await getUserById(fromUserId).then((user) =>{
                            receivedMessages.from = user.prenom+' '+user.nom;
                            receivedMessages.telephone = user.numero
                            receivedMessages.msg = messages['messages'][0]['message'][index]['_'].replace(/(\r\n\t|\n|\r|\t)/gm,"").trim()
                            msg.push(receivedMessages);
                            resolve(msg)
                        })
                    }
                   
                }
             }
             run()
        }
    });
  
   })
   
}

function getNumberOfContact(){
   return new Promise((resolve, reject) =>{
        parser.parseString(data, (err, result) =>{
            resolve(result['messagerie']['contacts'][0]['contact'].length)
        });
   })
}

function getNumberOfMessage(){
    return new Promise((resolve, reject) =>{
         parser.parseString(data, (err, result) =>{
             resolve(result['messagerie']['messages'][0]['message'].length)
         });
    })
 }

function insertUser(name, lastname, phone, data) {
    let nbContact;
    getNumberOfContact().then((nb) =>{
        nbContact = nb + 1;
        parser.parseString(data, (err, result) =>{
            result.messagerie.contacts[0].contact.push({
                $: {
                    idContact: 'con-'+nbContact,
                    groupesRef: "",
                    contactsRef: ""
                },
                nom: lastname,
                prenom: name,
                numero: phone
            });
           result = JSON.stringify(result).replace(/ATTR/g,'$');
           
            let builder = new xml2js.Builder()
            xml = builder.buildObject(JSON.parse(result))    
            fs.writeFile("messagerie.xml", xml, (err) =>{
                if(err) console.log(err);
                else console.log("Bien enregistré")
            });
        })
    });
}

function insertMessage(message, data) {
    console.log(message);
    getNumberOfMessage().then((nb) =>{
        nbMsg = nb + 1
        parser.parseString(data, (err, result) =>{
            result.messagerie.messages[0].message.push({
                $: {
                    idContact: 'msg-'+nbMsg,
                    expediteur: "",
                    destination: "",
                    datetime: ''
                },
                _: message
            });
           result = JSON.stringify(result).replace(/ATTR/g,'$');
           
            let builder = new xml2js.Builder()
            xml = builder.buildObject(JSON.parse(result))    
            fs.writeFile("messagerie.xml", xml, (err) =>{
                if(err) console.log(err);
                else console.log("Bien enregistré")
            });
        })
    })
}

function insertUserToGroupe() {}

function insertContactForUser() {}



function update() {}
