import express from 'express';
import { router } from './routes/index.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { boardsRoutes } from './modules/boards/boards.routes.js';
import { columnsRoutes } from './modules/columns/columns.routes.js';
import { cardsRoutes } from './modules/cards/cards.routes.js';
import { boardMembersRoutes } from './modules/board-members/board-members.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import cors from 'cors';
import { env } from './env.js';

const app = express();
app.use(
  cors({
    origin: env.CORS_ORIGINS,
  }),
);

app.use(express.json());
app.use(router);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/boards', boardMembersRoutes);
app.use('/boards', boardsRoutes);
app.use('/columns', columnsRoutes);
app.use('/cards', cardsRoutes);

app.use(errorHandler);

export default app;
