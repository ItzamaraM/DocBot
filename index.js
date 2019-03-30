// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict'; 

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase);
  
  //const firestore = new Firestore();
  //const settings = {timestampsInSnapshots: true};
  //firestore.settings(settings);
  //const timestamp = snapshot.get('created_at');
  //const date = timestamp.toDate();

const bd = admin.firestore();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  const databaseEntry = agent.parameters.any;  

  const dialogflowAgentRef = bd.collection('doc_bot').doc('doc_bot');

  function escribirEnBD (agent){
	  console.log(request.body);
  console.log(databaseEntry);
    return bd.runTransaction(t => {
      t.set(dialogflowAgentRef, {entry: databaseEntry});
      return Promise.resolve('Write complete');
    }).then(doc => {
      agent.add(`Wrote "${databaseEntry}" to the Firestore database.`);
    }).catch(err => {
  console.log(`Error writing to Firestore: ${err}`);
      agent.add(`Failed to write "${databaseEntry}" to the Firestore database.`);
    });
  }
  
                                                                
 
  function readFromDb (agent) {
    // Get the database collection 'dialogflow' and document 'agent'
    const dialogflowAgentDoc = bd.collection('doc_bot').doc('doc_bot');

    // Get the value of 'entry' in the document and send it to the user
    return dialogflowAgentDoc.get()
      .then(doc => {
        if (!doc.exists) {
          agent.add('No data found in the database!');
        } else {
          agent.add(doc.data().entry);
        }
        return Promise.resolve('Read complete');
      }).catch(() => {
        agent.add('Error reading entry from the Firestore database.');
        agent.add('Please add a entry to the database first by saying, "Write <your phrase> to the database"');
      });
  }

  let intentMap = new Map();
  intentMap.set('ApellidoPaterno', escribirEnBD);
  intentMap.set('ApellidoMaterno', escribirEnBD);
  intentMap.set('Alergias', escribirEnBD);
  intentMap.set('CualSeguro', escribirEnBD);
  intentMap.set('Edad', escribirEnBD);
  intentMap.set('Estatura', escribirEnBD);
  intentMap.set('Familiar', escribirEnBD);
  intentMap.set('NumeroSeguro', escribirEnBD);
  intentMap.set('Peso', escribirEnBD);
  intentMap.set('Sangre', escribirEnBD);
  intentMap.set('Telefono', escribirEnBD);
  agent.handleRequest(intentMap);
});