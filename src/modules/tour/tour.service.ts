import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router";
import { queryClient } from "@/lib/query-client";
import { getLeadsProvider, type LeadsListResponse } from "@/modules/leads/leads.api";
import {
  getSalesCustomersProvider,
  getSalesCustomerProjectsProvider,
  type GetSalesCustomersResponse,
  type GetSalesCustomerProjectsResponse,
} from "@/modules/customers/customers.api";
import {
  getEstimatesListProvider,
  type EstimatesListResponse,
} from "@/modules/quotation-generator/estimates.api";
import { tourSpeech, type SpeechState } from "./tour-speech.service";
import { useTourStore } from "./tour.store";
import type { TourDefinition, TourStepConfig, TourId } from "./tour.types";
import { salesPipelineTour } from "./tours/sales-pipeline.tour";
import { leadsDeepDiveTour } from "./tours/leads-deep-dive.tour";
import { quotationDeepDiveTour } from "./tours/quotation-deep-dive.tour";

export const TOURS_REGISTRY: Record<TourId, TourDefinition> = {
  "sales-pipeline": salesPipelineTour,
  "leads-deep-dive": leadsDeepDiveTour,
  "quotation-deep-dive": quotationDeepDiveTour,
};

interface ResumeTourContext {
  tourId: TourId;
  stepIndex: number;
}

const isLeadDetailsStep = (id: string) =>
  id.startsWith("step-lead-detail") ||
  id.startsWith("step-lead-tab") ||
  id.startsWith("step-lead-subpage");

const isEstimateDetailsStep = (id: string) =>
  id.startsWith("step-estimate-") || id.startsWith("step-submit-approval");
const DESKTOP_TOUR_WIDTH = 1024;

function isTourTargetVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (!element.isConnected) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  return true;
}

function pathsMatch(currentPathWithSearch: string, targetRoute: string): boolean {
  const normalize = (path: string) =>
    path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const current = normalize(currentPathWithSearch);
  const target = normalize(targetRoute);
  if (target === "/" || target === "/dashboard") {
    return current === "/" || current === "/dashboard";
  }
  return current === target;
}

function readCachedLeadId(): string | null {
  const entries = queryClient.getQueriesData<LeadsListResponse>({
    queryKey: ["sales", "leads"],
  });

  for (const [queryKey, data] of entries) {
    const scope = queryKey[2];
    if (scope !== undefined && typeof scope !== "object") continue;
    const leadId = data?.data?.leads?.[0]?._id;
    if (leadId) return leadId;
  }

  return null;
}

async function resolveFirstLeadId(): Promise<string | null> {
  const cached = readCachedLeadId();
  if (cached) return cached;

  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["sales", "leads", { page: 1, limit: 1, tour: true }],
      queryFn: () => getLeadsProvider({ page: 1, limit: 1 }),
    });
    return fresh.data?.leads?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a lead for the deal workspace.", error);
    return null;
  }
}

function readCachedCustomerId(): string | null {
  const entries = queryClient.getQueriesData<GetSalesCustomersResponse>({
    queryKey: ["customers", "list"],
  });

  for (const [, data] of entries) {
    const customerId = data?.data?.customers?.[0]?._id;
    if (customerId) return customerId;
  }

  return null;
}

async function resolveFirstCustomerId(): Promise<string | null> {
  const cached = readCachedCustomerId();
  if (cached) return cached;

  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["customers", "list", 1, 1, "tour"],
      queryFn: () => getSalesCustomersProvider(1, 1),
    });
    return fresh.data?.customers?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a customer ID.", error);
    return null;
  }
}

function readCachedProjectId(customerId?: string): string | null {
  const entries = queryClient.getQueriesData<GetSalesCustomerProjectsResponse>({
    queryKey: customerId
      ? ["customers", "sales-projects", customerId]
      : ["customers", "sales-projects"],
  });

  for (const [, data] of entries) {
    const projectId = data?.data?.projects?.[0]?._id;
    if (projectId) return projectId;
  }

  return null;
}

async function resolveFirstProjectId(customerId?: string): Promise<string | null> {
  const targetCustId = customerId || (await resolveFirstCustomerId());
  if (!targetCustId) return null;

  const cached = readCachedProjectId(targetCustId);
  if (cached) return cached;

  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["customers", "sales-projects", targetCustId, 1, 1, "tour"],
      queryFn: () => getSalesCustomerProjectsProvider(targetCustId, 1, 1),
    });
    return fresh.data?.projects?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve a customer project ID.", error);
    return null;
  }
}

function readCachedEstimateId(): string | null {
  const entries = queryClient.getQueriesData<EstimatesListResponse>({
    queryKey: ["sales", "estimates"],
  });

  for (const [, data] of entries) {
    const estimateId = data?.data?.estimates?.[0]?._id;
    if (estimateId) return estimateId;
  }

  return null;
}

