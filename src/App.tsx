import { CapturePage } from "./pages/CapturePage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { ReviewTicketPage } from "./pages/ReviewTicketPage";
import { SelectItemsPage } from "./pages/SelectItemsPage";
import { SummaryPage } from "./pages/SummaryPage";
import { useAppStore } from "./features/app/app.store";
import "./styles/globals.css";

export function App() {
  const step = useAppStore((state) => state.step);

  if (step === "review") {
    return <ReviewTicketPage />;
  }

  if (step === "processing") {
    return <ProcessingPage />;
  }

  if (step === "split") {
    return <SelectItemsPage />;
  }

  if (step === "summary") {
    return <SummaryPage />;
  }

  return <CapturePage />;
}
