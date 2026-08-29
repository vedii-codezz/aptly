import { parseDocumentFile } from "./file-parsing/extractText";

async function runFileParsingTests() {
  console.log("=================================================");
  console.log("    APTLY/ FILE PARSER & PDF TEST SUITE          ");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${msg}`);
    }
  }

  // TEST 1: Plain text file fast-path extraction
  const txtContent = "Aarav Sharma\nEducation: B.Tech in Computer Science 2026\nSkills: Python, TypeScript, React";
  const txtFile = new File([txtContent], "resume.txt", { type: "text/plain" });
  const txtResult = await parseDocumentFile(txtFile);
  assert(
    Boolean(txtResult.success && txtResult.text?.includes("Aarav Sharma") && txtResult.fileType === "TXT"),
    "Plain text (.txt) file parses successfully with fast client path"
  );

  // TEST 2: Empty text file rejection
  const emptyTxtFile = new File(["   "], "empty.txt", { type: "text/plain" });
  const emptyTxtResult = await parseDocumentFile(emptyTxtFile);
  assert(
    Boolean(!emptyTxtResult.success && emptyTxtResult.error),
    "Empty text file is rejected with clear error message"
  );

  // TEST 3: Unsupported file extension rejection
  const exeFile = new File(["MZ..."], "malicious.exe", { type: "application/x-msdownload" });
  const exeResult = await parseDocumentFile(exeFile);
  assert(
    Boolean(!exeResult.success && exeResult.error?.includes("Unsupported file format")),
    "Unsupported file format (.exe) is rejected with clear guidance"
  );

  // TEST 4: Oversized file rejection (>10MB)
  const fakeLargeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]);
  const oversizedFile = new File([fakeLargeBlob], "large_resume.pdf", { type: "application/pdf" });
  const oversizedResult = await parseDocumentFile(oversizedFile);
  assert(
    Boolean(!oversizedResult.success && oversizedResult.error?.includes("exceeds 10MB")),
    "Oversized file (>10MB) is rejected before network submission"
  );

  // TEST 5: Zero-byte file rejection
  const zeroFile = new File([], "zero.pdf", { type: "application/pdf" });
  const zeroResult = await parseDocumentFile(zeroFile);
  assert(
    Boolean(!zeroResult.success && zeroResult.error?.includes("empty")),
    "Zero-byte file is caught and rejected gracefully"
  );

  // Print Summary
  console.log("\n=================================================");
  console.log(`      ${passed}/${total} PARSER TESTS PASSED ✓`);
  console.log("=================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runFileParsingTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
