import { BoardPage } from "@/pages/board";

import { AppProviders } from "./providers";

function App() {
  return (
    <AppProviders>
      <BoardPage />
    </AppProviders>
  );
}

export default App;
