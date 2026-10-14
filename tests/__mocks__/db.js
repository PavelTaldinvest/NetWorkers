// Единый мок пула БД для Jest-тестов (используется через jest.mock из setup).
const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockClient = { query: mockQuery, release: jest.fn() };
mockConnect.mockResolvedValue(mockClient);

const poolMock = {
  query: mockQuery,
  connect: mockConnect,
  on: jest.fn(),
  end: jest.fn(),
};
module.exports = poolMock;
module.exports.__mockQuery = mockQuery;
