import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profile } from '../../data-access/models';

@Component({
  selector: 'ql-user-info',
  template: `
    <div class="bg-body-secondary">
      <div class="container py-4">
        <div class="col-md-10 offset-md-1 text-center">
          <img
            data-test="user-profile-image"
            [src]="profile.image"
            width="120"
            height="120"
            [alt]="profile.username"
          />
          <h1 data-test="user-profile-name">{{ profile.username }}</h1>
          <p data-test="user-profile-bio" class="text-body-tertiary">{{ profile.bio }}</p>
          <div class="d-flex justify-content-end">
            @if (canModify) {
              <a
                data-test="edit-profile-link"
                class="btn btn-sm btn-outline-secondary"
                routerLink="/settings"
                >Edit profile settings</a
              >
            } @else {
              <button
                data-test="toggle-follow-author-button"
                class="btn btn-sm"
                type="button"
                [class.btn-secondary]="profile.following"
                [class.btn-outline-secondary]="!profile.following"
                (click)="toggledFollow.emit()"
              >
                <span class="bi bi-plus-lg" aria-hidden="true"></span>
                {{ profile.following ? 'Unfollow' : 'Follow' }} {{ profile.username }}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoComponent {
  @Input({ required: true })
  public profile!: Profile;

  @Input()
  public canModify = false;

  @Output()
  public readonly toggledFollow = new EventEmitter<void>();
}
