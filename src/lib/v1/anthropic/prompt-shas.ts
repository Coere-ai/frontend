/**
 * The SHA-256 of every system prompt Coere's extension sends through the
 * proxy (docs/accounts.md 8.4), as hex of the UTF-8 text of the request's
 * first system block. Each prompt is frozen and pinned by this same SHA in
 * coere-v2 (packages/memory/src/prompts and packages/solution/src/prompts,
 * prompts.test.ts and schemas-v2.test.ts), and the system prompt always
 * goes first, whole, in a block of its own; what changes per call (the
 * chat, memory lines, the person's style) goes in the messages.
 *
 * The proxy accepts a message only when its first system block is one of
 * these, so coere.ai is not a free general purpose Claude API for anyone
 * who scripts a sign up. Hashes, not text: nothing of the prompt is kept
 * here, and a request's own text is never logged, only its SHA.
 *
 * A package that adds a prompt version registers its SHA here first, and
 * the site deploys before the extension that sends it. Every value comes
 * from coere-v2's pins of 2026-11-25; anthropic.test.ts checks
 * them against a coere-v2 checkout beside this one when there is one.
 */

/** SHA-256 of the first system block, to the prompt it is. */
export const PROMPT_SHAS: Readonly<Record<string, string>> = {
  "008b6621f45e87f9a1e660ae6a5fc22a1c8744784bf634aeb3df77fa2626ab2f": "act-answer-v1",
  "ec25281577e8e10e113701125842b990e0aeff3ab2439cca910b578216925656": "act-extract-v1",
  "509ad4655f07f193e1e8d6a95fa7ea8ca853486aa1d1fc3e3dba17781402431c": "act-plan-v1",
  "63c8148e2ed4f9ad272aefbeab86e5a26bd1558897a03e554a22fc6ec4e92bf5": "act-see-v1",
  "09393595c2425be63f391b8d5a024d2e8533ce1fa2a6c688eaa7f13d5969fbca": "act-step-v1",
  "e2aa88be87db47e652d2e1de54f4d43a460a887d0c0a3af1c0b2da283ecf7ba3": "act-v1",
  "f04297a81244540742fe9fb8469b4ef8c8c7f8bb7bbf33c64045115aa95623b2": "act-write-v1",
  "fd2ecb46430bbac63da50c96b8a9999ae429a0321618180b54b1c9619633315a": "doc-v1",
  "b7929c5b98c902e185ffc9593805acf551313d78bcf94ec10a3ca96b5f6e36b0": "extract-short-v2",
  "601e5c7487f0d4b591ae90b24bf33dfee94830218a7cf1759e6530ef43656451": "extract-v1",
  "a9118adcbc55d17f7faef42ae5f534848ba14c2968285dcb1c21da8c606ec24a": "extract-v3",
  "4e37c9be45952f0dc6c712f480dab247d80ab95c875c687109d230311e5b372d": "label-v1",
  "a6e602e4c4f1156dcbb28162f4fc8fa6efdba387396007aab2f70cd978cd4e6d": "link-v3",
  "bd551b94d95a6f8b4662dbe06a024d906388ea1d4e6c8bbdbf75ad83325ffcbd": "name-section-v1",
  "3495ab363b97d36f0f671e6dec0442cd77ac0df938efb5721e60033e24619320": "pairs-v1",
  "61235cf3960b615e9fa6180ffa5c51ecf948c77a10a08a97d9053865f0edea42": "profile-v1",
  "38f8bacdbc687382bf41efd66081e50764e35eb25788063274c63fda16d2e05b": "route-v2",
  "71a13a83429b1fef8dfda5e5c7b5fe63bbc8089b8316046c82b2ec93c6dd51a8": "split-v1",
  "a1f6e7996be6f46127bb595dc5c49cc2b430983919b19375ca94df20cad602fd": "summary-v1",
  "d7aa555787470193500e51d2d9c2664ae1f149806f220b86c68fdc2e5dcc47ae": "solution extract-org-v1",
  "15872f85509217d0d473db0fbc6e1cd5c9068430de54fb1300b38e24c3d99bd9": "solution extract-org-v2",
  "ccd90543ebab15f8ad8b212c36e7a82a652db55e60d08601f2e4469f5d673a70": "solution extract-short-org-v1",
  "dfdfcd74e0d57829071493d606b1d16f826eaacad4715d935ab5141ac6bc6042": "solution extract-short-org-v2",
  "d44f1895cdd4695a2a47b98479ecd315456c49dd9b091aff339c52ca432ef1a2": "solution label-org-v1",
  "d5c31742b355cdadaaa83b797771fc332282317d84e06599c450fca2c2623c4a": "solution route-org-v2",
  "1524ce7d9523468f4c774257153c79716b72fb95c5bcf36ec0884de4ee1ff5ce": "solution split-org-v2",
};

/**
 * `report`: a message whose first system block is not listed is logged by
 * its SHA and let through. `enforce`: it is refused as a bad request. The
 * check ships in `report` until every v2 to v4 prompt is confirmed in the
 * logs; enforcing is then this one line.
 */
export const PROMPT_CHECK: "report" | "enforce" = "report";
