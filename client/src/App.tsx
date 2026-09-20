import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import PwaStatus from "./components/PwaStatus";
import Home from "./pages/Home";

export default function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster position="bottom-right" />
        <PwaStatus />
        <Home />
      </TooltipProvider>
    </ErrorBoundary>
  );
}
