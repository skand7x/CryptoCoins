# Crypto Dashboard

A Flask-based web application that displays cryptocurrency information:
- Trending cryptocurrencies
- Price charts for major cryptocurrencies
- Top coins by market cap
- Exchange volume data

## Features

- Real-time cryptocurrency data from CoinGecko API
- Interactive price charts
- Trending coins section to see what's popular now
- Top cryptocurrencies by market cap with price changes
- Top cryptocurrency exchanges by trading volume

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd crypto-dashboard
```

2. Create a virtual environment (optional but recommended):
```
python -m venv venv
```

3. Activate the virtual environment:
   - Windows:
   ```
   venv\Scripts\activate
   ```
   - Mac/Linux:
   ```
   source venv/bin/activate
   ```

4. Install dependencies:
```
pip install -r requirements.txt
```

## Usage

1. Start the Flask application:
```
python app.py
```

2. Open your web browser and navigate to:
```
http://127.0.0.1:5000/
```

## API Endpoints

The application provides the following API endpoints that can be used independently:

- `/api/trending` - Get trending cryptocurrencies
- `/api/top_coins` - Get top cryptocurrencies by market cap
- `/api/coin_chart/<coin_id>` - Get price chart data for a specific coin
- `/api/exchange_volume` - Get top exchanges by trading volume

## Technologies Used

- **Backend**: Flask (Python)
- **API Data**: CoinGecko API
- **Frontend**: HTML, CSS, JavaScript
- **Charts**: Plotly.js
- **Styling**: Bootstrap 5

## Dependencies

- Flask
- Requests
- PyCoingecko
- Pandas
- Plotly
- python-dotenv

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Data provided by [CoinGecko](https://www.coingecko.com/) 