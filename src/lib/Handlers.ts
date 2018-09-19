import * as t from './t';
import { evaluate } from './Evaluator';
import { getFunction } from './functions';

export type HandlerTypes = 'BinaryExpression' | 'NumericLiteral' | 'StringLiteral' | 'BooleanLiteral' | 'ArrayExpression' |
  'NullLiteral' | 'Identifier' | 'CallExpression' | 'MemberExpression' | 'LogicalExpression';

export type Context = {
  [key: string]: any;
}
export type Handler = (ast: t.Expression, context: Context) => any;

export type Handlers = {
  readonly [T in HandlerTypes]: Handler
}

export const Handlers: Handlers = {
  BinaryExpression(ast: t.Expression, context: Context) {
    if (t.isBinaryExpression(ast)) {
      switch (ast.operator) {
        case '+':
          return evaluate(ast.left, context) + evaluate(ast.right, context);
        case '-':
          return evaluate(ast.left, context) - evaluate(ast.right, context);
        case '*':
          return evaluate(ast.left, context) * evaluate(ast.right, context);
        case '/':
          return evaluate(ast.left, context) / evaluate(ast.right, context);
        case '===':
          return evaluate(ast.left, context) === evaluate(ast.right, context);
        case '==':
          return evaluate(ast.left, context) == evaluate(ast.right, context);
        case '!==':
          return evaluate(ast.left, context) !== evaluate(ast.right, context);
        case '!=':
          return evaluate(ast.left, context) != evaluate(ast.right, context);
        case '>':
          return evaluate(ast.left, context) > evaluate(ast.right, context);
        case '>=':
          return evaluate(ast.left, context) >= evaluate(ast.right, context);
        case '<':
          return evaluate(ast.left, context) < evaluate(ast.right, context);
        case '<=':
          return evaluate(ast.left, context) <= evaluate(ast.right, context);
      }
    }
    throw new Error();
  },

  LogicalExpression(ast: t.Expression, context: Context): boolean {
    if (t.isLogicalExpression(ast)) {
      switch (ast.operator) {
        case '&&':
          return evaluate(ast.left, context) && evaluate(ast.right, context);
        case '||':
          return evaluate(ast.left, context) || evaluate(ast.right, context);
      }
    }
    throw new Error();
  },

  Identifier(ast: t.Expression, context: Context) {
    if (t.isIdentifier(ast)) {
      switch (ast.name) {
        case 'undefined':
          return undefined;
        default:
          return context[ast.name];
      }
    }
    throw new Error();
  },
  CallExpression(ast: t.Expression, context: Context) {
    if (t.isCallExpression(ast)) {
      if (t.isIdentifier(ast.callee)) {
        const func = getFunction(ast.callee.name);
        const args: t.Expression[] = ast.arguments.map(arg => {
          return evaluate(arg as t.Expression, context);
        });
        return func.call(null, ...args);
      }
    }
    throw new Error();
  },

  MemberExpression(ast: t.Expression, context: Context) {
    if (t.isMemberExpression(ast)) {
      const obj = evaluate(ast.object, context);
      if (!obj) return undefined;
      if (t.isIdentifier(ast.property)) {
        return evaluate(ast.property, obj);
      }
      if (t.isNumericLiteral(ast.property) || t.isStringLiteral(ast.property)) {
        return obj[ast.property.value];
      }
    }
    throw new Error();
  },
  NumericLiteral(ast: t.Expression) {
    if (t.isNumericLiteral(ast)) {
      return ast.value;
    }
    throw new Error();
  },
  StringLiteral(ast: t.Expression) {
    if (t.isStringLiteral(ast)) {
      return ast.value;
    }
    throw new Error();
  },
  BooleanLiteral(ast: t.Expression) {
    if (t.isBooleanLiteral(ast)) {
      return ast.value;
    }
    throw new Error();
  },
  NullLiteral(ast: t.Expression) {
    if (t.isNullLiteral(ast)) {
      return null;
    }
    throw new Error();
  },
  ArrayExpression(ast: t.Expression, context: Context) {
    if (t.isArrayExpression(ast)) {
      return ast.elements.map(elem => {
        return evaluate(elem as t.Expression, context);
      });
    }
    throw new Error();
  }
}

