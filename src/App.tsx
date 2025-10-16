import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Upload, FileText, Search, MessageCircle, Star } from "lucide-react";
import { getVercelOidcToken } from "@vercel/functions/oidc";

interface Candidate {
  id: string;
  score: number;
  author: string;
  source: string;
  page: string;
  text_preview: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [sessionId, _] = useState<string>(
    String(Math.floor(Math.random() * 1000000))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingCandidates, setIsFetchingCandidates] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isCandidatesFetched, setIsCandidatesFetched] = useState(false);
  const topCandidatesRef = useRef<HTMLDivElement>(null); // Ref for Top Matches section

  // Scroll to Top Matches when candidates are fetched
  useEffect(() => {
    if (isCandidatesFetched && topCandidates.length > 0 && topCandidatesRef.current) {
      topCandidatesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCandidatesFetched, topCandidates]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!jobDescription) return setError("Please enter a job description");
    const token = await getVercelOidcToken()
    if (files.length === 0) return setError("Please upload at least one resume");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("job_description", jobDescription);

    try {
      setIsUploading(true);
      setError(null);
      await axios.post(`${import.meta.env.VITE_API_URL}/upload_pdfs/`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      });
      // "Authorization": `Bearer ${token}
      setIsUploaded(true);
      alert("Resumes uploaded successfully!");
    } catch (err) {
      console.error(err);
      setError("Error uploading files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetStarted = async () => {
    if (!jobDescription) return setError("Please enter a job description");

    const formData = new FormData();
    const token = await getVercelOidcToken()
    formData.append("job_description", jobDescription);

    try {
      setIsFetchingCandidates(true);
      setError(null);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/ask/top_candidates/`,
        formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      }
      );
      setTopCandidates(res.data.top_candidates || []);
      setIsCandidatesFetched(true);
    } catch (err) {
      console.error(err);
      setError("Error fetching top candidates. Please try again.");
    } finally {
      setIsFetchingCandidates(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question) return setError("Please enter a question");
    const token = await getVercelOidcToken()
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("question", question);

    try {
      setIsAskingQuestion(true);
      setError(null);
      setChatMessages((prev) => [...prev, { role: "user", content: question }]);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/ask/`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      });
      const responseText = res.data.response || "No response";
      setChatMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
      setQuestion("");
    } catch (err) {
      console.error(err);
      setError("Error asking question. Please try again.");
    } finally {
      setIsAskingQuestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 text-gray-900 relative overflow-hidden font-sans antialiased">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-lg py-4 px-6 lg:px-12 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-indigo-700 tracking-tight">Talentxi</h1>
          <nav className="flex space-x-8">
            <a href="#get-started" className="text-gray-600 hover:text-indigo-700 font-medium transition-colors">
              Get Started
            </a>
            <a href="#features" className="text-gray-600 hover:text-indigo-700 font-medium transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-indigo-700 font-medium transition-colors">
              Testimonials
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-20">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Find Your Star Candidate in Seconds using AI
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {/* Say goodbye to resume overload. Upload your files, describe the role, and let our AI find the perfect candidates in minutes. */}
            {/* generate me something better according to my title it should also incorporatae that you can chat with llm find the data of resumes you upload to know more about your candidates */}
            Say goodbye to resume overload. Upload thousands of resumes, define your dream role, and let our AI pinpoint top candidates in seconds. Plus, dive deeper with real-time chat to answer any candidate-related question instantly.


          </p>
          <a
            href="#get-started"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 hover:scale-105 transition-all duration-300 shadow-md"
          >
            Start Matching <span className="ml-2">→</span>
          </a>
        </motion.section>

        {/* Upload and Job Description Section */}
        <section id="get-started" className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 space-y-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center">
            Start Matching Resumes
          </h3>
          {error && <p className="text-red-500 text-center font-medium">{error}</p>}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" /> Upload Resumes (PDFs)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200 cursor-pointer"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Search className="w-5 h-5 mr-2 text-indigo-600" /> Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
                placeholder="Tell us about the role and required skills..."
              />
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={handleUpload}
              disabled={isUploading}
              whileHover={{ scale: isUploading ? 1 : 1.05 }}
              whileTap={{ scale: isUploading ? 1 : 0.95 }}
              className={`px-6 py-3 rounded-full font-medium text-white flex items-center justify-center ${isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                }`}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" /> Upload Resumes
                </>
              )}
            </motion.button>
            <motion.button
              onClick={handleGetStarted}
              disabled={isFetchingCandidates || !isUploaded}
              whileHover={{ scale: isUploaded && !isFetchingCandidates ? 1.05 : 1 }}
              whileTap={{ scale: isUploaded && !isFetchingCandidates ? 0.95 : 1 }}
              className={`px-6 py-3 rounded-full font-medium flex items-center justify-center ${isFetchingCandidates || !isUploaded
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-md"
                }`}
            >
              {isFetchingCandidates ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2" /> Find Top Talent
                </>
              )}
            </motion.button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-10">
          <h3 className="text-2xl font-semibold text-gray-900 text-center">
            Why Talentxi Stands Out
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Upload className="w-8 h-8 text-indigo-600 mb-3" />
              <h4 className="text-lg font-medium mb-2">Effortless Uploads</h4>
              <p className="text-gray-600 text-sm">
                Drag and drop resumes or integrate with your ATS for seamless processing.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Search className="w-8 h-8 text-indigo-600 mb-3" />
              <h4 className="text-lg font-medium mb-2">Smart Matching</h4>
              <p className="text-gray-600 text-sm">
                Our AI scores candidates based on skills, experience, and job fit.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <MessageCircle className="w-8 h-8 text-indigo-600 mb-3" />
              <h4 className="text-lg font-medium mb-2">Instant Insights</h4>
              <p className="text-gray-600 text-sm">
                Ask our AI anything about your candidates for real-time answers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Top Candidates Section */}
        {topCandidates.length > 0 && (
          <section ref={topCandidatesRef} className="space-y-8">
            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              Your Top Matches
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCandidates.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <p className="text-lg font-medium text-gray-900 mb-1">{c.author}</p>
                  <p className="text-sm text-indigo-600 font-medium mb-2">
                    Match Score: {c.score.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3">{c.text_preview}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Chat Section with Spinner */}
        <section className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 space-y-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center flex items-center justify-center">
            <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" /> Ask About Your Candidates
          </h3>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
            placeholder="e.g., 'Why is this candidate a good fit?' or 'Compare top candidates' skills'..."
          />
          <motion.button
            onClick={handleAskQuestion}
            disabled={isAskingQuestion || !isCandidatesFetched}
            whileHover={{ scale: isCandidatesFetched && !isAskingQuestion ? 1.05 : 1 }}
            whileTap={{ scale: isCandidatesFetched && !isAskingQuestion ? 0.95 : 1 }}
            className={`w-full max-w-xs mx-auto px-6 py-3 rounded-full font-medium text-white ${isAskingQuestion || !isCandidatesFetched
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
              }`}
          >
            {isAskingQuestion ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Thinking...
              </div>
            ) : (
              "Ask AI"
            )}
          </motion.button>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-4">
            {chatMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className={`p-4 rounded-lg ${msg.role === "user"
                  ? "bg-indigo-50 text-indigo-900 ml-8"
                  : "bg-gray-50 text-gray-900 mr-8"
                  }`}
              >
                <strong className="block text-sm font-medium mb-1">
                  {msg.role === "user" ? "You" : "AI Assistant"}
                </strong>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.role === "user" && idx === chatMessages.length - 1 && isAskingQuestion && (
                  <div className="mt-2 flex justify-start">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="space-y-10">
          <h3 className="text-2xl font-semibold text-gray-900 text-center">
            Loved by Hiring Teams
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm mb-4 italic">
                "Talentxi saved us hours of manual screening. It's like having an extra team member!"
              </p>
              <p className="text-sm font-medium">Alex Rivera, HR Lead at TechCorp</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm mb-4 italic">
                "The AI insights are so precise—I found our top engineer in one click."
              </p>
              <p className="text-sm font-medium">Jordan Lee, Founder at StartupX</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm mb-4 italic">
                "Simple to use, accurate results, and fantastic support. Highly recommend!"
              </p>
              <p className="text-sm font-medium">Sam Taylor, Recruiter at Innovate Inc.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h4 className="text-2xl font-semibold">Transform Your Hiring Today</h4>
          <p className="text-indigo-200 max-w-xl mx-auto text-sm leading-relaxed">
            Join hiring teams worldwide using Talentxi to find top talent effortlessly.
          </p>
          <a
            href="#get-started"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-900 font-medium rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300"
          >
            Get Started <span className="ml-2">→</span>
          </a>
          <p className="text-sm text-indigo-300">© 2025 Talentxi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;