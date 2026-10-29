The answer types, rendered from `components.schemas` of `packages/api/openapi.json` (which the build makes from `packages/api/src/responses/*.ts` and the frozen `.coere` record schema). Notation: `?` marks an optional field, `anyOf[A | null]` a nullable one, `const` a fixed value, `tuple[...]` a fixed-length array; regular expression patterns are shown JSON-escaped, exactly as the file holds them. <!-- src: tools/api-openapi/document.ts:5-17 -->

### 6.1 Shared

`Problem`: RFC 9457 problem details with a stable code. detail holds counts, ids and parameter names only. <!-- src: packages/api/openapi.json:8848 -->

```text
object {
  type: string
  title: string
  status: integer minimum=400 maximum=599
  code: enum "bad_request"|"bad_batch"|"unauthorized"|"bad_signature"|"stale_request"|"replayed"|"forbidden_scope"|"forbidden_host"|"forbidden_origin"|"connect_denied"|"not_found"|"path_not_found"|"method_not_allowed"|"seq_gap"|"library_mismatch"|"ambiguous_path"|"cursor_stale"|"idempotency_conflict"|"epoch_changed"|"code_expired"|"receipt_expired"|"payload_too_large"|"unsupported_media_type"|"pairing_locked"|"rate_limited"|"internal"|"not_implemented"|"not_synced"|"insufficient_storage"
  detail?: string
  param?: string
  scope?: Scope
  ackedSeq?: integer minimum=0
  candidates?: array of PathStep
  matched?: array of PathStep
  retryAfter?: integer minimum=0
  demo?: boolean
}
```

`PathStep`: One step of a tree path, section first. <!-- src: packages/api/openapi.json:8742 -->

```text
object {
  id: string
  name: string
  kind: anyOf[const "section" | KindName]
}
```

`View`: Computed when read, from the record, the server clock and the person's zone. Never stored, never exported. <!-- src: packages/api/openapi.json:8804 -->

```text
object {
  path: array of PathStep
  current: boolean
  urgency: ViewUrgency
  subject?: object {
    id: string
    name: string
    kind: KindName
  }
}
```

`ViewUrgency` <!-- src: packages/api/openapi.json:8770 -->

```text
object {
  level: UrgencyLevel
  at: anyOf[Instant | null]
  label: anyOf[string | null]
}
```

`UrgencyLevel` <!-- src: packages/api/openapi.json:8731 -->

```text
enum "overdue"|"stale"|"today"|"soon"|"upcoming"|"later"|"none"
```

`Instant`: A moment in UTC, RFC 3339 with Z. Used for record time: when Coere learned, confirmed or retired something. <!-- src: packages/api/openapi.json:8967 -->

```text
string pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z$"
```

`When`: A time in the person's world, at the precision it was said. 'at' is a local date or date time with no offset (JSCalendar LocalDateTime) read in 'tz', an IANA zone; with no tz it is floating. Reduced precision ('2026', '2026-10') is allowed, as ISO 8601 and EDTF level 0 allow it. <!-- src: packages/api/openapi.json:8976 -->

```text
object {
  at: string pattern="^[0-9]{4}(-[0-9]{2}(-[0-9]{2}(T[0-9]{2}:[0-9]{2}(:[0-9]{2})?)?)?)?$"
  tz?: string pattern="^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$|^UTC$"
  approx?: const true
}
```

`KindName`: A base kind, or a custom one starting with 'x-'. <!-- src: packages/api/openapi.json:9398 -->

```text
string pattern="^(self|person|organization|group|project|course|task|event|place|product|document|topic|folder|other)$|^x-[a-z0-9-]{1,32}$"
```

`Importance`: How much this matters to the person over time. 5 critical (safety, health, legal, money at stake, identity), 4 high (active work, key people, standing preferences), 3 normal, 2 low, 1 trivia. <!-- src: packages/api/openapi.json:9030 -->

```text
integer minimum=1 maximum=5
```

`RecordStatus`: active is current. superseded was replaced by newer evidence (supersededBy says by what). retracted was found wrong. disputed has evidence both ways and is shown with its rival. Nothing is deleted: a forgotten record becomes a tombstone. merged is a duplicate whose evidence joined the record mergedInto names; it is not history and is never shown as a past value. <!-- src: packages/api/openapi.json:9403 -->

