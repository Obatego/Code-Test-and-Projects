# UniTrack — Student Expense Tracker

UniTrack is a responsive student expense tracker built with plain HTML, CSS, and JavaScript.

## Features
- Add expenses with a description, amount, and category (Food, Transport, Education, Other).
- Validation prevents blank descriptions and non-numeric, zero, or negative amounts.
- Delete an individual expense or clear the full list after confirmation.
- Total spending and category totals update automatically.
- Expenses and light/dark theme preference are saved in this browser using `localStorage`.
- Responsive layout, 3D-inspired hero artwork, and a multicolour paint-splash slogan.
- Includes the generated visual design concept at `assets/unitrack-design-concept.png`.

## Run locally
1. Extract the ZIP file.
2. Open the `UniTrack_Student_Expense_Tracker` folder.
3. Open `index.html` in a modern browser.
4. Start adding expenses.

No build tools, npm packages, or server are required for the basic version. The font stylesheet uses Google Fonts when you have an internet connection; the app still works offline with fallback fonts.

## Publish with GitHub Pages
1. Create a GitHub repository (for example, `unitrack-expense-tracker`).
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under build/deployment, choose **Deploy from a branch**.
5. Select your main branch and the `/ (root)` folder, then save.
6. Wait for the deployment to finish. GitHub will show your public Pages URL in Settings → Pages.

## Notes
- Data is stored only in the browser/device where it was entered. It is not a login-based cloud database and will not automatically sync across devices.
- Clearing browser site data can remove locally saved expenses. Export/backup functionality is not included in this starter version.
- `assets/unitrack-design-concept.png` is a bundled reference image; the live interface itself is constructed from HTML/CSS so the controls remain functional.
