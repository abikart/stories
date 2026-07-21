import type * as React from "react";

type JellyElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  [attribute: string]: unknown;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "jelly-accordion": JellyElementProps;
      "jelly-alert": JellyElementProps;
      "jelly-badge": JellyElementProps;
      "jelly-breadcrumbs": JellyElementProps;
      "jelly-button": JellyElementProps;
      "jelly-card": JellyElementProps;
      "jelly-checkbox": JellyElementProps;
      "jelly-chip": JellyElementProps;
      "jelly-collapsible": JellyElementProps;
      "jelly-dialog": JellyElementProps;
      "jelly-divider": JellyElementProps;
      "jelly-drawer": JellyElementProps;
      "jelly-icon-button": JellyElementProps;
      "jelly-input": JellyElementProps;
      "jelly-kbd": JellyElementProps;
      "jelly-label": JellyElementProps;
      "jelly-menu": JellyElementProps;
      "jelly-menu-item": JellyElementProps;
      "jelly-option": JellyElementProps;
      "jelly-otp": JellyElementProps;
      "jelly-pagination": JellyElementProps;
      "jelly-popover": JellyElementProps;
      "jelly-progress": JellyElementProps;
      "jelly-radio": JellyElementProps;
      "jelly-radio-group": JellyElementProps;
      "jelly-range": JellyElementProps;
      "jelly-resizable": JellyElementProps;
      "jelly-segment": JellyElementProps;
      "jelly-segmented": JellyElementProps;
      "jelly-select": JellyElementProps;
      "jelly-skeleton": JellyElementProps;
      "jelly-slider": JellyElementProps;
      "jelly-spinner": JellyElementProps;
      "jelly-switch": JellyElementProps;
      "jelly-tab-panel": JellyElementProps;
      "jelly-tabs": JellyElementProps;
      "jelly-textarea": JellyElementProps;
      "jelly-theme": JellyElementProps;
      "jelly-toaster": JellyElementProps;
      "jelly-tooltip": JellyElementProps;
    }
  }
}