```text
enum "active"|"superseded"|"retracted"|"disputed"|"merged"
```

`RecordType` <!-- src: packages/api/openapi.json:8719 -->

```text
enum "section"|"source"|"activity"|"profile"|"entity"|"fact"|"relation"|"tombstone"
```

`Scope` <!-- src: packages/api/openapi.json:8709 -->

```text
enum "memory:read"|"memory:evidence"|"memory:sensitive"|"memory:suggest"|"memory:export"|"memory:identity"
```

### 6.2 Memory records

Every memory object is its `.coere` record plus `view`, computed when read. <!-- src: packages/api/openapi.json:3-7 -->

`ApiSection` <!-- src: packages/api/openapi.json:10038 -->

```text
object {
  t: const "section"
  id: SectionId
  key: string pattern="^[a-z0-9_]{1,40}$"
  name: string minLength=1 maxLength=60
  about?: string maxLength=300
  base: boolean
  order: integer minimum=0 maximum=10000
  proposed?: const true
  ext?: Ext
  view: View
}
```

`ApiEntity`: A thing in the person's world. An entity with children is shown as a folder: CS 101 holds Project 1. <!-- src: packages/api/openapi.json:10089 -->

```text
object {
  t: const "entity"
  id: EntityId
  kind: KindName
  name: string minLength=1 maxLength=200
  aliases?: array maxItems=32 of string minLength=1 maxLength=200
  section: SectionId
  parent?: EntityId
  summary?: string maxLength=1000
  importance: Importance
  pinned?: const true
  status: RecordStatus
  supersededBy?: EntityId
  origin: Origin
  valid?: Valid
  urgency?: UrgencyInputs
  recorded: Recorded
  evidence: EvidenceList
  by: ActivityId
  personSet?: PersonSet
  summaryFacts?: array minItems=1 maxItems=64 of FactId   // The facts the summary cites. A summary without them is refused (semantic check S11).
  mergedInto?: EntityId
  ext?: Ext
  view: View
}
```

`ApiFact`: One atomic memory about an entity: the info under each memory. <!-- src: packages/api/openapi.json:10197 -->

```text
object {
  t: const "fact"
  id: FactId
  subject: EntityId
  kind: enum "attribute"|"preference"|"style"|"goal"|"task"|"event"|"decision"|"constraint"|"instruction"|"note"
  key: string pattern="^[a-z][a-z0-9_]{0,40}(\\.[a-z][a-z0-9_]{0,40}){0,3}$"   // What the fact is about, dotted and lower case: 'due', 'email', 'writing.tone', 'allergy'. Facts with the same subject and key compete for current.
  text: string minLength=1 maxLength=2000
  value?: TypedValue
  specifics?: array maxItems=64 of Specific
  importance: Importance
  pinned?: const true
  urgency?: UrgencyInputs
  progress?: enum "needs-action"|"in-process"|"completed"|"failed"|"cancelled"
  start?: When
  end?: When
  valid?: Valid
  status: RecordStatus
  supersedes?: array of FactId
  supersededBy?: FactId
  rival?: FactId
  confidence?: number minimum=0 maximum=1
  sensitivity?: enum "health"|"finance"|"identity"|"location"|"relationships"|"other"
  origin: Origin
  recorded: Recorded
  evidence: EvidenceList
  by: ActivityId
  under?: anyOf[SectionId | EntityId]   // Where the fact is filed: a section or a folder entity. Absent means filed under its subject. Required in practice when the subject is the self entity (semantic check S9).
  personSet?: PersonSet
  basis?: enum "user_stated"|"user_accepted"|"assistant_only"|"pasted"|"inferred"|"person"   // user_stated: the person said it. user_accepted: the AI said it and the person accepted it. assistant_only: only the AI said it. pasted: text the person pasted from elsewhere. inferred: concluded, not stated. person: typed by the person in Coere. Required when origin is extracted (semantic check S10).
  searchKeys?: object {
    terms?: array maxItems=8 of string minLength=1 maxLength=80
    questions?: array maxItems=3 of string minLength=1 maxLength=200
  }
  mergedInto?: FactId
  held?: const true   // Waiting for the person to confirm it. Kept and shown on the Memory page; left out of Recall, of an app's profile and context answers, and of text exports for another AI until confirmed.
  ext?: Ext
  view: View
}
```

