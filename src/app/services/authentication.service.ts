import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, throwError } from 'rxjs';
import { User } from '../models/user';
import { map } from 'rxjs/operators';
import { catchError} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private baseUrl = 'https://audit-api-service.herokuapp.com/';

  constructor(private http: HttpClient) {

    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();

   }
    httpOptions:any = {
    headers: new HttpHeaders({ 
      'Access-Control-Allow-Origin':'*',
      'Authorization':'authkey',
      'Content-Type':'text/plain',
    })
  };





 
   public get currentUserValue(): User {
    return this.currentUserSubject.value;
   }

   authenticate(login: Object): Observable<Object> {
    return this.http.post<any>(`${this.baseUrl}`+"login/authenticate", login)
        .pipe(map(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return user;
        }));
}

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
}

  activate(emailId: string): Observable<any> {
     // Setup log namespace query parameter
     const headers = new HttpHeaders(
       {'Content-Type': 'application/json',
       'X-Requested-With': 'XMLHttpRequest',
      //  'Access-Control-Allow-Origin': 'http://localhost:4200',
      //  'Access-Control-Allow-Headers': 'true',
      //  'Access-Control-Allow-Credentials': 'true',
      //  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE'

      
      });
     let params = new HttpParams().set('emailId', emailId);
     
    return this.http.get(this.baseUrl+ 'account/activation',{ params: params, headers: headers })
    .pipe(
       map(res => res), catchError(err => throwError(err))); 
  }

  emailverify(token: string): Observable<any> {
    // Setup log namespace query parameter
    let params = new HttpParams().set('token', token);
   return this.http.get(`${this.baseUrl}account/confirm-account`,{ params: params });
 }

 forgot(emailId: string): Observable<any> {
  // Setup log namespace query parameter
  let params = new HttpParams().set('emailId', emailId);
 return this.http.get(`${this.baseUrl}account/forgot-password`,{ params: params });
}

 passwordverify(token: string): Observable<any> {
  // Setup log namespace query parameter
  let params = new HttpParams().set('token', token);
 return this.http.get(`${this.baseUrl}account/confirm-password`,{ params: params });
}

 passwordcreate(password: string,emailId: string): Observable<any> {
  // Initialize Params Object
  let params = new HttpParams();
  // Begin assigning parameters
  params = params.append('password', password);
  params = params.append('emailId', emailId);
  
  return this.http.put(`${this.baseUrl}account/password-creation`,null,{ params: params });
}

private handleError(err: HttpErrorResponse) {
  console.log(err.message);
  return Observable.throw(err.message);
}
}
