import express from 'express';
import { marked } from 'marked';
import puppeteer from 'puppeteer';
import { extname } from 'path';

const app = express();
const port = process.env.PORT || '1337';

app.get('/', async (req, res) => {
  const url = req.query.url as string;
  const filename = (req.query.filename as string) || 'output';

  if (!url) {
    return res.status(400).send('Missing url.');
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).send('Invalid url.');
  }

  if (extname(url) !== '.md') {
    return res.status(400).send('Invalid file type.');
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      return res.status(502).send('Failed to fetch markdown file.');
    }

    const markdown = await response.text();
    const html = await marked(markdown);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Disposition': `attachment; filename=${filename}.pdf`,
      'Content-Type': 'application/pdf',
    });
    res.send(pdf);
  } catch (error) {
    return res.status(500).send('PDF conversion failed.');
  }
});

app.listen(port, () => {
  console.info(`server started at http://localhost:${port}.`);
});
