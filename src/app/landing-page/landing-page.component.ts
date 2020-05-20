import {Component, Input, OnInit, Renderer2, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../_services/authentication.service';
import { Role } from '../_models/role';

@Component({
  selector: 'app-modal-content-message',
  styleUrls: ['../log-in/log-in.component.css'],
  template: `
    <div class="m-2 p-2">
  <button class="close-btn " type="button" name="button"
          (click)="activeModal.dismiss('Cross click')"><img src="../assets/img/close-button.jpg" alt=""></button>
  <span class="text"><p class="text-center">{{message}}</p></span>
</div>
  `
})
export class MessModalContent {
  @Input() message;

  constructor(public activeModal: NgbActiveModal) {
  }
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  @ViewChild('message') mess: TemplateRef<any>;
  
  isSignedIn: boolean;
  isRoleUser: boolean;

  constructor(private activatedRoute: ActivatedRoute,
              private modalService: NgbModal,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.message) {
        this.modalService.open(MessModalContent)
          .componentInstance.message = params.message;
      }
    });
    this.isSignedIn = (this.authenticationService.currentUserValue === undefined) ? false : true;
    this.isRoleUser = (this.isSignedIn &&
      this.authenticationService.currentUserValue.role === Role.User);
  }


}
