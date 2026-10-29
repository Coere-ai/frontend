import { askerOf } from "@v2/apps/extension/src/background/cori/route";
import { createVoiceRouter, type PortLike, type VoiceRouter } from "@v2/apps/extension/src/voice/background/route";
import { clauses } from "@v2/apps/extension/src/voice/core/speakable";
import { fakeHearing, fakeSpeak, type FakeSpeechFile, type FakeVoiceFile } from "@v2/apps/extension/src/voice/fake/engines";
import { fakePacks } from "@v2/apps/extension/src/voice/fake/packs";
import type { SpeechIn, SpeechOut } from "@v2/apps/extension/src/voice/engine/speech-worker";
import type { Hearing, HearingFactory } from "@v2/apps/extension/src/voice/engine/hearing";
import type { VoiceIn, VoiceOut } from "@v2/apps/extension/src/voice/engine/voice-worker";
import type { ModelPack } from "@v2/apps/extension/src/voice/models/manifest";
import { createModelStore, webSha256, type ModelStore } from "@v2/apps/extension/src/voice/models/store";
import { createModels } from "@v2/apps/extension/src/voice/offscreen/models";
import { createVoiceHost, type VoiceHost, type WorkerLike } from "@v2/apps/extension/src/voice/offscreen/host";
import type { Capture } from "@v2/apps/extension/src/voice/offscreen/capture";
import type { Playback } from "@v2/apps/extension/src/voice/offscreen/playback";
import { isToOffscreen, readCommand, VOICE_CH, VOICE_PORT, type ToRouter, type VoiceEvent } from "@v2/apps/extension/src/voice/protocol";
import { ASSETS } from "../../stage/host";
import levels from "./levels.json";

/**
 * Voice mode's back end for the demo, kept in the top page as the service
 * worker and the offscreen document are in the extension: coere-v2's own
 * router (voice/background/route.ts) takes each AI site tab's port, and its
 * own offscreen host (voice/offscreen/host.ts) runs the holds, with the
 * fake build's pieces the e2e suite and the film use: the made up packs the
 * extension serves itself (public/voice-fake, downloaded and checked by the
 * real model store), the made up speech model that reveals its line a word
 * per stretch of voice (fake/engines.ts), and the made up voice that makes
 * a tone as long as Cori's line.
 *
 * Only three things stand in for the browser. The microphone makes frames
 * as loud, 20 ms by 20 ms, as the recorded question the film's fake
 * microphone played (levels.json, from tests/fixtures/voice/phrase.wav),
 * looping as Chromium's file microphone loops. The two workers run their
 * own message handling here in the page instead of in a Worker, since the
 * real ones read their packs from Cache Storage and load onnxruntime.
 * Playback keeps the tone's timing and plays nothing: the demo is silent.
 */

const EXTENSION_ID = "coere";
const ORIGIN = new URL(ASSETS, location.href).href;
const OFFSCREEN_URL = `${ORIGIN}offscreen.html`;

/** The made up packs at the address the demo serves them (lib/ext/voice-fake/), downloaded into a bucket in memory. */
const PACKS = fakePacks(ORIGIN);

function memoryStore(): ModelStore {
  const files = new Map<string, Uint8Array>();
  return createModelStore({
    open: async () => ({
      match: async (url: string) => {
        const bytes = files.get(url);
        return bytes ? new Response(bytes.slice(), { headers: { "content-length": String(bytes.length) } }) : undefined;
      },
      put: async (url: string, res: Response) => void files.set(url, new Uint8Array(await res.arrayBuffer())),
      keys: async () => [...files.keys()].map((url) => ({ url })),
    }),
    drop: async () => files.clear(),
    // The extension fetches with no credentials; the demo's files may sit behind the site's own sign in, so its cookie goes along.
    fetch: (url) => fetch(url, { credentials: "same-origin", cache: "no-store" }),
    sha256: webSha256,
  });
}

/** A worker's reply arrives as a message does: after the code that posted to it has run. */
function workerLike<In, Out>(handle: (m: In, post: (m: Out) => void) => void): WorkerLike<In, Out> {
  let gone = false;
  const w: WorkerLike<In, Out> = {
    onmessage: null,
    post: (m) => {
      if (!gone) setTimeout(() => !gone && handle(m, (out) => setTimeout(() => !gone && w.onmessage?.(out), 0)), 0);
    },
    terminate: () => void (gone = true),
  };
  return w;
}

const readJson = async <T>(store: ModelStore, pack: ModelPack, name: string): Promise<T> => {
  const bytes = await store.read(pack, name);
  if (!bytes) throw new Error("voice_not_downloaded");
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
};

