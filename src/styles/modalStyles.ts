/** Modal styles — aligned with fleet maintenancePlan constants */

export const MODAL_CONTAINER_CLASS = "flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl";

export const MODAL_HEADER_CLASS =
  "flex w-full shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-6 py-4";

export const MODAL_BODY_CLASS = "flex-1 overflow-y-auto px-6 py-5";

export const MODAL_FOOTER_CLASS =
  "flex w-full shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4";

export const MODAL_BTN_BASE =
  "inline-flex h-9 min-h-9 items-center justify-center gap-1.5 rounded-md border px-4 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-50";

export const MODAL_BTN_CANCEL_CLASS = `${MODAL_BTN_BASE} border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;

export const MODAL_BTN_PRIMARY_CLASS = `${MODAL_BTN_BASE} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`;

export const MODAL_BTN_DANGER_CLASS = `${MODAL_BTN_BASE} border-red-600 bg-red-600 text-white hover:bg-red-700`;

export const MODAL_FIELD_ROOT_CLASS = "w-full min-w-0 space-y-1.5";

export const MODAL_SELECT_TRIGGER_CLASS =
  "box-border flex min-h-10 w-full max-w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-0 text-sm shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export const MODAL_SEARCH_CONTROL_CLASS =
  "flex h-10 max-h-10 min-h-10 min-w-0 items-center rounded-lg border border-gray-300 bg-white px-3 py-0 shadow-sm";

export const MODAL_NATIVE_INPUT_CLASS =
  "box-border h-10 min-h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

export const MODAL_NATIVE_INPUT_INNER_CLASS =
  "min-h-0 w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-sm text-slate-900 shadow-none outline-none ring-0 focus:ring-0";

export const MODAL_HEADING_CLASS = "text-lg font-semibold text-slate-900";
