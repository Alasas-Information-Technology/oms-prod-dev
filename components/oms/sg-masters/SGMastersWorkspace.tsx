"use client";

import { useEffect, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { usePageBarDispatch } from "@/components/ui/layouts/page-bar-context";

import { GradeMasterWorkspace } from "@/components/oms/grade-master/GradeMasterWorkspace";
import { CategoryMasterWorkspace } from "@/components/oms/category-master/CategoryMasterWorkspace";
import { AdditionalMasterWorkspace } from "./AdditionalMasterWorkspace";

import styles from "./SGMasters.module.css";

const MASTER_TABS = [
  { value: "grade", label: "Grade Master" },
  { value: "category", label: "Category Master" },
  { value: "deployment", label: "Deployment Model" },
  { value: "designation", label: "Designation Master" },
];

export function SGMastersWorkspace() {
  const { setCustomCrumbs } = usePageBarDispatch();
  const [activeTab, setActiveTab] = useState("grade");

  const activeLabel =
    MASTER_TABS.find((tab) => tab.value === activeTab)?.label ??
    "Grade Master";

  useEffect(() => {
    setCustomCrumbs([
      { label: "Salary & Grade" },
      { label: "S&G Masters" },
      { label: activeLabel, isCurrent: true },
    ]);
  }, [activeLabel, setCustomCrumbs]);

  useEffect(() => {
    return () => {
      setCustomCrumbs(null);
    };
  }, [setCustomCrumbs]);

  return (
    <div className={styles.page}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className={styles.tabs}
      >
        <div className={styles.topRow}>
          <h1 className={styles.heading}>{activeLabel}</h1>

          <TabsList
            aria-label="Salary and Grade masters"
            className={styles.tabList}
          >
            {MASTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={styles.tabTrigger}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent
          value="grade"
          forceMount
          hidden={activeTab !== "grade"}
          className={styles.tabContent}
        >
          <GradeMasterWorkspace embedded />
        </TabsContent>

        <TabsContent
          value="category"
          forceMount
          hidden={activeTab !== "category"}
          className={styles.tabContent}
        >
          <CategoryMasterWorkspace embedded />
        </TabsContent>

        <TabsContent
          value="deployment"
          forceMount
          hidden={activeTab !== "deployment"}
          className={styles.tabContent}
        >
          <AdditionalMasterWorkspace kind="deployment" />
        </TabsContent>

        <TabsContent
          value="designation"
          forceMount
          hidden={activeTab !== "designation"}
          className={styles.tabContent}
        >
          <AdditionalMasterWorkspace kind="designation" />
        </TabsContent>
      </Tabs>
    </div>
  );
}