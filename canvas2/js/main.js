new (class Game {
  constructor() {
    this.c = document.querySelector('canvas');
    this.progress = document.querySelector('.progress');
    this.cx = this.c.getContext('2d');
    this.init();
    this.c.addEventListener('mousedown', this.onmousedown.bind(this), false);
    this.c.addEventListener('mouseup', this.onmouseup.bind(this), false);
    this.c.addEventListener('mousemove', this.onmousemove.bind(this), false);
  }
  init() {
    this.c.height = 500;
    this.c.width = 700;
    this.cx.fillStyle = 'rgb(200, 200, 250)';
    this.drawletter('ECG');
    this.cx.fillStyle = 'rgb(0, 0, 50)';
    this.letterpixels = this.getpixelamount(200, 200, 250); // 見本文字のピクセル量
  }
  // 判定処理
  pixelthreshold() {
    if (this.getpixelamount(0, 0, 50) / this.letterpixels > 0.75) {
      // 75%以上塗ったら成功
      console.log('you got it!');
      $('#flash-msg-area').flash_message({
        text: '75%以上塗りました',
        how: 'append',
      });
    }
  }
  showerror(error) {
    this.mousedown = false;
    console.log(error);
    $('#flash-msg-area').flash_message({
      text: '枠から外れました',
      how: 'append',
      class_name: 'error',
    });
  }
  // x,y座標から色コードを取得する
  getpixelcolour(x, y) {
    const pixels = this.cx.getImageData(0, 0, this.c.width, this.c.height);
    const index = y * (pixels.width * 4) + x * 4;
    return {
      r: pixels.data[index],
      g: pixels.data[index + 1],
      b: pixels.data[index + 2],
      a: pixels.data[index + 3],
    };
  }
  paint(x, y) {
    const colour = this.getpixelcolour(x, y);
    const amountRatio =
      (this.getpixelamount(0, 0, 50) / this.letterpixels) * 100;
    this.progress.innerHTML = `
      <div>${amountRatio}</div>
    `;
    this.pixelthreshold(); // 判定処理
    if (colour.a === 0) {
      // 透明だったら
      this.showerror('you are outside'); // 終了
    } else {
      // 透明でなかったら塗る
      const fillRange = 10;
      const stack = [[x, y]];
      while (stack.length > 0) {
        // console.log('stack', stack);
        const pixel = stack.pop();
        if (pixel[0] < 0 || pixel[0] >= this.c.width) continue;
        if (pixel[1] < 0 || pixel[1] >= this.c.height) continue;
        if (((x - pixel[0]) ** 2 + (y - pixel[1]) ** 2) ** 0.5 > fillRange)
          continue;
        const color = this.getpixelcolour(...pixel);
        if (color.a === 0) continue;
        if (color.r === 0 && color.g === 0 && color.b === 50) continue;

        this.cx.fillRect(pixel[0], pixel[1], 1, 1);

        if (pixel[0] >= x) stack.push([pixel[0] + 1, pixel[1]]);
        if (pixel[0] <= x) stack.push([pixel[0] - 1, pixel[1]]);
        if (pixel[1] >= y) stack.push([pixel[0], pixel[1] + 1]);
        if (pixel[1] <= y) stack.push([pixel[0], pixel[1] - 1]);
      }
    }
  }
  onmousedown(ev) {
    this.mousedown = true;
    ev.preventDefault();
  }
  onmouseup(ev) {
    this.mousedown = false;
    ev.preventDefault();
  }
  onmousemove(e) {
    const x = Math.round(e.clientX - this.c.getBoundingClientRect().left);
    const y = Math.round(e.clientY - this.c.getBoundingClientRect().top);
    if (this.mousedown) {
      this.paint(x, y);
    } else {
      // console.log(this.getpixelcolour(x, y));
    }
  }
  // 指定された色コードがキャンバス内に締めている量をドット数で取得
  getpixelamount(r, g, b) {
    const pixels = this.cx.getImageData(0, 0, this.c.width, this.c.height);
    const all = pixels.data.length;
    let amount = 0;
    for (let i = 0; i < all; i += 4) {
      if (
        pixels.data[i] === r &&
        pixels.data[i + 1] === g &&
        pixels.data[i + 2] === b
      ) {
        amount++;
      }
    }
    return amount;
  }
  drawletter(letter) {
    const path = new Path2D(
      'M 13.4606 293.112 C 16.3976 291.7728 94.8294 292.9554 94.8294 292.9554 C 116.1594 276.9336 141.4098 261.6678 156.6216 261.6192 C 173.718 261.3924 191.3544 281.8098 200.0916 292.9878 C 241.272 292.9716 260.0802 293.4738 260.0802 293.4738 L 275.0436 319.3452 L 294.9534 11.8066 C 295.5528 8.9554 301.3416 8.6243 302.3136 12.4454 L 322.1262 344.8224 L 336.6198 293.4792 L 418.1004 293.1336 C 418.1004 293.1336 459.8208 241.8282 480.7404 242.1468 C 501.6924 242.4708 520.6194 284.769 524.3994 292.7394 L 604.2114 293.2794 C 607.1922 295.677 607.6458 299.3868 604.4706 301.1472 L 524.043 301.293 C 518.0976 300.8556 518.2596 300.0672 517.671 299.2032 C 517.0878 298.3446 496.611 251.1972 481.5072 250.4952 C 466.4088 249.7986 421.5294 301.131 421.5294 301.131 C 421.5294 301.131 342.4896 302.13 342.5058 302.1462 C 342.5166 302.1624 322.002 380.8512 321.9966 380.8566 C 320.085 383.2326 316.6668 382.5198 315.3492 380.7324 L 299.0736 101.7689 C 298.593 97.0375 297.8262 99.8935 297.7182 101.5427 L 281.826 339.9678 C 281.2752 341.9658 277.4412 343.8126 275.6862 340.3458 C 275.6106 340.2 255.4794 301.5846 255.4794 301.5846 L 197.8236 301.3632 C 195.5772 301.3524 196.2846 301.347 194.8266 300.2454 C 179.6796 282.0042 169.1658 271.6956 159.9372 270.1458 C 144.3312 267.2136 107.0982 294.0354 97.6482 301.3848 L 14.3381 301.1742 C 9.3533 300.1482 10.2859 295.542 13.4606 293.112 Z'
    );
    this.cx.fill(path);
  }
})();
