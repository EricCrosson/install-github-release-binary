import * as core from "@actions/core";
import { Octokit as BaseOctokit } from "@octokit/rest";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";

const Octokit = BaseOctokit.plugin(retry).plugin(throttling);
export type Octokit = InstanceType<typeof Octokit>;

export function getOctokit(token: string): Octokit {
  return new Octokit({
    auth: token,
    request: { retries: 3 },
    throttle: {
      onRateLimit: (retryAfter, options: any) => {
        core.warning(
          `RateLimit detected for request ${options.method} ${options.url}.`,
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options: any) => {
        // does not retry, only logs a warning
        core.warning(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}.`,
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
      },
    },
  });
}
