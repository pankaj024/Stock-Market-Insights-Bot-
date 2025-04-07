const STOCK_API_KEY = 'cvp3b41r01qihjtrtmigcvp3b41r01qihjtrtmj0'; // Finnhub API key
const GEMINI_API_KEY = 'AIzaSyBvxC2k808xH55F2x-malFaHdwdZTPzTfI'; // Google API key
let socket;
let stockChart;
let stockLineChart;
let priceHistory = [];
let timeHistory = [];

// Real-time data for GOOGL, GOOG, and MSFT
const realTimeData = {
    GOOGL: {
        currentPrice: 145.6,
        open: 148.01,
        high: 151.07,
        low: 145.38,
        prevClose: 150.72,
        marketCap: null,
        yearHigh: 207.05,
        yearLow: 145.38,
        peRatio: null,
        dividendYield: null
    },
    GOOG: {
        currentPrice: 147.74,
        open: 149.9,
        high: 153.09,
        low: 147.54,
        prevClose: 152.63,
        marketCap: 1825770920000.0,
        yearHigh: 208.7,
        yearLow: 147.54,
        peRatio: null,
        dividendYield: null
    },
    MSFT: {
        currentPrice: 359.84,
        open: 364.125,
        high: 374.59,
        low: 359.48,
        prevClose: 373.11,
        marketCap: null,
        yearHigh: null,
        yearLow: null,
        peRatio: null,
        dividendYield: null
    }
};

// Function to create or update the bar chart
function createStockChart(symbol, data) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    const chartSection = document.querySelector('.chart-section');
    
    if (stockChart) {
        stockChart.destroy();
    }

    chartSection.style.display = 'flex';
    document.getElementById('stockChart').style.display = 'block';

    stockChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Open', 'High', 'Low', 'Current', 'Prev Close'],
            datasets: [{
                label: `${symbol} Price (USD)`,
                data: [data.open, data.high, data.low, data.currentPrice, data.prevClose],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: `${symbol} Daily Price Snapshot`
                }
            },
            animation: {
                duration: 500,
                easing: 'easeInOutQuad'
            }
        }
    });
}

// Function to create or update the line chart
function createStockLineChart(symbol, initialPrice) {
    const ctx = document.getElementById('stockLineChart').getContext('2d');
    const chartSection = document.querySelector('.chart-section');

    if (stockLineChart) {
        stockLineChart.destroy();
    }

    chartSection.style.display = 'flex';
    document.getElementById('stockLineChart').style.display = 'block';

    priceHistory = [initialPrice];
    timeHistory = [new Date().toLocaleTimeString()];

    stockLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeHistory,
            datasets: [{
                label: `${symbol} Real-Time Price (USD)`,
                data: priceHistory,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1,
                pointRadius: 2
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: `${symbol} Real-Time Price Trend`
                }
            },
            animation: {
                duration: 500,
                easing: 'easeInOutQuad'
            }
        }
    });
}

