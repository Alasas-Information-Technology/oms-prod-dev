"use client";

import * as React from "react";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface PageBarContextValue {
  actions: React.ReactNode | null;
  setActions: (actions: React.ReactNode | null) => void;
  customCrumbs: BreadcrumbCrumb[] | null;
  setCustomCrumbs: (crumbs: BreadcrumbCrumb[] | null) => void;
}

const PageBarContext = React.createContext<PageBarContextValue | null>(null);

export function PageBarProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = React.useState<React.ReactNode | null>(null);
  const [customCrumbs, setCustomCrumbs] = React.useState<BreadcrumbCrumb[] | null>(null);

  const value = React.useMemo(
    () => ({
      actions,
      setActions,
      customCrumbs,
      setCustomCrumbs,
    }),
    [actions, customCrumbs]
  );

  return (
    <PageBarContext.Provider value={value}>
      {children}
    </PageBarContext.Provider>
  );
}

export function usePageBar() {
  const context = React.useContext(PageBarContext);
  if (!context) {
    throw new Error("usePageBar must be used within a PageBarProvider");
  }
  return context;
}

export interface PageBarActionsProps {
  children: React.ReactNode;
}

/**
 * Component used by pages to inject actions (view switcher, export, primary action)
 * directly into the 56px sticky Page Bar.
 */
export function PageBarActions({ children }: PageBarActionsProps) {
  const { setActions } = usePageBar();

  React.useEffect(() => {
    setActions(children);
    return () => setActions(null);
  }, [children, setActions]);

  return null;
}

export interface PageBarBreadcrumbsProps {
  crumbs: BreadcrumbCrumb[];
}

/**
 * Component used by pages to override or append specific breadcrumbs into the Page Bar.
 */
export function PageBarBreadcrumbs({ crumbs }: PageBarBreadcrumbsProps) {
  const { setCustomCrumbs } = usePageBar();

  React.useEffect(() => {
    setCustomCrumbs(crumbs);
    return () => setCustomCrumbs(null);
  }, [crumbs, setCustomCrumbs]);

  return null;
}
