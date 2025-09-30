describe('Home', () => {
  const mockUser = {
    email: 'jack@gmail.com',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo',
    username: 'jack',
    bio: 'I work at a state farm',
    image: 'https://i.stack.imgur.com/xHWG8.jpg'
  };

  const mockTags = ['dragon', 'training'];

  const mockArticles = [
    {
      slug: 'how-to-train-your-dragon',
      title: 'How to train your dragon',
      body: 'It takes a Jacobian',
      description: 'Ever wondered how?',
      favoritesCount: 1,
      createdAt: new Date('10/8/2024').toString(),
      updatedAt: new Date('10/8/2024').toString(),
      favorited: true,
      author: {
        username: 'jack',
        bio: 'I work at a state farm',
        image: 'https://i.stack.imgur.com/xHWG8.jpg',
        following: false
      },
      tagList: mockTags
    },
    {
      slug: 'how-to-train-your-dragon-2',
      title: 'How to train your dragon',
      body: 'It takes a Jacobian',
      description: 'Ever wondered how?',
      favoritesCount: 1,
      createdAt: new Date('10/8/2024').toString(),
      updatedAt: new Date('10/8/2024').toString(),
      favorited: false,
      author: {
        username: 'jack2',
        bio: 'I work at a state farm',
        image: 'https://i.stack.imgur.com/xHWG8.jpg',
        following: false
      },
      tagList: mockTags
    }
  ];

  const startBackend = (): void => {
    cy.intercept('GET', 'api/user', { user: mockUser }).as('getCurrentUser');

    cy.intercept('GET', 'api/articles?limit=10', { articles: mockArticles, articlesCount: 20 }).as(
      'getGlobalFeed'
    );
    cy.intercept('GET', 'api/articles?limit=10&offset=0', {
      articles: mockArticles,
      articlesCount: 20
    }).as('getFirstPageOfGlobalFeed');
    cy.intercept('GET', 'api/articles?limit=10&offset=10', {
      articles: mockArticles,
      articlesCount: 20
    }).as('getSecondPageOfGlobalFeed');

    cy.intercept('GET', 'api/articles/feed?limit=10', {
      articles: mockArticles,
      articlesCount: 20
    }).as('getUserFeed');

    cy.intercept('GET', `api/articles?limit=10&tag=${mockTags[0]}`, {
      articles: mockArticles,
      articlesCount: 20
    }).as('getSelectedTagFeed');

    cy.intercept('GET', 'api/tags', { tags: mockTags }).as('getTags');

    cy.intercept('DELETE', `api/articles/${mockArticles[0].slug}/favorite`, {
      article: { ...mockArticles[0], favorited: false }
    }).as('unfavoriteArticle');
    cy.intercept('POST', `api/articles/${mockArticles[1].slug}/favorite`, {
      article: { ...mockArticles[1], favorited: true }
    }).as('favoriteArticle');
  };

  const storeJwtTokenInLocalStorage = (): void => {
    localStorage.setItem('jwtToken', mockUser.token);
  };

  beforeEach(() => {
    startBackend();
  });

  const getNavbarBrand = () => cy.get('[data-test=navbar-brand]');
  const getNavbarLink = () => cy.get('[data-test=navbar-link]');
  const getFeedTabLinks = () => cy.get('[data-test=feed-tab-link]');
  const getGlobalFeedTab = () => getFeedTabLinks().first();
  const getToggleFavoriteArticleButton = () => cy.get('[data-test=toggle-favorite-article-button]');
  const getArticlePreviewLink = () => cy.get('[data-test=article-preview-link]');
  const getPaginationItems = () => cy.get('.pagination .page-item');
  const getTagLink = () => cy.get('[data-test=tag-link]');

  it('should display a navbar', () => {
    cy.visit('/');
    getNavbarBrand().should('contain', 'Quill').and('have.attr', 'href', '/');
    getNavbarLink().should('have.length', 3);
    getNavbarLink()
      .first()
      .should('contain', 'Home')
      .and('have.class', 'active')
      .and('have.attr', 'href', '/');
    getNavbarLink()
      .eq(1)
      .should('contain', 'Sign in')
      .and('not.have.class', 'active')
      .and('have.attr', 'href', '/login');
    getNavbarLink()
      .eq(2)
      .should('contain', 'Sign up')
      .and('not.have.class', 'active')
      .and('have.attr', 'href', '/register');
  });

  it('should display a navbar collapsed on small screens', () => {
    cy.viewport('iphone-6+');
    cy.visit('/');
    getNavbarBrand().should('contain', 'Quill');
    getNavbarLink().should('not.be.visible');

    cy.get('[data-test=navbar-toggler]').click();
    getNavbarLink().should('be.visible');
  });

  it('should display a logged-in user', () => {
    storeJwtTokenInLocalStorage();
    cy.visit('/');
    cy.wait('@getCurrentUser');

    getNavbarLink().should('have.length', 4);
    getNavbarLink()
      .first()
      .should('contain', 'Home')
      .and('have.class', 'active')
      .and('have.attr', 'href', '/');
    getNavbarLink()
      .eq(1)
      .should('contain', 'New Article')
      .and('not.have.class', 'active')
      .and('have.attr', 'href', '/editor');
    getNavbarLink()
      .eq(2)
      .should('contain', 'Settings')
      .and('not.have.class', 'active')
      .and('have.attr', 'href', '/settings');
    getNavbarLink()
      .last()
      .should('contain', mockUser.username)
      .and('not.have.class', 'active')
      .and('have.attr', 'href', `/profile/${mockUser.username}`);
  });

  it('should display an empty message if no articles found', () => {
    cy.intercept('GET', 'api/articles?limit=10', {
      articles: [],
      articlesCount: 0
    }).as('getEmptyGlobalFeed');

    cy.visit('/');
    cy.get('[data-test=loading-article-list-message]')
      .should('be.visible')
      .and('contain', 'Loading articles');
    cy.wait('@getEmptyGlobalFeed');
    cy.get('[data-test=loading-article-list-message]').should('not.exist');

    cy.get('[data-test=no-article-list-message]')
      .should('be.visible')
      .and('contain', 'No articles found');
    getArticlePreviewLink().should('not.exist');
    getPaginationItems().should('not.exist');
  });

  it('should display a global feed by default', () => {
    cy.visit('/');
    cy.wait('@getGlobalFeed');

    getFeedTabLinks().should('have.length', 1);
    getGlobalFeedTab().should('have.class', 'active').and('contain', 'Global Feed');

    const getAuthorAvatarLink = () => cy.get('[data-test=author-avatar-link]');
    const getAuthorName = () => cy.get('[data-test=author-name]');
    const getArticleCreationDate = () => cy.get('[data-test=article-creation-date]');

    getAuthorAvatarLink().should('have.length', 2);
    getAuthorAvatarLink()
      .first()
      .should('have.attr', 'href', `/profile/${mockArticles[0].author.username}`)
      .find('img')
      .should('exist');

    getAuthorName().should('have.length', 2);
    getAuthorName()
      .first()
      .should('have.attr', 'href', `/profile/${mockArticles[0].author.username}`)
      .and('contain', mockArticles[0].author.username);

    getArticleCreationDate().should('have.length', 2);
    getArticleCreationDate().first().should('contain', 'Published on Oct 8, 2024');

    getToggleFavoriteArticleButton().should('have.length', 2);
    getToggleFavoriteArticleButton().first().should('have.class', 'btn-success');
    getToggleFavoriteArticleButton().eq(1).should('have.class', 'btn-outline-success');

    getArticlePreviewLink().should('have.length', 2);
    getArticlePreviewLink()
      .first()
      .should('have.attr', 'href', `/article/${mockArticles[0].slug}`)
      .within(() => {
        cy.get('[data-test=article-title]').should('contain', mockArticles[0].title);
        cy.get('[data-test=article-description]').should('contain', mockArticles[0].description);
        cy.get('[data-test=tag]').should('have.length', 2).contains(mockTags[0]);
      });

    getPaginationItems().should('have.length', 4);

    getPaginationItems().eq(2).click();
    cy.wait('@getSecondPageOfGlobalFeed');
    getArticlePreviewLink().should('have.length', 2);

    getPaginationItems().eq(1).click();
    cy.wait('@getFirstPageOfGlobalFeed');
    getArticlePreviewLink().should('have.length', 2);
  });

  it('should display a user feed in another tab if logged in', () => {
    storeJwtTokenInLocalStorage();
    cy.visit('/');
    cy.wait(['@getCurrentUser', '@getGlobalFeed']);

    const getYourFeedTab = () => getFeedTabLinks().eq(1);

    getFeedTabLinks().should('have.length', 2);
    getGlobalFeedTab().should('have.class', 'active');
    getYourFeedTab().should('not.have.class', 'active').and('contain', 'Your Feed');
    getYourFeedTab().click();

    getGlobalFeedTab().should('not.have.class', 'active');
    getYourFeedTab().should('have.class', 'active');

    cy.wait('@getUserFeed');

    getArticlePreviewLink().should('have.length', 2);
    getPaginationItems().should('have.length', 4);
  });

  it('should display a feed in another tab based on a selected tag', () => {
    cy.visit('/');
    cy.wait(['@getGlobalFeed', '@getTags']);

    getTagLink().first().click();

    getFeedTabLinks().should('have.length', 2);
    getGlobalFeedTab().should('not.have.class', 'active');
    getFeedTabLinks().eq(1).should('have.class', 'active').and('contain', `#${mockTags[0]}`);

    cy.wait('@getSelectedTagFeed');

    getArticlePreviewLink().should('have.length', 2);
    getPaginationItems().should('have.length', 4);

    getGlobalFeedTab().click();
    cy.wait('@getGlobalFeed');

    getFeedTabLinks().should('have.length', 1);
    getArticlePreviewLink().should('have.length', 2);
  });

  it('should redirect to the login page when a non-logged-in-user clicks the author name', () => {
    cy.visit('/');
    cy.wait('@getGlobalFeed');

    cy.get('[data-test=author-name]').first().click();

    cy.location('pathname').should('eq', '/login');
  });

  it('should redirect to the login page when a non-logged-in-user clicks toggle favorite', () => {
    cy.intercept('POST', `api/articles/${mockArticles[1].slug}/favorite`, {
      statusCode: 401
    }).as('failedFavoriteArticle');

    cy.visit('/');
    cy.wait('@getGlobalFeed');

    getToggleFavoriteArticleButton().eq(1).click();
    cy.wait('@failedFavoriteArticle');

    cy.location('pathname').should('eq', '/login');
  });

  it('should toggle favorite articles if the user is logged in', () => {
    storeJwtTokenInLocalStorage();
    cy.visit('/');

    cy.wait(['@getCurrentUser', '@getGlobalFeed']);

    getToggleFavoriteArticleButton().first().click();
    cy.wait('@unfavoriteArticle');

    getToggleFavoriteArticleButton().should('have.class', 'btn-outline-success');

    getToggleFavoriteArticleButton().eq(1).click();
    cy.wait('@favoriteArticle');

    getToggleFavoriteArticleButton().should('have.class', 'btn-success');
  });

  it('should display an empty message if no tags found', () => {
    cy.intercept('GET', 'api/tags', { tags: [] }).as('getEmptyTags');

    cy.visit('/');
    cy.get('[data-test=loading-tag-list-message]')
      .should('be.visible')
      .and('contain', 'Loading tags');
    cy.wait('@getEmptyTags');
    cy.get('[data-test=loading-tag-list-message]').should('not.exist');

    cy.get('[data-test=no-tag-list-message]').should('be.visible').and('contain', 'No tags found');
    getTagLink().should('not.exist');
  });

  it('should display a list of tags', () => {
    cy.visit('/');
    cy.wait('@getTags');

    cy.contains('h2', 'Popular tags');
    getTagLink().should('have.length', 2);
    getTagLink().first().should('contain', mockTags[0]);
    getTagLink().eq(1).should('contain', mockTags[1]);
  });
});
