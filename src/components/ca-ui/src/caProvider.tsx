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
import { CA } from "@arcana/ca-sdk";
import { useCAInternal, useProvideCA, VIEW } from "./hooks/useCAInternal";
import { Config } from "./types";

export const CAProvider = ({
  children,
  client,
  config,
}: {
  config?: Config;
  client: CA;
  children?: React.ReactNode;
}) => {
  const { ca, ready, address } = useProvideCA(client);
  const {
    intent,
    intentAllow,
    intentDeny,
    intentRefreshing,
    allowanceSources,
    steps,
    setView,
    view,
    error,
    setError,
  } = useCAInternal(ca);

  return (
    <>
      <GlobalStyles />
      <CAContext.Provider value={{ ca, ready, address }}>
        <ThemeProvider theme={config?.theme}>
          <CAErrorContext.Provider value={{ error, setError }}>
            <CAUnifiedBalanceContext.Provider
              value={{
                visible: view === VIEW.UB,
                setVisible: (v) => setView(v ? VIEW.UB : VIEW.NONE),
              }}
            >
              <>
                <Modal
                  alwaysOnTop={true}
                  isopen={view !== VIEW.NONE}
                >
                  <AllowanceSetup
                    $display={view === VIEW.ALLOWANCE}
                    sources={allowanceSources}
                  />
                  <IntentView
                    $display={view === VIEW.INTENT}
                    intent={intent}
                    allow={intentAllow}
                    deny={intentDeny}
                    intentRefreshing={intentRefreshing}
                  />
                  <Progress
                    intentSteps={steps}
                    $display={view === VIEW.PROGRESSION}
                    close={() => setView(VIEW.NONE)}
                  />
                  <UnifiedBalance
                    $display={view === VIEW.UB}
                    close={() => setView(VIEW.NONE)}
                  />
                  <ErrorBox
                    $display={view === VIEW.ERROR}
                    message={error}
                    close={() => {
                      setError("");
                      setView(VIEW.NONE);
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
