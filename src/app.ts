import axios from 'axios';
import express from 'express';
import { mdToPdf } from 'md-to-pdf';
import { extname, parse } from 'path';

const app = express();

const port = process.env.PORT || "1337";

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
  const pdf = await mdToPdf({ content: data });
  res.setHeader('Content-Disposition', `attachment; filename=${filename || 'output'}.pdf`);

  return res.end(pdf.content);
});

app.listen(port, () => {
  console.info(`server started at http://localhost:${port}.`);
});