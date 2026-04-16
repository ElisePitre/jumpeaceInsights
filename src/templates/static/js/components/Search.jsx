import React, { Component, useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import { Bar, Line } from "react-chartjs-2";
import WordCloud from "react-wordcloud";
import * as htmlToImage from "html-to-image";
import { auth, getPastSearches, getPopularSearches, addSearchToDatabase } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 16,
      right: 12,
      bottom: 24,
      left: 12,
    },
  },
  legend: false,
  scales: {
    yAxes: [
      {
        ticks: { min: 0.5, beginAtZero: false },
        scaleLabel: {
          display: true,
          labelString: "Closeness to search term",
          fontStyle: "bold",
        },
      },
    ],
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "Related terms",
          fontStyle: "bold",
        },
      },
    ],
  },
};
export const mapOptions = {
  options: {
    rotations: 2,
    rotationAngles: [-90, 0],
    enableTooltip: true,
    fontFamily: "montserrat",
    fontSizes: [20, 30],
    fontWeight: "bold",
    colors: ["#76cf64", "#020f00"],
  },
  callbacks: {
    getWordColor: (word) => {
      const normalized = Math.min(Math.max(Number(word.value) || 0, 0), 1);
      const sensitivity = Math.pow(normalized, 0.4);
      const lightness = 18 + (1 - sensitivity) * 62;
      return `hsl(140, 90%, ${lightness}%)`;
    },
  },
  size: [10, 50],
};

export const decadeComparisonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 16,
      right: 12,
      bottom: 24,
      left: 12,
    },
  },
  legend: false,
  scales: {
    yAxes: [
      {
        ticks: { min: 0, max: 1, beginAtZero: true },
        scaleLabel: {
          display: true,
          labelString: "Closeness of terms",
          fontStyle: "bold",
        },
      },
    ],
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: "Decade",
          fontStyle: "bold",
        },
      },
    ],
  },
};

const DECADES = [
  "1790",
  "1800",
  "1810",
  "1820",
  "1830",
  "1840",
  "1850",
  "1860",
  "1870",
  "1880",
  "1890",
  "1900",
  "1910",
  "1920",
  "1930",
  "1940",
  "1950",
  "1960",
];

const dev_past_searches = require("../../../public/dummy_data/past-searches.json");
const dev_popular_searches = require("../../../public/dummy_data/popular-searches.json");
const dev_search_results = require("../../../public/dummy_data/search-results.json");
const dev_decade_comparison_results = require("../../../public/dummy_data/decade-comparison-results.json");

const SEARCH_PARAMS = ["search_term", "destination_term", "start_date", "end_date"];

const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const base = String(window.JUMPEACE_API_BASE_URL || "").trim();
  return base.replace(/\/+$/, "");
};

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return `${apiBaseUrl}${normalizedPath}`;
};

export default class Search extends Component {
  constructor(props) {
    super(props);
    const user = auth.currentUser;
    this.state = {
      search_term: "",
      destination_term: "",
      start_date: DECADES[0],
      end_date: DECADES[DECADES.length - 1],
      error: "",
      loading: false,
      popular_searches: [],
      past_searches: [],
      search_results: {},
      decade_comparison_results: {},
      visualizer_mode: "bar",
      isGuest: !user || !!user.isAnonymous,
    };
    this.barChartRef = React.createRef();
    this.wordCloudRef = React.createRef();
    this.decadeComparisonRef = React.createRef();
    this.authUnsubscribe = null;
  }

  isGuestUser = (user) => !user || !!user.isAnonymous;

