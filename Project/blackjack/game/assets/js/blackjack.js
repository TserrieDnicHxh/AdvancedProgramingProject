class Blackjack {
    constructor() {
        this.deck = [];
        this.dealerCards = [];
        this.playerCards = [];
        this.suits = ['H', 'D', 'C', 'S'];
        this.values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.money = 1000;
        this.currentBet = 0;
        this.gameActive = false;

        this.initializeButtons();
        this.updateMoney();
    }

    initializeButtons() {
        document.getElementById('deal-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('hit-btn').addEventListener('click', () => this.hit());
        document.getElementById('stand-btn').addEventListener('click', () => this.stand());
        document.getElementById('place-bet').addEventListener('click', () => this.placeBet());
    }

    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let value of this.values) {
                this.deck.push({ suit, value });
            }
        }
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCard() {
        return this.deck.pop();
    }

    getCardValue(card) {
        if (card.value === 'A') return 11;
        if (['K', 'Q', 'J'].includes(card.value)) return 10;
        return parseInt(card.value);
    }

    calculateScore(cards) {
        let score = 0;
        let aces = 0;

        for (let card of cards) {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else {
                score += this.getCardValue(card);
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    getCardImagePath(card) {
        let suitName;
        let valueName;
    
        switch (card.suit) {
            case 'H': suitName = 'hearts'; break;
            case 'D': suitName = 'diamonds'; break;
            case 'C': suitName = 'clubs'; break;
            case 'S': suitName = 'spades'; break;
            default: suitName = '';
        }
    
        switch (card.value) {
            case 'A': valueName = 'ace'; break;
            case 'K': valueName = 'king'; break;
            case 'Q': valueName = 'queen'; break;
            case 'J': valueName = 'jack'; break;
            default: valueName = card.value;
        }
    
        return `assets/cards/${valueName}_of_${suitName}.png`;
    }

    updateCardDisplay(cards, elementId) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card');
            
            const cardImage = document.createElement('img');
            if (elementId === 'dealer-cards' && index === 1 && this.gameActive) {
                cardImage.src = 'assets/cards/card_back_purple.png';
            } else {
                cardImage.src = this.getCardImagePath(card);
            }
            cardImage.alt = `${card.value}${card.suit}`;
            cardImage.style.width = '100%';
            cardImage.style.height = '100%';
            cardImage.style.objectFit = 'contain';
            
            cardDiv.appendChild(cardImage);
            element.appendChild(cardDiv);
        });
    }

    updateScores() {
        const playerScore = this.calculateScore(this.playerCards);
        const dealerScore = this.calculateScore(this.dealerCards);
        
        document.getElementById('player-score').textContent = `Player Score: ${playerScore}`;
        if (this.gameActive) {
            document.getElementById('dealer-score').textContent = `Dealer Score: ${this.getCardValue(this.dealerCards[0])}`;
        } else {
            document.getElementById('dealer-score').textContent = `Dealer Score: ${dealerScore}`;
        }
    }

    updateMoney() {
        document.getElementById('money').textContent = `Balance: $${this.money}`;
    }

    placeBet() {
        const betAmount = parseInt(document.getElementById('bet-amount').value);
        if (betAmount > this.money) {
            alert('Yetersiz bakiye!');
            return;
        }
        if (betAmount < 10) {
            alert('Minimum bahis 10$!');
            return;
        }
        this.currentBet = betAmount;
        this.money -= betAmount;
        this.updateMoney();
        this.startNewGame();
    }

    startNewGame() {
        if (this.currentBet === 0) {
            alert('Önce bahis koymalısınız!');
            return;
        }

        this.createDeck();
        this.dealerCards = [this.drawCard(), this.drawCard()];
        this.playerCards = [this.drawCard(), this.drawCard()];
        
        this.gameActive = true;
        this.updateCardDisplay(this.dealerCards, 'dealer-cards');
        this.updateCardDisplay(this.playerCards, 'player-cards');
        this.updateScores();
        
        document.getElementById('hit-btn').disabled = false;
        document.getElementById('stand-btn').disabled = false;
        document.getElementById('deal-btn').disabled = true;
        document.getElementById('place-bet').disabled = true;
        document.getElementById('bet-amount').disabled = true;
        
        document.getElementById('message').textContent = '';
    }

    hit() {
        if (!this.gameActive) return;
        
        this.playerCards.push(this.drawCard());
        this.updateCardDisplay(this.playerCards, 'player-cards');
        this.updateScores();
        
        if (this.calculateScore(this.playerCards) > 21) {
            this.endGame('Kaybettiniz! 21\'i geçtiniz.');
        }
    }

    stand() {
        if (!this.gameActive) return;

        this.gameActive = false;
        this.updateCardDisplay(this.dealerCards, 'dealer-cards');
        this.updateScores();
        
        while (this.calculateScore(this.dealerCards) < 17) {
            this.dealerCards.push(this.drawCard());
            this.updateCardDisplay(this.dealerCards, 'dealer-cards');
            this.updateScores();
        }
        
        const dealerScore = this.calculateScore(this.dealerCards);
        const playerScore = this.calculateScore(this.playerCards);
        
        if (dealerScore > 21) {
            this.endGame('Kazandınız! Kurpiyer 21\'i geçti!', true);
        } else if (dealerScore > playerScore) {
            this.endGame('Kaybettiniz! Kurpiyer kazandı.');
        } else if (dealerScore < playerScore) {
            this.endGame('Kazandınız!', true);
        } else {
            this.endGame('Berabere!', 'draw');
        }
    }

    endGame(message, isWin = false) {
        this.gameActive = false;
        document.getElementById('message').textContent = message;
        document.getElementById('hit-btn').disabled = true;
        document.getElementById('stand-btn').disabled = true;
        document.getElementById('deal-btn').disabled = false;
        document.getElementById('place-bet').disabled = false;
        document.getElementById('bet-amount').disabled = false;

        if (isWin === true) {
            this.money += this.currentBet * 2;
        } else if (isWin === 'draw') {
            this.money += this.currentBet;
        }
        
        this.updateMoney();
        this.currentBet = 0;
    }
}

// Initialize game
const game = new Blackjack();