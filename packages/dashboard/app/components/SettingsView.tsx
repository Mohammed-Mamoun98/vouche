"use client";

import { useState } from "react";
import { PageHeader } from "./PageHeader";

export function SettingsView() {
  const [autoReview, setAutoReview] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  return (
    <>
      <PageHeader title="Settings" description="Configure your vouch setup" />

      <div className="mb-6">
        <h2 className="text-xs font-medium text-dim uppercase tracking-wide mb-2">
          General
        </h2>
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-edge">
            <div className="flex flex-col gap-0.5">
              <div className="text-[13px] font-medium text-text">
                Auto-review on push
              </div>
              <div className="text-[11px] text-dim">
                Automatically trigger reviews when branches are pushed
              </div>
            </div>
            <label className="relative inline-block w-9 h-5">
              <input
                type="checkbox"
                role="switch"
                checked={autoReview}
                onChange={(e) => setAutoReview(e.target.checked)}
                aria-checked={autoReview}
                aria-label="Auto-review on push"
                className="peer sr-only"
              />
              <span className="absolute cursor-pointer inset-0 bg-subtle border border-edge-strong rounded-[10px] transition-colors duration-200 before:absolute before:content-[''] before:h-[14px] before:w-[14px] before:left-[2px] before:bottom-[2px] before:bg-dim before:rounded-full before:transition-[transform,background] duration-200 peer-checked:bg-accent-dim peer-checked:border-accent peer-checked:before:bg-accent peer-checked:before:translate-x-4" />
            </label>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <div className="text-[13px] font-medium text-text">
                Slack notifications
              </div>
              <div className="text-[11px] text-dim">
                Get notified in Slack when reviews complete
              </div>
            </div>
            <label className="relative inline-block w-9 h-5">
              <input
                type="checkbox"
                role="switch"
                checked={slackNotifications}
                onChange={(e) => setSlackNotifications(e.target.checked)}
                aria-checked={slackNotifications}
                aria-label="Slack notifications"
                className="peer sr-only"
              />
              <span className="absolute cursor-pointer inset-0 bg-subtle border border-edge-strong rounded-[10px] transition-colors duration-200 before:absolute before:content-[''] before:h-[14px] before:w-[14px] before:left-[2px] before:bottom-[2px] before:bg-dim before:rounded-full before:transition-[transform,background] duration-200 peer-checked:bg-accent-dim peer-checked:border-accent peer-checked:before:bg-accent peer-checked:before:translate-x-4" />
            </label>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-medium text-dim uppercase tracking-wide mb-2">
          Review Thresholds
        </h2>
        <div className="bg-surface border border-edge rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-edge">
            <div className="flex flex-col gap-0.5">
              <div className="text-[13px] font-medium text-text">
                Flag below confidence
              </div>
              <div className="text-[11px] text-dim">
                Flag reviews with confidence below this threshold
              </div>
            </div>
            <select
              className="bg-elevated border border-edge-strong rounded-[5px] text-text text-xs px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-accent"
              defaultValue="70"
            >
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <div className="text-[13px] font-medium text-text">
                Max review duration
              </div>
              <div className="text-[11px] text-dim">
                Maximum time to wait for a review (in seconds)
              </div>
            </div>
            <select
              className="bg-elevated border border-edge-strong rounded-[5px] text-text text-xs px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-accent"
              defaultValue="300"
            >
              <option value="60">1 min</option>
              <option value="180">3 min</option>
              <option value="300">5 min</option>
              <option value="600">10 min</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
