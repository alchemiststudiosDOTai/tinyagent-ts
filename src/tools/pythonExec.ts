import { tool } from '../decorators';
import { z } from 'zod';
import execa from 'execa';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const MAX_CODE = 3_000;
const MAX_STDOUT = 4_000;

export class PythonExec {
  @tool(
    'Run a Python-3 snippet and return its stdout. ' +
      'Use this when multi-step logic is easier in code.',
    z.object({
      code: z.string().max(MAX_CODE, `code must be \u2264 ${MAX_CODE} chars`),
      timeoutMs: z
        .number()
        .int()
        .min(500)
        .max(20_000)
        .optional()
        .default(5_000),
    })
  )
  async pythonExec({ code, timeoutMs }: { code: string; timeoutMs: number }) {
    const stubDir = path.join(__dirname, '..', 'python_stubs');

    const app = express();
    app.use(bodyParser.json());
    const srv = app.listen(8123);

    app.post('/tool', async (req: express.Request, res: express.Response) => {
      try {
        const { tool, args } = req.body;
        const fn = (this as any)[tool];
        const out = await fn?.(args);
        res.json(out ?? { error: `unknown tool ${tool}` });
      } catch (e: any) {
        res.json({ error: String(e) });
      }
    });

    try {
      const { stdout } = await execa('python3', ['-'], {
        input: code,
        timeout: timeoutMs,
        env: { ...process.env, PYTHONPATH: stubDir },
      });
      return stdout.slice(0, MAX_STDOUT);
    } catch (err: any) {
      return `PythonExec error: ${err.message ?? err}`;
    } finally {
      srv.close();
    }
  }
}
