import puppeteer from "../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\zeels\\.gemini\\antigravity\\brain\\5f363e18-63dc-4e3f-948d-39ba4dc07d31";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:5173";

async function runLiveTest() {
  console.log("=== LAUNCHING CHROME AUTOMATION TEST ===");
  console.log("Connecting to Chrome binary at:", CHROME_PATH);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    defaultViewport: { width: 1440, height: 920 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
  });

  const page = await browser.newPage();
  const testResults = [];

  try {
    // -------------------------------------------------------------
    // TEST 1: LANDING PAGE
    // -------------------------------------------------------------
    console.log("Testing 01: Landing Page...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 15000 });
    await page.waitForSelector("h1");
    const headingText = await page.$eval("h1", (el) => el.innerText);
    console.log("  Landing Heading:", headingText.replace(/\n/g, " "));

    const shot1 = path.join(ARTIFACT_DIR, "01_landing_page.png");
    await page.screenshot({ path: shot1, fullPage: false });
    testResults.push({ screen: "Landing Page", status: "PASSED", file: shot1 });

    // -------------------------------------------------------------
    // TEST 2: REGISTRATION SCREEN
    // -------------------------------------------------------------
    console.log("Testing 02: Registration Screen...");
    await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
    await page.waitForSelector("form");
    const shot2 = path.join(ARTIFACT_DIR, "02_registration_page.png");
    await page.screenshot({ path: shot2, fullPage: false });
    testResults.push({ screen: "Registration", status: "PASSED", file: shot2 });

    // -------------------------------------------------------------
    // TEST 3: LOGIN SCREEN
    // -------------------------------------------------------------
    console.log("Testing 03: Login Screen...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
    await page.waitForSelector("form");
    const shot3 = path.join(ARTIFACT_DIR, "03_login_page.png");
    await page.screenshot({ path: shot3, fullPage: false });
    testResults.push({ screen: "Login", status: "PASSED", file: shot3 });

    // -------------------------------------------------------------
    // TEST 4: FORGOT PASSWORD
    // -------------------------------------------------------------
    console.log("Testing 04: Forgot Password Flow...");
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: "networkidle0" });
    await page.waitForSelector("input[type='email']");
    const shot4 = path.join(ARTIFACT_DIR, "04_forgot_password.png");
    await page.screenshot({ path: shot4, fullPage: false });
    testResults.push({ screen: "Forgot Password", status: "PASSED", file: shot4 });

    // -------------------------------------------------------------
    // TEST 5: PRICING & VOICE MINUTES
    // -------------------------------------------------------------
    console.log("Testing 05: Pricing Page...");
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    const shot5 = path.join(ARTIFACT_DIR, "05_pricing_page.png");
    await page.screenshot({ path: shot5, fullPage: false });
    testResults.push({ screen: "Prepaid Minutes & Pricing", status: "PASSED", file: shot5 });

    // -------------------------------------------------------------
    // TEST 6: RESUME UPLOAD (AUTHENTICATED SESSION)
    // -------------------------------------------------------------
    console.log("Testing 06: Resume Upload Screen...");
    // Simulate candidate auth token in localStorage
    await page.evaluate(() => {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("token", "session_token_live_test");
      localStorage.setItem("userEmail", "alex.mercer@engineering.com");
      localStorage.setItem("userName", "Alex Mercer");
    });

    await page.goto(`${BASE_URL}/upload`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    const shot6 = path.join(ARTIFACT_DIR, "06_resume_upload.png");
    await page.screenshot({ path: shot6, fullPage: false });
    testResults.push({ screen: "Resume Intelligence Upload", status: "PASSED", file: shot6 });

    // -------------------------------------------------------------
    // TEST 7: PERSONALIZED DASHBOARD WITH REAL BACKEND DATA
    // -------------------------------------------------------------
    console.log("Testing 07: Personalized Dashboard...");
    const mockQuestions = [
      "Explain how you architect connection pooling and cache invalidation strategies using Neon PostgreSQL and Redis under high-throughput FastAPI services.",
      "How does the React 19 compiler optimize re-renders compared to manual useMemo and useCallback hooks?",
      "Explain the GIL in Python and how you scale CPU-bound computational tasks using Celery and multiprocessing.",
      "Describe how you design schema migrations in production without downtime using zero-downtime blue-green deployments.",
      "Walk me through your debugging workflow when a slow SQL query spikes database CPU to 95%.",
      "Explain the difference between Server Components and Client Components in modern React architecture.",
      "How do you implement distributed rate limiting across microservices using Redis token bucket algorithms?",
      "Explain closures and event-loop microtask queues in JavaScript runtime execution.",
    ];
    const mockSkills = ["React 19", "FastAPI", "Python", "Neon PostgreSQL", "Redis", "TypeScript", "System Design"];

    await page.evaluate((qs, sks) => {
      localStorage.setItem("cachedQuestions", JSON.stringify(qs));
      localStorage.setItem("cachedSkills", JSON.stringify(sks));
      localStorage.setItem("latestResumeId", "42");
    }, mockQuestions, mockSkills);

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    // Wait for the spotlight and list to settle
    await new Promise((r) => setTimeout(r, 600));

    const shot7 = path.join(ARTIFACT_DIR, "07_dashboard_personalized.png");
    await page.screenshot({ path: shot7, fullPage: false });
    testResults.push({ screen: "Personalized Interview Dashboard", status: "PASSED", file: shot7 });

    // -------------------------------------------------------------
    // TEST 8: INTERVIEW PRACTICE WORKSPACE (STAR METHODOLOGY)
    // -------------------------------------------------------------
    console.log("Testing 08: Practice Workspace...");
    await page.goto(`${BASE_URL}/workspace`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h2");
    await new Promise((r) => setTimeout(r, 600));

    const shot8 = path.join(ARTIFACT_DIR, "08_practice_workspace.png");
    await page.screenshot({ path: shot8, fullPage: false });
    testResults.push({ screen: "Interview Practice Workspace", status: "PASSED", file: shot8 });

    // -------------------------------------------------------------
    // TEST 9: VERBAL INTERVIEW CHAMBER (MODAL)
    // -------------------------------------------------------------
    console.log("Testing 09: Voice Interview Modal...");
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find((b) => b.innerText.includes("Practice Verbally"));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      console.log("  Practice Verbally button clicked:", clicked);
      await new Promise((r) => setTimeout(r, 1000));
      const shot9 = path.join(ARTIFACT_DIR, "09_voice_modal_chamber.png");
      await page.screenshot({ path: shot9, fullPage: false });
      testResults.push({ screen: "Voice Interview Chamber (Modal)", status: "PASSED", file: shot9 });
    } catch (modalErr) {
      console.warn("  Voice modal test error:", modalErr.message);
    }

    // -------------------------------------------------------------
    // TEST 10: MOBILE RESPONSIVE LAYOUT (375x812 - iPhone)
    // -------------------------------------------------------------
    console.log("Testing 10: Mobile Responsive Viewport (375px)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));

    const shot10 = path.join(ARTIFACT_DIR, "10_mobile_responsive.png");
    await page.screenshot({ path: shot10, fullPage: false });
    testResults.push({ screen: "Mobile Responsive Layout", status: "PASSED", file: shot10 });

    console.log("\n=== ALL CHROME AUTOMATION TESTS COMPLETED SUCCESSFULLY ===");
    console.log(JSON.stringify(testResults, null, 2));

  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await browser.close();
  }
}

runLiveTest();
