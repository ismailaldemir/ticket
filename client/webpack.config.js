module.exports = {
  // ...existing code...
  devServer: {
    // ...existing code...
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Eski onBeforeSetupMiddleware ve onAfterSetupMiddleware işlevlerini buraya taşıyın
      // devServer.app.use(...);

      return middlewares;
    },
  },
};