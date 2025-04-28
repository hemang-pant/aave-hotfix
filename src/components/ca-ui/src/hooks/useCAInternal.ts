import {
  CA,
  type ProgressSteps,
  type ProgressStep,
  type Intent as IntentType,
  type onAllowanceHookSource,
} from "@arcana/ca-sdk";
import { useState, useEffect, useRef } from "react";
import { clearAsyncInterval, setAsyncInterval } from "../utils/commonFunction";
import { useAccountEffect } from "wagmi";

type CurrentStep =
  | "ub"
  | "allowance"
  | "intent"
  | "progression"
  | "loading"
  | "none"
  | "error";

const useCAInternal = (ca: CA) => {
  const [currentStep, setCurrentStep] = useState<CurrentStep>("none");
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<Array<ProgressStep & { done: boolean }>>(
    []
  );
  const [intentRefreshing, setIntentRefreshing] = useState(false);
  const intentP = useRef({
    allow: () => {},
    deny: () => {},
    intent: undefined as IntentType | undefined,
    intervalHandler: null as null | number,
  });

  const allowanceP = useRef<{
    allow: ((s: Array<"min" | "max" | bigint | string>) => void) | null;
    deny: () => void;
    sources: Array<onAllowanceHookSource & { done: boolean }>;
  }>({
    allow: null,
    deny: () => {},
    sources: [],
  });

  const intentAllow = () => {
    if (intentP.current.intervalHandler != null) {
      clearAsyncInterval(intentP.current.intervalHandler);
      intentP.current.intervalHandler = null;
    }
    intentP.current.allow();
    setCurrentStep("progression");
  };

  const intentDeny = () => {
    if (intentP.current.intervalHandler != null) {
      console.log("setting intervalHandler");
      clearAsyncInterval(intentP.current.intervalHandler);
      intentP.current.intervalHandler = null;
    }
    intentP.current.deny();
  };

  useEffect(() => {
    if (error) {
      setCurrentStep("error");
    }
  }, [error]);

  useEffect(() => {
    if (ca) {
      ca.setOnIntentHook(async ({ intent, allow, deny, refresh }) => {
        console.log({ intent });
        intentP.current.allow = allow;
        intentP.current.deny = deny;
        intentP.current.intent = intent;
        intentP.current.intervalHandler = setAsyncInterval(async () => {
          console.time("intentRefresh");
          setIntentRefreshing(true);
          intentP.current.intent = await refresh();
          setIntentRefreshing(false);
          console.timeEnd("intentRefresh");
        }, 5000);
        setCurrentStep("intent");
      });

      ca.setOnAllowanceHook(async ({ allow, deny, sources }) => {
        allowanceP.current.sources = sources.map((s) => ({
          ...s,
          done: false,
        }));
        allowanceP.current.allow = allow;
        allowanceP.current.deny = deny;
        allowanceP.current.allow(sources.map((s) => "max"));
        setCurrentStep("allowance");
      });

      ca.caEvents.addListener("expected_steps", (data: ProgressSteps) => {
        setSteps(data.map((d) => ({ ...d, done: false })));
      });

      ca.caEvents.addListener("step_complete", (data: ProgressStep) => {
        setSteps((steps) => {
          return steps.map((s) => {
            if (s.type === data.type) {
              const ns = { ...s, done: true };
              if (data.data) {
                ns.data = data.data;
              }
              return ns;
            }
            return s;
          });
        });

        if (data.type === "ALLOWANCE_APPROVAL_MINED") {
          const tid = data.typeID.split("_")[1];
          const chainID = parseInt(tid, 10);
          const v = allowanceP.current.sources.find(
            (a) => a.chainID === chainID
          );
          if (v) {
            v.done = true;
          }
        }
      });
    }

    return () => {
      ca.caEvents.removeAllListeners("expected_steps");
      ca.caEvents.removeAllListeners("step_complete");
    };
  }, [ca]);

  return {
    setCurrentStep,
    intentRefreshing,
    steps,
    currentStep,
    intentP,
    intentAllow,
    intentDeny,
    allowanceP,
    error,
    setError,
  };
};

const useProvideCA = (ca: CA) => {
  const [ready, setReady] = useState(false);
  useAccountEffect({
    async onConnect({ connector }) {
      try {
        const p = await connector.getProvider();
        ca.setEVMProvider(p as any);
        await ca.init();
        setReady(true);
      } catch (e) {
        console.log("ca did not connect. err = ", e);
      }
    },
    onDisconnect() {
      ca.deinit();
      setReady(false);
    },
  });
  return { ca, ready };
};

export { useProvideCA, useCAInternal, CurrentStep };
