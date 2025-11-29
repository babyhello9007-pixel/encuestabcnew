import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initFavicon } from "./lib/faviconLoader";
import Home from "./pages/Home";
import { useEffect } from "react";
import Survey from "./pages/Survey";
import NanoEncuestaBC from "./pages/NanoEncuestaBC";
import Results from "./pages/Results";
import About from "./pages/About";
import Admin from "./pages/Admin";
import CodeEditor from "./pages/CodeEditor";
import LeaderSurvey from "./pages/LeaderSurvey";
import Bio from "./pages/Bio";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/encuesta"} component={Survey} />
      <Route path={"/nano-encuesta"} component={NanoEncuestaBC} />
      <Route path={"/lideres"} component={LeaderSurvey} />
      <Route path={"/resultados"} component={Results} />
      <Route path={"/acerca-de"} component={About} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/editor"} component={CodeEditor} />
      <Route path={"/bio"} component={Bio} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Forzar carga del favicon al montar la aplicación
    initFavicon();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

