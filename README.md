# Clean YouTube Search

[magunapina.github.io/clean-youtube-search](https://magunapina.github.io/clean-youtube-search/)

A web application that performs YouTube searches using the YouTube Data API, providing search results without unrelated recommendations and supporting various search options.

## Usage

This application requires a YouTube Data API v3 key.\
[Click here to learn how to get your API key](https://developers.google.com/youtube/v3/getting-started#before-you-start)\
Your key is securely stored locally in your browser and is only sent directly to YouTube.\
Enter your API key in the application's sidebar to start.

### Quota

The YouTube Data API v3 provides **10,000 quota units per day** (resets daily).\
Each search request in this application consumes **102 units**, meaning you can perform approximately **98 searches per day**.\
Please note that loading the next page of results also counts as a new search and consumes another **102 units**.\
Also, be aware that even invalid or failed searches consume quota. For personal use, this is usually more than enough.

### Search Options

This application provides various search options.\
If you want to know exactly how each of these search parameters works in detail, please refer to the official [YouTube Data API v3 Search: list documentation](https://developers.google.com/youtube/v3/docs/search/list).

## Development

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your machine.

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```
