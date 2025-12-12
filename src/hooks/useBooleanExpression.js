import { useState, useCallback } from 'react';
import { BooleanExpressions } from 'boolean-expressions';

export default function useBooleanExpression() {
  const [expression, setExpression] = useState(null);
  const [variables, setVariables] = useState([]);
  const [error, setError] = useState(null);
  
  const parseExpression = useCallback((expressionString) => {
    try {
      const expr = new BooleanExpressions(expressionString);
      const vars = expr.getVariableNames();
      setExpression(expr);
      setVariables(vars);
      setError(null);
      return { valid: true, variables: vars };
    } catch (err) {
      setError(err.message);
      return { valid: false, error: err.message };
    }
  }, []);
  
  const evaluate = useCallback((variableValues) => {
    if (!expression) {
      return { result: false, error: 'No expression set' };
    }
    
    try {
      // Convert object form to array of true variable names
      let trueVars = [];
      if (Array.isArray(variableValues)) {
        trueVars = variableValues;
      } else {
        trueVars = Object.keys(variableValues).filter(key => variableValues[key]);
      }
      
      const result = expression.evaluate(trueVars);
      return { result };
    } catch (err) {
      return { result: false, error: err.message };
    }
  }, [expression]);
  
  return {
    parseExpression,
    evaluate,
    variables,
    error,
    hasExpression: !!expression
  };
}