  getBarData() {
    const sr = this.state.search_results;
    if (!sr?.vectors) return { labels: [], datasets: [] };
    return {
      labels: sr.vectors.map((v) => v.word),
      datasets: [{ label: sr.search, data: sr.vectors.map((v) => v.vector), backgroundColor: "rgba(12,23,54,1)" }],
    };
  }
  getMapData() {
    const sr = this.state.search_results;
    if (!sr?.vectors?.length) return [];
    const rawValues = sr.vectors.map((v) => Number(v.vector) || 0);
    const min = Math.min(...rawValues);
    const max = Math.max(...rawValues);
    const range = max - min || 1;

    return sr.vectors.map((v) => {
      const raw = Number(v.vector) || 0;
      return {
        text: v.word,
        value: (raw - min) / range,
        rawValue: raw,
      };
    });
  }
  // New feature: decade comparison -- Added by Elise
  getDecadeComparisionData() {
    const sr = this.state.search_results;
    const dcr = this.state.decade_comparison_results;
    const decadeResults = Array.isArray(dcr?.results)
      ? dcr.results
      : Array.isArray(sr?.results)
        ? sr.results
        : Array.isArray(sr?.decade_comparison)
          ? sr.decade_comparison
          : [];

    if (decadeResults.length === 0) {
      return { labels: [], datasets: [] };
    }

    const parsedResults = decadeResults
      .map((item) => ({
        decade: String(item?.decade ?? ""),
        similarity: Number(item?.similarity),
      }))
      .filter((item) => item.decade !== "" && !Number.isNaN(item.similarity));

    parsedResults.sort((a, b) => {
      const aNum = parseInt(a.decade.replace(/\D/g, ""), 10);
      const bNum = parseInt(b.decade.replace(/\D/g, ""), 10);
      if (Number.isNaN(aNum) || Number.isNaN(bNum)) return a.decade.localeCompare(b.decade);
      return aNum - bNum;
    });

    return {
      labels: parsedResults.map((item) => item.decade),
      datasets: [
        {
          label: `${dcr.term_a || sr.term_a || this.state.search_term} vs ${dcr.term_b || sr.term_b || this.state.destination_term}`,
          data: parsedResults.map((item) => item.similarity),
          borderColor: "rgba(12,23,54,1)",
          backgroundColor: "rgba(12,23,54,0.2)",
          fill: false,
          lineTension: 0.1,
        },
      ],
    };
  }

