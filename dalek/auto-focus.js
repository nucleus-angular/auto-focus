module.exports = {
  name: 'auto focus',

  'should auto focus input if true is passed': function(test) {
    test.open('http://localhost:3000/home')
    .wait(500)
    .assert.exists('.is-focused', 'element focused')
    .done();
  },

  'should not auto focus input if true is not passed': function(test) {
    test.open('http://localhost:3000/home/2')
    .wait(500)
      .assert.exists('.not-focused', 'element not focused')
    .done();
  },

  'should auto focus input when event is triggered': function(test) {
    test.open('http://localhost:3000/home/2')
    .wait(500)
    .click('body')
      .assert.exists('.not-focused', 'element not focused')
    .click('[data-ut="focus-input"]')
    .wait(500)
        .assert.exists('.is-focused', 'element focused')
    .done();
  }
}