import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizValidationPreview } from '../_models/quiz-validation-preview';
import { QuizValidationListService} from '../_services/quiz-validation-list.service';

@Component({
  selector: 'app-validation-page',
  templateUrl: './validation-page.component.html',
  styleUrls: ['./validation-page.component.css']
})
export class ValidationPageComponent implements OnInit {
  active: number;
  currentUsername: string;
  showButtons: boolean = true;

  constructor(private quizValidationService: QuizValidationListService) {
    this.active = 1;
  }

  ngOnInit(): void {
    this.currentUsername = this.quizValidationService.getCurrentUsername();
  }

  changeList(event):void{
    if (event == 1){
      this.showButtons = true;
    }
    else{
      this.showButtons = false;
    }
    this.quizValidationService.listType = event;
  }

}
