import express from 'express';
import { router } from './routes/index.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { boardsRoutes } from './modules/boards/boards.routes.js';
import { columnsRoutes } from './modules/columns/columns.routes.js';
import { cardsRoutes } from './modules/cards/cards.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(router);
app.use('/auth', authRoutes);
app.use('/boards', boardsRoutes);
app.use('/columns', columnsRoutes);
app.use('/cards', cardsRoutes);

export default app;