`ApiRelation`: A typed link between two entities, written in active voice from 'from' to 'to'. <!-- src: packages/api/openapi.json:10395 -->

```text
object {
  t: const "relation"
  id: RelationId
  from: EntityId
  type: string pattern="^[a-z][a-z0-9_]{0,40}$"
  to: EntityId
  label?: string maxLength=120
  importance: Importance
  valid?: Valid
  status: RecordStatus
  supersededBy?: RelationId
  origin: Origin
  recorded: Recorded
  evidence: EvidenceList
  by: ActivityId
  ext?: Ext
  view: View
}
```

`ApiSource`: A conversation that evidence points into, as the v1 library saved it. <!-- src: packages/api/openapi.json:10466 -->

```text
object {
  t: const "source"
  id: SourceId
  platform: string pattern="^[a-z][a-z0-9_]{0,31}$"
  title?: string maxLength=500
  url?: string pattern="^https://"
  project?: string maxLength=200
  createdAt?: Instant
  updatedAt?: Instant
  capturedAt: Instant
  messages: integer minimum=0
  convSha256: Sha256
  file?: string pattern="^chats/[^/]+(/[^/]+)*\\.txt$"
  ext?: Ext
  view: View
}
```

`ApiStyleProfile`: Measures of how the person writes, computed in code from their own messages over a period, per platform or overall. Exemplars point at messages; their text is never copied here. <!-- src: packages/api/openapi.json:10530 -->

```text
object {
  t: const "profile"
  id: ProfileId
  subject: EntityId
  period: object {
    from: Instant
    to: Instant
  }
  platform?: string pattern="^[a-z][a-z0-9_]{0,31}$"
  messages: integer minimum=0
  stats: object {
    measures?: object map of Rate
    openers?: Shares
    signOffs?: Shares
    functionWords?: object map of Rate
  }
  exemplars?: array maxItems=10 of MessageRef
  by: ActivityId
  ext?: Ext
  view: View
}
```

Record parts referenced above:

`SectionId` <!-- src: packages/api/openapi.json:8937 -->

```text
string pattern="^sec_[a-z0-9_]{1,40}$"
```

`EntityId` <!-- src: packages/api/openapi.json:8941 -->

```text
string pattern="^ent_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
```

`FactId` <!-- src: packages/api/openapi.json:8945 -->

```text
string pattern="^fact_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
```

`RelationId` <!-- src: packages/api/openapi.json:8949 -->

```text
string pattern="^rel_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
```

`ActivityId` <!-- src: packages/api/openapi.json:8953 -->

```text
string pattern="^act_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
```

`SourceId`: A conversation's library id, '&lt;platform&gt;:&lt;platform conversation id&gt;', as Coere v1 stores it. <!-- src: packages/api/openapi.json:8957 -->

```text
string pattern="^[a-z][a-z0-9_]{0,31}:[^\\s#]{1,256}$"
```

`MessageRef`: A message on the conversation's visible branch: '&lt;library id&gt;#m&lt;n&gt;', where n is the number the v1 text file prints in the message's '[n] ROLE' marker, from 1. <!-- src: packages/api/openapi.json:8962 -->

```text
string pattern="^[a-z][a-z0-9_]{0,31}:[^\\s#]{1,256}#m[1-9][0-9]{0,5}$"
```

`Sha256` <!-- src: packages/api/openapi.json:8972 -->

```text
string pattern="^[0-9a-f]{64}$"
```

`EvidenceList` <!-- src: packages/api/openapi.json:9129 -->

```text
array minItems=1 maxItems=64 of Evidence
```

`Evidence`: One piece of evidence. src points at a chat message, or role 'person' marks an edit the person made in Coere, or role 'import' a record brought in from another tool. <!-- src: packages/api/openapi.json:9084 -->

