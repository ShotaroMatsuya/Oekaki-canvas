window.addEventListener('load', () => {
  const force = document.querySelectorAll('#force')[0];
  const touches = document.querySelectorAll('#touches')[0];
  const canvas = document.querySelector('#draw-area');
  const context = canvas.getContext('2d');

  const canvasForWidthIndicator = document.querySelector(
    '#line-width-indicator'
  );
  const contextForWidthIndicator = canvasForWidthIndicator.getContext('2d');

  const lastPosition = { x: null, y: null };
  let isDrag = false;
  let pressure = 0.1;
  // 現在の線の色を保持する変数(デフォルトは黒(#000000)とする)
  let currentColor = '#000000';
  let currentLineWidth = 1;

  function draw(x, y) {
    if (!isDrag) {
      return;
    }
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = currentLineWidth;
    context.strokeStyle = currentColor;
    if (lastPosition.x === null || lastPosition.y === null) {
      context.moveTo(x, y);
    } else {
      context.moveTo(lastPosition.x, lastPosition.y);
    }
    context.lineTo(x, y);
    context.stroke();

    lastPosition.x = x;
    lastPosition.y = y;
  }
  function showLineWidthIndicator(x, y) {
    contextForWidthIndicator.lineCap = 'round';
    contextForWidthIndicator.lineJoin = 'round';
    contextForWidthIndicator.strokeStyle = currentColor;

    contextForWidthIndicator.lineWidth = 1;

    contextForWidthIndicator.clearRect(
      0,
      0,
      canvasForWidthIndicator.width,
      canvasForWidthIndicator.height
    );

    contextForWidthIndicator.beginPath();

    // x, y座標を中心とした円(「○」)を描画する。
    // 第3引数の「currentLineWidth / 2」で、実際に描画する線の太さと同じ大きさになる。
    // ドキュメント: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    contextForWidthIndicator.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);

    contextForWidthIndicator.stroke();
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function dragStart(event) {
    context.beginPath();

    isDrag = true;
    requestIdleCallback(() => {
      force.textContent = 'force = ' + pressure;

      const touch = event.touches ? event.touches[0] : null;
      if (touch) {
        touches.innerHTML = `
          touchType = ${touch.touchType} ${
          touch.touchType === 'direct' ? '👆' : '✍️'
        } <br/>
          radiusX = ${touch.radiusX} <br/>
          radiusY = ${touch.radiusY} <br/>
          rotationAngle = ${touch.rotationAngle} <br/>
          altitudeAngle = ${touch.altitudeAngle} <br/>
          azimuthAngle = ${touch.azimuthAngle} <br/>
        `;
      }
    });
  }

  function dragEnd(event) {
    context.closePath();
    isDrag = false;
    lastPosition.x = null;
    lastPosition.y = null;
  }

  function initEventHandler() {
    const clearButton = document.querySelector('#clear-button');
    clearButton.addEventListener('click', clear);

    // 消しゴムモードを選択したときの挙動
    const eraserButton = document.querySelector('#eraser-button');
    eraserButton.addEventListener('click', () => {
      // 消しゴムと同等の機能を実装したい場合は現在選択している線の色を
      // 白(#FFFFFF)に変更するだけでよい
      currentColor = '#FFFFFF';
    });

    const layeredCanvasArea = document.querySelector('#layerd-canvas-area');
    for (const ev of ['touchstart', 'mousedown']) {
      layeredCanvasArea.addEventListener(ev, dragStart);
    }
    for (const ev of ['touchend', 'touchleave', 'mouseup']) {
      layeredCanvasArea.addEventListener(ev, dragEnd);
    }
    layeredCanvasArea.addEventListener('mouseout', dragEnd);
    for (const ev of ['touchmove', 'mousemove']) {
      layeredCanvasArea.addEventListener(ev, event => {
        if (!isDrag) return;
        event.preventDefault();
        console.log('touchmove, mousemove');
        draw(event.layerX, event.layerY);

        // 現在のマウスの位置を中心として、線の太さを「○」で表現するためのcanvasに描画を行う
        showLineWidthIndicator(event.layerX, event.layerY);
      });
    }
  }

  // カラーパレットの設置を行う
  function initColorPalette() {
    const joe = colorjoe.rgb('color-palette', currentColor);

    // 'done'イベントは、カラーパレットから色を選択した時に呼ばれるイベント
    // ドキュメント: https://github.com/bebraw/colorjoe#event-handling
    joe.on('done', color => {
      // コールバック関数の引数からcolorオブジェクトを受け取り、
      // このcolorオブジェクト経由で選択した色情報を取得する

      // color.hex()を実行すると '#FF0000' のような形式で色情報を16進数の形式で受け取れる
      // draw関数の手前で定義されている、線の色を保持する変数に代入して色情報を変更する
      currentColor = color.hex();
    });
  }
  // 文字の太さの設定・更新を行う機能
  function initConfigOfLineWidth() {
    const textForCurrentSize = document.querySelector('#line-width');
    const rangeSelector = document.querySelector('#range-selector');

    // 線の太さを記憶している変数の値を更新する
    currentLineWidth = rangeSelector.value;

    // "input"イベントをセットすることでスライド中の値も取得できるようになる。
    // ドキュメント: https://developer.mozilla.org/ja/docs/Web/HTML/Element/Input/range
    rangeSelector.addEventListener('input', event => {
      const width = event.target.value;

      // 線の太さを記憶している変数の値を更新する
      currentLineWidth = width;

      // 更新した線の太さ値(数値)を<input id="range-selector" type="range">の右側に表示する
      textForCurrentSize.innerText = width;
    });
  }

  initEventHandler();
  initColorPalette();
  initConfigOfLineWidth();
});
