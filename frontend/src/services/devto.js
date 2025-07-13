import axios from "../utils/api";

export const getArticles = async (username) => {
  try {
    const response = await axios.get(`/api/devto/articles/${username}`);
    return response.data.data; 
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch articles");
  }
};