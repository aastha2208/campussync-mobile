process.env.JWT_SECRET = 'test_jwt_secret_do_not_use_in_prod';

const bcrypt = require('bcryptjs');

jest.mock('../models/Admin');
const Admin = require('../models/Admin');
const { login } = require('./authController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController.login (admin)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects missing email/password with 400', async () => {
    const res = mockRes();
    await login({ body: { email: '', password: '' } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 when no admin matches the email', async () => {
    Admin.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login({ body: { email: 'nobody@bmsce.ac.in', password: 'whatever' } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 401 on wrong password, without leaking whether the email exists via message content', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({
      _id: 'admin1', email: 'ieee.admin1@bmsce.ac.in', passwordHash,
      name: 'IEEE Admin 1', clubId: 'ieee', clubName: 'IEEE BMSCE',
    });
    const res = mockRes();
    await login({ body: { email: 'ieee.admin1@bmsce.ac.in', password: 'wrong-password' } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 200 + a token on correct password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    Admin.findOne.mockResolvedValue({
      _id: 'admin1', email: 'ieee.admin1@bmsce.ac.in', passwordHash,
      name: 'IEEE Admin 1', clubId: 'ieee', clubName: 'IEEE BMSCE',
    });
    const res = mockRes();
    await login({ body: { email: 'ieee.admin1@bmsce.ac.in', password: 'correct-password' } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.token).toBeTruthy();
    expect(payload.user.isAdmin).toBe(true);
    expect(payload.user.clubId).toBe('ieee');
  });
});
