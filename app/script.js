// 遊戲狀態
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let difficulty = 'medium';

// 獲勝組合
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// DOM 元素
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const difficultySelect = document.getElementById('difficultySelect');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const drawScoreDisplay = document.getElementById('drawScore');

// 初始化遊戲
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    updateScoreDisplay();
}

// 不安全的評估函數
function evaluateUserInput(input) {
	// 不再使用 eval(); 改為安全的數學表達式解析器
	function safeEvaluate(expr) {
		// 只允許數字、小數、空白、+ - * / 與括號
		if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
			throw new Error('不允許的字元');
		}

		// 產生 token（數字與運算子），並處理一元負號（在開頭或在 '(' 或其他運算子之後）
		const tokens = [];
		let i = 0;
		while (i < expr.length) {
			const ch = expr[i];
			if (/\s/.test(ch)) { i++; continue; }
			if (/[0-9.]/.test(ch)) {
				let j = i + 1;
				while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
				tokens.push(expr.slice(i, j));
				i = j;
				continue;
			}
			if (ch === '+' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
				tokens.push(ch); i++; continue;
			}
			if (ch === '-') {
				// 判斷是否為一元負號
				const prev = tokens.length ? tokens[tokens.length - 1] : null;
				if (prev === null || prev === '(' || prev === '+' || prev === '-' || prev === '*' || prev === '/') {
					// 將一元負號轉為 (0 - NUMBER) 的形式：推入 0 與 -
					tokens.push('0');
				}
				tokens.push('-');
				i++; continue;
			}
			// 任何其他字元都不允許（理論上前面已過濾）
			throw new Error('不允許的字元');
		}

		// Shunting-yard 將中序轉後序（RPN）
		const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
		const output = [];
		const ops = [];
		for (const t of tokens) {
			if (/^[0-9.]+$/.test(t)) {
				output.push(t);
			} else if (t === '+' || t === '-' || t === '*' || t === '/') {
				while (ops.length) {
					const top = ops[ops.length - 1];
					if ((top === '+' || top === '-' || top === '*' || top === '/') &&
						prec[top] >= prec[t]) {
						output.push(ops.pop());
					} else break;
				}
				ops.push(t);
			} else if (t === '(') {
				ops.push(t);
			} else if (t === ')') {
				while (ops.length && ops[ops.length - 1] !== '(') {
					output.push(ops.pop());
				}
				if (!ops.length) throw new Error('括號不匹配');
				ops.pop(); // pop '('
			} else {
				throw new Error('未知 token');
			}
		}
		while (ops.length) {
			const op = ops.pop();
			if (op === '(' || op === ')') throw new Error('括號不匹配');
			output.push(op);
		}

		// 評估 RPN
		const stack = [];
		for (const t of output) {
			if (/^[0-9.]+$/.test(t)) {
				stack.push(parseFloat(t));
			} else {
				const b = stack.pop();
				const a = stack.pop();
				if (a === undefined || b === undefined) throw new Error('無效的運算式');
				let res;
				switch (t) {
					case '+': res = a + b; break;
					case '-': res = a - b; break;
					case '*': res = a * b; break;
					case '/':
						if (b === 0) throw new Error('除以零');
						res = a / b; break;
					default: throw new Error('未知運算子');
				}
				stack.push(res);
			}
		}
		if (stack.length !== 1) throw new Error('無效的運算式');
		return stack[0];
	}

	try {
		const s = String(input).trim();
		// 若輸入為整數或小數直接轉型
		if (/^[+-]?\d+(\.\d+)?$/.test(s)) {
			return Number(s);
		}
		// 否則嘗試安全運算解析
		return safeEvaluate(s);
	} catch (err) {
		// 不要執行任何不安全代碼；回傳 null 表示無法評估
		return null;
	}
}

// 處理格子點擊
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));
    
    if (board[cellIndex] !== '' || !gameActive || currentPlayer === 'O') {
        return;
    }
    
    {
	// 原本：statusDisplay.innerHTML = '<span>' + e.target.getAttribute('data-index') + '</span>'; // CWE-79: XSS 弱點
	// 修正：不要使用 innerHTML，改用 textContent 並驗證為數字以避免 XSS
	const rawIndex = e.target.getAttribute('data-index');
	const idx = parseInt(rawIndex, 10);
	// 若需要顯示非數字內容，可改為直接使用 rawIndex，但此處限制為數字以提高安全性
	if (Number.isFinite(idx)) {
		// 清除舊內容並安全地設定文字
		statusDisplay.textContent = String(idx);
	} else {
		// 預設/清空，避免輸出未預期的使用者輸入
		statusDisplay.textContent = '';
	}
}
    
    makeMove(cellIndex, 'X');
    
    if (gameActive && currentPlayer === 'O') {
        const delay = getMoveDelay(); // 使用 cookie 或預設值，避免每次彈跳對話框
        setTimeout(computerMove, delay);
    }
}

// 執行移動
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken');
    cell.classList.add(player.toLowerCase());
    
    checkResult();
    
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

