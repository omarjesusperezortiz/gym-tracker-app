// Minimal chainable fake for the subset of the Supabase query builder that
// src/lib/history.ts uses (from().select().eq().order() / from().insert().select().single()).
// Each chain method returns the same builder so any call order resolves to
// the configured `result` when awaited.
export interface FakeResult {
  data?: unknown;
  error?: unknown;
}

export interface FakeQueryBuilder extends PromiseLike<FakeResult> {
  select: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  insert: jest.Mock;
  single: jest.Mock;
}

export function makeQueryBuilder(result: FakeResult): FakeQueryBuilder {
  const builder = {} as FakeQueryBuilder;
  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.single = jest.fn(() => builder);
  builder.then = (onFulfilled, onRejected) => Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}
