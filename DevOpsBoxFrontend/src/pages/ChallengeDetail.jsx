import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChallengeById, startChallenge } from "/src/services/api.js"; // **Final Path attempt: Absolute from container root**

export default function ChallengeDetail() {
  const { id } = useParams();
  
  // State to hold the challenge data and UI status
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [startStatus, setStartStatus] = useState({ state: 'idle', message: '' }); // State for challenge start process

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
      </div>
    </div>
  );
}

