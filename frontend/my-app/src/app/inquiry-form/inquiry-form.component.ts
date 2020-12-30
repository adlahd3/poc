import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {concatMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  styleUrls: ['./inquiry-form.component.css']
})
export class InquiryFormComponent implements OnInit {


   private instanceId; 
   crFormGroup: FormGroup
   crInputControl: FormControl
   btnDisabled: boolean

   isValid: boolean
   amount: number
   crN: String

   hideResult:boolean;
   

  constructor(private http: HttpClient) { 

    this.crFormGroup = new FormGroup({
      crInputControl: new FormControl('', 
      [
        Validators.required,
        Validators.minLength(5)
      ]),
    });

    this.btnDisabled = false;
  }



  ngOnInit(): void {
    this.hideResult = true;
  }



  OnInput(event: any) {
    this.crN = event.target.value;
  }


  onSubmit(){
    
    let headers = new HttpHeaders().set('Access-Control-Allow-Origin', "*"); // create header object

    this.btnDisabled = true;
    this.http.post<any>('http://localhost:8080/engine-rest/process-definition/Process_refund:14:c6ac75da-4206-11eb-824c-0242ac110002/start', {}, {headers: headers})
    .pipe(
      tap((res) => {
        console.log(`result: ${res}`);
        this.instanceId = res.id;
      }),
      concatMap((res: { id: string }) => this.http.get(`http://localhost:8080/engine-rest/task?processInstanceId=${+res.id}`)),
      tap(res => console.log("Second Call: " + res)),
      concatMap((res: { id: string }) => this.http.post(`http://localhost:8080/engine-rest/task/${+res.id}`,
       {
         variables: {
          cr_number: {
            value: this.crN, 
            type: "string"
          }
         }
        }
    )))
    .subscribe(data => {
      console.log("data is " + data);
      this.btnDisabled = false;
  })
  }
}
