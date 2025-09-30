describe('Article', () => {
  const mockUser = {
    email: 'jack@gmail.com',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo',
    username: 'jack',
    bio: 'I work at a state farm',
    image: 'https://i.stack.imgur.com/xHWG8.jpg'
  };

  const mockTags = ['dragon', 'training'];

  const mockArticle = {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    body: 'It takes a Jacobian',
    description: 'Ever wondered how?',
    favoritesCount: 1,
    createdAt: new Date('10/8/2024').toString(),
    updatedAt: new Date('10/8/2024').toString(),
    favorited: false,
    author: {
      username: mockUser.username,
      bio: mockUser.bio,
      image: mockUser.image,
      following: false
    },
    tagList: mockTags
  };

  const favoritedCount = mockArticle.favoritesCount + 1;

  const startBackend = (): void => {
    cy.intercept('GET', 'api/user', { user: mockUser }).as('getCurrentUser');

    cy.intercept('GET', `api/articles/${mockArticle.slug}`, req => {
      req.reply({ delay: 100, body: { article: mockArticle } });
    }).as('getArticle');

    cy.intercept('POST', `api/profiles/${mockArticle.author.username}/follow`, {
      profile: { ...mockArticle.author, following: true }
    }).as('followAuthor');
    cy.intercept('DELETE', `api/profiles/${mockArticle.author.username}/follow`, {
      profile: { ...mockArticle.author, following: false }
    }).as('unfollowAuthor');

    cy.intercept('POST', `api/articles/${mockArticle.slug}/favorite`, {
      article: { ...mockArticle, favoritesCount: favoritedCount, favorited: true }
    }).as('favoriteArticle');
    cy.intercept('DELETE', `api/articles/${mockArticle.slug}/favorite`, {
      article: { ...mockArticle, favorited: false }
    }).as('unfavoriteArticle');
  };

  const storeJwtTokenInLocalStorage = (): void => {
    localStorage.setItem('jwtToken', mockUser.token);
  };

  beforeEach(() => {
    startBackend();
  });

  const getToggleFollowAuthorButton = () => cy.get('[data-test=toggle-follow-author-button]');
  const getToggleFavoriteArticleButton = () => cy.get('[data-test=toggle-favorite-article-button]');
  const getEditArticleLink = () => cy.get('[data-test=edit-article-link]');
  const getDeleteArticleButton = () => cy.get('[data-test=delete-article-button]');

  it('should display an article page', () => {
    cy.visit(`/article/${mockArticle.slug}`);

    cy.get('[data-test=loading-article-message]')
      .should('be.visible')
      .and('contain', 'Loading article');
    cy.wait('@getArticle');
    cy.get('[data-test=loading-article-message]').should('not.exist');

    cy.contains('h1', mockArticle.title);
    cy.get('[data-test=author-avatar-link]')
      .should('have.attr', 'href', `/profile/${mockArticle.author.username}`)
      .find('img')
      .should('exist');
    cy.get('[data-test=author-name]')
      .should('have.attr', 'href', `/profile/${mockArticle.author.username}`)
      .and('contain', mockArticle.author.username);
    cy.get('[data-test=article-creation-date]').should('contain', 'Published on Oct 8, 2024');

    getToggleFollowAuthorButton()
      .should('have.class', 'btn-outline-secondary')
      .and('contain', `Follow ${mockArticle.author.username}`);
    getToggleFavoriteArticleButton()
      .should('have.class', 'btn-outline-success')
      .and('contain', `Favorite (${mockArticle.favoritesCount})`);

    cy.get('[data-test=article-body]').should('contain', mockArticle.body);
    cy.get('[data-test=tag]').should('have.length', 2).contains(mockTags[0]);
  });

  it('should display a toggle follow button with a toggle favorite button if cannot modify', () => {
    cy.intercept('GET', 'api/user', { user: { ...mockUser, username: 'john' } }).as(
      'getCurrentUser'
    );

    storeJwtTokenInLocalStorage();
    cy.visit(`/article/${mockArticle.slug}`);

    getToggleFollowAuthorButton().should('exist');
    getToggleFavoriteArticleButton().should('exist');
  });

  it('should display an edit link with a delete button if can modify', () => {
    storeJwtTokenInLocalStorage();
    cy.visit(`/article/${mockArticle.slug}`);
    cy.wait(['@getCurrentUser', '@getArticle']);

    getEditArticleLink()
      .should('have.attr', 'href', `/editor/${mockArticle.slug}`)
      .and('contain', 'Edit');
    getDeleteArticleButton().should('contain', 'Delete');
  });

  it('should redirect to the login page when a non-logged-in-user clicks toggle follow', () => {
    cy.intercept('POST', `api/profiles/${mockArticle.author.username}/follow`, {
      statusCode: 401
    }).as('failedFollowProfile');

    cy.visit(`/article/${mockArticle.slug}`);
    cy.wait('@getArticle');

    getToggleFollowAuthorButton().click();
    cy.wait('@failedFollowProfile');

    cy.location('pathname').should('eq', '/login');
  });

  it('should redirect to the login page when a non-logged-in-user clicks toggle favorite', () => {
    cy.intercept('POST', `api/articles/${mockArticle.slug}/favorite`, {
      statusCode: 401
    }).as('failedFavoriteArticle');

    cy.visit(`/article/${mockArticle.slug}`);
    cy.wait('@getArticle');

    getToggleFavoriteArticleButton().click();
    cy.wait('@failedFavoriteArticle');

    cy.location('pathname').should('eq', '/login');
  });

  it('should toggle follow author if the user is logged in', () => {
    cy.intercept('GET', 'api/user', { user: { ...mockUser, username: 'john' } }).as(
      'getCurrentUser'
    );

    storeJwtTokenInLocalStorage();
    cy.visit(`/article/${mockArticle.slug}`);
    cy.wait(['@getCurrentUser', '@getArticle']);

    getToggleFollowAuthorButton().click();
    cy.wait('@followAuthor');

    getToggleFollowAuthorButton()
      .should('have.class', 'btn-secondary')
      .and('contain', `Unfollow ${mockArticle.author.username}`);

    getToggleFollowAuthorButton().click();
    cy.wait('@unfollowAuthor');

    getToggleFollowAuthorButton()
      .should('have.class', 'btn-outline-secondary')
      .and('contain', `Follow ${mockArticle.author.username}`);
  });

  it('should toggle favorite article if the user is logged in', () => {
    cy.intercept('GET', 'api/user', { user: { ...mockUser, username: 'john' } }).as(
      'getCurrentUser'
    );

    storeJwtTokenInLocalStorage();
    cy.visit(`/article/${mockArticle.slug}`);
    cy.wait(['@getCurrentUser', '@getArticle']);

    getToggleFavoriteArticleButton().click();
    cy.wait('@favoriteArticle');

    getToggleFavoriteArticleButton()
      .should('have.class', 'btn-success')
      .and('contain', `Unfavorite (${favoritedCount})`);

    getToggleFavoriteArticleButton().click();
    cy.wait('@unfavoriteArticle');

    getToggleFavoriteArticleButton()
      .should('have.class', 'btn-outline-success')
      .and('contain', `Favorite (${mockArticle.favoritesCount})`);
  });
});
