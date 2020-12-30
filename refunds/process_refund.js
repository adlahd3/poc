const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const sqlite3 = require('sqlite3').verbose();
const configuration = require('config');

// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const hostName = configuration.get("camunda.host"); 
const config = { baseUrl: `${hostName}/engine-rest`, use: logger };

// create a Client instance with custom configuration
const client = new Client(config);


async function updateCRLatestAmount(amount, cr_number) {
    console.log("updating the cr latest amount log");
    const FILE = "./cr.db";
    var db = new sqlite3.Database(FILE, sqlite3.OPEN_READWRITE);
    const sql = "UPDATE crs SET refund_amount = ? WHERE cr_number = ?";
    
    db.run(sql, [amount, cr_number], (result, err) => {
        if (err != null) {
            console.error('could not perform update query. ' + err);
        }
    });

    console.log('closing the database for updating the cr latest amount log ...');
    db.close((err) => {
        if (err != null) {
            console.error('error while closing the database ' + err);
        }
    })
}

async function updateFinancialLog(amount, cr_number) {

    console.log("updating the financial log");

    const FILE = "./refunds.db";
    var db = new sqlite3.Database(FILE, sqlite3.OPEN_READWRITE);
    
    var currentDate = new Date(Date.now()).toLocaleString().split(',')[0];
    console.log(`current date is ${currentDate}`);
    const sql = "INSERT INTO amounts (cr_number, amount, issued_at) VALUES (?, ?, ?)";
    
    db.run(sql, [cr_number, amount, currentDate])
    console.log("closing database for updating the financial log");
    db.close((err) => {
        if (err != null) {
            console.error("error while closing database for updating the financial log " + e);
        }
    });
}

// susbscribe to the topic: 't_issue_refund'
client.subscribe("t_issue_refund", async function({ task, taskService }) {
  
  // get variables from process
  const cr            = task.variables.get("cr_number");
  const refund_amount = task.variables.get("refund_amount");
  console.log(`Incoming CR is ${cr} Refund amount is ${refund_amount}.`);
  

  // updating cr db 
   updateCRLatestAmount(refund_amount, cr)
   .then(() => {
    updateFinancialLog(refund_amount, cr);
   }).finally(() => {
    taskService.complete(task);
   }).catch((err) => {
    if (err != null) {
        console.error('error is ' + err);
    }
   });
  
});