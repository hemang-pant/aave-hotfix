import React from "react";
import { CA } from "@arcana/ca-sdk";

export const CAContext = React.createContext<{
  ca: CA | null;
  ready: boolean;
  address: `0x${string}` | undefined
}>({
  ready: false,
  ca: null,
  address: undefined
});

export const CAErrorContext = React.createContext<{
  error: null | string;
  setError: (err: string) => void;
}>({
  error: "",
  setError: () => {},
});

export const CAUnifiedBalanceContext = React.createContext<{
  visible: boolean;
  setVisible: (b: boolean) => void;
}>({
  visible: false,
  setVisible: () => {},
});
