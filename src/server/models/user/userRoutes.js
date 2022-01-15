const user = require('./userController');

module.exports = (app) => {
  app.post('/api/registerUser', user.register);
  app.post('/api/loginUser', user.login);
  app.get('/api/getAccount', user.getAccount);
  app.post('/api/getProfile', user.getProfile);
  app.post('/api/searchUsers', user.searchUsers);
  app.post('/api/updateUser', user.updateUser);
  app.post('/api/verifyWallet', user.verifyWallet);
  app.post('/api/sendEmailVerification', user.sendEmailVerification);
  app.post('/api/verifyEmail', user.verifyEmail);
  app.post('/api/requestPassword', user.requestPassword);
  app.post('/api/recoverPassword', user.recoverPassword);
  app.post('/api/newPassword', user.newPassword);
  app.post('/api/twitter', user.twitter);
  app.post('/api/getBids', user.getBids);
};
