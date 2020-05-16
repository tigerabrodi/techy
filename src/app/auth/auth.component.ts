import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UiService } from '../shared/ui.service';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  loginMode = true;
  isLoading = false;

  isLoadingSubscription: Subscription;

  // declaring form
  authForm = this.fb.group({});

  constructor(
    private uiService: UiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isLoadingSubscription = this.uiService.loadingStateChanged.subscribe(
      (isLoading) => {
        this.isLoading = isLoading;
      }
    );

    // initializing form
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password2: ['', Validators.required],
    });
  }

  onSubmit() {
    const email = this.authForm.get('email').value;
    const password = this.authForm.get('password').value;
    const password2 = this.authForm.get('password2').value;
    if (!this.loginMode) {
      if (password !== password2) {
        return this.uiService.alertAction('Passwords Do Not Match', 'danger');
      } else {
        this.authService.registerUser({
          email,
          password,
        });
      }
    } else {
      this.authService.login({
        email,
        password,
      });
    }
  }

  // access the controls
  get f() {
    return this.authForm.controls;
  }

  onSwitchAuth(event: any) {
    event.preventDefault();
    this.loginMode = !this.loginMode;
  }

  ngOnDestroy() {
    if (this.isLoadingSubscription) {
      this.isLoadingSubscription.unsubscribe();
    }
  }
}
