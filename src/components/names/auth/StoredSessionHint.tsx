import { AUTH_STORAGE_KEY } from "@/lib/names/supabase";

// Runs while the HTML parses: on a device that keeps a session, hide the server-rendered
// signed-out screen (SignedOutView) until React takes over and shows the skeleton or redirects.
const SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(AUTH_STORAGE_KEY)})!==null){var s=document.createElement("style");s.textContent="[data-names-gate]{visibility:hidden}";document.head.appendChild(s)}}catch(e){}`;

/** Put first in a page whose signed-out view the server renders (welcome, join). */
export default function StoredSessionHint() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
