import type { ZoomSessionConfig } from "./zoom.types";

declare global {
  interface Window {
    ZoomMtgEmbedded?: {
      createClient: () => ZoomEmbeddedClient;
    };
  }
}

export interface ZoomEmbeddedClient {
  init: (options: {
    zoomAppRoot: HTMLElement | null;
    language?: string;
    customize?: Record<string, unknown>;
  }) => Promise<void>;
  join: (options: {
    sdkKey: string;
    signature: string;
    meetingNumber: string;
    password?: string;
    userName: string;
    userEmail?: string;
    zak?: string;
  }) => Promise<void>;
  leaveMeeting: () => Promise<void>;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

const ZOOM_SDK_CDN_URL = "https://source.zoom.us/zoom-meeting-embedded-3.9.0.min.js";

/**
 * Loads the official Zoom Meeting SDK script dynamically.
 */
export async function loadZoomMeetingSDK(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.ZoomMtgEmbedded) return true;

  return new Promise((resolve) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${ZOOM_SDK_CDN_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = ZOOM_SDK_CDN_URL;
    script.async = true;
    script.onload = () => {
      resolve(!!window.ZoomMtgEmbedded);
    };
    script.onerror = () => {
      console.warn("Failed to load Zoom Meeting SDK from CDN. Operating in local mode.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initializes and joins an embedded Zoom meeting inside a specified container element.
 */
export async function initZoomMeetingClient(
  container: HTMLElement,
  config: ZoomSessionConfig,
  onMeetingEnd?: () => void,
): Promise<ZoomEmbeddedClient | null> {
  const isLoaded = await loadZoomMeetingSDK();

  if (!isLoaded || !window.ZoomMtgEmbedded) {
    return null;
  }

  try {
    const client = window.ZoomMtgEmbedded.createClient();

    await client.init({
      zoomAppRoot: container,
      language: "en-US",
      customize: {
        meetingInfo: ["topic", "host", "mn", "pwd", "telPwd", "invite", "participant", "dc", "enctype"],
        toolbar: {
          buttons: [
            { category: "icon", name: "audio" },
            { category: "icon", name: "video" },
            { category: "icon", name: "share" },
            { category: "icon", name: "chat" },
            { category: "icon", name: "participant" },
          ],
        },
      },
    });

    if (onMeetingEnd) {
      client.on("connection-change", (payload: unknown) => {
        const state = (payload as { state?: string })?.state;
        if (state === "Closed") {
          onMeetingEnd();
        }
      });
    }

    // Only attempt real Zoom join if real credentials (not placeholders) are present
    const isRealCredential =
      config.sdkKey &&
      config.sdkKey !== "demo_sdk_key" &&
      config.signature &&
      config.signature !== "demo_signature_token";

    if (isRealCredential) {
      await client.join({
        sdkKey: config.sdkKey,
        signature: config.signature,
        meetingNumber: config.meetingNumber.replace(/\s+/g, ""),
        password: config.password,
        userName: config.userName,
        userEmail: config.userEmail,
        zak: config.zakToken,
      });
    }

    return client;
  } catch (error) {
    console.error("Zoom SDK init/join error:", error);
    return null;
  }
}
