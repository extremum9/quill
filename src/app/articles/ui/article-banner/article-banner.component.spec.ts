import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Article } from '../../data-access/models';

import { ArticleBannerComponent } from './article-banner.component';
import { By } from '@angular/platform-browser';

describe('ArticleBannerComponent', () => {
  const mockArticle = {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    createdAt: new Date('02/09/2025').toString(),
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'jack',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: false
    }
  } as Article;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  });

  it('should have a title', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('[data-test=article-title]'));
    expect(title).withContext('You should have an `h1` element for the title').not.toBeNull();
    expect(title.nativeElement.textContent)
      .withContext('The title should have a text')
      .toContain(mockArticle.title);
  });

  it('should display an edit link with a delete button if can modify', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    const debugElement = fixture.debugElement;
    fixture.componentInstance.article = mockArticle;
    fixture.componentInstance.canModify = true;
    fixture.detectChanges();

    const editLink = debugElement.query(By.css('[data-test=edit-article-link]'));
    expect(editLink)
      .withContext('You should have an `a` element for the link to the editor page')
      .not.toBeNull();
    expect(editLink.nativeElement.getAttribute('href'))
      .withContext('The `href` attribute of the `a` element is not correct')
      .toBe(`/editor/${mockArticle.slug}`);
    expect(editLink.nativeElement.textContent)
      .withContext('The link should have a text')
      .toContain('Edit');

    const deleteButton = debugElement.query(By.css('[data-test=delete-article-button]'));
    expect(deleteButton)
      .withContext('You should have a button to delete the article')
      .not.toBeNull();
    expect(deleteButton.nativeElement.hasAttribute('disabled'))
      .withContext('Your delete button should NOT be disabled if the status is not deleting')
      .toBe(false);
    expect(deleteButton.nativeElement.textContent)
      .withContext('The button should have a text')
      .toContain('Delete');
  });

  it('should display a toggle follow button with a toggle favorite button if cannot modify', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    const debugElement = fixture.debugElement;
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    const toggleFollowButton = debugElement.query(
      By.css('[data-test=toggle-follow-author-button]')
    );
    expect(toggleFollowButton)
      .withContext('You should have a button to toggle the following of the author')
      .not.toBeNull();

    const toggleFollowButtonElement = toggleFollowButton.nativeElement;
    expect(toggleFollowButtonElement.textContent)
      .withContext('The button should have a text')
      .toContain(`Follow ${mockArticle.author.username}`);

    const toggleFavoriteButton = debugElement.query(
      By.css('[data-test=toggle-favorite-article-button]')
    );
    expect(toggleFavoriteButton)
      .withContext('You should have a button to toggle the favoriting of the article')
      .not.toBeNull();

    const toggleFavoriteButtonElement = toggleFavoriteButton.nativeElement;
    expect(toggleFavoriteButtonElement.textContent)
      .withContext('The button should have the number of favorites')
      .toContain(mockArticle.favoritesCount);
    expect(toggleFavoriteButtonElement.textContent)
      .withContext('The button should have a text')
      .toContain('Favorite');

    fixture.componentRef.setInput('article', {
      ...mockArticle,
      favorited: true,
      author: { ...mockArticle.author, following: true }
    });
    fixture.detectChanges();

    expect(toggleFollowButtonElement.textContent).toContain(
      `Unfollow ${mockArticle.author.username}`
    );
    expect(toggleFavoriteButtonElement.textContent).toContain('Unfavorite');
  });

  it('should emit an output event when clicking the delete button', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    const component = fixture.componentInstance;
    fixture.componentInstance.article = mockArticle;
    fixture.componentInstance.canModify = true;
    fixture.detectChanges();

    spyOn(component.deleted, 'emit');

    const button = fixture.debugElement.query(By.css('[data-test=delete-article-button]'));
    button.triggerEventHandler('click');
    fixture.detectChanges();

    expect(button.nativeElement.hasAttribute('disabled'))
      .withContext('Your delete button should be disabled if the status is deleting')
      .toBe(true);
    expect(component.deleted.emit).toHaveBeenCalled();
  });

  it('should emit an output event when clicking the toggle follow button', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    const component = fixture.componentInstance;
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    spyOn(component.toggledFollow, 'emit');

    const button = fixture.debugElement.query(By.css('[data-test=toggle-follow-author-button]'));
    button.triggerEventHandler('click');

    expect(component.toggledFollow.emit).toHaveBeenCalled();
  });

  it('should emit an output event when clicking the toggle favorite button', () => {
    const fixture = TestBed.createComponent(ArticleBannerComponent);
    const component = fixture.componentInstance;
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    spyOn(component.toggledFavorite, 'emit');

    const button = fixture.debugElement.query(By.css('[data-test=toggle-favorite-article-button]'));
    button.triggerEventHandler('click');

    expect(component.toggledFavorite.emit).toHaveBeenCalled();
  });
});
