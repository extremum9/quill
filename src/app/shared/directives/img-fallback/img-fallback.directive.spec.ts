import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ImgFallbackDirective } from './img-fallback.directive';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  template: ` <img src="invalid.jpg" [qlImgFallback]="fallbackImage()" /> `,
  standalone: true,
  imports: [ImgFallbackDirective]
})
class TestComponent {
  public fallbackImage = signal('');
}

describe('ImgFallbackDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should provide an image with a fallback if the path is invalid', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const debugElement = fixture.debugElement;
    fixture.detectChanges();

    const imageElement: HTMLImageElement = debugElement.query(
      By.directive(ImgFallbackDirective)
    ).nativeElement;

    expect(imageElement.src).toContain('invalid.jpg');

    imageElement.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(imageElement.src).toContain('smiley-cyrus');

    fixture.componentInstance.fallbackImage.set('custom-fallback.jpg');
    fixture.detectChanges();

    imageElement.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(imageElement.src).toContain('custom-fallback.jpg');
  });
});
