import axios from "../utils/api";

export const getEvents = async () => {
  try {
    const response = await axios.get("/api/events");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch events");
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await axios.post("/api/events", eventData);
    return response.data.data; 
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error(error.response?.data?.message || "Failed to create event");
  }
};