import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ImgFallbackDirective } from '@/app/shared/directives/img-fallback/img-fallback.directive';

import { Article } from '../../data-access/models';

import { ArticleMetaComponent } from './article-meta.component';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  template: `<ql-article-meta [article]="mockArticle">hello</ql-article-meta>`,
  standalone: true,
  imports: [ArticleMetaComponent]
})
class ArticleMetaTestComponent {
  public mockArticle = {
    createdAt: new Date('02/09/2025').toString(),
    author: {
      username: 'jack',
      image: 'https://i.stack.imgur.com/xHWG8.jpg'
    }
  } as Article;
}

describe('ArticleMetaComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  });

  it('should display the author avatar', () => {
    const fixture = TestBed.createComponent(ArticleMetaTestComponent);
    const mockArticle = fixture.componentInstance.mockArticle;
    fixture.detectChanges();

    const avatarLink = fixture.debugElement.query(By.css('[data-test=author-avatar-link]'));
    expect(avatarLink)
      .withContext('You should have an `a` element for the author avatar')
      .not.toBeNull();
    expect(avatarLink.nativeElement.getAttribute('href'))
      .withContext('The `href` attribute of the `a` element is not correct')
      .toBe(`/profile/${mockArticle.author.username}`);

    const avatar = avatarLink.query(By.css('img'));
    expect(avatar)
      .withContext('You should have an image for the author avatar wrapped around an `a` element')
      .not.toBeNull();
    expect(avatar.injector.get(ImgFallbackDirective))
      .withContext('The image should use the `qlImgFallback` directive')
      .toBeTruthy();

    const avatarElement = avatar.nativeElement;
    expect(avatarElement.getAttribute('src'))
      .withContext('The `src` attribute of the image is not correct')
      .toBe(mockArticle.author.image);
    expect(avatarElement.getAttribute('width'))
      .withContext('The `width` attribute of the image is not correct')
      .toBe('32');
    expect(avatarElement.getAttribute('height'))
      .withContext('The `height` attribute of the image is not correct')
      .toBe('32');
    expect(avatarElement.getAttribute('alt'))
      .withContext('The `alt` attribute of the image is not correct')
      .toBe(mockArticle.author.username);
  });

  it('should display article info', () => {
    const fixture = TestBed.createComponent(ArticleMetaTestComponent);
    const debugElement = fixture.debugElement;
    const mockArticle = fixture.componentInstance.mockArticle;
    fixture.detectChanges();

    const authorName = debugElement.query(By.css('[data-test=author-name]'));
    expect(authorName)
      .withContext('You should have an `a` element for the author name')
      .not.toBeNull();
    expect(authorName.nativeElement.getAttribute('href'))
      .withContext('The `href` attribute of the `a` element is not correct')
      .toBe(`/profile/${mockArticle.author.username}`);
    expect(authorName.nativeElement.textContent)
      .withContext('The `a` element should have a text')
      .toContain(mockArticle.author.username);

    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(mockArticle.createdAt);

    const date = debugElement.query(By.css('[data-test=article-creation-date]'));
    expect(date)
      .withContext('You should have a `p` element for the creation date of the article')
      .not.toBeNull();
    expect(date.nativeElement.textContent)
      .withContext('You should have a `time` element inside the `p` element')
      .toContain(`Published on ${formattedDate}`);

    const time = date.query(By.css('time'));
    expect(time).withContext('You should have a `time` element for the date').not.toBeNull();
    expect(time.nativeElement.textContent)
      .withContext('You should use the `date` pipe to format the date')
      .toContain(formattedDate);
  });

  it('should project the content', () => {
    const fixture = TestBed.createComponent(ArticleMetaTestComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.textContent)
      .withContext('ArticleMetaComponent should use `ng-content`')
      .toContain('hello');
  });
});
