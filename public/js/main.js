function setup() {
	//Create the canvas and save it to a variable;
	const myCanvas = createCanvas(1920, 1080);

	//Set the parent of the canvas to an HTML element by it's ID value 
	myCanvas.parent("canvas-container");

	background(220, 40, 50);
}

(function () {


	var config = {
		tileWidth: .25, //小星星的宽高
		tileHeight: .25,
		tileSet: [], //存储小星星的二维数组
		tableRows: 10, //行数
		baseScore: 5, //每一个小星星的基础分数
		stepScore: 10, //每一个小星星的递增分数
		targetScore: 2000, //目标分数，初始为2000
		el: document.querySelector('#starList'),// 星星列表
		scoreTarget: document.querySelector('#scoreTarget'),//目标分数
		scoreCurrent: document.querySelector('#scoreCurrent'),//当前分数
		scoreSelect: document.querySelector('#scoreSelect'),//选中星星分数
		scoreLevel: document.querySelector('#scoreLevel'),//当前所在的关数
	};


	//全局计算属性
	var computed = {
		flag: true, //锁
		choose: [], //已选中的小星星集合
		timer: null,
		totalScore: 0, //总分数
		tempTile: null,
		level: 1, //当前所在的关数（每闯过一关+1，游戏失败回复为1）
		stepTargetScore: 500, //闯关成功的递增分数（500/关）
		score: 0 //当前的计算分数
	};


	function Block(number, row, col) {
		var tile = document.createElement('li');
		tile.width = config.tileWidth;
		tile.height = config.tileHeight;
		tile.number = number;
		tile.row = row;
		tile.col = col;
		return tile;
	}


	function PopStar() {
		return new PopStar.prototype.init();
	}


	PopStar.prototype = {



		init: function () {
			this.initTable();
		},



		initTable: function () {
			this.initScore();
			this.initTileSet();
			this.initBlocks();
		},



		initScore: function () {
			new CountUp(config.scoreTarget, config.targetScore, config.targetScore).start();
			config.scoreCurrent.innerHTML = computed.totalScore;
			config.scoreLevel.innerHTML = computed.level;
		},



		mouseClick: function () {
			var tileSet = config.tileSet,
				choose = computed.choose,
				baseScore = config.baseScore,
				stepScore = config.stepScore,
				el = config.el,
				self = this,
				len = choose.length;
			if (!computed.flag || len <= 1) {
				return;
			}
			computed.flag = false;
			computed.tempTile = null;
			var score = 0;
			for (var i = 0; i < len; i++) {
				score += baseScore + i * stepScore;
			}

			new CountUp(config.scoreCurrent, computed.totalScore, computed.totalScore += score).start();
			for (var i = 0; i < len; i++) {
				setTimeout(function (i) {
					tileSet[choose[i].row][choose[i].col] = null;
					el.removeChild(choose[i]);
				}, i * 100, i);
			}
			setTimeout(function () {
				self.move();

				//result

				setTimeout(function () {
					if (self.isFinish()) {
						self.clear();
						if (computed.totalScore >= config.targetScore) {
							new CountUp(config.scoreTarget, config.targetScore, config.targetScore += (computed.level - 1) * computed
								.stepTargetScore)
								.start();

							new CountUp(config.scoreLevel, computed.level, computed.level += 1).start();
							alert("Congratulations! Go to the next level.");
							console.log("Congratulations! Go to the next level.")
						} else {
							config.targetScore = config.scoreTarget = 900;
							computed.level = computed.totalScore = 0;
							alert("Game over. Try again.");
							console.log("Game over. Try again.")
						}
						computed.flag = true;

					} else {
						choose = [];
						computed.flag = true;
						self.mouseOver(computed.tempTile);
					}
				}, 300 + choose.length * 150);
			}, choose.length * 100);
		},



		clear: function () {
			var tileSet = config.tileSet,
				rows = tileSet.length,
				el = config.el;
			var temp = [];
			for (var i = rows - 1; i >= 0; i--) {
				for (var j = tileSet[i].length - 1; j >= 0; j--) {
					if (tileSet[i][j] === null) {
						continue;
					}
					temp.push(tileSet[i][j])
					tileSet[i][j] = null;
				}
			}
			for (var k = 0; k < temp.length; k++) {
				setTimeout(function (k) {
					el.removeChild(temp[k]);
					if (k >= temp.length - 1) {
						setTimeout(function (k) {
							new PopStar();
						}, 500)
					}
				}, k * 100, k);
			}
		},

		/**
		 * game situation
		 * @returns {boolean}
		 */
		isFinish: function () {
			var tileSet = config.tileSet,
				rows = tileSet.length;
			for (var i = 0; i < rows; i++) {
				var row = tileSet[i].length;
				for (var j = 0; j < row; j++) {
					var temp = [];
					this.checkLink(tileSet[i][j], temp);
					if (temp.length > 1) {
						return false;
					}
				}
			}
			return true;
		},


		move: function () {
			var rows = config.tableRows,
				tileSet = config.tileSet;

			//move downward
			for (var i = 0; i < rows; i++) {
				var pointer = 0;
				for (var j = 0; j < rows; j++) {
					if (tileSet[j][i] != null) {
						if (j !== pointer) {
							tileSet[pointer][i] = tileSet[j][i];
							tileSet[j][i].row = pointer;
							tileSet[j][i] = null;
						}
						pointer++;
					}
				}
			}
			//move horizontally
			for (var i = 0; i < tileSet[0].length;) {
				if (tileSet[0][i] == null) {
					for (var j = 0; j < rows; j++) {
						tileSet[j].splice(i, 1);
					}
					continue;
				}
				i++;
			}
			this.refresh()
		},



		mouseOver: function (obj) {
			if (!computed.flag) { //locked
				computed.tempTile = obj;
				return;
			}
			this.clearFlicker();
			var choose = [];
			this.checkLink(obj, choose);
			computed.choose = choose;
			if (choose.length <= 1) {
				choose = [];
				return;
			}
			this.flicker(choose);
			this.computeScore(choose);
		},



		teScore: function (arr) {
			var score = 0,
				len = arr.length,
				baseScore = config.baseScore,
				stepScore = config.stepScore;
			for (var i = 0; i < len; i++) {
				score += baseScore + i * stepScore
			}
			if (score <= 0) {
				return;
			}
			computed.score = score;
			config.scoreSelect.style.opacity = '1';
			config.scoreSelect.innerHTML = arr.length + "combo " + score + "points";
			setTimeout(function () {
				config.scoreSelect.style.opacity = '0';
			}, 1200)
		},



		clearFlicker: function () {
			var tileSet = config.tileSet;
			for (var i = 0; i < tileSet.length; i++) {
				for (var j = 0; j < tileSet[i].length; j++) {
					var div = tileSet[i][j];
					if (div === null) {
						continue;
					}
					div.classList.remove("scale");
				}
			}
		},



		flicker: function (arr) {
			for (var i = 0; i < arr.length; i++) {
				var div = arr[i];
				div.classList.add("scale");
			}
		},



		checkLink: function (obj, arr) {
			if (obj === null) {
				return;
			}
			arr.push(obj);




			var tileSet = config.tileSet,
				rows = config.tableRows;
			if (obj.col > 0 && tileSet[obj.row][obj.col - 1] && tileSet[obj.row][obj.col - 1].number === obj.number && arr.indexOf(
				tileSet[obj.row][obj.col - 1]) === -1) {
				this.checkLink(tileSet[obj.row][obj.col - 1], arr);
			}
			if (obj.col < rows - 1 && tileSet[obj.row][obj.col + 1] && tileSet[obj.row][obj.col + 1].number === obj.number &&
				arr.indexOf(tileSet[obj.row][obj.col + 1]) === -1) {
				this.checkLink(tileSet[obj.row][obj.col + 1], arr);
			}
			if (obj.row < rows - 1 && tileSet[obj.row + 1][obj.col] && tileSet[obj.row + 1][obj.col].number === obj.number &&
				arr.indexOf(tileSet[obj.row + 1][obj.col]) === -1) {
				this.checkLink(tileSet[obj.row + 1][obj.col], arr);
			}
			if (obj.row > 0 && tileSet[obj.row - 1][obj.col] && tileSet[obj.row - 1][obj.col].number === obj.number && arr.indexOf(
				tileSet[obj.row - 1][obj.col]) === -1) {
				this.checkLink(tileSet[obj.row - 1][obj.col], arr);
			}
		},


		initTileSet: function () {
			var rows = config.tableRows,
				arr = config.tileSet;
			for (var i = 0; i < rows; i++) {
				arr[i] = [];
				for (var j = 0; j < rows; j++) {
					arr[i][j] = [];
				}
			}
		},


		initBlocks: function () {
			var tileSet = config.tileSet,
				self = this,
				el = config.el,
				cols = tileSet.length;
			for (var i = 0; i < cols; i++) {
				var rows = tileSet[i].length;
				for (var j = 0; j < rows; j++) {
					var tile = this.createBlock(Math.floor(Math.random() * 5), i, j);
					tile.onmouseover = function () {
						self.mouseOver(this)
					};
					tile.onclick = function () {
						self.mouseClick();
					};

					tileSet[i][j] = tile;
					el.appendChild(tile);
				}
			}
			this.refresh()
		},



		refresh: function () {
			var tileSet = config.tileSet;
			for (var i = 0; i < tileSet.length; i++) {
				var row = tileSet[i].length;
				for (var j = 0; j < row; j++) {
					var tile = tileSet[i][j];
					if (tile == null) {
						continue;
					}
					tile.row = i;
					tile.col = j;
					tile.style.left = tileSet[i][j].col * config.tileWidth + "rem";
					tile.style.bottom = tileSet[i][j].row * config.tileHeight + "rem";
					tile.style.backgroundImage = "url('./images/" + tileSet[i][j].number + ".png')";

				}
			}
		},


		createBlock: function (number, row, col) {
			return new Block(number, row, col);
		},

	};
	PopStar.prototype.init.prototype = PopStar.prototype;
	window.PopStar = PopStar;
})();