```text
object {
  src: anyOf[MessageRef | ActivityId]
  role: enum "user"|"assistant"|"system"|"tool"|"person"|"import"
  at: Instant
  quote?: Quote
  msgSha256?: Sha256
  stale?: const true   // Set when the message changed and the quote could not be found again. The fact keeps its specifics.
}
```

`Quote`: Where the evidence sits in the message, as a W3C Web Annotation TextQuoteSelector plus TextPositionSelector. start and end count UTF-16 code units in the message text, end excluded. <!-- src: packages/api/openapi.json:9051 -->

```text
object {
  exact: string minLength=1 maxLength=4000
  prefix?: string maxLength=32
  suffix?: string maxLength=32
  start: integer minimum=0
  end: integer minimum=1
}
```

`Specific`: A detail that must survive word for word: a name, number, date, amount, version or decision. text is copied verbatim from the quote of evidence[ev]; value is its normalized form when one exists. <!-- src: packages/api/openapi.json:9137 -->

```text
object {
  type: enum "name"|"date"|"time"|"datetime"|"duration"|"money"|"number"|"quantity"|"percent"|"version"|"email"|"phone"|"url"|"address"|"code"|"identifier"|"decision"|"other"
  text: string minLength=1 maxLength=500
  ev: integer minimum=0 maximum=63
  value?: TypedValue
}
```

`TypedValue`: A typed value. Amounts are decimal strings, so 0.10 stays 0.10 and no float rounding touches money. <!-- src: packages/api/openapi.json:9184 -->

```text
object oneOf[ {
    type?: const "text"
    text: string
  } |  {
    type?: const "number"
    number: string pattern="^-?[0-9]+(\\.[0-9]+)?$"
  } |  {
    type?: const "quantity"
    number: string pattern="^-?[0-9]+(\\.[0-9]+)?$"
    unit: string maxLength=32
  } |  {
    type?: const "money"
    amount: string pattern="^-?[0-9]+(\\.[0-9]+)?$"
    currency: string pattern="^[A-Z]{3}$"
  } |  {
    type?: const "percent"
    number: string pattern="^-?[0-9]+(\\.[0-9]+)?$"
  } |  {
    type?: const "when"
    when: When
  } |  {
    type?: const "duration"
    iso: string pattern="^P(?!$)([0-9]+Y)?([0-9]+M)?([0-9]+W)?([0-9]+D)?(T(?!$)([0-9]+H)?([0-9]+M)?([0-9]+(\\.[0-9]+)?S)?)?$"
  } |  {
    type?: const "version"
    version: string maxLength=64
  } |  {
    type?: const "url"
    url: string pattern="^[a-z][a-z0-9+.-]*:"
  } |  {
    type?: const "email"
    email: string pattern="^[^@\\s]+@[^@\\s]+$"
  } |  {
    type?: const "phone"
    phone: string maxLength=40
  } |  {
    type?: const "entity"
    entity: EntityId
  } |  {
    type?: const "bool"
    bool: boolean
  }]
```

`Origin`: extracted from chats by the extractor, inferred from several facts, stated by the person in Coere, imported from another tool. <!-- src: packages/api/openapi.json:9413 -->

```text
enum "extracted"|"inferred"|"stated"|"imported"
```

`Recorded`: Record time: when Coere first and last saw evidence for this, and when it stopped treating it as current. <!-- src: packages/api/openapi.json:9010 -->

```text
object {
  first: Instant
  last: Instant
  retired?: Instant
}
```

`Valid`: Valid time: when this was true in the world. Open ends are left out. Graphiti calls these t_valid and t_invalid. <!-- src: packages/api/openapi.json:8997 -->

```text
object {
  from?: When
  to?: When
}
```

`UrgencyInputs`: The inputs urgency is computed from at read time, never a stored level that goes stale. priority follows iCalendar and JSCalendar: 0 undefined, 1 highest, 9 lowest. <!-- src: packages/api/openapi.json:9036 -->

```text
object {
  due?: When
  priority?: integer minimum=0 maximum=9
}
```

