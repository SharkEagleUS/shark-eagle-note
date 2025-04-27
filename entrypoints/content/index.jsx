import React from "react";
import ReactDOM from "react-dom/client";
import {MantineProvider} from "@mantine/core";
// Remember to import Mantine's styles
import "@mantine/core/styles.css";
import "./content-ui.scss";
import Sidebar from './components/Sidebar.jsx';

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createUi(ctx);
    ui.mount();
  },
});

//
// Mantine doesn't work with shadow roots by default. We have to pass custom
// values for the MantineProvider's `cssVariablesSelector` and `getRootElement`
// options.
//
// We'll point both at the HTML element inside the shadow root WXT creates.
//

function createUi(ctx) {
  return createShadowRootUi(ctx, {
    name: "shark-eagle-note-chrome-ext-wxt",
    position: "inline",
    append: "first",
    onMount(uiContainer, shadow) {
      const app = document.createElement("div");
      uiContainer.append(app);

      // Create a root on the UI container and render a component
      const root = ReactDOM.createRoot(app);
      root.render(
        <React.StrictMode>
          <MantineProvider
            theme={theme}
            cssVariablesSelector="html"
            getRootElement={() => shadow.querySelector("html")}
          >
            <Sidebar/>
          </MantineProvider>
        </React.StrictMode>,
      );
      return root;
    },
    onRemove(root) {
      root?.unmount();
    },
  });
}
