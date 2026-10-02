"use client";

import { useCallback, useEffect, useState } from "react";
import { createSeedStore } from "./salary-grade.data";
import {
  applyCreation,
  decodeStore,
} from "./salary-grade.utils";
import type {
  CreateGradeInput,
  GradeStore,
} from "./salary-grade.types";

export const SALARY_GRADE_STORAGE_KEY =
  "oms.salary-grade.demo.v1";

const readStore = (): GradeStore => {
  const raw = window.localStorage.getItem(
    SALARY_GRADE_STORAGE_KEY,
  );

  return raw === null ? createSeedStore() : decodeStore(raw);
};

// Replace this hook with authenticated backend API calls later.
export function useSalaryGrades() {
  const [store, setStore] =
    useState<GradeStore>(createSeedStore);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] =
    useState<string | null>(null);

  useEffect(() => {
    function load() {
      try {
        setStore(readStore());
        setStorageError(null);
      } catch {
        setStorageError(
          "Saved demo data could not be read. Existing data has not been overwritten. Check browser storage, then reload.",
        );
      } finally {
        setReady(true);
      }
    }

    load();

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === SALARY_GRADE_STORAGE_KEY ||
        event.key === null
      ) {
        load();
      }
    };

    window.addEventListener("storage", onStorage);

    return () =>
      window.removeEventListener("storage", onStorage);
  }, []);

  const create = useCallback(
    (input: CreateGradeInput) => {
      if (!ready || storageError) {
        throw new Error(
          "Demo storage is unavailable. Reload before saving.",
        );
      }

      // Check current saved data again before creating anything.
      const latest = readStore();

      const result = applyCreation(
        latest,
        input,
        () => crypto.randomUUID(),
      );

      try {
        window.localStorage.setItem(
          SALARY_GRADE_STORAGE_KEY,
          JSON.stringify(result.store),
        );
      } catch {
        throw new Error(
          "Could not save in this browser. Your form is still open; check storage space or browser permissions and retry.",
        );
      }

      setStore(result.store);
      return result;
    },
    [ready, storageError],
  );

  return { store, ready, storageError, create };
}