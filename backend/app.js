const { json } = require('express')
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express()
const port = 3000

const baseUrl = "http://localhost:8080/engine-rest"; 
const processId = "Process_refund:11:a730d328-3bbb-11eb-a85c-0242ac110002";


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());




async function createRequest(){
  var bk = Math.floor(Math.random() * 5001); 
  return axios
  .post(`${baseUrl}/process-definition/${processId}/start`, {
   "businessKey": bk
  })
  .then((data) => {
    console.log(`businessKey ${bk}`)
    return data.data;
  })
  .catch((e) => {
    console.log(e)
  });
}

async function getProcessTasks(processInstanceId){
  console.log(`getting process instance ${processInstanceId} tasks.`)
  return axios
    .get(`${baseUrl}/task?processInstanceId=${processInstanceId}`)
    .then((r) => {
      console.log(`it has task id => ${r.data[0].id}`)
      return r.data[0].id;
    }).catch((e) => {
      console.error(`could not get process instance ${processInstanceId} tasks. ${e}`)
    })

}

async function startProcess(taskId, cr){

  console.log(`completing the first task in process : ${taskId} with cr ${cr}`);
  return axios
 .post(`${baseUrl}/task/${taskId}/complete`, {

   "variables": {
     "cr_number":{
       "value": cr, 
       "type": "String"
     }
   }
 })
 .then(() => {
   console.log("started the process");
 }).catch((e) => {
  console.error(`could not start. ${e}`)
})
}

async function getResult(pid){
  var finalResult = {
    cr_number : "", 
    valid: false, 
    refund_amount: 0
  };


  await new Promise(resolve => setTimeout(resolve, 2500)); // fake message 
  return axios.get(`${baseUrl}/history/variable-instance?processInstanceId=${pid}`)
  .then((result) => {
   
    crNumber = result.data.find((e) => e.name == "cr_number");
    if(crNumber != null){
      finalResult.cr_number = crNumber.value;
    }

    validity = result.data.find((e) => e.name == "is_valid");
    if(validity != null){
      finalResult.valid = validity.value;
    }

    refund = result.data.find((e) => e.name == "refund_amount");
    if(refund != null){
      finalResult.refund_amount = refund.value;
    }

    return finalResult;
   
  })
  .catch((e) => console.error(e));
}


app.post('/start', (req, res) => {
  
  var cr = req.body.cr;
  let pinsid = null;
  let taskId = null;
  let bk = null;

   createRequest()
  .then((requestData) => {
    console.log(`new process instance id is ${requestData.id}`);
    this.bk = requestData.businessKey
    this.pinsid  = requestData.id;
  })
  .then(()  => {
    getProcessTasks(this.pinsid).then((tid) => {
      this.taskId = tid;
    })
    .then(() => {
      startProcess(this.taskId, cr).then(() => {
        console.log(`getting final result`);
          getResult(this.pinsid)
          .then((result) => {
            console.log(result);
            res.json({
              "error": false, 
              "process_instacne_id": this.pinsid,
              "result": result
            })
          })
     
      })
    })
    
  })

  .catch((e) => console.error(`error is ${e}`) );
})



app.listen(port, () => {
  console.log(`Sample Backend app listening at http://localhost:${port}`)
})