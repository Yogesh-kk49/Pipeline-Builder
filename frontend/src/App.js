import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { SubmitButton } from "./submit";
import HomePage from "./HomePage";

function PipelinePage() {
  return (
    <div style={{ width: "100vw", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

function HomeWrapper() {
  const navigate = useNavigate();

  return (
    <HomePage
      onEnter={() => {
        navigate("/app");
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/app" element={<PipelinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;