const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const sqlite3 = require('sqlite3').verbose();
const configuration = require('config');

const hostName = configuration.get("camunda.host"); 



function updateEligible(cr_number, flag){
    console.log('connecting to database');
    const FILE = "./cr.db";
    var db = new sqlite3.Database(FILE, sqlite3.OPEN_READWRITE);
    
     var x = (flag ? 1 : 0);

      console.log('querying database');
      db.run("UPDATE crs SET is_eligible = ? WHERE cr_number = ?",[x, cr_number], (err) => {
  
            if(err != null){
              console.log('error while updating ' + err);
            }
        });
}



// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: `${hostName}/engine-rest`, use: logger };
// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 't_determine_eligibility'
client.subscribe("t_determine_eligibility", async function({ task, taskService }) {
  
  // get variables from process
  const cr            = task.variables.get("cr_number");
  const refund_amount = task.variables.get("refund_amount");
  console.log(`CR number is ${cr}, Last Refunded Amount ${refund_amount}.`);
  

  // set initial values 
    var isValid = true;
    var isOdd = true;
  
  if((cr.startsWith("10") && refund_amount === 0)){
    console.log(`CR Starts with 10`);  
  }else if(cr.startsWith("20") && refund_amount === 0) {
    console.log(`CR Starts with 20`);
      isOdd = false;
  }else{
    isValid = false;
  }

  await updateEligible(cr, isValid);

// prepare next step
let processVariables = new Variables();

processVariables.set("is_odd", isOdd);
processVariables.set("isValid", isValid);
processVariables.set("is_valid", isValid);
processVariables.set("yes", isValid);

await taskService.complete(task, processVariables);
});