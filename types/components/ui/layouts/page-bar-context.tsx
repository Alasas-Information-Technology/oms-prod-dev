"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface PageBarContextValue {
  actions: React.ReactNode | null;
  setActions: (actions: React.ReactNode | null) => void;
  customCrumbs: BreadcrumbCrumb[] | null;
  setCustomCrumbs: (crumbs: BreadcrumbCrumb[] | null | ((prev: BreadcrumbCrumb[] | null) => BreadcrumbCrumb[] | null)) => void;
}

export interface PageBarDispatchValue {
  setActions: (actions: React.ReactNode | null) => void;
  setCustomCrumbs: (crumbs: BreadcrumbCrumb[] | null | ((prev: BreadcrumbCrumb[] | null) => BreadcrumbCrumb[] | null)) => void;
}

const PageBarStateContext = React.createContext<{
  actions: React.ReactNode | null;
  customCrumbs: BreadcrumbCrumb[] | null;
} | null>(null);

const PageBarDispatchContext = React.createContext<PageBarDispatchValue | null>(null);

export function PageBarProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActionsState] = React.useState<React.ReactNode | null>(null);
  const [customCrumbs, setCustomCrumbsState] = React.useState<BreadcrumbCrumb[] | null>(null);

  const setActions = React.useCallback((newActions: React.ReactNode | null) => {
    setActionsState((prev) => (prev === newActions ? prev : newActions));
  }, []);

  const setCustomCrumbs = React.useCallback(
    (
      newCrumbs:
        | BreadcrumbCrumb[]
        | null
        | ((prev: BreadcrumbCrumb[] | null) => BreadcrumbCrumb[] | null)
    ) => {
      setCustomCrumbsState((prev) => {
        const resolved = typeof newCrumbs === "function" ? newCrumbs(prev) : newCrumbs;
        if (prev === resolved) return prev;
        if (Array.isArray(prev) && Array.isArray(resolved)) {
          if (
            prev.length === resolved.length &&
            prev.every(
              (p, i) =>
                p.label === resolved[i].label &&
                p.href === resolved[i].href &&
                p.isCurrent === resolved[i].isCurrent
            )
          ) {
            return prev;
          }
        }
        return resolved;
      });
    },
    []
  );

  const stateValue = React.useMemo(
    () => ({
      actions,
      customCrumbs,
    }),
    [actions, customCrumbs]
  );

  const dispatchValue = React.useMemo(
    () => ({
      setActions,
      setCustomCrumbs,
    }),
    [setActions, setCustomCrumbs]
  );

  return (
    <PageBarDispatchContext.Provider value={dispatchValue}>
      <PageBarStateContext.Provider value={stateValue}>
        {children}
      </PageBarStateContext.Provider>
    </PageBarDispatchContext.Provider>
  );
}

export function usePageBar(): PageBarContextValue {
  const state = React.useContext(PageBarStateContext);
  const dispatch = React.useContext(PageBarDispatchContext);
  if (!state || !dispatch) {
    throw new Error("usePageBar must be used within a PageBarProvider");
  }
  return {
    ...state,
    ...dispatch,
  };
}

export function usePageBarDispatch(): PageBarDispatchValue {
  const dispatch = React.useContext(PageBarDispatchContext);
  if (!dispatch) {
    throw new Error("usePageBarDispatch must be used within a PageBarProvider");
  }
  return dispatch;
}

export interface PageBarActionsProps {
  children: React.ReactNode;
}

/**
 * Component used by pages to inject actions (view switcher, export, primary action)
 * directly into the 56px sticky Page Bar.
 * Uses a Portal when the DOM slot exists to eliminate re-render loops.
 */
export function PageBarActions({ children }: PageBarActionsProps) {
  const { setActions } = usePageBarDispatch();
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = document.getElementById("page-bar-actions-slot");
    if (el) {
      setTargetElement(el);
    } else {
      setActions(children);
    }
    return () => {
      if (!el) {
        setActions(null);
      }
    };
  }, [setActions, targetElement ? undefined : children]);

  if (targetElement) {
    return ReactDOM.createPortal(children, targetElement);
  }

  return null;
}

export interface PageBarBreadcrumbsProps {
  crumbs: BreadcrumbCrumb[];
}

/**
 * Component used by pages to override or append specific breadcrumbs into the Page Bar.
 */
export function PageBarBreadcrumbs({ crumbs }: PageBarBreadcrumbsProps) {
  const { setCustomCrumbs } = usePageBarDispatch();

  React.useEffect(() => {
    setCustomCrumbs(crumbs);
    return () => setCustomCrumbs(null);
  }, [crumbs, setCustomCrumbs]);

  return null;
}
