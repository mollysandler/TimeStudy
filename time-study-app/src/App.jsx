import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

import MachinistLayout from "./layouts/MachinistLayout";
import MachinistDashboard from "./pages/machinist/MachinistDashboard";
import ProcessTimerPage from "./pages/machinist/ProcessTimerPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TimeStudyDetailPage from "./pages/admin/TimeStudyDetailPage";
import NewTimeStudyPage from "./pages/admin/NewTimeStudyPage";
import NewMachinistPage from "./pages/admin/NewMachinistPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/machinist" element={<MachinistLayout />}>
        <Route index element={<MachinistDashboard />} />
        <Route path=":studyId" element={<ProcessTimerPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="time-studies/new" element={<NewTimeStudyPage />} />
        <Route path="machinist/new" element={<NewMachinistPage />} />
        <Route path="time-studies/:studyId" element={<TimeStudyDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