  downloadChart() {
    if (!this.barChartRef.current) return;
    const chart = this.barChartRef.current.chartInstance; // Chart.js v2
    const image = chart.toBase64Image();

    const link = document.createElement("a");
    link.href = image;
    link.download = this.state.search_results.search + "-bar-graph.png";
    link.click();
  }
  downloadMap() {
    if (!this.wordCloudRef.current) return;

    htmlToImage
      .toPng(this.wordCloudRef.current, {
        pixelRatio: 2,
        backgroundColor: "#fff", // optional
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = this.state.search_results.search + "-word-web.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error(err));
    // htmlToImage.toSvg(this.wordCloudRef.current).then((dataUrl) => {
    //   const link = document.createElement('a');
    //   link.href = dataUrl;
    //   link.download = this.state.search_results.search + '-word-web.png';
    //   link.click();
    // });
  }
  // New feature: decade comparison -- Added by Elise
  downloadDecadeComparison() {
    if (!this.decadeComparisonRef.current) return;

    htmlToImage
      .toPng(this.decadeComparisonRef.current, {
        pixelRatio: 2,
        backgroundColor: "#fff",
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        const fileNameBase = this.state.search_results.search || this.state.search_results.term_a || this.state.search_term;
        link.download = fileNameBase + "-decade-comparison.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error(err));
  }

  downloadCSV() {
    const hasDestinationTerm = this.state.destination_term.trim() !== "";
    let csvContent = "";
    let fileName = "";

    if (hasDestinationTerm) {
      // Download decade comparison results
      const dcr = this.state.decade_comparison_results;
      const sr = this.state.search_results;
      const decadeResults = Array.isArray(dcr?.results) ? dcr.results : Array.isArray(sr?.results) ? sr.results : [];

      csvContent = "Decade,Similarity\n";
      decadeResults.forEach((item) => {
        csvContent += `${item.decade},${item.similarity}\n`;
      });

      const termA = dcr.term_a || sr.term_a || this.state.search_term;
      const termB = dcr.term_b || sr.term_b || this.state.destination_term;
      fileName = `${termA}-vs-${termB}-decade-comparison.csv`;
    } else {
      // Download top 100 search results
      const vectors = this.state.search_results.vectors || [];
      const top100 = vectors.slice(0, 100);

      csvContent = "Word,Similarity\n";
      top100.forEach((v) => {
        csvContent += `${v.word},${v.vector}\n`;
      });

      const searchTerm = this.state.search_results.search || this.state.search_term;
      fileName = `${searchTerm}-top-results.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  componentDidMount() {
    this.getSearches("popular");
    this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
      const isGuest = this.isGuestUser(user);

      this.setState({ isGuest }, () => {
        if (isGuest) {
          this.setState({ past_searches: [] });
        } else {
          this.getSearches("past");
        }
      });
    });

    this.getQueryFromUrl();
    window.addEventListener("hashchange", this.getQueryFromUrl);
  }
  componentWillUnmount() {
    window.removeEventListener("hashchange", this.getQueryFromUrl);
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  devMode = false;
  devData = {
    past_searches: dev_past_searches,
    popular_searches: dev_popular_searches,
    search_results: dev_search_results,
    decade_comparison_results: dev_decade_comparison_results,
  };
  devGlobals = {
    username: "test-user",
  };

  getQueryFromUrl = () => {
    const hash = window.location.hash;
    const queryString = hash.split("?")[1] || "";

    const params = new URLSearchParams(queryString);

    let search = false;
    SEARCH_PARAMS.forEach((param, index) => {
      let value = params.get(param) ?? "";

      // Cap the decades
      if (param === "start_date" && !value) value = DECADES[0];
      if (param === "end_date" && !value) value = DECADES[DECADES.length - 1];

      if (value !== this.state[param]) {
        this.setState({ [param]: value }, () => {
          search = true;
        });
      }
    });
    if (search) {
      console.log("search");
      this.handleSubmit();
    } else {
      this.setState({ search_results: {}, decade_comparison_results: {} });
    }
  };

  updateQueryInUrl = () => {
    const hash = window.location.hash.split("?")[0]; // "#/search"

    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");

    SEARCH_PARAMS.forEach((param) => {
      if (!params.get(param) || params.get(param) !== this.state[param]) {
        params.set(param, this.state[param]);
      }
    });

    const newHash = `${hash}?${params.toString()}`;

    window.history.replaceState(null, "", newHash);
  };

  handleSubmit = async (e) => {
    if (e) {
      this.updateQueryInUrl();
    }

    if (this.devMode) {
      this.setState({
        search_results: this.devData.search_results.results,
        decade_comparison_results: this.state.destination_term.trim() !== "" ? this.devData.decade_comparison_results : {},
        loading: false,
      });
      return;
    }

    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    this.setState({ error: "", loading: true });

    try {
      const response = await fetch(buildApiUrl("/api/query"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_word: this.state.search_term,
          destination_word: this.state.destination_term,
          start_year: Number(this.state.start_date),
          end_year: Number(this.state.end_date),
          clean_results: true,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("API response:", data);
      if (response.ok) {
        this.setState({
          search_results: this.mapApiResultsToVectors(data),
          decade_comparison_results: data.decade_comparison_results || data.decadeComparisonResults || {},
          loading: false,
        });

        // Log search to Firebase database for authenticated users
        const user = auth.currentUser;
        if (user && !user.isAnonymous) {
          const searchedWord = String(this.state.search_term || "").trim();

          if (searchedWord) {
            this.setState((prevState) => {
              const newSearchObj = {
                word: searchedWord,
                startYear: Number(this.state.start_date),
                endYear: Number(this.state.end_date),
              };
              const nextPastSearches = [newSearchObj, ...prevState.past_searches.filter((item) => item.word !== searchedWord)].slice(0, 5);

              return { past_searches: nextPastSearches };
            });
          }

          try {
            await addSearchToDatabase(user.uid, this.state.search_term, Number(this.state.start_date), Number(this.state.end_date));

            await this.getSearches("past", searchedWord);
          } catch (dbErr) {
            console.error("Error logging search to database:", dbErr);
            // Don't show error to user - search was successful
          }
        }
      } else {
        this.setState({
          error: data.message || "Word not in vocabulary. Please try again with a different word or adjust the date range.",
          loading: false,
        });
      }
    } catch (err) {
      this.setState({
        error: "Network error. Please try again later.",
        loading: false,
      });
    }
  };

  searchesMap = {
    popular: {
      title: "Popular",
      apiCall: "getPopularSearches",
    },
    past: {
      title: "Past",
      apiCall: "getPastSearches",
    },
  };

  mapApiResultsToVectors = (apiResults) => {
    return {
      search: apiResults.query,
      vectors: (apiResults.results || []).map((r) => ({
        word: r.word,
        vector: r.weighted_similarity,
      })),
    };
  };

  getSearches = async (type, prependWord = "") => {
    if (this.devMode) {
      this.setState({ [type + "_searches"]: this.devData[type + "_searches"].searches });
      return;
    }

    try {
      let results = [];

      if (type === "popular") {
        // Get popular searches from Firebase (keep full objects with count)
        const popularData = await getPopularSearches();
        results = popularData;
      } else if (type === "past") {
        // Get past searches for current user from Firebase (keep full objects with decades)
        const user = auth.currentUser;
        if (user && !user.isAnonymous) {
          const pastData = await getPastSearches(user.uid);
          results = pastData;

          const normalizedPrependWord = String(prependWord || "").trim();
          if (normalizedPrependWord) {
            const prependItem = results.find((item) => item.word === normalizedPrependWord);
            const otherItems = results.filter((item) => item.word !== normalizedPrependWord);
            results = prependItem ? [prependItem, ...otherItems].slice(0, 5) : otherItems.slice(0, 5);
          }
        }
      }

      this.setState({ [type + "_searches"]: results });
    } catch (err) {
      console.error(`Error fetching ${type} searches:`, err);
      this.setState({
        error: `Failed to get ${type} searches. Please try again.`,
        loading: false,
      });
    }
  };

  scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  searches = (type) => {
    const title = this.searchesMap[type].title + " Searches";
    return (
      <div className="result-card">
        <h4 className="searches-header">{title}</h4>

        <ul className="searches-list">
          {this.state[type + "_searches"].map((item, index) => {
            const searchWord = item.word;
            let startDecade = this.state.start_date;
            let endDecade = this.state.end_date;

            if (type === "past" && item.startYear && item.endYear) {
              startDecade = String(item.startYear);
              endDecade = String(item.endYear);
            } else if (type === "popular") {
              startDecade = "1790";
              endDecade = "1960";
            }

            return (
              <li key={index}>
                <Link
                  to={`/search?search_term=${encodeURIComponent(searchWord)}&start_date=${encodeURIComponent(startDecade)}&end_date=${encodeURIComponent(endDecade)}`}
                  onClick={this.scrollToTop}
                >
                  {searchWord}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  results = () => {
    const hasDestinationTerm = this.state.destination_term.trim() !== "";
    const decadeData = this.getDecadeComparisionData();
    const hasDecadeData = decadeData.labels.length > 0;
    const hasVectorData = Array.isArray(this.state.search_results.vectors) && this.state.search_results.vectors.length > 0;
    const resultTitle = this.state.search_results.search || this.state.search_results.term_a || this.state.search_term;
    return (
      <div className="result-card results-wide" style={{ margin: "0 auto", padding: "24px", maxWidth: "1100px" }}>
        <h4 className="searches-header">Results: {resultTitle}</h4>

        {/* Top 5 Results */}
        <div style={{ marginTop: "10px" }}>
          <h4 className="searches-header" style={{ fontSize: "1rem" }}>
            Top 5 Results
          </h4>
          <ol className="searches-list">
            {(this.state.search_results.vectors || []).slice(0, 5).map((result, index) => (
              <li key={index}>
                <Link
                  to={`/search?search_term=${encodeURIComponent(result.word)}&start_date=${encodeURIComponent(this.state.start_date)}&end_date=${encodeURIComponent(this.state.end_date)}`}
                >
                  {result.word}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* Buttons (stacked) + Visualizer side by side */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px", alignItems: "flex-start" }}>
          {/* Stacked buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0, width: "160px" }}>
            <button className="auth-button" onClick={() => this.setState({ visualizer_mode: "bar" })} disabled={!hasVectorData}>
              Bar graph
            </button>
            <button className="auth-button" onClick={() => this.setState({ visualizer_mode: "map" })} disabled={!hasVectorData}>
              Word web
            </button>
            {hasDestinationTerm && hasDecadeData && (
              <button className="auth-button" onClick={() => this.setState({ visualizer_mode: "decade-comparison" })}>
                Decade comparison
              </button>
            )}
            {!this.state.isGuest && (
              <button
                className="auth-button"
                onClick={() => {
                  if (this.state.visualizer_mode === "bar") {
                    this.downloadChart();
                  } else if (this.state.visualizer_mode === "decade-comparison") {
                    this.downloadDecadeComparison();
                  } else {
                    this.downloadMap();
                  }
                }}
              >
                Download Visuals
              </button>
            )}
            {!this.state.isGuest && (
              <button className="auth-button" onClick={() => this.downloadCSV()}>
                Download CSV
              </button>
            )}
          </div>

          {/* Visualizer takes remaining width */}
          <div style={{ flex: 1, minWidth: 0, paddingLeft: "16px" }}>
            <h4 className="searches-header">Visualizer</h4>
            {this.state.visualizer_mode === "bar" && hasVectorData && (
              <div style={{ height: 480, minHeight: 380 }}>
                <Bar ref={this.barChartRef} options={chartOptions} data={this.getBarData()} />
              </div>
            )}
            {this.state.visualizer_mode === "map" && hasVectorData && (
              <div ref={this.wordCloudRef} style={{ height: 460, minHeight: 360 }}>
                <WordCloud options={mapOptions.options} callbacks={mapOptions.callbacks} words={this.getMapData()} />
              </div>
            )}
            {this.state.visualizer_mode === "decade-comparison" && hasDestinationTerm && hasDecadeData && (
              <div ref={this.decadeComparisonRef} style={{ height: 480, minHeight: 380 }}>
                <Line options={decadeComparisonOptions} data={decadeData} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  searchChips = () => {
    const resultTitle = this.state.search_results.search || this.state.search_results.term_a || "";
    return (
      <div>
        {Object.keys(this.state.search_results).length !== 0 && resultTitle !== "" && this.results()}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
          {!this.state.isGuest && this.state.past_searches.length !== 0 && <div style={{ flex: "0 1 auto" }}>{this.searches("past")}</div>}
          <div style={{ flex: "0 1 auto" }}>{this.searches("popular")}</div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="page-container">
        <NavBar />
        <div className="page-card">
          <h2 className="page-title">Search</h2>

          {this.state.error && <div className="auth-error">{this.state.error}</div>}

          <form onSubmit={this.handleSubmit} className="auth-form">
            {/* First row: search input */}
            <div className="form-row">
              <div className="form-group search-box" style={{ flex: 1 }}>
                <input
                  type="text"
                  id="search_term"
                  value={this.state.search_term}
                  onChange={(e) => this.setState({ search_term: e.target.value })}
                  placeholder="Enter your search..."
                  required
                  disabled={this.state.loading}
                />
                <button type="submit" className="search-button" disabled={this.state.loading}>
                  <img src="/public/images/magnifyingGlass.png" alt="Search" />
                </button>
              </div>
            </div>

            {/* Second row: start_date | end_date | destination_term */}
            <div className="form-row" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="start_date">Start Decade</label>
                <select
                  id="start_date"
                  value={this.state.start_date}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    const startIdx = DECADES.indexOf(newStart);
                    const endIdx = DECADES.indexOf(this.state.end_date);
                    if (endIdx < startIdx) {
                      this.setState({ start_date: newStart, end_date: newStart });
                    } else {
                      this.setState({ start_date: newStart });
                    }
                  }}
                  disabled={this.state.loading}
                >
                  {DECADES.map((d) => (
                    <option key={`${d}s`} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="end_date">End Decade</label>
                <select
                  id="end_date"
                  value={this.state.end_date}
                  onChange={(e) => this.setState({ end_date: e.target.value })}
                  disabled={this.state.loading}
                >
                  {DECADES.filter((d) => DECADES.indexOf(d) >= DECADES.indexOf(this.state.start_date)).map((d) => (
                    <option key={`${d}s`} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="destination_term">Destination Term</label>
                <input
                  type="text"
                  id="destination_term"
                  value={this.state.destination_term}
                  onChange={(e) => this.setState({ destination_term: e.target.value })}
                  placeholder="Destination term..."
                  disabled={this.state.loading}
                />
              </div>
            </div>
          </form>

          {this.state.loading && (
            <div className="site-blurb loading-indicator" style={{ marginTop: "12px" }}>
              <div className="loading-spinner" aria-hidden="true" />
              <h3 className="site-blurb-header">Searching...</h3>
              <p className="site-blurb-text">Fetching related terms and preparing visualizations.</p>
            </div>
          )}

          {/* Site blurb */}
          <div className="site-blurb">
            <h3 className="site-blurb-header">Explore semantic shifts across centuries</h3>
            <p className="site-blurb-text">
              Discover how the meaning and relationships between words have evolved from the 1790s to the 1960s, powered by decade-specific language
              models trained on historical English texts.
            </p>
          </div>

          <this.searchChips />
        </div>
      </div>
    );
  }
}