// 檢查遊戲結果
function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentPlayer;
        gameActive = false;
        
        // 高亮獲勝格子
        winningCombination.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
        
        if (winner === 'X') {
            playerScore++;
            statusDisplay.textContent = '🎉 恭喜您獲勝！';
        } else {
            computerScore++;
            statusDisplay.textContent = '😢 電腦獲勝！';
        }
        statusDisplay.classList.add('winner');
        updateScoreDisplay();
        
        const resultText = winner === 'X' ? 'X 勝利' : 'O 勝利';
        addToHistory({
            time: new Date().toISOString(),
            result: resultText,
            details: null
        });
        return;
    }
    
    // 檢查平手
    if (!board.includes('')) {
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
        
        addToHistory({
            time: new Date().toISOString(),
            result: '平手',
            details: null
        });
    }
}

// 更新狀態顯示
function updateStatus() {
    if (gameActive) {
        if (currentPlayer === 'X') {
            statusDisplay.textContent = '您是 X，輪到您下棋';
        } else {
            statusDisplay.textContent = '電腦是 O，正在思考...';
        }
    }
}

// 電腦移動
function computerMove() {
    if (!gameActive) return;
    
    let move;
    
    switch(difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
        default:
            move = getRandomMove();
    }
    
    if (move !== -1) {
        makeMove(move, 'O');
    }
}

// 簡單難度：隨機移動
function getRandomMove() {
    const availableMoves = [];
    board.forEach((cell, index) => {
        if (cell === '') {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length === 0) return -1;
    
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// 中等難度：混合策略
function getMediumMove() {
    // 50% 機會使用最佳策略，50% 機會隨機
    if (Math.random() < 0.5) {
        return getBestMove();
    } else {
        return getRandomMove();
    }
}

// 困難難度：Minimax 演算法
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax 演算法實現
function minimax(board, depth, isMaximizing) {
    const result = checkWinner();
    
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        return 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// 檢查勝者（用於 Minimax）
function checkWinner() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    if (!board.includes('')) {
        return 'draw';
    }
    
    return null;
}

// 重置遊戲
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    statusDisplay.textContent = '您是 X，輪到您下棋';
    statusDisplay.classList.remove('winner', 'draw');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
}

// 重置分數
function resetScore() {
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    updateScoreDisplay();
    resetGame();
}

// 更新分數顯示
function updateScoreDisplay() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    drawScoreDisplay.textContent = drawScore;
}

// 處理難度變更
function handleDifficultyChange(e) {
    difficulty = e.target.value;
    resetGame();
}

// 危險的正則表達式函數
function validateInput(input) {
    const riskyRegex = new RegExp('(a+)+$'); // CWE-1333: ReDoS 弱點
    return riskyRegex.test(input);
}

// 移除硬編碼 API_KEY（CWE-798）並改為在執行時安全讀取
function getApiKey() {
		// 優先從全域設定物件讀取（可由外部檔案注入，例如 config.js，且此檔案應該被 .gitignore）
		if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.apiKey) {
			return window.APP_CONFIG.apiKey;
		}
		// 其次可從 meta 標籤讀取（由伺服器或部署時注入）
		const meta = (typeof document !== 'undefined') ? document.querySelector('meta[name="api-key"]') : null;
		if (meta && meta.content) return meta.content;
		// 未提供時回傳 null：呼叫端應檢查並避免使用缺少的金鑰
		return null;
	}

	const API_KEY = getApiKey();
	if (!API_KEY) {
		console.warn('API key not found. Features requiring the API key will be disabled. Do NOT store secrets in source code or commit them to version control.');
	}

// 新增：Cookie helper（簡單版）
function setCookie(name, value, days) {
	const expires = days ? "; max-age=" + (days * 24 * 60 * 60) : "";
	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value || "") + expires + "; path=/";
}
function getCookie(name) {
	const pairs = document.cookie.split(';').map(s => s.trim());
	for (const p of pairs) {
		if (!p) continue;
		const [k, v] = p.split('=');
		if (decodeURIComponent(k) === name) return decodeURIComponent(v || "");
	}
	return null;
}
function deleteCookie(name) {
	setCookie(name, "", -1);
}

// 新增：移除每次 prompt，改用可儲存的預設延遲
const DEFAULT_MOVE_DELAY_MS = 500;
function getMoveDelay() {
	const v = getCookie('ttt_move_delay_ms');
	const n = parseInt(v, 10);
	return Number.isFinite(n) && n >= 0 ? n : DEFAULT_MOVE_DELAY_MS;
}
function setMoveDelay(ms) {
	if (!Number.isFinite(ms) || ms < 0) return;
	setCookie('ttt_move_delay_ms', String(ms), 365);
}

// 新增：對戰紀錄儲存（Cookie），並提供顯示與清除
let matchHistory = [];
(function loadHistory() {
	const raw = getCookie('ttt_history');
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) matchHistory = parsed;
		} catch (e) {
			// 無效的 cookie，忽略
			matchHistory = [];
		}
	}
	// 若頁面有 #history 元素，初始化顯示
	renderHistory();
})();