async function resolveFirstEstimateId(): Promise<string | null> {
  const cached = readCachedEstimateId();
  if (cached) return cached;

  try {
    const fresh = await queryClient.fetchQuery({
      queryKey: ["sales", "estimates", 1, 1, "", "tour"],
      queryFn: () => getEstimatesListProvider({ page: 1, limit: 1 }),
    });
    return fresh.data?.estimates?.[0]?._id ?? null;
  } catch (error) {
    console.warn("[Tour] Unable to resolve an estimate ID.", error);
    return null;
  }
}

export class TourCoordinator {
  private driverObj: Driver | null = null;
  private navigate: NavigateFunction | null = null;
  private currentTour: TourDefinition | null = null;
  private stepToken = 0;
  private unsubscribe: (() => void) | null = null;
  private currentSpeechUnsub: (() => void) | null = null;
  private resumeContext: ResumeTourContext | null = null;

  private cleanupSpeechSubscription() {
    if (this.currentSpeechUnsub) {
      this.currentSpeechUnsub();
      this.currentSpeechUnsub = null;
    }
  }

  public init(navigate: NavigateFunction) {
    this.navigate = navigate;
    if (this.unsubscribe) return;

    this.unsubscribe = useTourStore.subscribe((state, previous) => {
      if (state.isAudioMuted === previous.isAudioMuted) return;
      if (state.isAudioMuted) {
        tourSpeech.stop("muted");
        return;
      }

      const step = this.currentTour?.steps[state.currentStepIndex];
      if (!step) return;
      const textToSpeak =
        document.querySelector(step.element) === null &&
        isLeadDetailsStep(step.id)
          ? "There are no leads yet. The deal workspace will appear here after the first inquiry is captured."
          : document.querySelector(step.element) === null &&
            isEstimateDetailsStep(step.id)
          ? "No saved estimates are available yet in the history. Save an estimate draft first to review formal estimate packages and submit them for approval."
          : step.speechText || step.description;
      tourSpeech.speak(textToSpeak, false);
    });
  }

  private async waitForElement(
    selector: string,
    timeoutMs = 4000,
  ): Promise<Element | null> {
    const existing = document.querySelector(selector);
    if (existing && isTourTargetVisible(existing)) return existing;

    return new Promise((resolve) => {
      let timeoutId = 0;
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element && isTourTargetVisible(element)) {
          window.clearTimeout(timeoutId);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      timeoutId = window.setTimeout(() => {
        observer.disconnect();
        const element = document.querySelector(selector);
        resolve(element && isTourTargetVisible(element) ? element : null);
      }, timeoutMs);
    });
  }

  public async startTour(
    tour: TourDefinition,
    startIndex = 0,
    resumeContext?: ResumeTourContext | null,
  ) {
    this.stopTour(false);
    if (resumeContext !== undefined) {
      this.resumeContext = resumeContext;
    }
    tourSpeech.prime();
    this.currentTour = tour;
    useTourStore.getState().setActiveTour(tour.id);

    if (window.innerWidth < DESKTOP_TOUR_WIDTH) {
      toast.info(
        "This tour is designed for desktop. Hidden navigation steps are skipped on smaller screens.",
      );
    }

    this.driverObj = driver({
      animate: true,
      allowClose: true,
      overlayClickBehavior: "none",
      overlayColor: "rgba(15, 23, 42, 0.7)",
      stagePadding: 8,
      stageRadius: 8,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish Tour ✓",
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      onDestroyed: (_element, _step, opts) => {
        if (opts.reason === "replaced") return;
        this.cleanupSpeechSubscription();
        tourSpeech.stop();
        this.currentTour = null;
        this.driverObj = null;
        if (useTourStore.getState().activeTourId) {
          useTourStore.getState().setActiveTour(null);
        }
      },
    });

    await this.goToStep(startIndex);
  }

