import { useState, useEffect, useCallback, useRef } from "react";

export type MediaPermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

export type MediaDeviceErrorType =
  | "permission-denied"
  | "not-found"
  | "in-use"
  | "overconstrained"
  | "unsupported"
  | "unknown";

export interface MediaDeviceErrorInfo {
  type: MediaDeviceErrorType;
  message: string;
  actionHint: string;
}

export interface MediaDeviceStatus {
  hasSupport: boolean;
  permission: MediaPermissionState;
  hasDevice: boolean;
  deviceLabel?: string;
  error?: MediaDeviceErrorInfo;
}

export interface MediaPermissionsState {
  camera: MediaDeviceStatus;
  microphone: MediaDeviceStatus;
  isChecking: boolean;
}

/**
 * Classifies getUserMedia errors into clear, actionable error messages and hints
 */
export function classifyMediaError(
  err: unknown,
  kind: "camera" | "microphone",
): MediaDeviceErrorInfo {
  const error = err as Error;
  const name = error?.name || "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      type: "permission-denied",
      message: `${kind === "camera" ? "Camera" : "Microphone"} permission was denied.`,
      actionHint: `Click the lock or camera icon in your browser's address bar and set ${
        kind === "camera" ? "Camera" : "Microphone"
      } to "Allow", then click Retry.`,
    };
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      type: "not-found",
      message: `No ${kind} found on this device.`,
      actionHint: `Please connect a ${
        kind === "camera" ? "webcam" : "microphone"
      } or verify it is recognized by your operating system.`,
    };
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      type: "in-use",
      message: `${kind === "camera" ? "Camera" : "Microphone"} is already in use by another app.`,
      actionHint: `Close other programs that might be using the ${kind} (such as Teams, Zoom app, Google Meet, or OBS) and try again.`,
    };
  }

  if (name === "OverconstrainedError") {
    return {
      type: "overconstrained",
      message: `Requested ${kind} resolution or settings are not supported.`,
      actionHint: "We will attempt to connect with standard default settings.",
    };
  }

  if (name === "SecurityError") {
    return {
      type: "unsupported",
      message: "Media access is blocked due to security settings.",
      actionHint: "Ensure this application is running over HTTPS or on localhost.",
    };
  }

  return {
    type: "unknown",
    message: error?.message || `Failed to access ${kind}.`,
    actionHint: "Please check your browser and system device permissions.",
  };
}

/**
 * Checks queryable permission status using navigator.permissions
 */
export async function queryPermissionStatus(
  name: "camera" | "microphone",
): Promise<MediaPermissionState> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "prompt";
  }

  try {
    const status = await navigator.permissions.query({
      name: name as PermissionName,
    });
    return status.state as MediaPermissionState;
  } catch {
    // Some browsers (e.g. Firefox) throw TypeError for 'camera' / 'microphone' queries
    return "prompt";
  }
}

/**
 * Creates an audio volume level monitor using Web Audio API
 */
export function createAudioMeter(
  stream: MediaStream,
  onVolumeChange: (volume: number) => void,
): () => void {
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let animationFrameId: number | null = null;
  let isClosed = false;

  try {
    const AudioContextClass =
      window.AudioContext ||
      // @ts-expect-error webkitAudioContext fallback
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return () => {};
    }

    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      if (isClosed || !analyser) return;

      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Normalize to 0-100 range with sensitivity boost
      const normalizedVolume = Math.min(100, Math.round((average / 128) * 100));
      onVolumeChange(normalizedVolume);

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();
  } catch (err) {
    console.warn("AudioContext setup failed:", err);
  }

  return () => {
    isClosed = true;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    if (source) {
      try {
        source.disconnect();
      } catch {
        // ignore
      }
    }
    if (audioContext && audioContext.state !== "closed") {
      audioContext.close().catch(() => {});
    }
  };
}

/**
 * Hook to manage camera and microphone permissions and device discovery
 */
