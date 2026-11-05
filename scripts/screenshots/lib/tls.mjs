// A certificate made for one run, for the local servers the browser and the
// site reach over https. Chrome trusts it by its key hash
// (--ignore-certificate-errors-spki-list) and Node by NODE_EXTRA_CA_CERTS,
// so no certificate check is turned off anywhere. The key never leaves the
// run's temporary folder, which dispose() removes.

import { execFileSync } from "node:child_process";
import { createHash, createPublicKey } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** `names` are DNS names; an IP address goes in as one too. */
export function runCert(names) {
  const dir = mkdtempSync(join(tmpdir(), "coere-shots-tls-"));
  const keyPath = join(dir, "key.pem");
  const certPath = join(dir, "cert.pem");
  const san = names.map((n) => (/^\d+\.\d+\.\d+\.\d+$/.test(n) ? `IP:${n}` : `DNS:${n}`)).join(",");
  execFileSync(
    "openssl",
    ["req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes", "-days", "1", "-subj", "/CN=coere-screenshots", "-addext", `subjectAltName=${san}`, "-addext", "basicConstraints=critical,CA:TRUE", "-keyout", keyPath, "-out", certPath],
    { stdio: "ignore" },
  );
  const key = readFileSync(keyPath);
  const cert = readFileSync(certPath);
  const der = createPublicKey(cert).export({ type: "spki", format: "der" });
  return {
    key,
    cert,
    certPath,
    spki: createHash("sha256").update(der).digest("base64"),
    dispose: () => rmSync(dir, { recursive: true, force: true }),
  };
}
