describe('Login', () => {
  const mockUser = {
    email: 'jack@gmail.com',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo',
    username: 'jack',
    bio: 'I work at a state farm',
    image: 'https://i.stack.imgur.com/xHWG8.jpg'
  };

  const getEmailInput = () => cy.get('[data-test=email-input]');
  const getPasswordInput = () => cy.get('[data-test=password-input]');
  const getValidationErrorMessage = () => cy.get('.invalid-feedback');
  const getPasswordToggleButton = () => cy.get('[data-test=toggle-password-button]');
  const getSubmitButton = () => cy.get('[data-test=submit-button]');

  it('should display a login page', () => {
    cy.intercept('POST', 'api/users/login', { user: mockUser }).as('loginUser');

    cy.visit('/login');

    cy.contains('h1', 'Sign in');
    cy.contains('a', "Don't have an account?").should('have.attr', 'href', '/register');

    getSubmitButton().should('be.visible').and('be.disabled');
    getEmailInput().focus().blur();
    getValidationErrorMessage().should('be.visible').and('contain', 'The email is required');
    getEmailInput().type('jack@');
    getValidationErrorMessage()
      .should('be.visible')
      .and('contain', 'The email must be a valid email address');
    getEmailInput().clear();
    getEmailInput().type('jack@gmail.com');
    getValidationErrorMessage().should('not.be.visible');

    getPasswordInput().focus().blur();
    getValidationErrorMessage().should('be.visible').and('contain', 'The password is required');
    getPasswordInput().type('1234');
    getValidationErrorMessage()
      .should('be.visible')
      .and('contain', 'The password must be at least 8 characters long');
    getPasswordInput().clear();
    getPasswordInput().type('12345678');
    getValidationErrorMessage().should('not.be.visible');

    getPasswordToggleButton().click();
    getPasswordInput().should('have.attr', 'type', 'text');
    getPasswordToggleButton().click();
    getPasswordInput().should('have.attr', 'type', 'password');

    getSubmitButton().click();
    cy.wait('@loginUser');

    cy.location('pathname').should('eq', '/');
  });

  it('should display backend errors if login fails', () => {
    cy.intercept('POST', 'api/users/login', {
      statusCode: 404,
      body: {
        errors: {
          email: ['already exists'],
          'email or password': ['is invalid']
        }
      }
    }).as('failedLoginUser');

    cy.visit('/login');

    getEmailInput().type('jack@gmail.com');
    getPasswordInput().type('12345678');

    getSubmitButton().click();
    cy.wait('@failedLoginUser');

    cy.location('pathname').should('eq', '/login');

    const getErrorMessage = () => cy.get('[data-test=error-message]');

    getErrorMessage().should('contain', 'email already exists');
    getErrorMessage().should('contain', 'email or password is invalid');
  });
});
