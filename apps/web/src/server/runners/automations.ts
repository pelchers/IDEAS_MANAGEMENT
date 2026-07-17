import { prisma } from "@/server/db";
import { dispatchCommand } from "./runners";
import type { AutomationTrigger } from "@/generated/prisma";

export interface AutomationCondition {
  status?: string;
  projectId?: string;
}

/**
 * Evaluate a user's automation rules for a task event and dispatch matching
 * commands to their runners. Best-effort — never throws into the caller.
 */
export async function runAutomations(
  userId: string,
  trigger: AutomationTrigger,
  ctx: { taskId: string; status?: string; projectId?: string | null }
): Promise<number> {
  try {
    const rules = await prisma.automationRule.findMany({ where: { userId, trigger, enabled: true } });
    let fired = 0;
    for (const rule of rules) {
      const cond = (rule.conditionJson ?? {}) as AutomationCondition;
      if (cond.status && cond.status !== ctx.status) continue;
      if (cond.projectId && cond.projectId !== ctx.projectId) continue;
      if (!rule.runnerId) continue;
      const cmd = await dispatchCommand(userId, {
        runnerId: rule.runnerId,
        command: rule.command,
        taskId: ctx.taskId,
        source: "automation",
      });
      if (cmd) fired++;
    }
    return fired;
  } catch {
    return 0;
  }
}