export function useMediaPermissions() {
  const [permissions, setPermissions] = useState<MediaPermissionsState>({
    camera: {
      hasSupport: typeof navigator !== "undefined" && !!navigator.mediaDevices,
      permission: "prompt",
      hasDevice: false,
    },
    microphone: {
      hasSupport: typeof navigator !== "undefined" && !!navigator.mediaDevices,
      permission: "prompt",
      hasDevice: false,
    },
    isChecking: true,
  });

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
  const permissionStatusListenersRef = useRef<Array<() => void>>([]);

  const refreshDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      setPermissions((prev) => ({
        ...prev,
        camera: { ...prev.camera, hasSupport: false, permission: "unsupported" },
        microphone: { ...prev.microphone, hasSupport: false, permission: "unsupported" },
        isChecking: false,
      }));
      return;
    }

    try {
      const [cameraPerm, micPerm] = await Promise.all([
        queryPermissionStatus("camera"),
        queryPermissionStatus("microphone"),
      ]);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const audioInputs = devices.filter((d) => d.kind === "audioinput");

      setAvailableCameras(videoInputs);
      setAvailableMicrophones(audioInputs);

      setPermissions((prev) => ({
        camera: {
          ...prev.camera,
          hasSupport: true,
          permission: cameraPerm,
          hasDevice: videoInputs.length > 0,
          deviceLabel: videoInputs[0]?.label || undefined,
        },
        microphone: {
          ...prev.microphone,
          hasSupport: true,
          permission: micPerm,
          hasDevice: audioInputs.length > 0,
          deviceLabel: audioInputs[0]?.label || undefined,
        },
        isChecking: false,
      }));
    } catch (err) {
      console.warn("Failed to enumerate media devices:", err);
      setPermissions((prev) => ({ ...prev, isChecking: false }));
    }
  }, []);

  // Set up permission listeners if supported
  useEffect(() => {
    refreshDevices();

    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      const names: Array<"camera" | "microphone"> = ["camera", "microphone"];
      names.forEach((name) => {
        navigator.permissions
          .query({ name: name as PermissionName })
          .then((status) => {
            const handleChange = () => {
              setPermissions((prev) => ({
                ...prev,
                [name]: {
                  ...prev[name],
                  permission: status.state as MediaPermissionState,
                  error:
                    status.state === "granted" ? undefined : prev[name].error,
                },
              }));
              refreshDevices();
            };
            status.addEventListener("change", handleChange);
            permissionStatusListenersRef.current.push(() => {
              status.removeEventListener("change", handleChange);
            });
          })
          .catch(() => {
            // Permission query unsupported for this name
          });
      });
    }

    // Listen to physical device plug/unplug events
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      const handleDeviceChange = () => {
        refreshDevices();
      };
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
      permissionStatusListenersRef.current.push(() => {
        navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
      });
    }

    return () => {
      permissionStatusListenersRef.current.forEach((clean) => clean());
      permissionStatusListenersRef.current = [];
    };
  }, [refreshDevices]);

  // Request camera access explicitly
  const requestCamera = useCallback(
    async (
      constraints?: MediaTrackConstraints,
    ): Promise<{ stream: MediaStream | null; error?: MediaDeviceErrorInfo }> => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        const errorInfo: MediaDeviceErrorInfo = {
          type: "unsupported",
          message: "Media devices are not supported in this browser environment.",
          actionHint: "Please open this page in a secure modern browser (Chrome, Firefox, Edge, Safari).",
        };
        setPermissions((prev) => ({
          ...prev,
          camera: { ...prev.camera, error: errorInfo, permission: "unsupported" },
        }));
        return { stream: null, error: errorInfo };
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints || { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        const activeTrack = stream.getVideoTracks()[0];
        setPermissions((prev) => ({
          ...prev,
          camera: {
            ...prev.camera,
            permission: "granted",
            hasDevice: true,
            deviceLabel: activeTrack?.label || prev.camera.deviceLabel,
            error: undefined,
          },
        }));

        refreshDevices();
        return { stream };
      } catch (err) {
        const errorInfo = classifyMediaError(err, "camera");
        setPermissions((prev) => ({
          ...prev,
          camera: {
            ...prev.camera,
            permission: errorInfo.type === "permission-denied" ? "denied" : prev.camera.permission,
            error: errorInfo,
          },
        }));
        return { stream: null, error: errorInfo };
      }
    },
    [refreshDevices],
  );

  // Request microphone access explicitly
  const requestMicrophone = useCallback(async (): Promise<{
    stream: MediaStream | null;
    error?: MediaDeviceErrorInfo;
  }> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const errorInfo: MediaDeviceErrorInfo = {
        type: "unsupported",
        message: "Microphone access is not supported in this browser.",
        actionHint: "Please open this page in a modern browser with HTTPS.",
      };
      setPermissions((prev) => ({
        ...prev,
        microphone: { ...prev.microphone, error: errorInfo, permission: "unsupported" },
      }));
      return { stream: null, error: errorInfo };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      const activeTrack = stream.getAudioTracks()[0];
      setPermissions((prev) => ({
        ...prev,
        microphone: {
          ...prev.microphone,
          permission: "granted",
          hasDevice: true,
          deviceLabel: activeTrack?.label || prev.microphone.deviceLabel,
          error: undefined,
        },
      }));

      refreshDevices();
      return { stream };
    } catch (err) {
      const errorInfo = classifyMediaError(err, "microphone");
      setPermissions((prev) => ({
        ...prev,
        microphone: {
          ...prev.microphone,
          permission: errorInfo.type === "permission-denied" ? "denied" : prev.microphone.permission,
          error: errorInfo,
        },
      }));
      return { stream: null, error: errorInfo };
    }
  }, [refreshDevices]);

  return {
    permissions,
    availableCameras,
    availableMicrophones,
    refreshDevices,
    requestCamera,
    requestMicrophone,
  };
}
