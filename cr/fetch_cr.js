const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const util = require('util')
const configuration = require('config');


const sqlite3 = require('sqlite3').verbose();

const hostName = configuration.get("camunda.host"); 
// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: `${hostName}/engine-rest`, use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

result = { name: "NAME PLACEHOLDER", 
           cr_number: "CR NUMBER PLACEHOLDER",
           is_eligible: 0,
           refund_amount: 0
          };

function setResult(r){

 console.log(`setting result object ... ${r.id} ${r.name} ${r.cr_number} ${r.is_eligible} ${r.refund_amount}`);

  result.name          = r.name; 
  result.cr_number     = r.cr_number;
  result.is_eligible   = r.is_eligible;
  result.refund_amount = r.refund_amount;
}


function getResult() {
  return result;
}

async function query(cr_number, cb){

  const FILE = "./cr.db";
  var db = new sqlite3.Database(FILE, sqlite3.OPEN_READONLY);
  
  db.get("SELECT * FROM crs WHERE cr_number = ? LIMIT 1", [cr_number], (err, row) => {
    
    if (err != null) {
      console.error("error while getting records " + err);
    }
    console.log(`Query result is: ${row.cr_number}`);
    cb(row);
  }).close((e) => {
    console.log('Closing database');
    if (e != null) {
      console.error('Could not close database connection, ' + e);
    }
  });
}

// susbscribe to the topic: 't_determine_eligibility'
client.subscribe("t_fetch_cr", async function({ task, taskService }) {
  
  const cr_number = task.variables.get("cr_number");
  console.log(`incoming cr number is ${cr_number}`);

  query(cr_number, setResult)
  .finally(() => {
    console.log("latest refund: " + getResult().refund_amount);
    console.log("cr_name: "       + getResult().name);
    console.log("cr_number: "     + getResult().cr_number);
    // prepare next step
    let processVariables = new Variables();
    processVariables.set("refund_amount", result.refund_amount);
    processVariables.set("cr_name",       result.name);
    processVariables.set("cr_number",     result.cr_number);
     // complete the task
    console.log("completing the task");
    taskService.complete(task, processVariables);
  });

});