`PersonSet`: Names of the fields the person set by hand. Extraction, consolidation and imports never change them. <!-- src: packages/api/openapi.json:9895 -->

```text
array of enum "importance"|"under"|"parent"|"section"|"due"|"text"|"name"|"pinned"|"progress"
```

`Ext`: Extensions, keyed by a reverse domain name. Readers keep what they do not understand and write it back unchanged. <!-- src: packages/api/openapi.json:9391 -->

```text
object
```

`ProfileId` <!-- src: packages/api/openapi.json:9913 -->

```text
string pattern="^prof_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
```

`Rate` <!-- src: packages/api/openapi.json:9917 -->

```text
number minimum=0
```

`Shares` <!-- src: packages/api/openapi.json:10014 -->

```text
array maxItems=5 of object {
    text: string minLength=1 maxLength=40
    share: number minimum=0 maximum=1
  }
```

### 6.3 Answers

`Health` <!-- src: packages/api/openapi.json:10627 -->

```text
object {
  ok: const true
  server: string
  api: string
  format: string
  paired: boolean
}
```

`Me` <!-- src: packages/api/openapi.json:10655 -->

```text
object {
  token: object {
    id: string
    name: string
    scopes: array of Scope
    sections: anyOf[array of string | null]
    createdAt: Instant
    lastUsedAt: anyOf[Instant | null]
    expiresAt: anyOf[Instant | null]
  }
  memory: object {
    library: anyOf[string | null]
    demo: boolean
    syncedAt: anyOf[Instant | null]
    version: anyOf[string | null]
    timeZone: anyOf[string | null]
    counts: object {
      sections: integer minimum=0
      entities: integer minimum=0
      facts: integer minimum=0
      relations: integer minimum=0
    }
  }
  server: object {
    version: string
    api: string
    format: string
  }
}
```

#### PersonProfile

`PersonProfile` <!-- src: packages/api/openapi.json:10870 -->

```text
object {
  self: ApiEntity
  timeZone: anyOf[string | null]
  now: Instant
  bySection: array of object {
      section: PathStep
      facts: array of ApiFact
    }
  style: StyleSummary
  dueSoon: array maxItems=10 of ApiFact
}
```

#### StyleSummary

`StyleSummary` <!-- src: packages/api/openapi.json:10834 -->

```text
object {
  writing: array of ApiFact
  tone: array of ApiFact
  answers: array of ApiFact
  snapshots: array of ApiStyleProfile
}
```

`SectionSummary` <!-- src: packages/api/openapi.json:10932 -->

```text
object {
  section: ApiSection
  counts: object {
    entities: integer minimum=0
    facts: integer minimum=0
    due: integer minimum=0
  }
  urgency: UrgencyLevel
}
```

`SectionList` <!-- src: packages/api/openapi.json:10972 -->

```text
object {
  data: array of SectionSummary
}
```

`TreeNode` <!-- src: packages/api/openapi.json:10987 -->

```text
object {
  id: string
  kind: anyOf[const "memory" | const "section" | KindName]
  name: string
  importance: anyOf[integer minimum=1 maximum=5 | null]
  urgency: UrgencyLevel
  counts: object {
    children: integer minimum=0
    facts: integer minimum=0
  }
  children?: array of TreeNode
  more?: integer minimum=0
}
```

`Tree` <!-- src: packages/api/openapi.json:11063 -->

```text
object {
  root: TreeNode
}
```

`EntityPage` <!-- src: packages/api/openapi.json:11075 -->

```text
object {
  data: array of ApiEntity
  hasMore: boolean
  nextCursor: anyOf[string | null]
}
```

`FactPage` <!-- src: packages/api/openapi.json:11105 -->

```text
object {
  data: array of ApiFact
  hasMore: boolean
  nextCursor: anyOf[string | null]
}
```

`NodeDetail` <!-- src: packages/api/openapi.json:11197 -->

```text
object {
  node: anyOf[ApiEntity | ApiSection]
  children: EntityPage
  facts: FactPage
  about: FactPage
  relations: array maxItems=50 of RelatedEdge
  counts: object {
    children: integer minimum=0
    facts: integer minimum=0
    history: integer minimum=0
    relations: integer minimum=0
  }
}
```

