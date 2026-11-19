import puppeteer from "../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\zeels\\.gemini\\antigravity\\brain\\5f363e18-63dc-4e3f-948d-39ba4dc07d31";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:5173";

async function runMockInterviewAutomation() {
  console.log("=== STARTING MOCK INTERVIEW AUTOMATION SUITE ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    defaultViewport: { width: 1440, height: 960 },
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
  });

  const page = await browser.newPage();

  try {
    // 1. Visit base and seed authentication in localStorage
    console.log("1. Seeding candidate authentication token...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });

    // Login via UI or localStorage
    await page.evaluate(() => {
      // Create a valid mock token or test user session
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", "test_interview@example.com");
      localStorage.setItem("userName", "Zeel Sheth");
    });

    // Also call backend to get a real JWT token for test user
    const token = await page.evaluate(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test_interview@example.com",
            password: "hashed_test_password",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          return data.token;
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    });

    if (!token) {
      console.log("  Registering / signing in test user...");
      await page.evaluate(async () => {
        try {
          const regRes = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test_candidate_ui@example.com",
              password: "SecurePassword123!",
            }),
          });
          const data = await regRes.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", "test_candidate_ui@example.com");
            localStorage.setItem("userName", "Zeel Candidate");
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    // 2. Navigate to Mock Interview Setup Screen
    console.log("2. Navigating to Mock Interview Setup Screen (/mock-interview)...");
    await page.goto(`${BASE_URL}/mock-interview`, { waitUntil: "networkidle0", timeout: 15000 });
    await page.waitForSelector("h1");
    const setupTitle = await page.$eval("h1", (el) => el.innerText);
    console.log("  Setup Page Title:", setupTitle);

    const shot1 = path.join(ARTIFACT_DIR, "mock_interview_01_setup.png");
    await page.screenshot({ path: shot1, fullPage: false });
    console.log("  Screenshot saved:", shot1);

    // 3. Click "Begin Mock Interview" button
    console.log("3. Initiating mock interview session...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const startBtn = buttons.find((b) => b.innerText.includes("Begin Mock Interview"));
      if (startBtn) startBtn.click();
    });

    // Wait for chamber URL
    console.log("  Waiting for navigation to interview chamber...");
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 });
    console.log("  Current URL:", page.url());

    // 4. Verify Turn 1 question is loaded (Mandatory Self-Introduction)
    await page.waitForSelector("textarea", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));

    const shot2 = path.join(ARTIFACT_DIR, "mock_interview_02_first_question.png");
    await page.screenshot({ path: shot2, fullPage: false });
    console.log("  Screenshot saved:", shot2);

    // 5. Submit candidate's introduction response
    console.log("4. Submitting candidate self-introduction response...");
    const candidateResponse =
      "I am an MCA graduate. I developed an AI Interview Assistant using React.js, FastAPI, and PostgreSQL. " +
      "In this project, I architected the OCR document processing pipeline, designed the relational schemas, and integrated Gemini LLM.";

    await page.type("textarea", candidateResponse, { delay: 15 });

    // Click Send
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const sendBtn = buttons.find((b) => b.innerText.includes("Send"));
      if (sendBtn) sendBtn.click();
    });

    // Wait for AI to evaluate Turn 1 and generate Turn 2
    console.log("  Waiting for AI evaluation & Turn 2 generation...");
    await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return text.includes("TURN #2") || text.includes("Question 2");
      },
      { timeout: 35000 }
    );
    console.log("  Turn 2 generated successfully!");
    await new Promise((r) => setTimeout(r, 2000));

    const shot3 = path.join(ARTIFACT_DIR, "mock_interview_03_ai_evaluation_and_followup.png");
    await page.screenshot({ path: shot3, fullPage: false });
    console.log("  Screenshot saved:", shot3);

    // 6. Conclude Interview and Generate Performance Report
    console.log("5. Concluding interview to generate final performance report...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const concludeBtn = buttons.find((b) => b.innerText.includes("Conclude & Evaluate"));
      if (concludeBtn) concludeBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Click confirm in modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const generateBtn = buttons.find((b) => b.innerText.includes("Generate Final Report"));
      if (generateBtn) generateBtn.click();
    });

    console.log("  Waiting for navigation to performance report...");
    await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 });
    console.log("  Report Page URL:", page.url());

    await page.waitForSelector("h1", { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 2000));

    const shot4 = path.join(ARTIFACT_DIR, "mock_interview_04_performance_report.png");
    await page.screenshot({ path: shot4, fullPage: false });
    console.log("  Screenshot saved:", shot4);

    console.log("\n=== ALL MOCK INTERVIEW TESTS COMPLETED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("Test execution error:", error);
    const errShot = path.join(ARTIFACT_DIR, "mock_interview_error.png");
    await page.screenshot({ path: errShot, fullPage: true });
    console.log("Error screenshot captured at:", errShot);
  } finally {
    await browser.close();
  }
}

runMockInterviewAutomation();