/** engine/speech-worker.ts's handling, over the fake speech pack. */
function speechWorker(store: ModelStore): WorkerLike<SpeechIn, SpeechOut> {
  let factory: Promise<HearingFactory> | null = null;
  let hearing: Hearing | null = null;
  let early: Float32Array[] | null = null;
  return workerLike<SpeechIn, SpeechOut>((m, post) => {
    if (m.t === "load") {
      factory ??= readJson<FakeSpeechFile>(store, m.pack, "speech.json").then(fakeHearing);
      factory.then(
        () => post({ t: "ready" }),
        () => {
          factory = null;
          post({ t: "failed" });
        },
      );
      return;
    }
    if (m.t === "start") {
      hearing?.cancel();
      hearing = null;
      if (!factory) return post({ t: "failed" });
      const mine: Float32Array[] = [];
      early = mine;
      void factory.then(
        (make) => {
          if (early !== mine) return;
          early = null;
          hearing = make((text) => post({ t: "words", text }));
          for (const pcm of mine) hearing.feed(pcm);
        },
        () => post({ t: "failed" }),
      );
      return;
    }
    if (m.t === "feed") return hearing ? hearing.feed(m.pcm) : void early?.push(m.pcm);
    if (m.t === "cancel") {
      hearing?.cancel();
      hearing = null;
      early = null;
      return;
    }
    void (async () => {
      try {
        await factory;
        const h = hearing;
        hearing = null;
        post({ t: "final", text: h ? await h.finish() : "" });
      } catch {
        post({ t: "failed" });
      }
    })();
  });
}

/** engine/voice-worker.ts's handling, over the fake voice pack: Cori's line in clauses, each a tone as long as its words. */
function voiceWorker(store: ModelStore): WorkerLike<VoiceIn, VoiceOut> {
  let model: Promise<FakeVoiceFile> | null = null;
  let current = 0;
  return workerLike<VoiceIn, VoiceOut>((m, post) => {
    if (m.t === "load") {
      model ??= readJson<FakeVoiceFile>(store, m.pack, "voice.json");
      model.then(
        () => post({ t: "ready", backend: "wasm" }),
        () => {
          model = null;
          post({ t: "failed", id: null });
        },
      );
    } else if (m.t === "speak") {
      current = m.id;
      const id = m.id;
      void (async () => {
        if (!model) return post({ t: "failed", id });
        try {
          const voice = await model;
          const parts = clauses(m.text);
          for (const [i, part] of parts.entries()) {
            if (id !== current) return;
            const out = fakeSpeak(voice, part, m.speed);
            post({ t: "audio", id, rate: out.rate, samples: out.samples, last: i === parts.length - 1 });
          }
        } catch {
          if (id === current) post({ t: "failed", id });
        }
      })();
    } else current = 0;
  });
}

/**
 * offscreen/playback.ts's timing with no sound: clauses queue back to back,
 * `on` as the first starts and `off` when the last has had its length, or
 * at once on a hush.
 */
function silentPlayback(on: () => void, off: () => void): Playback {
  let endsAt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let speaking = false;
  const stop = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    endsAt = 0;
    if (speaking) {
      speaking = false;
      off();
    }
  };
  return {
    push(rate, samples, last) {
      const now = performance.now();
      endsAt = Math.max(now + 20, endsAt) + (samples.length / rate) * 1000;
      if (timer) clearTimeout(timer);
      timer = last ? setTimeout(stop, endsAt - now) : null;
      if (!speaking) {
        speaking = true;
        on();
      }
    },
    hush: stop,
  };
}

/** What the microphone hears while a hold lasts: her recorded question, looping as a file microphone does, or a quiet room. */
export type Heard = "question" | "quiet";

/** A quiet room, as coere-v2's e2e helper makes one for the silence gate (quietWav): far under the meter's floor. */
const QUIET_DB = -77;

/**
 * The microphone: a 16 kHz frame every 20 ms, as the capture worklet hands
 * them on, each as loud as that moment of what it hears. While the player
 * skips ahead unseen, frames come several to a tick.
 */
function microphone(fast: () => boolean, heard: () => Heard) {
  return async (frame: (pcm: Float32Array) => void): Promise<Capture> => {
    let at = 0;
    const clip = heard();
    const next = (): Float32Array => {
      const db = clip === "quiet" ? QUIET_DB : levels.db[at++ % levels.db.length]!;
      // A low tone at exactly this loudness: whole periods in a frame, so its RMS is the level itself.
      const amp = Math.SQRT2 * 10 ** (db / 20);
      return Float32Array.from({ length: 320 }, (_, i) => amp * Math.sin((2 * Math.PI * 200 * i) / 16000));
    };
    const id = setInterval(() => {
      for (let n = fast() ? 8 : 1; n > 0; n--) frame(next());
    }, levels.frameMs);
    return { close: () => clearInterval(id) };
  };
}

