import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

import cookieParser from 'cookie-parser';
import { handleLogin, handleLogout, handleMe, handleChangePassword } from './server/auth.js';
import apiRouter from './server/api.js';

const browserDistFolder = join(import.meta.dirname, '../browser');
const uploadsFolder = join(process.cwd(), 'public', 'uploads');

export const app = express();
const angularApp = new AngularNodeAppEngine();

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for user uploaded images
app.use('/uploads', express.static(uploadsFolder));

// Admin Authentication Endpoints
app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);
app.get('/api/auth/me', handleMe);
app.post('/api/auth/change-password', handleChangePassword);

// Products, Categories, Uploads, Settings API
app.use('/api', apiRouter);

app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'Server is working' });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
