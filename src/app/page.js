"use client";

import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [file, setFile] = useState(null);
  const [punctuationCounts, setPunctuationCounts] = useState(null);
  const [loading, setLoading] = useState(false);

  // List of all 18 punctuation marks
  const punctuationMarks = [
    "apostrophes",
    "colons",
    "commas",
    "curly_brackets",
    "double_inverted_commas",
    "ellipses",
    "em_dashes",
    "en_dashes",
    "exclamation_marks",
    "full_stops",
    "hyphens",
    "other_punctuation_marks",
    "question_marks",
    "round_brackets",
    "semicolons",
    "slashes",
    "square_brackets",
    "vertical_bars",
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CSV file!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://punctuation-omdx.vercel.app/process-file", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Ensure all punctuation marks are included, with a default count of 0
      const normalizedData = punctuationMarks.reduce((acc, mark) => {
        acc[mark] = data.punctuation_counts[mark] || 0;
        return acc;
      }, {});

      setPunctuationCounts(normalizedData);
      console.log(normalizedData);
    } catch (error) {
      alert("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Chart Data and Options
  const chartData = punctuationCounts
    ? {
        labels: punctuationMarks.map((mark) => mark.replace(/_/g, " ")),
        datasets: [
          {
            label: "Punctuation Count",
            data: punctuationMarks.map((mark) => punctuationCounts[mark]),
            backgroundColor: [
              "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9", "#92A8D1",
              "#034F84", "#F7786B", "#DE93BA", "#A1C8E9", "#D94F70",
              "#45B8AC", "#EFC050", "#5B5EA6", "#9B2335", "#E15D44",
              "#7FCDCD", "#BC243C", "#4A4E4D",
            ],
            borderWidth: 1,
          },
        ],
      }
    : {
        labels: [],
        datasets: [],
      };

  const maxCount = punctuationCounts
    ? Math.ceil(Math.max(...Object.values(punctuationCounts)) / 1000) * 1000
    : 0;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: "#FFFFFF",
        },
      },
      title: {
        display: true,
        text: "Punctuation Analysis",
        font: {
          size: 22,
          weight: "bold",
        },
        color: "#FFFFFF",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Punctuation Type",
          font: { size: 14, color: "#FFFFFF" },
        },
        ticks: { color: "#FFFFFF" },
      },
      y: {
        title: {
          display: true,
          text: "Count",
          font: { size: 14, color: "#FFFFFF" },
        },
        beginAtZero: true,
        max: maxCount,
        ticks: { color: "#FFFFFF" },
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-gray-200">
      <h1 className="text-4xl font-bold text-white mb-8">Punctuation Analyzer</h1>
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 border border-gray-600 rounded-lg cursor-pointer bg-gray-800 focus:outline-none hover:bg-gray-700 hover:shadow-lg transition"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 hover:shadow-md transition"
          }`}
        >
          {loading ? "Analyzing..." : "Upload and Analyze"}
        </button>
      </div>

      {punctuationCounts && (
        <div className="mt-10 w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Punctuation Count Results
          </h2>
          <div className="flex flex-col gap-4">
            {Object.entries(punctuationCounts).map(([key, value]) => (
              <div key={key} className="flex justify-between text-gray-300 border-b py-2">
                <span className="capitalize">{String(key).replace(/_/g, " ")}</span>
                <span className="font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-medium text-gray-200 mb-4">
              Punctuation Distribution
            </h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
