import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: 'img[qlImgFallback]',
  standalone: true,
  host: {
    '(error)': 'onError()'
  }
})
export class ImgFallbackDirective {
  private readonly elementRef = inject(ElementRef);

  public readonly imgFallback = input('', { alias: 'qlImgFallback' });

  protected onError(): void {
    const element: HTMLImageElement = this.elementRef.nativeElement;
    element.setAttribute('src', this.imgFallback() || '/smiley-cyrus.jpg');
  }
}
