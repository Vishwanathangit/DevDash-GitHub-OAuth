const axios = require("axios");

const fetchdevtoController = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
        success: false,
      });
    }

    const response = await axios.get(
      `https://dev.to/api/articles?username=${username}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const articles = response.data.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      published_at: article.published_at,
      tag_list: article.tag_list,
      social_image: article.social_image,
      reading_time_minutes: article.reading_time_minutes,
      public_reactions_count: article.public_reactions_count,
    }));

    return res.status(200).json({
      message: "Dev.to articles fetched successfully",
      data: articles,
      success: true,
    });
  } catch (err) {
    console.log(`Error in fetch dev to Controller - ${err.message}`);

    if (err.response && err.response.status === 404) {
      return res.status(404).json({
        message: "User not found on Dev.to",
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      success: false,
    });
  }
};

module.exports = { fetchdevtoController };
