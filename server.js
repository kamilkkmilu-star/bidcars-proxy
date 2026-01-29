import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors());

app.get("/bidcars", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    // czekamy aż BID.CARS faktycznie załaduje dane pojazdu
    await page.waitForSelector("text=VIN", {
      timeout: 30000
    });

    const html = await page.content();

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);

  } catch (err) {
    res.status(500).json({
      error: err.toString()
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
