import axios from "../utils/api";

export const getRepos = async () => {
  try {
    const response = await axios.get("/api/github/repos");
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch repositories");
  }
};