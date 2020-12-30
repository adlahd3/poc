import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class McService {


  private baseUrl = 'http://localhost:3000';  // URL to web api


  constructor(
    private http: HttpClient) { }

   /** GET heroes from the server */

}
