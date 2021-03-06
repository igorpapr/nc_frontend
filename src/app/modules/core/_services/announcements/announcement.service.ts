import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {Announcement} from '../../_models/announcement';
import {User} from '../../_models/user';
import {AuthenticationService} from '../authentication/authentication.service';
import { HandleErrorsService } from '../utils/handle-errors.service';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    url = `${environment.apiUrl}` + 'announcement';
    user: User;

    constructor(private http: HttpClient, private sanitizer: DomSanitizer,
                private authenticationService: AuthenticationService,
                private handleErrorsService: HandleErrorsService) {
        this.user = authenticationService.currentUserValue;
    }

    //list of announcements in range
    getAnnouncements(start: number, amount: number): Observable<Announcement[]> {
        const options = {
            params: new HttpParams().set('start', start.toString()).set('amount', amount.toString())

        };

        return this.http.get<Announcement[]>(this.url + '/getall', options).pipe(
            map(data => data.map(x => {
                return new Announcement().deserialize(x, this.sanitizer);
            }),
            catchError(this.handleErrorsService.handleError<Announcement[]>('getAnnouncements', []))
            )
        );
    }

    //amount of announcements for pagination
    getAmount(): Observable<number> {

        return this.http.get<number>(this.url + '/getamount').pipe(
            catchError(this.handleErrorsService.handleError<number>('getAmount', 0))            
        );
    }

    //new announcement
    addAnnouncement(announcement: Announcement, img: File): Observable<Announcement> {
        let postAnnouncement = announcement;
        postAnnouncement.creatorId = this.user.id;
        const formData = new FormData();

        formData.append('obj', JSON.stringify(postAnnouncement));
        if (img !== undefined) {
            formData.append('img', img, img.name);
        }


        return this.http.post<Announcement>(this.url + '/create', formData)
            .pipe(map(data => {
                return new Announcement().deserialize(data, this.sanitizer);
            }),
            catchError(this.handleErrorsService.handleError<Announcement>('addAnnouncement', null))
            );
    }

    editAnnouncement(announcement: Announcement, img: File): Observable<Announcement> {
        let postAnnouncement = announcement;
        postAnnouncement.creatorId = this.user.id;
        const formData = new FormData();

        formData.append('obj', JSON.stringify(postAnnouncement));

        if (img !== undefined && img !== null) {
            formData.append('img', img, img.name);
            formData.append('newimage', 'true');
        } else if (img === null) {
            formData.append('newimage', 'true');
        }

        return this.http.put<Announcement>(this.url + '/edit', formData)
            .pipe(map(data => {
                return new Announcement().deserialize(data, this.sanitizer);
            }),
            catchError(this.handleErrorsService.handleError<Announcement>('editAnnouncement', null))
            );
    }


    //delete announcement
    deleteAnnouncement(id: string): Observable<Announcement> {
        return this.http.delete<Announcement>(this.url + '/delete/' + id).pipe(
            catchError(this.handleErrorsService.handleError<Announcement>('deleteAnnouncement', null))
            
        );
    }

    //validate announcement
    validateAnnouncement(announcement: Announcement): boolean {
        return announcement.textContent !== '' && announcement.title !== '';
    }

    getAdminName() {
        return this.user.username;
    }

}
