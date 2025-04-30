document.addEventListener('DOMContentLoaded', function() {
    // Fetch all data on page load
    fetchTrendingCoins();
    fetchTopCoins();
    fetchExchangeVolume();
});

// Format currency with appropriate symbol and commas
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Format large numbers with abbreviations (K, M, B, T)
function formatLargeNumber(num) {
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(2) + 'T';
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

// Format percentage changes
function formatPercentChange(percentChange) {
    const formatted = parseFloat(percentChange).toFixed(2) + '%';
    if (percentChange > 0) {
        return `<span class="price-up">+${formatted}</span>`;
    } else if (percentChange < 0) {
        return `<span class="price-down">${formatted}</span>`;
    } else {
        return `<span>${formatted}</span>`;
    }
}

// Fetch trending coins
async function fetchTrendingCoins() {
    try {
        const response = await fetch('/api/trending');
        const data = await response.json();
        
        // Update trending coins section
        const trendingCoinsContainer = document.getElementById('trending-coins');
        trendingCoinsContainer.innerHTML = '';
        
        if (data.coins && data.coins.length > 0) {
            data.coins.forEach(coinItem => {
                const coin = coinItem.item;
                const coinHtml = `
                    <div class="col-md-3 mb-3">
                        <div class="trending-coin">
                            <img src="${coin.thumb}" alt="${coin.name}" class="coin-image">
                            <div>
                                <h5 class="mb-0">${coin.name}</h5>
                                <small class="text-muted">${coin.symbol}</small>
                                <p class="mb-0">Rank: #${coin.market_cap_rank || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                `;
                trendingCoinsContainer.innerHTML += coinHtml;
            });
        } else {
            trendingCoinsContainer.innerHTML = '<div class="col-12 text-center">No trending coins available</div>';
        }
    } catch (error) {
        console.error('Error fetching trending coins:', error);
        document.getElementById('trending-coins').innerHTML = 
            '<div class="col-12 text-center">Error loading trending coins</div>';
    }
}

// Fetch top coins by market cap
async function fetchTopCoins() {
    try {
        const response = await fetch('/api/top_coins');
        const coins = await response.json();
        
        // Update market overview with top 2 coins data
        if (coins && coins.length > 0) {
            // Update BTC card
            const btcData = coins.find(coin => coin.symbol === 'btc');
            if (btcData) {
                document.getElementById('btc-price').textContent = formatCurrency(btcData.current_price);
                document.getElementById('btc-change').innerHTML = formatPercentChange(btcData.price_change_percentage_24h);
            }
            
            // Update ETH card
            const ethData = coins.find(coin => coin.symbol === 'eth');
            if (ethData) {
                document.getElementById('eth-price').textContent = formatCurrency(ethData.current_price);
                document.getElementById('eth-change').innerHTML = formatPercentChange(ethData.price_change_percentage_24h);
            }
            
            // Calculate global market cap (simplified)
            const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
            document.getElementById('global-market-cap').textContent = formatLargeNumber(totalMarketCap);
            
            // Estimate market cap change (using weighted average)
            const totalMarketCapChange = coins.reduce((sum, coin) => {
                return sum + (coin.price_change_percentage_24h * coin.market_cap);
            }, 0) / totalMarketCap;
            
            document.getElementById('market-cap-change').innerHTML = formatPercentChange(totalMarketCapChange);
        }
        
        // Update top coins table
        const topCoinsTable = document.getElementById('top-coins-table');
        topCoinsTable.innerHTML = '';
        
        if (coins && coins.length > 0) {
            coins.forEach((coin, index) => {
                const priceChange24h = formatPercentChange(coin.price_change_percentage_24h);
                
                // Create a simple sparkline from price data if available
                let sparkline = '';
                if (coin.sparkline_in_7d && coin.sparkline_in_7d.price) {
                    sparkline = `<span class="sparkline" data-coin-id="${coin.id}" onclick="showCoinChart('${coin.id}', '${coin.name}')">View Chart</span>`;
                }
                
                const rowHtml = `
                    <tr class="coin-row" data-coin-id="${coin.id}">
                        <td>${index + 1}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${coin.image}" alt="${coin.name}" class="coin-image">
                                <div>
                                    <span class="fw-bold">${coin.name}</span>
                                    <small class="text-muted d-block">${coin.symbol.toUpperCase()}</small>
                                </div>
                            </div>
                        </td>
                        <td>${formatCurrency(coin.current_price)}</td>
                        <td>${priceChange24h}</td>
                        <td>${formatLargeNumber(coin.market_cap)}</td>
                        <td>${formatLargeNumber(coin.total_volume)}</td>
                        <td>${sparkline}</td>
                    </tr>
                `;
                topCoinsTable.innerHTML += rowHtml;
            });
            
            // Add click event to rows to show detailed chart
            document.querySelectorAll('.coin-row').forEach(row => {
                row.addEventListener('click', function() {
                    const coinId = this.getAttribute('data-coin-id');
                    const coinName = this.querySelector('.fw-bold').textContent;
                    showCoinChart(coinId, coinName);
                });
            });
        } else {
            topCoinsTable.innerHTML = '<tr><td colspan="7" class="text-center">No coin data available</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching top coins:', error);
        document.getElementById('top-coins-table').innerHTML = 
            '<tr><td colspan="7" class="text-center">Error loading coin data</td></tr>';
    }
}

// Fetch and display exchange volume data
async function fetchExchangeVolume() {
    try {
        const response = await fetch('/api/exchange_volume');
        const exchanges = await response.json();
        
        const exchangesContainer = document.getElementById('exchanges-list');
        exchangesContainer.innerHTML = '';
        
        if (exchanges && exchanges.length > 0) {
            exchanges.forEach(exchange => {
                const exchangeHtml = `
                    <div class="col-md-3 mb-3">
                        <div class="exchange-card">
                            <img src="${exchange.image || 'https://via.placeholder.com/64'}" alt="${exchange.name}" onerror="this.src='https://via.placeholder.com/64'">
                            <div class="exchange-info">
                                <h5 class="exchange-name">${exchange.name}</h5>
                                <p class="mb-0">24h Volume: ${formatLargeNumber(exchange.trade_volume_24h_btc)} BTC</p>
                                <p class="mb-0">Trust Score: ${exchange.trust_score || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                `;
                exchangesContainer.innerHTML += exchangeHtml;
            });
        } else {
            exchangesContainer.innerHTML = '<div class="col-12 text-center">No exchange data available</div>';
        }
    } catch (error) {
        console.error('Error fetching exchange volume:', error);
        document.getElementById('exchanges-list').innerHTML = 
            '<div class="col-12 text-center">Error loading exchange data</div>';
    }
}

// Show detailed chart for a specific coin
async function showCoinChart(coinId, coinName) {
    try {
        // Show loading state
        const chartCard = document.getElementById('chart-card');
        chartCard.classList.remove('d-none');
        document.getElementById('coin-chart-title').textContent = `${coinName} Price Chart (7 Days)`;
        document.getElementById('coin-chart').innerHTML = '<div class="text-center py-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Scroll to chart section
        document.getElementById('coin-detail').scrollIntoView({behavior: 'smooth'});
        
        // Fetch chart data
        const response = await fetch(`/api/coin_chart/${coinId}`);
        const data = await response.json();
        
        if (data.chart) {
            // Parse the chart data and render with Plotly
            const chartDiv = document.getElementById('coin-chart');
            chartDiv.innerHTML = '';
            Plotly.newPlot('coin-chart', JSON.parse(data.chart));
        } else {
            document.getElementById('coin-chart').innerHTML = '<div class="alert alert-warning">No chart data available for this coin</div>';
        }
    } catch (error) {
        console.error('Error fetching coin chart:', error);
        document.getElementById('coin-chart').innerHTML = 
            '<div class="alert alert-danger">Error loading chart data</div>';
    }
} 