  public async goToStep(
    index: number,
    direction: "forward" | "backward" = "forward",
  ) {
    if (!this.currentTour || !this.driverObj) return;
    const token = ++this.stepToken;
    const step = this.currentTour.steps[index];
    if (!step) {
      this.completeTour();
      return;
    }

    useTourStore.getState().setCurrentStepIndex(index);

    const targetRoute = await this.resolveStepRoute(step);
    if (token !== this.stepToken) return;

    const isSpecialStep = isLeadDetailsStep(step.id) || isEstimateDetailsStep(step.id);

    if (!targetRoute) {
      if (isSpecialStep) {
        this.presentStep(step, index, null);
        return;
      }

      console.info(`[Tour] Route not available for step: ${step.id}. Skipping.`);
      const nextIndex = direction === "forward" ? index + 1 : index - 1;
      if (nextIndex >= 0 && nextIndex < this.currentTour.steps.length) {
        await this.goToStep(nextIndex, direction);
      } else {
        this.completeTour();
      }
      return;
    }

    const currentPath = window.location.pathname + window.location.search;
    if (
      targetRoute &&
      this.navigate &&
      !pathsMatch(currentPath, targetRoute)
    ) {
      this.navigate(targetRoute);
    }

    const timeoutMs = isSpecialStep ? 8000 : 4000;
    const element = await this.waitForElement(step.element, timeoutMs);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return;

    if (!element) {
      if (isSpecialStep) {
        this.presentStep(step, index, null);
        return;
      }

      console.warn(`[Tour] Element not found: ${step.element}. Skipping to next step.`);
      const nextIndex = direction === "forward" ? index + 1 : index - 1;
      if (nextIndex >= 0 && nextIndex < this.currentTour.steps.length) {
        await this.goToStep(nextIndex, direction);
      } else {
        this.completeTour();
      }
      return;
    }

    this.presentStep(step, index, step.element);
  }

  private async resolveStepRoute(step: TourStepConfig): Promise<string | null> {
    if (step.route.includes(":projectId")) {
      const projectId = await resolveFirstProjectId();
      return projectId ? step.route.replace(":projectId", projectId) : null;
    }
    if (step.route.includes(":customerId")) {
      const customerId = await resolveFirstCustomerId();
      return customerId ? step.route.replace(":customerId", customerId) : null;
    }
    if (step.route.includes(":leadId")) {
      const leadId = await resolveFirstLeadId();
      return leadId ? step.route.replace(":leadId", leadId) : null;
    }
    if (step.route.includes(":estimateId")) {
      const estimateId = await resolveFirstEstimateId();
      return estimateId ? step.route.replace(":estimateId", estimateId) : "/quotation/history";
    }
    if (!isLeadDetailsStep(step.id)) return step.route;
    const leadId = await resolveFirstLeadId();
    return leadId ? `/leads/${leadId}` : null;
  }

