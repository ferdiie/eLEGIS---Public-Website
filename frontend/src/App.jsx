import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import About from "./pages/About";
import SearchResults from "./pages/SearchResults";
import RecordList from "./pages/legislative/RecordList";
import RecordDetail from "./pages/legislative/RecordDetail";
import CurrentCouncil from "./pages/councilors/Current";
import PreviousCouncils from "./pages/councilors/Previous";
import CouncilorProfile from "./pages/councilors/Profile";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/legislative/:type" element={<RecordList />} />
          <Route path="/legislative/:type/:id" element={<RecordDetail />} />
          <Route path="/council/current" element={<CurrentCouncil />} />
          <Route path="/council/previous" element={<PreviousCouncils />} />
          <Route path="/council/member/:id" element={<CouncilorProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-muted">The page you're looking for doesn't exist or may have moved.</p>
    </div>
  );
}
