const axios = require('axios')

console.log(`deleting ... `)

instances = [];



axios.get('http://localhost:8080/engine-rest/process-instance')
.then((response) => {

    response.data.forEach(element => {
        console.log(element);
        instances.push(element.id);
    })

})
.then(() => {
    axios.post('http://localhost:8080/engine-rest/process-instance/delete', {
        processInstanceIds: instances
    })
    .catch((e) => console.log(`error is ${e}`))
})
.catch((e) => console.error(e) );