  private presentStep(
    step: TourStepConfig,
    index: number,
    element: string | null,
  ) {
    if (!this.currentTour || !this.driverObj) return;

    if (element) {
      const domEl = document.querySelector(element);
      if (domEl) {
        domEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const total = this.currentTour.steps.length;
    const isFirst = index === 0;
    const isLast = index === total - 1;
    let description =
      element === null && isLeadDetailsStep(step.id)
        ? "No active leads are available yet. Once a lead exists, this workspace tracks communication history, call notes, reminders, and linked quotes."
        : element === null && isEstimateDetailsStep(step.id)
        ? "No saved estimates are available yet in the history. Save an estimate draft first to review formal estimate packages and submit them for approval."
        : step.description;

    let speech =
      element === null && isLeadDetailsStep(step.id)
        ? "There are no leads yet. The deal workspace will appear here after the first inquiry is captured."
        : element === null && isEstimateDetailsStep(step.id)
        ? "No saved estimates are available yet. Save an estimate draft first to review formal packages and submit for approval."
        : step.speechText || step.description;

    if (isLast && this.resumeContext) {
      const tourName = this.currentTour.name || "deep dive";
      description =
        `You've completed the ${tourName} walkthrough! Click 'Continue Sales Tour' below to return to the core tour.`;
      speech =
        `You've completed the ${tourName} walkthrough! Click Continue Sales Tour to resume the core sales tour.`;
    }

    const nextBtnText = isLast
      ? (this.resumeContext ? "Continue Sales Tour →" : "Finish Tour ✓")
      : "Next →";

    this.driverObj.highlight({
      ...(element ? { element } : {}),
      popover: {
        title: isLast && this.resumeContext ? `${this.currentTour.name} Complete!` : step.title,
        description,
        side: step.side || "bottom",
        align: step.align || "start",
        showButtons: ["next", "previous", "close"],
        disableButtons: isFirst ? ["previous"] : [],
        showProgress: true,
        progressText: `${index + 1} of ${total}`,
        nextBtnText,
        prevBtnText: "← Back",
        onPopoverRender: (popoverDOM) => {
          this.cleanupSpeechSubscription();

          let badge = popoverDOM.wrapper.querySelector<HTMLButtonElement>(
            ".tour-speaker-status-badge",
          );
          if (!badge) {
            badge = document.createElement("button");
            badge.type = "button";
            badge.className = "tour-speaker-status-badge";
            badge.setAttribute("aria-label", "Tour speech status");
            if (popoverDOM.title && popoverDOM.title.parentNode) {
              popoverDOM.wrapper.insertBefore(badge, popoverDOM.title);
            } else {
              popoverDOM.wrapper.prepend(badge);
            }
          }

          const updateBadge = (state: SpeechState) => {
            if (!badge) return;
            badge.className = `tour-speaker-status-badge ${state}`;
            if (state === "speaking") {
              badge.innerHTML = `<span class="tour-pulse-dot"></span><span>🔊 Voice: Speaking...</span>`;
              badge.title = "Audio guide is playing (Click to mute)";
            } else if (state === "finished") {
              badge.innerHTML = `<span>✓ Voice: Finished</span>`;
              badge.title = "Audio guide completed (Click to replay)";
            } else if (state === "muted") {
              badge.innerHTML = `<span>🔇 Voice: Muted</span>`;
              badge.title = "Audio is muted (Click to unmute and play)";
            } else {
              badge.innerHTML = `<span>🔈 Voice: Ready</span>`;
              badge.title = "Click to play audio guidance";
            }
          };

          badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            tourSpeech.prime();
            const currentState = tourSpeech.getState();
            const currentlyMuted = useTourStore.getState().isAudioMuted;

            if (currentState === "finished" && !currentlyMuted) {
              const textToSpeak =
                element === null && isLeadDetailsStep(step.id)
                  ? "There are no leads yet. The deal workspace will appear here after the first inquiry is captured."
                  : element === null && isEstimateDetailsStep(step.id)
                  ? "No saved estimates are available yet in the history. Save an estimate draft first to review formal estimate packages and submit them for approval."
                  : isLast && this.resumeContext
                    ? `You've completed the ${this.currentTour?.name || "walkthrough"}! Click Continue Sales Tour to resume the core sales tour.`
                    : step.speechText || step.description;
              tourSpeech.speak(textToSpeak, false);
              return;
            }

            useTourStore.getState().toggleAudioMute();
          };

          this.currentSpeechUnsub = tourSpeech.onStateChange((state) => {
            updateBadge(state);
          });

          // Handle Branching Button
          const existingBranchBox = popoverDOM.wrapper.querySelector(
            ".tour-branch-container",
          );
          if (step.branch) {
            if (!existingBranchBox) {
              const branchBox = document.createElement("div");
              branchBox.className = "tour-branch-container";

              const promptEl = document.createElement("div");
              promptEl.className = "tour-branch-prompt";
              promptEl.textContent =
                step.branch.description ||
                "Want to explore this section in depth?";

              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "tour-branch-btn";
              btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span>${step.branch.label}</span>
              `;

              btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetTour = TOURS_REGISTRY[step.branch!.tourId];
                if (!targetTour) return;

                const resumeStepIndex =
                  step.branch!.resumeStepIndex ?? index + 1;
                const resumeCtx: ResumeTourContext = {
                  tourId: this.currentTour!.id,
                  stepIndex: resumeStepIndex,
                };

                toast.info(`Launching ${targetTour.name}...`);
                void this.startTour(targetTour, 0, resumeCtx);
              };

              branchBox.appendChild(promptEl);
              branchBox.appendChild(btn);

              if (popoverDOM.description && popoverDOM.description.parentNode) {
                popoverDOM.description.parentNode.insertBefore(
                  branchBox,
                  popoverDOM.description.nextSibling,
                );
              } else if (popoverDOM.footer) {
                popoverDOM.wrapper.insertBefore(branchBox, popoverDOM.footer);
              } else {
                popoverDOM.wrapper.appendChild(branchBox);
              }
            }
          } else if (existingBranchBox) {
            existingBranchBox.remove();
          }
        },
        onNextClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          void this.goToStep(index + 1, "forward");
        },
        onPrevClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          void this.goToStep(Math.max(0, index - 1), "backward");
        },
        onCloseClick: () => {
          this.cleanupSpeechSubscription();
          this.stopTour(true);
        },
      },
    });

    const isMuted = useTourStore.getState().isAudioMuted;
    tourSpeech.speak(speech, isMuted);
  }

  public completeTour() {
    if (this.currentTour) {
      useTourStore.getState().markTourCompleted(this.currentTour.id);
    }

    if (this.resumeContext) {
      const { tourId, stepIndex } = this.resumeContext;
      const completedTourName = this.currentTour?.name || "Walkthrough";
      this.resumeContext = null;
      const targetTour = TOURS_REGISTRY[tourId];
      if (targetTour) {
        toast.success(
          `${completedTourName} complete! Resuming Sales Tour...`,
          {
            action: {
              label: "Exit Tour",
              onClick: () => this.stopTour(true),
            },
          },
        );
        void this.startTour(targetTour, stepIndex, null);
        return;
      }
    }

    this.stopTour(true);
  }

  public stopTour(clearResume = true) {
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    this.stepToken += 1;
    if (clearResume) {
      this.resumeContext = null;
    }
    if (this.driverObj) {
      const activeDriver = this.driverObj;
      this.driverObj = null;
      this.currentTour = null;
      activeDriver.destroy();
      return;
    }
    this.currentTour = null;
  }
}

export const tourCoordinator = new TourCoordinator();