`RelatedEdge` <!-- src: packages/api/openapi.json:11135 -->

```text
object {
  relation: ApiRelation
  direction: enum "out"|"in"
  other: object {
    id: string
    name: string
    kind: KindName
    path: array of PathStep
  }
}
```

`RelatedList` <!-- src: packages/api/openapi.json:11182 -->

```text
object {
  data: array of RelatedEdge
}
```

`FactSourceRef` <!-- src: packages/api/openapi.json:11265 -->

```text
object {
  id: string
  platform: string
  title: anyOf[string | null]
  url: anyOf[string | null]
}
```

`FactDetail` is `ApiFact` plus two fields: <!-- src: packages/api/openapi.json:11303-11514 -->

```text
history: array of ApiFact
sources: array of FactSourceRef
```

`Resolved` <!-- src: packages/api/openapi.json:11515 -->

```text
object {
  node: anyOf[ApiEntity | ApiSection]
  path: array of PathStep
}
```

`SearchResult` <!-- src: packages/api/openapi.json:11541 -->

```text
object {
  intent: object {
    deadline: boolean
    history: boolean
    people: boolean
    window: anyOf[array minItems=2 tuple[string, string] | null]
  }
  open: anyOf[NodeDetail | null]
  hits: array of object {
      node: object {
        id: string
        name: string
        kind: anyOf[const "section" | KindName]
        path: array of PathStep
        nameHighlights: array of array minItems=2 tuple[integer minimum=0, integer minimum=0]
      }
      score: number
      facts: array maxItems=3 of object {
          score: number
          highlights: array of array minItems=2 tuple[integer minimum=0, integer minimum=0]
          fact: ApiFact
        }
    }
  capped: boolean
}
```

`ContextBlock` <!-- src: packages/api/openapi.json:11716 -->

```text
object {
  text: string
  items: array of object {
      id: string
      t: enum "fact"|"entity"
      section: string
    }
  truncated: boolean
}
```

`Change` <!-- src: packages/api/openapi.json:11759 -->

```text
object {
  seq: integer minimum=1
  id: string
  t: RecordType
  op: enum "put"|"remove"|"forget"
  record?: anyOf[anyOf[ApiSection | ApiSource | ApiEntity | ApiFact | ApiRelation | ApiStyleProfile] | null]
}
```

`ChangeFeed` <!-- src: packages/api/openapi.json:11817 -->

```text
object {
  data: array of Change
  next: string
  epoch: string
}
```

`SuggestionCreate` <!-- src: packages/api/openapi.json:11840 -->

```text
object {
  kind?: enum "add"|"correct"|"forget" string default="add"
  text: string minLength=1 maxLength=2000
  about?: string minLength=1 maxLength=400
  section?: string pattern="^[a-z0-9_]{1,40}$"
  due?: object {
    at: string pattern="^[0-9]{4}(-[0-9]{2}(-[0-9]{2}(T[0-9]{2}:[0-9]{2}(:[0-9]{2})?)?)?)?$"
    tz?: string pattern="^[A-Za-z_]+(\\/[A-Za-z0-9_+-]+){0,2}$|^UTC$"
    approx?: const true boolean
  }
  importance?: integer minimum=1 maximum=5
  note?: string minLength=1 maxLength=500 pattern="^[^\\x00-\\x1f\\x7f-\\x9f]*$"
}
```

`Suggestion` <!-- src: packages/api/openapi.json:11959 -->

```text
object {
  id: string
  kind: enum "add"|"correct"|"forget"
  status: enum "pending"|"accepted"|"dismissed"|"expired"
  createdAt: Instant
  deliveredAt: anyOf[Instant | null]
  decidedAt: anyOf[Instant | null]
  resultIds: array of string
}
```

`SuggestionPage` <!-- src: packages/api/openapi.json:12021 -->

```text
object {
  data: array of Suggestion
  hasMore: boolean
  nextCursor: anyOf[string | null]
}
```

#### DraftContext

`DraftContext` <!-- src: packages/api/openapi.json:12711 -->

