import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {ExtendedQuizPreview} from '../../_models/extendedquiz-preview';
import {DomSanitizer} from '@angular/platform-browser';
import {QuizFilterSettings} from '../../_models/quiz-filter-settings';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../utils/locale.service';

@Injectable({
    providedIn: 'root'
})
export class SearchFilterQuizService {

    readonly filterUrl = `${environment.apiUrl}quizzes/filter-quiz-list/page`;
    readonly filterUrlTotalSize = `${environment.apiUrl}quizzes/filter-quiz-list/size`;

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            observe: 'response'
        })
    };

    private settings: QuizFilterSettings;
    private currentQuizzesSubject: BehaviorSubject<ExtendedQuizPreview[]>;
    public currentQuizzes: Observable<ExtendedQuizPreview[]>;
    private currentQuizzesSizeSubject: BehaviorSubject<number>;
    public currentQuizzesSize: Observable<number>;

    constructor(private http: HttpClient,
                private sanitizer: DomSanitizer,
                private localeService: LocaleService) {
        this.currentQuizzesSubject = new BehaviorSubject<ExtendedQuizPreview[]>([]);
        this.currentQuizzes = this.currentQuizzesSubject.asObservable();

        this.currentQuizzesSizeSubject = new BehaviorSubject<number>(0);
        this.currentQuizzesSize = this.currentQuizzesSizeSubject.asObservable();
        this.initSettings();
    }

    search(term: string, newSettings?: boolean) {
        if (newSettings) {
            this.initSettings();
        }
        this.settings.quizName = term;
        this.filterQuiz().subscribe();
    }

    filterQuiz(page?: number): Observable<ExtendedQuizPreview[]> {
        this.filterTotalSize().subscribe(n => this.currentQuizzesSizeSubject.next(n));
        return this.sendReq(this.settings, page ? page : 1);
    }

    filterTotalSize(): Observable<number> {
        const sett = this.generateSettingsForRequest(this.settings);
        return this.http.post<number>(this.filterUrlTotalSize, sett, this.httpOptions);
    }

    getSettings(): QuizFilterSettings {
        return this.settings;
    }

    setSettings(settings: QuizFilterSettings): void {
        this.settings = settings;
    }

    initSettings() {
        this.settings = {
            quizName: null,
            userName: null,
            moreThanRating: '0',
            lessThanRating: '5',
            orderByRating: null,
            tags: [],
            categories: [],
            quizLang: this.localeService.getValue('quizFilter.langAll')
        };
        console.log(this.settings);
    }

    private sendReq(settings: QuizFilterSettings, page: number): Observable<ExtendedQuizPreview[]> {
        const sett = this.generateSettingsForRequest(settings);
        return this.http.post<ExtendedQuizPreview[]>(`${this.filterUrl}/${page}`, JSON.stringify(sett),
            this.httpOptions).pipe(map(data => {
                const quizzes = data.map(x => {
                    return new ExtendedQuizPreview().deserialize(x, this.sanitizer);
                });
                this.currentQuizzesSubject.next(quizzes);
                console.log(this.currentQuizzesSubject.value);
                return quizzes;
            }
        ));
    }

    private generateSettingsForRequest(settings: QuizFilterSettings) {
        return {
            quizName: settings.quizName,
            userName: settings.userName,
            moreThanRating: settings.moreThanRating,
            lessThanRating: settings.lessThanRating,
            orderByRating: settings.orderByRating,
            tags: settings.tags.length > 0 ? settings.tags.map(x => x.id) : null,
            categories: settings.categories.length > 0 ? settings.categories.map(x => x.id) : null,
            quizLang: settings.quizLang === this.localeService.getValue('quizFilter.langAll') ?
                null : this.languageEditor(settings.quizLang)
        };
    }

    private languageEditor(lang: string) {
        switch (lang) {
            case this.localeService.getValue('utils.langEng'):
                return 'eng';
            case this.localeService.getValue('utils.langUkr'):
                return 'ukr';
            default:
                return lang;
        }
    }
}