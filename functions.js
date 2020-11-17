
const xml2js = require("xml2js");
const fs = require('fs');
const { resolve } = require("path");
const parser = xml2js.Parser({ attrkey: "ATTR" });
let data  = fs.readFileSync("messagerie.xml", "utf-8");


function getUserById(idContact){
    let found = false;
    let ctact;
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

function getGroupeById(idGroupe){
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

function getGroupesOfUser(idContact){
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

 function receivedMessages(id){
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
