import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CIFFWebsite from "./components/CIFFWebsite";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CIFFWebsite />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
