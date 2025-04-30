from flask import Flask, render_template, jsonify
from pycoingecko import CoinGeckoAPI
import pandas as pd
import json
import plotly
import plotly.express as px
from datetime import datetime, timedelta

app = Flask(__name__)
cg = CoinGeckoAPI()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/trending')
def get_trending():
    try:
        trending = cg.get_search_trending()
        return jsonify(trending)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/top_coins')
def get_top_coins():
    try:
        # Get top 20 coins by market cap
        coins = cg.get_coins_markets(
            vs_currency='usd',
            order='market_cap_desc',
            per_page=20,
            page=1,
            sparkline=True
        )
        return jsonify(coins)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/coin_chart/<coin_id>')
def get_coin_chart(coin_id):
    try:
        # Get historical price data for the last 7 days
        days = 7
        price_data = cg.get_coin_market_chart_by_id(id=coin_id, vs_currency='usd', days=days)
        
        # Convert the timestamp to readable date
        prices = price_data['prices']
        df = pd.DataFrame(prices, columns=['timestamp', 'price'])
        df['date'] = pd.to_datetime(df['timestamp'], unit='ms')
        
        # Create chart with plotly
        fig = px.line(df, x='date', y='price', title=f'{coin_id.capitalize()} Price (Last {days} Days)')
        
        # Create the chart as JSON
        graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        return jsonify({"chart": graphJSON})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/exchange_volume')
def get_exchange_volume():
    try:
        # Get top exchanges by volume
        exchanges = cg.get_exchanges_list()
        # Sort by trade volume (if available)
        exchanges_with_volume = [ex for ex in exchanges if ex.get('trade_volume_24h_btc') is not None]
        sorted_exchanges = sorted(
            exchanges_with_volume, 
            key=lambda x: float(x.get('trade_volume_24h_btc', 0)), 
            reverse=True
        )[:10]
        
        return jsonify(sorted_exchanges)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 