context('Create a New Game', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display a modal to create a new game', () => {
    cy.get('.start-form > p').should(
      'have.text',
      'Welcome to CAH-Box, a mashup of Cards Against Humanity and Jackbox games.'
    );
    cy.get('.start-form > button').should('have.text', 'Create Game');
  });

  it('should create a new game', () => {
    cy.get('.start-form > button').click();

    cy.location('pathname').should('match', /\/game\/[A-Z0-9]{4}/);
    cy.get('.join-form label').should('have.text', 'Enter Username');
    cy.get('.join-form input#username').should('exist');
    cy.get('.join-form button').should('have.text', 'Join Game');
  });
});