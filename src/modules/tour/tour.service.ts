import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router";
import { queryClient } from "@/lib/query-client";
import { getLeadsProvider, type LeadsListResponse } from "@/modules/leads/leads.api";
import { tourSpeech, type SpeechState } from "./tour-speech.service";
import { useTourStore } from "./tour.store";
import type { TourDefinition, TourStepConfig } from "./tour.types";

const isLeadDetailsStep = (id: string) => id.startsWith("step-lead-detail");
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

function pathsMatch(currentPath: string, targetRoute: string): boolean {
  const normalize = (path: string) =>
    path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const current = normalize(currentPath);
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

export class TourCoordinator {
  private driverObj: Driver | null = null;
  private navigate: NavigateFunction | null = null;
  private currentTour: TourDefinition | null = null;
  private stepToken = 0;
  private unsubscribe: (() => void) | null = null;
  private currentSpeechUnsub: (() => void) | null = null;

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

  public async startTour(tour: TourDefinition, startIndex = 0) {
    this.stopTour();
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

  public async goToStep(index: number) {
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

    if (!targetRoute && isLeadDetailsStep(step.id)) {
      this.presentStep(step, index, null);
      return;
    }

    const currentPath = window.location.pathname;
    if (
      targetRoute &&
      this.navigate &&
      !pathsMatch(currentPath, targetRoute)
    ) {
      this.navigate(targetRoute);
    }

    const timeoutMs = isLeadDetailsStep(step.id) ? 8000 : 4000;
    const element = await this.waitForElement(step.element, timeoutMs);
    if (token !== this.stepToken || !this.currentTour || !this.driverObj) return;

    if (!element) {
      if (isLeadDetailsStep(step.id)) {
        this.presentStep(step, index, null);
        return;
      }

      console.warn(`[Tour] Element not found: ${step.element}. Skipping to next step.`);
      if (index + 1 < this.currentTour.steps.length) {
        await this.goToStep(index + 1);
      } else {
        this.completeTour();
      }
      return;
    }

    this.presentStep(step, index, step.element);
  }

  private async resolveStepRoute(step: TourStepConfig): Promise<string | null> {
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
    const description =
      element === null && isLeadDetailsStep(step.id)
        ? "No active leads are available yet. Once a lead exists, this workspace tracks communication history, call notes, reminders, and linked quotes."
        : step.description;

    this.driverObj.highlight({
      ...(element ? { element } : {}),
      popover: {
        title: step.title,
        description,
        side: step.side || "bottom",
        align: step.align || "start",
        showButtons: ["next", "previous", "close"],
        disableButtons: isFirst ? ["previous"] : [],
        showProgress: true,
        progressText: `${index + 1} of ${total}`,
        nextBtnText: isLast ? "Finish ✓" : "Next →",
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
                  : step.speechText || step.description;
              tourSpeech.speak(textToSpeak, false);
              return;
            }

            useTourStore.getState().toggleAudioMute();
          };

          this.currentSpeechUnsub = tourSpeech.onStateChange((state) => {
            updateBadge(state);
          });
        },
        onNextClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          void this.goToStep(index + 1);
        },
        onPrevClick: () => {
          this.cleanupSpeechSubscription();
          tourSpeech.stop();
          void this.goToStep(Math.max(0, index - 1));
        },
        onCloseClick: () => {
          this.cleanupSpeechSubscription();
          this.stopTour();
        },
      },
    });

    const isMuted = useTourStore.getState().isAudioMuted;
    const speech =
      element === null && isLeadDetailsStep(step.id)
        ? "There are no leads yet. The deal workspace will appear here after the first inquiry is captured."
        : step.speechText || step.description;

    tourSpeech.speak(speech, isMuted);
  }

  public completeTour() {
    if (this.currentTour) {
      useTourStore.getState().markTourCompleted(this.currentTour.id);
    }
    this.stopTour();
  }

  public stopTour() {
    this.cleanupSpeechSubscription();
    tourSpeech.stop();
    this.stepToken += 1;
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
