const axios = require("axios");

const fetchgithubController = async (req, res) => {
  try {
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({
        message: "GitHub access token not found",
        success: false,
      });
    }

    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: "updated",
        per_page: 50,
      },
    });

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      private: repo.private,
    }));

    return res.status(200).json({
      message: "GitHub repositories fetched successfully",
      data: repos,
      success: true,
    });
  } catch (err) {
    console.log(`Error in fetch github Controller - ${err.message}`);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      success: false,
    });
  }
};

module.exports = { fetchgithubController };
