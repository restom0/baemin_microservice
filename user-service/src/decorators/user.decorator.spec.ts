import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { User } from './user.decorator';

// createParamDecorator hides its factory; recover it from the route metadata
// set when the decorator is applied to a parameter.
function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
  class TestTarget {
    handler(@decorator() _value: unknown) {
      return _value;
    }
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestTarget, 'handler');
  return args[Object.keys(args)[0]].factory as (
    data: unknown,
    ctx: ExecutionContext,
  ) => unknown;
}

describe('User decorator', () => {
  it('extracts the authenticated user from the request', () => {
    const factory = getParamDecoratorFactory(User as () => ParameterDecorator);
    const request = { user: { user_id: 42 } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(factory(null, ctx)).toEqual({ user_id: 42 });
  });
});
