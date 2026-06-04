import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [analyzedAt, setAnalyzedAt] = useState("");

  const formatFileName = (name) => {
    if (!name) return "";
    return name.length > 28 ? `${name.substring(0, 28)}...` : name;
  };

  const formatStatus = (status) => {
    if (!status || status.toLowerCase() === "unknown") {
      return "Reference Not Provided";
    }

    return status;
  };

  const statusClass = (status) => {
    if (!status) return "unknown";

    const normalized = status.toLowerCase();

    if (normalized.includes("normal")) return "normal";
    if (normalized.includes("high")) return "high";
    if (normalized.includes("low")) return "low";
    if (normalized.includes("borderline")) return "borderline";

    return "unknown";
  };

  const severityClass = (severity) => {
    if (!severity) return "severity-normal";

    const normalized = severity.toLowerCase();

    if (normalized.includes("normal")) return "severity-normal";
    if (normalized.includes("mild")) return "severity-mild";
    if (normalized.includes("review")) return "severity-review";

    return "severity-unknown";
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please choose a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);
    setChatAnswer("");
    setAnalyzedAt("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      setResult(response.data);
      setAnalyzedAt(new Date().toLocaleString());
    } catch (error) {
      console.error(error);
      alert("Something went wrong while analyzing the report.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setChatQuestion("");
    setChatAnswer("");
    setAnalyzedAt("");
  };

  const handleDownload = () => {
    if (!result) return;

    const labValuesText =
      result.analysis.lab_values && result.analysis.lab_values.length > 0
        ? result.analysis.lab_values
            .map(
              (item) =>
                `- ${item.test_name}: ${item.result} | Range: ${item.reference_range} | Status: ${formatStatus(
                  item.status
                )} | ${item.explanation}`
            )
            .join("\n")
        : "No lab values extracted.";

    const analysisText = `
MedLens AI Report Analysis

File: ${result.filename}
Analyzed At: ${analyzedAt}
Characters Extracted: ${result.characters_extracted}

Document Type:
${result.analysis.document_type}

Overall Review:
${result.analysis.severity_level}

Summary:
${result.analysis.summary}

Key Findings:
${result.analysis.key_findings.map((item) => `- ${item}`).join("\n")}

Lab Values:
${labValuesText}

Questions for Doctor:
${result.analysis.questions_for_doctor.map((item) => `- ${item}`).join("\n")}

Important Notes:
${result.analysis.important_notes.map((item) => `- ${item}`).join("\n")}

Disclaimer:
MedLens AI is intended for educational purposes only and does not replace professional medical advice, diagnosis, or treatment.
`;

    const blob = new Blob([analysisText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "medlens-analysis.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleChat = async () => {
    if (!chatQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }

    if (!result) {
      alert("Please analyze a report first.");
      return;
    }

    setChatLoading(true);
    setChatAnswer("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        question: chatQuestion,
        analysis_context: result.analysis,
      });

      setChatAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while answering your question.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      alert("Please upload a PDF file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-badge">AI Healthcare Assistant</div>
        <h1>MedLens AI</h1>
        <p>
          Upload a medical report and receive a clear, patient-friendly
          explanation with key findings, lab values, and questions to ask your
          doctor.
        </p>
      </header>

      <main className="layout">
        <section className="upload-panel">
          <div className="upload-icon">🩺</div>

          <h2>Upload Report</h2>
          <p>Supported format: PDF medical reports and lab results.</p>

          <label
            className="upload-box"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <span>
              {file
                ? formatFileName(file.name)
                : "Drag and drop a PDF here, or click to choose a file"}
            </span>
          </label>

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing Report..." : "Analyze Report"}
          </button>

          {result && (
            <button className="secondary-button" onClick={handleClear}>
              Analyze Another Report
            </button>
          )}

          {loading && <div className="loader"></div>}
        </section>

        <section className="results-panel">
          {!result && (
            <div className="empty-state">
              <h2>Your analysis will appear here</h2>
              <p>
                MedLens AI will summarize your document, highlight key findings,
                extract lab values, and suggest helpful questions for your
                healthcare provider.
              </p>
            </div>
          )}

          {result && (
            <div className="results">
              <div className="results-header">
                <div>
                  <p className="eyebrow">Analysis Results</p>
                  <h2>{result.analysis.document_type}</h2>
                  {analyzedAt && (
                    <p className="timestamp">Analyzed {analyzedAt}</p>
                  )}
                </div>

                <span
                  className={`status-pill ${severityClass(
                    result.analysis.severity_level
                  )}`}
                >
                  {result.analysis.severity_level || "Completed"}
                </span>
              </div>

              <div className="meta-grid">
                <div>
                  <span>File</span>
                  <strong title={result.filename}>
                    {formatFileName(result.filename)}
                  </strong>
                </div>

                <div>
                  <span>Characters Extracted</span>
                  <strong>{result.characters_extracted}</strong>
                </div>
              </div>

              <article className="analysis-card summary-card">
                <h3>📝 Summary</h3>
                <p>{result.analysis.summary}</p>
              </article>

              <article className="analysis-card">
                <h3>🔍 Key Findings</h3>
                <ul>
                  {result.analysis.key_findings.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </article>

              {result.analysis.lab_values &&
                result.analysis.lab_values.length > 0 && (
                  <article className="analysis-card">
                    <h3>🧪 Lab Values</h3>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Range</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.analysis.lab_values.map((item, index) => (
                            <tr key={index}>
                              <td>{item.test_name}</td>
                              <td>{item.result}</td>
                              <td>{item.reference_range}</td>
                              <td>
                                <span
                                  className={`lab-status ${statusClass(
                                    item.status
                                  )}`}
                                >
                                  {formatStatus(item.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                )}

              <article className="analysis-card">
                <h3>❓ Questions for Doctor</h3>
                <ul>
                  {result.analysis.questions_for_doctor.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="analysis-card">
                <h3>⚠️ Important Notes</h3>
                <ul>
                  {result.analysis.important_notes.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="analysis-card chat-card">
                <h3>💬 Ask a Follow-Up Question</h3>
                <textarea
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Example: Should I ask my doctor about my RBC count?"
                />
                <button onClick={handleChat} disabled={chatLoading}>
                  {chatLoading ? "Thinking..." : "Ask MedLens AI"}
                </button>

                {chatAnswer && (
                  <div className="chat-answer">
                    <strong>MedLens AI:</strong>
                    <p>{chatAnswer}</p>
                  </div>
                )}
              </article>

              <button className="download-button" onClick={handleDownload}>
                Download Analysis
              </button>

              <div className="disclaimer">
                MedLens AI is intended for educational purposes only and does
                not replace professional medical advice, diagnosis, or
                treatment. Always consult a qualified healthcare provider about
                your results.
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;