/** The names service worker (public/names/sw.js) and the scope it controls. */
export const SW_URL = "/names/sw.js";
/** "/names", not "/names/": the swipe screen is /names itself (see manifest.ts). */
export const SW_SCOPE = "/names";

/** Production builds only; dev keeps hot reload free of cached pages. */
export function shouldRegisterWorker(nodeEnv: string | undefined, hasServiceWorker: boolean): boolean {
  return nodeEnv === "production" && hasServiceWorker;
}

export const UPDATE_TEXT = "עדכון זמין";
export const UPDATE_ACTION = "רענון";

type WorkerLike = Pick<ServiceWorker, "state" | "postMessage" | "addEventListener">;
type RegistrationLike = {
  waiting: WorkerLike | null;
  installing: WorkerLike | null;
  addEventListener(type: "updatefound", listener: () => void): void;
  removeEventListener(type: "updatefound", listener: () => void): void;
  update(): Promise<unknown>;
};
type ContainerLike = {
  controller: unknown;
  addEventListener(type: "controllerchange", listener: () => void): void;
  removeEventListener(type: "controllerchange", listener: () => void): void;
};

/**
 * Offers an update when a new worker is installed and waiting behind a controlling one
 * (a first install has no controller: nothing to update). `apply()` asks the waiting
 * worker to skip waiting; the page reloads once it takes control, and only then, so a
 * worker that takes over on its own never reloads a page mid-swipe. Returns a stop function.
 */
export function watchForUpdates(
  reg: RegistrationLike,
  container: ContainerLike,
  onUpdate: (apply: () => void) => void,
  reload: () => void,
): () => void {
  let requested = false;
  let offered: WorkerLike | null = null;
  const offer = (worker: WorkerLike) => {
    if (!container.controller || offered === worker) return;
    offered = worker;
    onUpdate(() => {
      requested = true;
      worker.postMessage({ type: "SKIP_WAITING" });
    });
  };
  const onFound = () => {
    const worker = reg.installing;
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed") offer(worker);
    });
  };
  const onControllerChange = () => {
    if (requested) reload();
  };
  if (reg.waiting) offer(reg.waiting);
  reg.addEventListener("updatefound", onFound);
  container.addEventListener("controllerchange", onControllerChange);
  return () => {
    reg.removeEventListener("updatefound", onFound);
    container.removeEventListener("controllerchange", onControllerChange);
  };
}
