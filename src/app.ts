import axios from 'axios';
import express from 'express';
import markdownPdf from 'markdown-pdf';
import { extname } from 'path';

const app = express();

const port = process.env.PORT || '1337';

app.get('/', async (req, res) => {
  const url = req.query.url as string;
  const filename = req.query.filename as string;

  if (!url) {
    return res.status(500).send('Missing url.');
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(500).send('Invalid url.');
  }

  if (extname(url) !== '.md') {
    return res.status(500).send('Invalid file type.');
  }

  const { data } = await axios.get(url, { timeout: 1000 });
  const callback = (error: Error, buf: unknown) => {
    if (error) {
      return res.status(500).send(error);
    }

    res.set({
      'Content-Disposition': `attachment; filename=${filename || 'output'}.pdf`,
      'Content-Type': 'application/pdf',
    });
    res.send(buf);
  };
  markdownPdf()
    .from.string(data)
    .to.buffer({}, callback as unknown as () => void);
});

app.listen(port, () => {
  console.info(`server started at http://localhost:${port}.`);
});