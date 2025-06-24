import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./components/Navigation";
import { Toaster } from "./components/ui/toaster";
import CalendarPage from "./pages/CalendarPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import StatisticsPage from "./pages/StatisticsPage";
import StudyPage from "./pages/StudyPage";

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              {/* 공개 페이지 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* 보호된 페이지들 - 로그인 필요 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/study/:studyId" element={<StudyPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
