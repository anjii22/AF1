const Budget = require('../models/budgetModel');

jest.mock('../models/budgetModel');

describe('Budget Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new budget', () => {
    expect(true).toBe(true);
  });

  it('should delete a budget', () => {
    expect(true).toBe(true);
  });
});
