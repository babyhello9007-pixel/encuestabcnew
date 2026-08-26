import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initFavicon } from "./lib/faviconLoader";
import { lazy, Suspense, useEffect } from "react";
import Home from "./pages/Home";
import NotFound from "@/pages/NotFound";

const Survey = lazy(() => import("./pages/Survey"));
const NanoEncuestaBC = lazy(() => import("./pages/NanoEncuestaBC"));
const Results = lazy(() => import("./pages/Results"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const CodeEditor = lazy(() => import("./pages/CodeEditor"));
const LeaderSurvey = lazy(() => import("./pages/LeaderSurvey"));
const SurveysVarias = lazy(() => import("./pages/SurveysVarias"));
const Bio = lazy(() => import("./pages/Bio"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminBlogLogin = lazy(() => import("./pages/AdminBlogLogin"));
const DiscordCallback = lazy(() => import("./pages/DiscordCallback"));
const CoalitionsComparison = lazy(() => import("./pages/CoalitionsComparison"));
const PartiesDocumentation = lazy(() => import("./pages/PartiesDocumentation"));
const AdminParties = lazy(() => import("./pages/AdminParties"));
const AdminStatistics = lazy(() => import("./pages/AdminStatistics"));
const SimuladorBCGuide = lazy(() => import("./pages/SimuladorBCGuide"));
const Primarias = lazy(() => import("./pages/Primarias"));
const TestPolitico = lazy(() => import("./pages/TestPolitico"));
const ValorarLideres = lazy(() => import("./pages/ValorarLideres"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/encuesta"} component={Survey} />
      <Route path={"/nano-encuesta"} component={NanoEncuestaBC} />

      <Route path={"/encuestas-varias"} component={SurveysVarias} />
      <Route path={"/resultados"} component={Results} />
      <Route path={"/simulador-bc-guia"} component={SimuladorBCGuide} />
      <Route path={"/respuestas"} component={Results} />
      <Route path={"/primarias"} component={Primarias} />
      <Route path={"/test-politico"} component={TestPolitico} />
      <Route path={"/valorar-lideres"} component={ValorarLideres} />
      <Route path={"/acerca-de"} component={About} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/editor"} component={CodeEditor} />
      <Route path={"/bio"} component={Bio} />
      <Route path={"/linktree"} component={Bio} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:id"} component={BlogPost} />
      <Route path={"/coaliciones-comparar"} component={CoalitionsComparison} />
      <Route path={"/documentacion/partidos"} component={PartiesDocumentation} />
      <Route path={"/admin/partidos"} component={AdminParties} />
      <Route path={"/admin/estadisticas"} component={AdminStatistics} />
      <Route path={"/auth/discord/callback"} component={DiscordCallback} />
      <Route path={"/admin/blog/login"} component={AdminBlogLogin} />
      <Route path={"/admin/blog"} component={AdminBlogLogin} />
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
          <Suspense fallback={<div className="min-h-screen bg-[#080b17] text-white flex items-center justify-center font-[TVP]">Cargando…</div>}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