```text
object {
  memoryVersion: string
  chat: anyOf[string | null]
  first: boolean
  client: anyOf[object {
      id: string
      name: string
    } | null]
  items: array of DraftItem
  also: array of DraftItem
  topic: array of string
  fromChats: integer minimum=0
  sources: array of string
  tokens: integer minimum=0
  chars: integer minimum=0
  block: string
  receipt: anyOf[string pattern="^rcp_[0-7][0-9A-HJKMNP-TV-Z]{25}$" | null]
  recorded: boolean
  vectors: enum "ready"|"loading"
}
```

`DraftItem` <!-- src: packages/api/openapi.json:12523 -->

```text
object {
  id: string
  kind: enum "core"|"client"|"node"|"chat"
  path: array of string
  reason: enum "standing"|"client"|"name"|"both"|"vector"|"keyword"|"asked"|"linked"|"task"
  via: anyOf[object {
      id: string
      path: array of string
    } | null]
  why: string
  changedOnly: boolean
  tokens: integer minimum=0
  version: string
  lines: array of DraftLine
  sources: array of string
  fromChats: integer minimum=0
  chat?: DraftChat
}
```

`DraftLine` <!-- src: packages/api/openapi.json:12435 -->

```text
object {
  record: string
  text: string
  platform: anyOf[string | null]
  at: anyOf[Instant | null]
  date: anyOf[string | null]
  chats: integer minimum=0
  chatRefs?: array of object {
      id: string
      platform: string
      title: string
      url: anyOf[string | null]
    }
}
```

`DraftChat` <!-- src: packages/api/openapi.json:12631 -->

```text
object {
  platform: anyOf[string | null]
  at: anyOf[Instant | null]
  date: anyOf[string | null]
  chars: integer minimum=0
  kinds: array of string
  ref?: object {
    id: string
    title: string
    url: anyOf[string | null]
  }
}
```

`DraftSent` <!-- src: packages/api/openapi.json:12832 -->

```text
object {
  recorded: integer minimum=0
}
```

`Identity` <!-- src: packages/api/openapi.json:12845 -->

```text
object {
  person: object {
    id: string
    name: string
    path: array of PathStep
  }
  fields: object {
    role: anyOf[object {
        fact: string
        value: string
      } | null]
    organization: anyOf[object {
        fact: string
        value: string
      } | null]
    location: anyOf[object {
        fact: string
        value: string
      } | null]
    timeZone: anyOf[object {
        fact: string
        value: string
      } | null]
    pronouns: anyOf[object {
        fact: string
        value: string
      } | null]
  }
  values: array of object {
      fact: string
      key: string
      kind: enum "email"|"phone"|"link"
      label: anyOf[string | null]
      value: string
      sources: array of string
      at: anyOf[Instant | null]
    }
}
```

`CorePackView` <!-- src: packages/api/openapi.json:13067 -->

```text
object {
  lines: array of object {
      record: string
      part: enum "identity"|"answers"|"style"|"pinned"|"company"
      text: string
    }
  about: string
  tokens: integer minimum=0
}
```

`ConnectStarted` <!-- src: packages/api/openapi.json:13114 -->

```text
object {
  id: string pattern="^con_[0-7][0-9A-HJKMNP-TV-Z]{25}$"
  code: string pattern="^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$"
  expiresIn: integer minimum=0
  pollAfter: integer minimum=0
}
```

`ConnectPoll` <!-- src: packages/api/openapi.json:13142 -->

```text
object {
  token: anyOf[string pattern="^coere_app_[A-Z2-7]{52}$" | null]
  pollAfter: integer minimum=0
}
```

`Client` <!-- src: packages/api/openapi.json:13317 -->

```text
object {
  id: string
  name: string
  key: string
  section: string pattern="^client_[a-z0-9_]{1,33}$"
  path: array of PathStep
  domains: array of string
}
```

`ClientPage` <!-- src: packages/api/openapi.json:13356 -->

```text
object {
  data: array of Client
  hasMore: boolean
  nextCursor: anyOf[string | null]
}
```

`ClientCard` <!-- src: packages/api/openapi.json:13386 -->

```text
object {
  client: Client
  item: DraftItem
  block: string
}
```
