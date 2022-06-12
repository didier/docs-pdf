# Docs to PDF

## Get started

1. Create a `.env` file and fill it with your data. Refer to `.env.example` for more info.
2. Make sure you using Node v14 — A bug in Puppeteer on Node 16 prevents this script from working. If you use `nvm`, You can run `nvm use` to switch to the correct version.
3. `npm run pdf`
4. ???
5. Profit

---

Note: as of now, the program doesn't log anything to your console. If you want a more verbose output, run `node index.js`

## Example Next-page Selectors

Make sure all your pages contain a 'next' link. Tools like Docusaurus and GitBook do this by default, but you'll have to do that manually for Notion.

- Docusaurus <br/>
  `NEXT_PAGE_SELECTOR=".pagination-nav__link.pagination-nav__link--next"`
- Notion (provided that you've added a 'next' link to each page)<br/>
  `NEXT_PAGE_SELECTOR='.notion-page-content div a:last-of-type[href^="/"]:not([href*="#"])'`
- GitBook (causes a timeout for some reason, so broken for now)<br/>
  `NEXT_PAGE_SELECTOR='[data-testid="page.desktopTableOfContents"] + div a:last-child[href^="/"]'`