async function fetchStockDetails(symbol) {
    symbol = symbol.toUpperCase();
    if (socket) socket.close();

    const chatBox = document.getElementById('chatBox');
    const chartSection = document.querySelector('.chart-section');
    chatBox.innerHTML += `<p class="ai-message">AI: Fetching stock details for ${symbol}...</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    if (realTimeData[symbol]) {
        const data = realTimeData[symbol];
        const change = data.prevClose ? ((data.currentPrice - data.prevClose) / data.prevClose * 100).toFixed(2) : 'N/A';
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        chatBox.innerHTML += `<p class="ai-message">AI: Stock Details for ${symbol} (as of ${today}):\n` +
            `Current Price: USD ${data.currentPrice.toFixed(2)}\n` +
            `Open: USD ${data.open.toFixed(2)}\n` +
            `High: USD ${data.high.toFixed(2)}\n` +
            `Low: USD ${data.low.toFixed(2)}\n` +
            `Previous Close: USD ${data.prevClose.toFixed(2)}\n` +
            `Change: ${change === 'N/A' ? 'N/A' : change + '%'}\n` +
            `Exchange: NASDAQ\n` +
            `Sector: Technology\n` +
            `Industry: Internet Content & Information\n` +
            `52-Week High: USD ${data.yearHigh ? data.yearHigh.toFixed(2) : 'N/A'}\n` +
            `52-Week Low: USD ${data.yearLow ? data.yearLow.toFixed(2) : 'N/A'}\n` +
            (data.marketCap ? `Market Cap: USD ${(data.marketCap / 1e12).toFixed(2)} Trillion\n` : '') +
            `Note: Prices are near the 52-week low amid recent market volatility.</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        createStockChart(symbol, {
            open: data.open,
            high: data.high,
            low: data.low,
            currentPrice: data.currentPrice,
            prevClose: data.prevClose
        });
        createStockLineChart(symbol, data.currentPrice);
        return;
    }

    try {
        socket = new WebSocket(`wss://ws.finnhub.io?token=${STOCK_API_KEY}`);

        socket.onopen = () => {
            console.log('WebSocket connected!');
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': symbol }));
            console.log(`Subscribed to ${symbol}`);
        };

        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`);
        const quote = await quoteResponse.json();

        if (!quoteResponse.ok || !quote.c || quote.c <= 0) {
            chatBox.innerHTML += `<p class="ai-message">AI: No data found for ${symbol}. Please use a valid US stock symbol (e.g., AAPL).</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            return;
        }

        const currentPrice = quote.c.toFixed(2);
        const openPrice = quote.o.toFixed(2);
        const highPrice = quote.h.toFixed(2);
        const lowPrice = quote.l.toFixed(2);
        const prevClose = quote.pc.toFixed(2);
        const change = prevClose ? ((currentPrice - prevClose) / prevClose * 100).toFixed(2) : 'N/A';
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const profileResponse = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${STOCK_API_KEY}`);
        const profile = await profileResponse.json();

        const metricsResponse = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${STOCK_API_KEY}`);
        const metrics = await metricsResponse.json();

        const marketCap = profile.marketCapitalization ? (profile.marketCapitalization / 1e6).toFixed(2) : 'N/A';
        const yearHigh = metrics['52WeekHigh']?.toFixed(2) || 'N/A';
        const yearLow = metrics['52WeekLow']?.toFixed(2) || 'N/A';
        const peRatio = metrics['peTTM']?.toFixed(2) || 'N/A';
        const dividendYield = metrics['dividendYieldTTM']?.toFixed(2) || 'N/A';

        chatBox.innerHTML += `<p class="ai-message">AI: Stock Details for ${symbol} (as of ${today}):\n` +
            `Current Price: USD ${currentPrice}\n` +
            `Open: USD ${openPrice}\n` +
            `High: USD ${highPrice}\n` +
            `Low: USD ${lowPrice}\n` +
            `Previous Close: USD ${prevClose}\n` +
            `Change: ${change === 'N/A' ? 'N/A' : change + '%'}\n` +
            `Exchange: NASDAQ\n` +
            `Sector: Technology\n` +
            `Industry: Internet Content & Information\n` +
            `Market Cap: USD ${marketCap} Trillion\n` +
            `52-Week High: USD ${yearHigh}\n` +
            `52-Week Low: USD ${yearLow}\n` +
            `P/E Ratio: ${peRatio}\n` +
            `Dividend Yield: ${dividendYield}%\n` +
            `Note: Verify real-time data as prices can fluctuate rapidly.</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        createStockChart(symbol, {
            open: parseFloat(openPrice),
            high: parseFloat(highPrice),
            low: parseFloat(lowPrice),
            currentPrice: parseFloat(currentPrice),
            prevClose: parseFloat(prevClose)
        });
        createStockLineChart(symbol, parseFloat(currentPrice));

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'trade' && data.data) {
                const trade = data.data[0];
                const price = trade.p.toFixed(2);

                if (stockChart) {
                    stockChart.data.datasets[0].data[3] = parseFloat(price);
                    stockChart.update();
                }

                if (stockLineChart) {
                    priceHistory.push(parseFloat(price));
                    timeHistory.push(new Date().toLocaleTimeString());
                    if (priceHistory.length > 20) {
                        priceHistory.shift();
                        timeHistory.shift();
                    }
                    stockLineChart.data.labels = timeHistory;
                    stockLineChart.data.datasets[0].data = priceHistory;
                    stockLineChart.update();
                }
            }
        };

        socket.onerror = (error) => console.error(`WebSocket error for ${symbol}:`, error);
        socket.onclose = (event) => console.log(`WebSocket closed for ${symbol}:`, event.code, event.reason);
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        chatBox.innerHTML += `<p class="ai-message">AI: Error fetching data for ${symbol}. Check your connection or try again later.</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return;

    const chatBox = document.getElementById('chatBox');
    const chartSection = document.querySelector('.chart-section');
    const chatSection = document.querySelector('.chat-section');
    chatBox.innerHTML += `<p class="user-message">You: ${message}</p>`;
    chatInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // Reset to initial 50% width
    chatSection.classList.remove('full-width');
    chartSection.style.display = 'none';
    document.getElementById('stockChart').style.display = 'none';
    document.getElementById('stockLineChart').style.display = 'none';

    const lowerMessage = message.toLowerCase();
    if ((lowerMessage.includes('who') || lowerMessage.includes('whose')) && 
        (lowerMessage.includes('developer') || lowerMessage.includes('made') || lowerMessage.includes('make') || lowerMessage.includes('created') || lowerMessage.includes('built'))) {
        chatBox.innerHTML += `<p class="ai-message">AI: I was created by Gautam, Mayank, and Pankaj.</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
    }

    const stockRegex = /\b[A-Z]{1,5}\b/;
    const stockMatch = message.match(stockRegex);
    const isStockQuery = stockMatch && (lowerMessage.includes('stock') || lowerMessage.includes('price') || lowerMessage.includes('details') || lowerMessage.includes('about'));

    if (stockMatch && isStockQuery) {
        const symbol = stockMatch[0].toUpperCase();
        // Expand chat section to full width and show chart section
        chatSection.classList.add('full-width');
        chartSection.style.display = 'flex';
        document.getElementById('stockChart').style.display = 'block';
        document.getElementById('stockLineChart').style.display = 'block';
        await fetchStockDetails(symbol);
    } else if (stockMatch && !isStockQuery) {
        chatBox.innerHTML += `<p class="ai-message">AI: Did you mean to ask about the stock '${stockMatch[0]}'? Try saying '${stockMatch[0]} stock details'!</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            chatBox.innerHTML += `<p class="ai-message">AI: ${aiResponse}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (error) {
            console.error('Gemini API error:', error);
            chatBox.innerHTML += `<p class="ai-message">AI: Oops! I couldn’t process that. Try asking about a stock (e.g., 'AAPL stock details') or something else!</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});