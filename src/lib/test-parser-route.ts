import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { POST, runtime } from '../app/api/parse-file/route';

async function run() {
  assert.equal(runtime, 'nodejs');
  let passed = 0;
  for (const [name, type, expectedStatus] of [
    ['real-text-pdf.pdf', 'PDF', 200], ['malformed.pdf', 'PDF', 422], ['resume.docx', 'DOCX', 200],
  ] as const) {
    const form = new FormData();
    form.set('file', new File([readFileSync(`test-assets/${name}`)], name));
    const response = await POST(new NextRequest('http://localhost/api/parse-file', { method: 'POST', body: form }));
    assert.equal(response.status, expectedStatus, name);
    const payload = await response.json();
    if (expectedStatus === 200) { assert.equal(payload.fileType, type); assert.ok(payload.text.length > 20); }
    else assert.equal(payload.success, false);
    passed++;
  }
  const form = new FormData();
  form.set('file', new File(['Accurate resume text with genuine experience and education.'], 'resume.txt', { type: 'text/plain' }));
  const response = await POST(new NextRequest('http://localhost/api/parse-file', { method: 'POST', body: form }));
  assert.equal(response.status, 200); assert.equal((await response.json()).fileType, 'TXT'); passed++;
  console.log(`PARSER ROUTE: ${passed}/${passed} tests passed; Node runtime verified`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
