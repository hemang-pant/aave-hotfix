import { CAContext, CAErrorContext, CAUnifiedBalanceContext } from "./context";
import React from "react";
import IntentView from "./components/IntentView";
import Modal from "./components/shared/Modal";
import ThemeProvider from "./components/ThemeProvider";
import Progress from "./components/Progression";
import AllowanceSetup from "./components/AllowanceSetup";
import UnifiedBalance from "./components/UnifiedBalance";
import GlobalStyles from "./components/GlobalStyles";
import ErrorBox from "./components/Error";
import { getCA } from "./ca";
import { useCAInternal, useProvideCA } from "./hooks/useCAInternal";
import Decimal from "decimal.js";

Decimal.set({ toExpNeg: -18 });

export const CAProvider = ({
  children,
  network,
}: {
  network?: "testnet" | "dev";
  children?: React.ReactNode;
}) => {
  const provider = getCA(network);
  const { ca, ready } = useProvideCA(provider);
  const {
    steps,
    setCurrentStep,
    currentStep,
    intentP,
    allowanceP,
    intentRefreshing,
    intentDeny,
    intentAllow,
    error,
    setError,
  } = useCAInternal(ca);

  return (
    <>
      <GlobalStyles />
      <CAContext.Provider value={{ ca, ready }}>
        <ThemeProvider>
          <CAErrorContext.Provider value={{ error, setError }}>
            <CAUnifiedBalanceContext.Provider
              value={{
                visible: currentStep === "ub",
                setVisible: (v) => setCurrentStep(v ? "ub" : "none"),
              }}
            >
              <>
                <Modal
                  alwaysOnTop={currentStep !== "progression"}
                  isopen={currentStep !== "none"}
                >
                  <AllowanceSetup
                    $display={currentStep === "allowance"}
                    sources={allowanceP.current.sources}
                  />
                  <IntentView
                    $display={currentStep === "intent"}
                    intent={intentP.current.intent}
                    allow={intentAllow}
                    deny={intentDeny}
                    intentRefreshing={intentRefreshing}
                  />
                  <Progress
                    intentSteps={steps}
                    $display={currentStep === "progression"}
                    close={() => setCurrentStep("none")}
                  />
                  <UnifiedBalance
                    $display={currentStep === "ub"}
                    close={() => setCurrentStep("none")}
                  />
                  <ErrorBox
                    $display={currentStep === "error"}
                    message={error}
                    close={() => {
                      setError("");
                      setCurrentStep("none");
                    }}
                  />
                </Modal>
              </>
              <>{children}</>
            </CAUnifiedBalanceContext.Provider>
          </CAErrorContext.Provider>
        </ThemeProvider>
      </CAContext.Provider>
    </>
  );
};
