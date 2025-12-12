import { expect } from 'chai';
import { BooleanExpressions } from 'boolean-expressions';

describe('Boolean Logic Tests', () => {
  it('should evaluate AND expressions correctly', () => {
    const expr = new BooleanExpressions('A and B');
    expect(expr.evaluate(['A', 'B'])).to.be.true;
    expect(expr.evaluate(['A'])).to.be.false;
    expect(expr.evaluate(['B'])).to.be.false;
    expect(expr.evaluate([])).to.be.false;
  });
  
  it('should evaluate OR expressions correctly', () => {
    const expr = new BooleanExpressions('A or B');
    expect(expr.evaluate(['A', 'B'])).to.be.true;
    expect(expr.evaluate(['A'])).to.be.true;
    expect(expr.evaluate(['B'])).to.be.true;
    expect(expr.evaluate([])).to.be.false;
  });
  
  it('should evaluate NOT expressions correctly', () => {
    const expr = new BooleanExpressions('not A');
    expect(expr.evaluate(['A'])).to.be.false;
    expect(expr.evaluate([])).to.be.true;
  });
  
  it('should evaluate complex expressions correctly', () => {
    const expr = new BooleanExpressions('(A and B) or (C and not D)');
    expect(expr.evaluate(['A', 'B'])).to.be.true;
    expect(expr.evaluate(['C'])).to.be.true;
    expect(expr.evaluate(['A', 'D'])).to.be.false;
    expect(expr.evaluate(['D'])).to.be.false;
  });
});