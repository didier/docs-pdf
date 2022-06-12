import 'dotenv/config'
import pdfjs from 'pdfjs'
import puppeteer from 'puppeteer'
import _fs from 'fs'
const fs = _fs.promises

// Create PDF doc
const doc = new pdfjs.Document()

// Go to page
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.emulateMediaType('print')

const {
  NAME,
  STUDENT_NUMBER,
  STUDY,
  SCHOOL,
  PROJECT_TITLE,
  PDF_PATH,
  DOCS_URL,
  NEXT_PAGE_SELECTOR,
  HAS_LAZY_LOADING
} = process.env

// Go to page
await page.goto(DOCS_URL)

const headerTemplate = async (page) => `
<style>
  header.header {
    font-size: 8px;
    font-family: 'Inter', sans-serif;
    width: 100%;
    height: 8em;
    color: #27272a;
    position: relative;
    left: 0;
    right: 0;
    top: 0;
    margin: 2em auto 0 auto;
    padding: 0 1.7cm;
    text-align: left;
  }
</style>

<header class="header">
  <span class="title" />
</header>
`

const footerTemplate = async (page) => `
<style>
  footer {
    font-size: 8px;
    font-family: 'Inter', sans-serif;
    width: 100%;
    height: 8em;
    color: #27272a;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    column-gap: 32px;
    align-items: end;
    margin: 0 auto;
    padding: 0 1.7cm;
    width: 100%;
  }

  .spacer {
    width: 64px;
  }

  .col-span-2 {
    grid-column: span 2 / span 2;
  }
</style>

<footer>
<span>${PROJECT_TITLE}</span>
<span>
${NAME} <br />${STUDENT_NUMBER}
</span>
<span class="col-span-2">
${STUDY} <br />
${SCHOOL}
</span>
<span style="text-align: right;">
<span class="pageNumber" /> of <span class="totalPages" />
</span>
</footer>
`

// Create PDF of page
async function createPDF(page) {
  await page.waitForNetworkIdle()
  const src = await page.pdf({
    path: PDF_PATH,
    displayHeaderFooter: true,
    headerTemplate: await headerTemplate(page),
    footerTemplate: await footerTemplate(page),
    printBackground: true,
    format: 'A4',
    margin: { top: '1.9cm', bottom: '3.67cm', left: '1.9cm', right: '1.9cm' }
  })

  const pdf = new pdfjs.ExternalDocument(src)
  doc.addPagesOf(pdf)

  const selector = NEXT_PAGE_SELECTOR

  const nextLink = await page.evaluate((selector) => {
    const element = document.querySelector(selector)
    if (element) {
      return element.href
    } else {
      return ''
    }
  }, selector)

  if (nextLink) {
    await page.goto(nextLink, {
      waitUntil: 'networkidle0'
    })

    await page.evaluate(() => {
      // const viewPortHeight = document.documentElement.clientHeight;
      let lastScrollTop = document.scrollingElement.scrollTop

      // Scroll to bottom of page until we can't scroll anymore.
      const scroll = () => {
        document.scrollingElement.scrollTop += 100 //(viewPortHeight / 2);
        if (document.scrollingElement.scrollTop !== lastScrollTop) {
          lastScrollTop = document.scrollingElement.scrollTop
          requestAnimationFrame(scroll)
        }
      }
      scroll()
    })

    console.log(`Navigated to ${nextLink}`)

    // If page has lazy loaded images, wait for them to load
    if (HAS_LAZY_LOADING) {
      const WAIT_FOR = 3000
      await page.waitForTimeout(WAIT_FOR)
    }

    await createPDF(page)
  } else {
    console.log('Saving pdf...')
    const src = await fs.readFile(PDF_PATH)
    const ext = new pdfjs.ExternalDocument(src)
    doc.pipe(_fs.createWriteStream(PDF_PATH))
    await doc.end()
    await browser.close()
  }
}

await createPDF(page)
