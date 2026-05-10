import { Router, Route } from "@solidjs/router";
import { FormPage } from "./pages/FormPage";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <Route path="/f/:id" component={FormPage} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
