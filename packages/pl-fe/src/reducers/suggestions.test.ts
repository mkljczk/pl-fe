import reducer from './suggestions';

describe('suggestions reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      items: [],
      next: null,
      isLoading: false,
    });
  });
});
