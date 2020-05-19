import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GameResult} from '../_models/game-result';

@Injectable({
    providedIn: 'root'
})
export class GameResultService {

    url = `${environment.apiUrl}games/sessions/`;
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };


    constructor(private http: HttpClient) {

    }

    getResults(gameId: string): Observable<GameResult[]> {
        return this.http.get<GameResult[]>(this.url + `${gameId}`, this.httpOptions);
    }
}