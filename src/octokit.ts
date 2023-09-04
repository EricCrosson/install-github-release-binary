import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { throttling } from "@octokit/plugin-throttling";

export type { Octokit } from "@octokit/rest";

const ThrottlingOctokit = Octokit.plugin(throttling);

export function getOctokit(token: string): Octokit {
  return new ThrottlingOctokit({
    auth: token,
    throttle: {
      onRateLimit: (retryAfter, options: any) => {
        core.warning(
          `RateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter, options: any) => {
        // does not retry, only logs a warning
        core.warning(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
      },
    },
  });
}
