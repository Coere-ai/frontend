// The toolbar popup over the page it opened on, as the film framed it
// (coere-v2 tools/demo-video/actions/stage.ts popupOver): the page under
// it fills the window and Coere's own popup page sits where Chrome draws
// it, under the toolbar button at the window's right, 360 by 600. Here
// the page under it is fake Gmail in a frame nobody presses, and the popup
// is the extension's own entry, mounted in this page.
import "../../stage/tab/ext-setup";
import "./popup-frame";
import "@v2/apps/extension/src/entrypoints/popup/main";