export interface VoiceBackEnd {
  router: VoiceRouter;
  /** The made up packs are in place: Voice mode was turned on in Settings, off camera. */
  ready: Promise<void>;
  /** Sets what the microphone hears at the next hold. */
  hear(clip: Heard): void;
  /** A tab's chrome.runtime.connect for the voice port, wired to the router. */
  connect(tab: string, siteUrl: string): (info?: { name?: string }) => unknown;
  dispose(): void;
}

/** The voice back end for one play of the film. */
export function voiceBackEnd(fast: () => boolean): VoiceBackEnd {
  const store = memoryStore();
  const models = createModels(store, PACKS);
  models.download(["speech", "voice"]);
  const live = new Set<() => void>();
  let gone = false;

  let host: VoiceHost | null = null;
  const router = createVoiceRouter({
    extensionId: EXTENSION_ID,
    extensionOrigin: ORIGIN,
    offscreenUrl: OFFSCREEN_URL,
    ensureOffscreen: async () => undefined,
    sendToOffscreen: async (msg) => {
      if (!isToOffscreen(msg) || !host) return false;
      const cmd = msg.cmd.t === "gone" ? { t: "gone" as const } : readCommand(msg.cmd);
      if (cmd) void host.command(msg.port, cmd).catch(() => undefined);
      return true;
    },
  });
  let clip: Heard = "question";
  const capture = microphone(fast, () => clip);
  host = createVoiceHost({
    packs: PACKS,
    models,
    speechWorker: () => speechWorker(store),
    voiceWorker: () => voiceWorker(store),
    capture: async (frame) => {
      const c = await capture(frame);
      live.add(c.close);
      return { close: () => (live.delete(c.close), c.close()) };
    },
    playback: silentPlayback,
    // Cori's own voice always loads here, so the system's voice is never asked for.
    systemSpeak: () => null,
    send: (port: string, event: VoiceEvent) => {
      if (gone) return;
      const msg: ToRouter = { ch: VOICE_CH, to: "router", port, event };
      router.message(msg, { id: EXTENSION_ID, url: OFFSCREEN_URL }, () => undefined);
    },
    after: (ms, run) => {
      const id = setTimeout(run, ms);
      return () => clearTimeout(id);
    },
  });

  return {
    router,
    ready: models.settled(),
    hear: (next) => void (clip = next),
    connect(tab, siteUrl) {
      return (info) => {
        if (info?.name !== VOICE_PORT) return deadPort(info?.name ?? "");
        // The tab's side and the worker's side of one port, as chrome.runtime.connect makes them.
        const toWorker = new Set<(m: unknown) => void>();
        const toTab = new Set<(m: unknown) => void>();
        const closeWorker = new Set<() => void>();
        const deliver = (set: Set<(m: unknown) => void>, m: unknown) => {
          for (const cb of [...set])
            try {
              cb(structuredClone(m));
            } catch {
              // A tab the film has moved on from.
            }
        };
        const sender = { id: EXTENSION_ID, url: siteUrl, frameId: 0 };
        // Only a top frame on a supported site, or a page of ours, may hold a voice port.
        if (!askerOf(sender, { extensionId: EXTENSION_ID, extensionOrigin: ORIGIN })) console.warn(`voice port from ${tab} would be refused`);
        const worker: PortLike = {
          name: VOICE_PORT,
          sender,
          postMessage: (m) => setTimeout(() => deliver(toTab, m), 0),
          disconnect: () => undefined,
          onMessage: { addListener: (cb) => void toWorker.add(cb) },
          onDisconnect: { addListener: (cb) => void closeWorker.add(cb) },
        };
        router.connect(worker);
        return {
          name: VOICE_PORT,
          postMessage: (m: unknown) => setTimeout(() => deliver(toWorker, m), 0),
          disconnect: () => closeWorker.forEach((cb) => cb()),
          onMessage: { addListener: (cb: (m: unknown) => void) => void toTab.add(cb), removeListener: (cb: (m: unknown) => void) => void toTab.delete(cb) },
          onDisconnect: { addListener: () => undefined, removeListener: () => undefined },
        };
      };
    },
    dispose() {
      gone = true;
      for (const close of live) close();
      live.clear();
    },
  };
}

function deadPort(name: string) {
  const none = { addListener: () => undefined, removeListener: () => undefined };
  return { name, postMessage: () => undefined, disconnect: () => undefined, onMessage: none, onDisconnect: none };
}
