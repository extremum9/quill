import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Article } from '../../data-access/models';

import { ArticleMetaComponent } from '../article-meta';

@Component({
  selector: 'ql-article-banner',
  template: `
    <div class="bg-black bg-gradient">
      <div class="container py-4">
        <h1 data-test="article-title" class="text-white">{{ article.title }}</h1>

        <ql-article-meta [article]="article">
          <div class="d-flex flex-wrap align-self-end align-items-center gap-2">
            @if (canModify) {
              <a
                data-test="edit-article-link"
                class="btn btn-sm btn-secondary"
                [routerLink]="['/editor', article.slug]"
              >
                <span class="bi bi-pencil-square"></span>
                Edit
              </a>
              <button
                data-test="delete-article-button"
                class="btn btn-sm btn-danger"
                type="button"
                [disabled]="deleting"
                (click)="delete()"
              >
                <span class="bi bi-trash3"></span>
                Delete
              </button>
            } @else {
              <button
                data-test="toggle-follow-author-button"
                class="btn btn-sm"
                type="button"
                [class.btn-secondary]="article.author.following"
                [class.btn-outline-secondary]="!article.author.following"
                (click)="toggledFollow.emit()"
              >
                <span class="bi bi-plus-lg"></span>
                {{ article.author.following ? 'Unfollow' : 'Follow' }}
                {{ article.author.username }}
              </button>
              <button
                data-test="toggle-favorite-article-button"
                class="btn btn-sm"
                type="button"
                [class.btn-success]="article.favorited"
                [class.btn-outline-success]="!article.favorited"
                (click)="toggledFavorite.emit()"
              >
                <span class="bi bi-heart-fill"></span>
                {{ article.favorited ? 'Unfavorite' : 'Favorite' }}
                ({{ article.favoritesCount }})
              </button>
            }
          </div>
        </ql-article-meta>
      </div>
    </div>
  `,
  standalone: true,
  imports: [RouterLink, ArticleMetaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleBannerComponent {
  protected deleting = false;

  @Input({ required: true })
  public article!: Article;

  @Input()
  public canModify = false;

  @Output()
  public readonly toggledFollow = new EventEmitter<void>();

  @Output()
  public readonly toggledFavorite = new EventEmitter<void>();

  @Output()
  public readonly deleted = new EventEmitter<void>();

  protected delete(): void {
    this.deleting = true;
    this.deleted.emit();
  }
}
