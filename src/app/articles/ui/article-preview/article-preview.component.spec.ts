import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { TagListComponent } from '@/app/shared/ui/tag-list';

import { Article } from '../../data-access/models';

import { ArticleMetaComponent } from '../article-meta';

import { ArticlePreviewComponent } from './article-preview.component';

describe('ArticlePreviewComponent', () => {
  const mockArticle = {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    description: 'Ever wondered how?',
    tagList: ['dragons', 'training'],
    createdAt: new Date('02/09/2025').toString(),
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'jack',
      image: 'https://i.stack.imgur.com/xHWG8.jpg'
    }
  } as Article;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  });

  it('should use ArticleMetaComponent', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(ArticleMetaComponent)))
      .withContext(
        'You might have forgot to add ArticleMetaComponent to the ArticlePreviewComponent template'
      )
      .not.toBeNull();
  });

  it('should display a button to toggle favorite', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('[data-test=toggle-favorite-article-button]'));
    expect(button)
      .withContext('You should have a button to toggle the favoriting of the article')
      .not.toBeNull();
    expect(button.nativeElement.textContent)
      .withContext('The button should have a correct number of favorites')
      .toContain(mockArticle.favoritesCount);
  });

  it('should display a preview link', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    const debugElement = fixture.debugElement;
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    const previewLink = debugElement.query(By.css('[data-test=article-preview-link]'));
    expect(previewLink)
      .withContext('You should have an `a` element for the preview link')
      .not.toBeNull();
    expect(previewLink.nativeElement.getAttribute('href'))
      .withContext('The `href` attribute of the `a` element is not correct')
      .toBe(`/article/${mockArticle.slug}`);

    const title = previewLink.query(By.css('[data-test=article-title]'));
    expect(title).withContext('You should have an `h3` element for the title').not.toBeNull();
    expect(title.nativeElement.textContent)
      .withContext('The title should have a text')
      .toContain(mockArticle.title);

    const description = previewLink.query(By.css('[data-test=article-description]'));
    expect(description)
      .withContext('You should have a `p` element for the description')
      .not.toBeNull();
    expect(description.nativeElement.textContent)
      .withContext('The description should have a text')
      .toContain(mockArticle.description);

    const readMoreLabel = previewLink.query(By.css('[data-test=article-read-more-label]'));
    expect(readMoreLabel)
      .withContext('You should have a `span` element for the read more label')
      .not.toBeNull();
    expect(readMoreLabel.nativeElement.textContent)
      .withContext('The read more label should have a text')
      .toContain('Read more');

    const tagList = debugElement.query(By.directive(TagListComponent));
    expect(tagList)
      .withContext('You should use TagListComponent to display a list of tags')
      .not.toBeNull();

    const tagNames = tagList.queryAll(By.css('[data-test=tag]'));
    expect(tagNames.length).withContext('You should have two tags displayed').toBe(2);
    expect(tagNames[0].nativeElement.textContent).toContain(mockArticle.tagList[0]);
    expect(tagNames[1].nativeElement.textContent).toContain(mockArticle.tagList[1]);
  });

  it('should emit an output event when clicking the toggle favorite button', () => {
    const fixture = TestBed.createComponent(ArticlePreviewComponent);
    const component = fixture.componentInstance;
    fixture.componentInstance.article = mockArticle;
    fixture.detectChanges();

    spyOn(component.toggledFavorite, 'emit');

    const button = fixture.debugElement.query(By.css('[data-test=toggle-favorite-article-button]'));
    button.triggerEventHandler('click');

    expect(component.toggledFavorite.emit).toHaveBeenCalled();
  });
});
