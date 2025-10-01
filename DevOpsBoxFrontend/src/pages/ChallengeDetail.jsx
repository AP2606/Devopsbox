import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Edit3 } from 'lucide-react';
import { fetchChallengeById, startChallenge, validateChallenge, runCommand, resetChallenge } from "/src/services/api.js";


  const FileEditor = ({ challengeId }) => {
  const [filePath, setFilePath] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [editStatus, setEditStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map challenge ID to its default starting file path
  const defaultFiles = {
    1: "/workspace/challenge_1/broken-ci.yml",
    2: "/workspace/challenge_2/Dockerfile",
    3: "/workspace/challenge_3/deployment.yaml"
  };

  const currentDefaultPath = defaultFiles[challengeId] || `/workspace/challenge_${challengeId}/`;

  const fetchFileContent = async (path) => {
    setIsLoading(true);
    setEditStatus(null);
    try {
      // NOTE: Using direct fetch since readFile is not yet exported in src/services/api.js
      const res = await fetch(`/api/read-file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
        setEditStatus(null);
      } else {
        setFileContent(data.error || "# Error loading file. Path may be incorrect or challenge not started.");
        setEditStatus(`Error: ${data.error || 'Could not load file.'}`);
      }
    } catch (error) {
      setFileContent("# Network error loading file content.");
      setEditStatus(`Network Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Initialize path and fetch content when component mounts
  useEffect(() => {
    setFilePath(currentDefaultPath);
    fetchFileContent(currentDefaultPath);
  }, [challengeId]);

  // 2. Handler to manually load file if user changes path
  const handleLoadFile = () => {
    fetchFileContent(filePath);
  };

  // 3. Save function (calls the new /api/edit-file endpoint)
  const handleSaveFile = async () => {
    setIsLoading(true);
    setEditStatus(null);
    try {
      // NOTE: Using direct fetch since editFile is not yet exported in src/services/api.js
      const res = await fetch("/api/edit-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content: fileContent }),
      });
      const data = await res.json();
      const newStatus = data.message || data.error;
      setEditStatus(newStatus);
    } catch (error) {
      setEditStatus(`Network Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor = editStatus ? (editStatus.startsWith('Error') || editStatus.startsWith('Failed') ? 'text-red-500' : 'text-green-600') : 'text-gray-500';
  const buttonClassName = "px-4 py-2 rounded-xl text-white font-bold text-lg transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50";


  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
        <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
        Sandbox File Editor
      </h3>

      {/* File Path Input */}
      <div className="flex space-x-2 mb-3">
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-lg font-mono text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="/workspace/challenge_id/file_name.ext"
          aria-label="File path"
        />
        <button
            onClick={handleLoadFile}
            disabled={isLoading}
            className="flex-shrink-0 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load File'}
          </button>
      </div>

      {/* Textarea Editor */}
      <textarea
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        rows={12}
        className="w-full p-4 h-64 border-2 border-gray-300 rounded-xl font-mono text-sm bg-gray-900 text-white shadow-inner focus:border-indigo-500 focus:outline-none resize-y"
        placeholder={isLoading ? "Loading file content..." : "Start typing your file content here..."}
        disabled={isLoading}
        aria-label="File content editor"
      />

      {/* Save Button and Status */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleSaveFile}
          disabled={isLoading}
          className={`${buttonClassName} bg-indigo-600 hover:bg-indigo-700`}
        >
          {isLoading ? 'Saving...' : '💾 Save Changes'}
        </button>

        {editStatus && (
          <p className={`text-sm font-semibold p-2 rounded ${statusColor} transition-opacity duration-300`}>
            {editStatus}
          </p>
        )}
      </div>
    </div>
  );
};
export default function ChallengeDetail() {
  const { id } = useParams();
  
  // State to hold the challenge data and UI status
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [startStatus, setStartStatus] = useState({ state: 'idle', message: '' }); // State for challenge start process
  const [validationStatus, setValidationStatus] = useState({ state: 'idle', message: '' });
  const [command, setCommand] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [resetStatus, setResetStatus] = useState({ state: 'idle', message: '' });

  // Fetch challenge details when the component mounts or ID changes
  useEffect(() => {
    // Reset state before fetching
    setIsLoading(true);
    setFetchError(null);

    fetchChallengeById(id)
      .then(data => {
        setChallenge(data);
      })
      .catch(err => {
        // Use err.message if available, otherwise default string
        setFetchError(err.message || 'Failed to retrieve challenge data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]); // Dependency array: ensures fetch runs ONLY when 'id' changes

  // Handler for starting the challenge
  const handleStartChallenge = async () => {
    if (!challenge) return;
    
    setStartStatus({ state: 'loading', message: 'Starting sandbox environment...' });
    
    try {
      // NOTE: We rely on the /api/start/{id} endpoint working correctly
      const result = await startChallenge(id);
      
      setStartStatus({ 
        state: 'success', 
        message: result.message || 'Challenge environment started successfully! Details should appear soon.' 
      });
      // In a real app, you would likely fetch the challenge again here to update its status
    } catch (err) {
      setStartStatus({ 
        state: 'error', 
        message: err.message || 'Failed to start challenge environment. Please check the backend service.' 
      });
    }
  };
const handleValidateChallenge = async () => {
  setValidationStatus({ state: 'loading', message: 'Validating solution...' });
  try {
    const result = await validateChallenge(id);
    setValidationStatus({ state: 'success', message: result.message || 'Validation passed!' });
    setChallenge(prevChallenge => ({
      ...prevChallenge,
      status: 'completed' // Force the status update in the UI
    }));
  } catch (err) {
    setValidationStatus({ state: 'error', message: err.message || 'Validation failed.' });
  }
};
  const handleRunCommand = async () => {
    if (!command.trim()) return;
    setCommandOutput("Running...");
    try {
      const result = await runCommand(command);
      setCommandOutput(
        `Exit Code: ${result.exit_code}\n\nSTDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}`
      );
    } catch (err) {
      setCommandOutput(`Error: ${err.message}`);
    }
  };
const handleResetChallenge = async () => {
  setResetStatus({ state: 'loading', message: 'Resetting environment...' });
  try {
    const result = await resetChallenge(id);
    setResetStatus({ state: 'success', message: result.message || 'Challenge reset.' });
    setChallenge(prev => ({ ...prev, status: "pending" })); // update local state
  } catch (err) {
    setResetStatus({ state: 'error', message: err.message || 'Reset failed.' });
  }
};

  // --- Render Logic ---
  if (isLoading) return <p className="text-center text-xl p-8 text-gray-600">Loading challenge details...</p>;
  if (fetchError) return <p className="text-center text-red-600 text-xl p-8">Error: {fetchError}</p>;
  if (!challenge) return <p className="text-center text-xl p-8 text-gray-600">Challenge not found.</p>;

  // Button status derived from challenge state
  const isStarting = startStatus.state === 'loading';
  const isActive = challenge.status === 'active';
  const buttonText = isStarting 
    ? 'Starting...' 
    : (isActive ? 'Already Active' : 'Start Challenge');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-2xl">
      <Link to="/challenges" className="text-blue-600 hover:text-blue-800 transition duration-150 mb-4 inline-block font-medium">
        &larr; Back to Challenges
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-3 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-900">{challenge.title}</h1>
        <span className={`mt-2 sm:mt-0 px-4 py-1 text-sm font-semibold rounded-full shadow-inner ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {challenge.status}
        </span>
      </div>

      <div className="mb-6 space-y-3 text-lg text-gray-600">
        <p>📌 **Category:** <span className="font-semibold text-gray-800">{challenge.category}</span></p>
        <p>⚡ **Difficulty:** <span className="font-semibold text-gray-800">{challenge.difficulty}</span></p>
      </div>

      <div className="prose max-w-none border-t pt-6">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">Challenge Description</h2>
        <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col gap-4">
        {/* Start Challenge Button */}
        <button
          onClick={handleStartChallenge}
          disabled={isStarting || isActive}
          className={`
            w-full sm:w-auto px-10 py-3 rounded-xl text-white font-bold text-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center justify-center
            ${isStarting || isActive
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 transform hover:scale-[1.01]'
            }
          `}
        >
          {buttonText}
          {isStarting && <svg className="animate-spin ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
        </button>
        
        {/* Status Messages */}
        {startStatus.state !== 'idle' && (
          <div className={`p-4 rounded-lg font-medium text-base ${startStatus.state === 'success' ? 'bg-green-100 text-green-700' : startStatus.state === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            <p>{startStatus.message}</p>
          </div>
        )}
        <div className="flex flex-col gap-4 mt-6">
  <button
    onClick={handleValidateChallenge}
    disabled={validationStatus.state === 'loading'}
    className={`
      w-full sm:w-auto px-10 py-3 rounded-xl text-white font-bold text-lg transition duration-300 shadow-lg hover:shadow-xl
      ${validationStatus.state === 'loading'
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700 transform hover:scale-[1.01]'
      }
    `}
  >
    {validationStatus.state === 'loading' ? 'Validating...' : 'Validate Challenge'}
  </button>

  {validationStatus.state !== 'idle' && (
    <div className={`p-4 rounded-lg font-medium text-base ${
      validationStatus.state === 'success'
        ? 'bg-green-100 text-green-700'
        : validationStatus.state === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-blue-100 text-blue-700'
    }`}>
      <p>{validationStatus.message}</p>
    </div>
    )}
        </div>
<button
  onClick={handleResetChallenge}
  disabled={resetStatus.state === 'loading'}
  className={`
    w-full sm:w-auto px-10 py-3 rounded-xl text-white font-bold text-lg transition duration-300 shadow-lg hover:shadow-xl
    ${resetStatus.state === 'loading'
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-red-600 hover:bg-red-700 transform hover:scale-[1.01]'
    }
  `}
>
  {resetStatus.state === 'loading' ? 'Resetting...' : 'Reset Challenge'}
</button>

{resetStatus.state !== 'idle' && (
  <div className={`p-4 rounded-lg font-medium text-base ${
    resetStatus.state === 'success'
      ? 'bg-green-100 text-green-700'
      : resetStatus.state === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700'
  }`}>
    <p>{resetStatus.message}</p>
  </div>
)}

<FileEditor challengeId={id} />
{/* Sandbox Terminal */}
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-bold mb-2">💻 Sandbox Terminal</h3>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g., ls -l /workspace/challenge_1)"
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <button
            onClick={handleRunCommand}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Run
          </button>
          {commandOutput && (
            <pre className="mt-4 bg-black text-green-400 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {commandOutput}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

