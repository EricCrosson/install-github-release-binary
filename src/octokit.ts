import * as core from "@actions/core";
import { GitHub, getOctokitOptions } from "@actions/github/lib/utils";
import { throttling } from "@octokit/plugin-throttling";

const ThrottlingOctokit = GitHub.plugin(throttling);
export type Octokit = ReturnType<typeof getOctokit>;

export function getOctokit(token: string) {
  return new ThrottlingOctokit({
    throttle: {
      onRateLimit: (retryAfter: number, options: any) => {
        core.warning(
          `RateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
        return true;
      },
      onSecondaryRateLimit: (retryAfter: number, options: any) => {
        core.warning(
          `SecondaryRateLimit detected for request ${options.method} ${options.url}.`
        );
        core.info(`Retrying after ${retryAfter} seconds.`);
        return true;
      },
    },
    ...getOctokitOptions(token),
  });
}
