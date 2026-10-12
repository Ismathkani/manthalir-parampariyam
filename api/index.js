export default async function handler(req, res) {
  const { app } = await import('../dist/manthalir-parampariyam1/server/server.mjs');
  return app(req, res);
}
