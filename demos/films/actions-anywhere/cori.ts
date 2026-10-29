import { readPlan, actionOf } from "@v2/packages/memory/src/cori-route/actions/plan";
import { ACTION_CAPABILITIES } from "@v2/packages/memory/src/cori-route/actions/registry";
import { actionAnswer } from "@v2/apps/extension/src/cori/engine/route/gate-answers";
import type { Env } from "@v2/apps/extension/src/cori/engine/answers/build";
import type { CoriAskResult } from "@v2/apps/extension/src/lib/cori-messages";
import { planOf } from "@v2/tests/fake-claude/scenarios/act";

/**
 * Cori's answer to a line asked in the toolbar popup, as the service
 * worker gives it in a v2 build: act@1 plans the line (coere-v2's fake
 * Haiku, the `act` scenario), the engine's plan reader checks it against
 * the capabilities, and the gate's action answer hands the popup a
 * `browser_action` act with the person's own line. Nothing runs from the
 * answer itself; the popup starts the run on the page it opened over.
 */
export function answerAction(line: string): CoriAskResult {
  const input = planOf({ line, capabilities: ACTION_CAPABILITIES.map((c) => ({ kind: c.kind, fields: [...c.fields] })) });
  const message = { stop_reason: "tool_use", content: [{ type: "tool_use", id: "toolu_act_1", name: "plan_action", input }] };
  const plan = readPlan(message as never);
  const env = { ctx: { version: 2, surface: "popup" } } as unknown as Env;
  const draft = actionAnswer(env, actionOf(plan), line);
  return {
    answer: draft.answer,
    state: null,
    log: { intent: draft.answer.intent, answer: draft.answer.id, outcome: draft.answer.outcome, conf: 90, stage: 0, hits: 0, followUp: false, gated: true, ms: 420 },
  };
}
