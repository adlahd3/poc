const { Client, logger } = require("camunda-external-task-client-js");
const { Variables } = require("camunda-external-task-client-js");
const configuration = require('config');

const hostName = configuration.get("camunda.host"); 
// configuration for the Client:
//  - 'baseUrl': url to the Workflow Engine
//  - 'logger': utility to automatically log important events
const config = { baseUrl: `${hostName}/engine-rest`, use: logger };

// create a Client instance with custom configuration
const client = new Client(config);

console.log(`Listening to ${hostName}/engine-rest ...`);

// susbscribe to the topic: 't_notify'
client.subscribe("t_notify", async function({ task, taskService }) {
  
  // get variables from process
  const eligable         = task.variables.get("yes");
  const crNmber          = task.variables.get("cr_number");
  const refund_amount    = task.variables.get("refund_amount");
  
  if(eligable){
    console.log("Dear CR %s owner. We are pleased to inform you that you are eligble for refund amount %f", crNmber, refund_amount);
  }else{
    console.log("Dear CR %s owner. We are sorry to inform you that you are not eligble for refund. ", crNmber);
  }
    // complete the task
  await taskService.complete(task);
});