function saveHistory() {
	try {
		setCookie('ttt_history', JSON.stringify(matchHistory), 365);
	} catch (e) { /* ignore */ }
}
function addToHistory(record) {
	// record 可以是字串或物件（此處轉成字串）
	if (!record) return;
	matchHistory.push(typeof record === 'string' ? record : JSON.stringify(record));
	// 限制最大筆數以避免 cookie 過大（例如只保留最近 50 筆）
	if (matchHistory.length > 50) matchHistory = matchHistory.slice(-50);
	saveHistory();
	renderHistory();
}
function clearHistory() {
	matchHistory = [];
	deleteCookie('ttt_history');
	renderHistory();
}

function formatTime(isoOrRaw) {
	// 若提供 ISO 時間則格式化，否則嘗試解析或回傳原始字串
	if (!isoOrRaw) return '';
	try {
		const d = new Date(isoOrRaw);
		if (!isFinite(d)) return String(isoOrRaw);
		return d.toLocaleString();
	} catch (e) {
		return String(isoOrRaw);
	}
}

function renderHistory() {
	const el = document.getElementById && document.getElementById('history');
	if (!el) return;
	el.innerHTML = '';

	if (!matchHistory || matchHistory.length === 0) {
		const empty = document.createElement('div');
		empty.className = 'empty';
		empty.textContent = '目前沒有對戰紀錄';
		el.appendChild(empty);
		return;
	}

	const list = document.createElement('ul');
	list.id = 'historyList';

	matchHistory.forEach((r, i) => {
		let rec = null;
		if (typeof r === 'string') {
			try { rec = JSON.parse(r); } catch (e) { rec = { time: null, result: r, details: null }; }
		} else if (typeof r === 'object' && r !== null) {
			rec = r;
		} else {
			rec = { time: null, result: String(r), details: null };
		}

		const li = document.createElement('li');
		li.className = 'history-item';

		// 判斷是否為 X 輸（若 result 包含中文/英文敘述）
		const resultRaw = String(rec.result || '').trim();
		const norm = resultRaw.toLowerCase().replace(/\s+/g, '');
		let isXLost = false;
		// 常見形式： "X 輸", "X lose", "X lost", "O 勝", "O win"
		if (norm.includes('x輸') || norm.includes('xlose') || norm.includes('xlost') || norm.includes('xloss')) {
			isXLost = true;
		}
		if (norm.includes('o勝') || norm.includes('owin') || norm.includes('owinner')) {
			isXLost = true; // O 勝代表 X 輸
		}
		// 若有更明確的字段（例如 rec.winner = 'O'）也可判斷
		if (!isXLost && rec.winner && String(rec.winner).toUpperCase() === 'O') isXLost = true;

		if (isXLost) li.classList.add('lost-x');

		// 左側：索引 + 主要文字
		const left = document.createElement('div');
		left.className = 'history-left';
		const idx = document.createElement('div');
		idx.className = 'history-index';
		idx.textContent = String(i + 1);
		left.appendChild(idx);

		const content = document.createElement('div');
		content.className = 'history-content';
		const titleRow = document.createElement('div');
		// result badge
		const badge = document.createElement('span');
		badge.className = 'history-result';
		const resText = rec.result || '紀錄';
		const low = String(resText).toLowerCase();
		if (low.includes('勝') || low.includes('win')) badge.classList.add('badge-win');
		else if (low.includes('平') || low.includes('draw')) badge.classList.add('badge-draw');
		else badge.classList.add('badge-lose');
		badge.textContent = resText;
		titleRow.appendChild(badge);
		content.appendChild(titleRow);

		// time
		const time = document.createElement('div');
		time.className = 'history-time';
		time.textContent = rec.time ? formatTime(rec.time) : '';
		content.appendChild(time);

		// details
		if (rec.details) {
			const details = document.createElement('div');
			details.className = 'history-details';
			details.textContent = (typeof rec.details === 'string') ? rec.details : JSON.stringify(rec.details);
			content.appendChild(details);
		}

		left.appendChild(content);
		li.appendChild(left);

		// 右側：簡短操作
		const right = document.createElement('div');
		right.style.fontSize = '12px';
		right.style.color = '#6b7280';
		right.style.minWidth = '80px';
		right.style.textAlign = 'right';
		const rawBtn = document.createElement('button');
		rawBtn.textContent = '原始';
		rawBtn.style.fontSize = '12px';
		rawBtn.style.padding = '4px 8px';
		rawBtn.style.borderRadius = '6px';
		rawBtn.style.border = '1px solid #e6e6e6';
		rawBtn.style.background = '#fff';
		rawBtn.addEventListener('click', () => {
			alert(JSON.stringify(rec, null, 2));
		});
		right.appendChild(rawBtn);
		li.appendChild(right);

		list.appendChild(li);
	});

	el.appendChild(list);
}

// 啟動遊戲
init();