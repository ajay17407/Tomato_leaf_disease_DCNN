import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/predict`, formData);
      
      if (res.data.error) {
        throw new Error(res.data.error);
      }
      
      setResult(res.data);
    } catch (error) {
      console.error('Prediction error:', error);
      setError(error.response?.data?.error || error.message || 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 bg-gray-50">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Tomato Disease Classifier</h1>
              <p className="text-gray-600 mb-8">Upload an image to detect tomato plant diseases</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md transition-all ${!file || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Analyze Image'}
                </button>
              </form>
            </div>
          </div>

          <div className="md:w-1/2 p-8 bg-white">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analysis Results</h2>

            {preview ? (
              <div className="mb-6">
                <div className="relative pb-2/3 h-48">
                  <img
                    src={preview}
                    alt="preview"
                    className="absolute h-full w-full object-contain rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-6">
                <p className="text-gray-500">Preview will appear here</p>
              </div>
            )}

            {result ? (
              <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                <h3 className="text-lg font-medium text-indigo-800 mb-2">Prediction Complete</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Class</p>
                    <p className="text-xl font-semibold text-gray-900 capitalize">
                      {result.class.replace(/_/g, ' ').replace('Tomato ', '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confidence</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                        style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm font-medium text-gray-600 mt-1">
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <p className="text-gray-500">
                  {file ? 'Click "Analyze Image" to get predictions' : 'Upload an image to see analysis results'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;