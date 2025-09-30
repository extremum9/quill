import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { UserInfoComponent } from './user-info.component';
import { By } from '@angular/platform-browser';

describe('UserInfoComponent', () => {
  const mockProfile = {
    username: 'jack',
    bio: 'I work at a state farm',
    image: 'https://i.stack.imgur.com/xHWG8.jpg',
    following: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  });

  it('should display user info', () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    const debugElement = fixture.debugElement;
    fixture.componentInstance.profile = mockProfile;
    fixture.detectChanges();

    const image = debugElement.query(By.css('[data-test=user-profile-image]'));
    expect(image).withContext('You should have an image for the user avatar').not.toBeNull();

    const imageElement = image.nativeElement;
    expect(imageElement.getAttribute('src'))
      .withContext('The `src` attribute of the image is not correct')
      .toBe(mockProfile.image);
    expect(imageElement.getAttribute('width'))
      .withContext('The `width` attribute of the image is not correct')
      .toBe('120');
    expect(imageElement.getAttribute('height'))
      .withContext('The `height` attribute of the image is not correct')
      .toBe('120');
    expect(imageElement.getAttribute('alt'))
      .withContext('The `alt` attribute of the image is not correct')
      .toBe(mockProfile.username);

    const username = debugElement.query(By.css('[data-test=user-profile-name]'));
    expect(username).withContext('You should have an `h1` element for the username').not.toBeNull();
    expect(username.nativeElement.textContent).toContain(mockProfile.username);

    const bio = debugElement.query(By.css('[data-test=user-profile-bio]'));
    expect(bio).withContext('You should have a `p` element for the bio').not.toBeNull();
    expect(bio.nativeElement.textContent).toContain(mockProfile.bio);

    const toggleFollowButton = debugElement.query(
      By.css('[data-test=toggle-follow-author-button]')
    );
    expect(toggleFollowButton)
      .withContext('You should have a button to toggle the following of a user')
      .not.toBeNull();
    expect(toggleFollowButton.nativeElement.textContent)
      .withContext('The button should have a text containing the username')
      .toContain(`Follow ${mockProfile.username}`);

    fixture.componentRef.setInput('profile', { ...mockProfile, following: true });
    fixture.detectChanges();

    expect(toggleFollowButton.nativeElement.textContent)
      .withContext('The button should have a text containing the username')
      .toContain(`Unfollow ${mockProfile.username}`);
  });

  it('should display an edit profile link if can modify', () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    const debugElement = fixture.debugElement;
    fixture.componentInstance.profile = mockProfile;
    fixture.componentInstance.canModify = true;
    fixture.detectChanges();

    expect(debugElement.query(By.css('toggle-follow-author-button')))
      .withContext('You should NOT have a button to toggle the following of a user')
      .toBeNull();

    const editProfileLink = debugElement.query(By.css('[data-test=edit-profile-link]'));
    expect(editProfileLink)
      .withContext('You should have an `a` element for the link to the settings page')
      .not.toBeNull();
    expect(editProfileLink.nativeElement.textContent)
      .withContext('The link should have a text')
      .toContain('Edit profile settings');
  });

  it('should emit an output event when clicking the toggle follow button', () => {
    const fixture = TestBed.createComponent(UserInfoComponent);
    const component = fixture.componentInstance;
    fixture.componentInstance.profile = mockProfile;
    fixture.detectChanges();

    spyOn(component.toggledFollow, 'emit');

    fixture.debugElement
      .query(By.css('[data-test=toggle-follow-author-button]'))
      .triggerEventHandler('click');

    expect(component.toggledFollow.emit).toHaveBeenCalled();
  });
});
