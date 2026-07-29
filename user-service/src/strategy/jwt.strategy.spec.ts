// Passport strategies cannot be constructed standalone, so stub the passport
// layer and assert JwtStrategy's own constructor and validate logic.
jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () => class {},
}));

const fromAuthHeaderAsBearerToken = jest.fn(() => 'extractor');

jest.mock('passport-jwt', () => ({
  Strategy: class {},
  ExtractJwt: { fromAuthHeaderAsBearerToken },
}));

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('configures the bearer extractor and the configured secret', () => {
    const config = { get: jest.fn().mockReturnValue('configured-secret') };

    const strategy = new JwtStrategy(config as never);

    expect(strategy).toBeInstanceOf(JwtStrategy);
    expect(config.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(fromAuthHeaderAsBearerToken).toHaveBeenCalled();
  });

  it('falls back to the default secret when none is configured', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };

    expect(() => new JwtStrategy(config as never)).not.toThrow();
  });

  it('returns the JWT payload from validate', async () => {
    const strategy = new JwtStrategy({
      get: () => 'configured-secret',
    } as never);

    await expect(strategy.validate({ user_id: 1 })).resolves.toEqual({
      user_id: 1,
    });
  });
});
